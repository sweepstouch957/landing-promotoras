'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Button,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import { Logout, Person, AdminPanelSettings } from '@mui/icons-material';

const AuthNavigation: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const primaryColor = '#c10061';

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    router.push('/');
  };

  const handleGoToAdmin = () => {
    handleMenuClose();
    router.push('/admin');
  };

  const handleGoToCitas = () => {
    handleMenuClose();
    router.push('/citas');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Chip
        icon={<AdminPanelSettings sx={{ color: primaryColor }} />}
        label={user.role === 'administrator' ? 'Administrador' : user.role}
        variant="outlined"
        size="small"
        sx={{
          borderColor: primaryColor,
          color: primaryColor,
          '& .MuiChip-icon': {
            color: primaryColor,
          },
        }}
      />

      <Button
        onClick={handleMenuOpen}
        startIcon={
          <Avatar
            sx={{
              width: 24,
              height: 24,
              bgcolor: 'white',
              color: primaryColor,
            }}
          >
            <Person />
          </Avatar>
        }
        variant="outlined"
        size="small"
        sx={{
          borderColor: primaryColor,
          color: primaryColor,
          '&:hover': {
            borderColor: primaryColor,
            backgroundColor: 'rgba(224, 16, 112, 0.1)',
          },
        }}
      >
        {user.username}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box px={2} py={1}>
          <Typography variant="subtitle2" color="text.secondary">
            Conectado como
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {user.username}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user.email}
          </Typography>
        </Box>

        <Divider />

        <MenuItem onClick={handleGoToAdmin}>
          <AdminPanelSettings sx={{ mr: 1, color: primaryColor }} />
          <Typography color={primaryColor}>Panel de Admin</Typography>
        </MenuItem>

        <MenuItem onClick={handleGoToCitas}>
          <AdminPanelSettings sx={{ mr: 1, color: primaryColor }} />
          <Typography color={primaryColor}>Gestión de Citas</Typography>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <Logout sx={{ mr: 1 }} />
          Cerrar Sesión
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AuthNavigation;
