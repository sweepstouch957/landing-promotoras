'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
  Collapse,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Dashboard,
  CalendarMonth,
  Close as CloseIcon,
  AdminPanelSettings,
  ExpandLess,
  ExpandMore,
  Person,
  Logout,
  Home,
  DashboardCustomize,
} from '@mui/icons-material';

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
  onToggle?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [adminMenuOpen, setAdminMenuOpen] = useState(true);

  const primaryColor = '#f82083';
  const hoverColor = '#e01070';

  const menuItems = [
    {
      text: 'Panel de Admin',
      icon: <Dashboard />,
      path: '/admin',
      isAdmin: true,
    },
    {
      text: 'Gestión de Citas',
      icon: <DashboardCustomize />,
      path: '/citas',
      isAdmin: true,
    },
    {
      text: 'Calendario',
      icon: <CalendarMonth />,
      path: '/calendario',
      isAdmin: true,
    },
  ];

  const handleNavigation = (path: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push(path as any);
    if (isMobile) {
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
    if (isMobile) {
      onClose();
    }
  };

  const toggleAdminMenu = () => {
    setAdminMenuOpen(!adminMenuOpen);
  };

  const drawerWidth = 280;

  const sidebarContent = (
    <Box
      sx={{
        height: '100vh',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${hoverColor} 100%)`,
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <AdminPanelSettings sx={{ fontSize: 28 }} />
          <Typography variant="h6" fontWeight="bold">
            Admin Panel
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {user && (
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <Avatar
              sx={{
                bgcolor: 'white',
                color: primaryColor,
                width: 40,
                height: 40,
              }}
            >
              <Person />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {user.username}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {user.email}
              </Typography>
            </Box>
          </Box>
          <Chip
            icon={<AdminPanelSettings />}
            label="Administrador"
            size="small"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              '& .MuiChip-icon': {
                color: 'white',
              },
            }}
          />
        </Box>
      )}

      <Box sx={{ flexGrow: 1, py: 1, overflow: 'hidden' }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigation('/')}
              sx={{
                mx: 1,
                borderRadius: 1,
                backgroundColor:
                  pathname === '/' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                <Home />
              </ListItemIcon>
              <ListItemText
                primary="Inicio"
                primaryTypographyProps={{
                  fontWeight: pathname === '/' ? 'bold' : 'normal',
                }}
              />
            </ListItemButton>
          </ListItem>

          <Divider
            sx={{ my: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          />

          <ListItem disablePadding>
            <ListItemButton
              onClick={toggleAdminMenu}
              sx={{
                mx: 1,
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                <AdminPanelSettings />
              </ListItemIcon>
              <ListItemText
                primary="Administración"
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
              {adminMenuOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>

          <Collapse in={adminMenuOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {menuItems.map((item) => (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      mx: 2,
                      borderRadius: 1,
                      backgroundColor:
                        pathname === item.path
                          ? 'rgba(255, 255, 255, 0.2)'
                          : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: pathname === item.path ? 'bold' : 'normal',
                        fontSize: '0.9rem',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </List>
      </Box>

      <Box
        sx={{
          p: 2,
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
            <Logout />
          </ListItemIcon>
          <ListItemText
            primary="Cerrar Sesión"
            primaryTypographyProps={{ fontWeight: 'bold' }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          anchor="left"
          open={open}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        <Drawer
          variant="persistent"
          anchor="left"
          open={open}
          sx={{
            width: open ? drawerWidth : 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      )}
    </>
  );
};

export default AdminSidebar;
