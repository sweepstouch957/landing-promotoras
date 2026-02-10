'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from './AdminSidebar';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  Fab
} from '@mui/material';
import {
  Menu as MenuIcon,
  AdminPanelSettings
} from '@mui/icons-material';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title = 'Panel de Administración' }) => {
  const { isAuthenticated, user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const primaryColor = '#ff0f6e';
  const drawerWidth = 280;

  // Ajustar sidebar según el tamaño de pantalla
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  // Solo mostrar el layout si el usuario está autenticado
  if (!isAuthenticated || !user) {
    return <>{children}</>;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <AdminSidebar
        open={sidebarOpen}
        onClose={handleSidebarClose}
        onToggle={handleSidebarToggle}
      />

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${sidebarOpen ? drawerWidth : 0}px)` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          backgroundColor: '#f5f5f5',
          minHeight: '100vh'
        }}
      >
        {/* AppBar superior para móvil */}
        {isMobile && (
          <AppBar
            position="fixed"
            sx={{
              backgroundColor: primaryColor,
              zIndex: theme.zIndex.drawer + 1,
              display: { md: 'none' }
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="abrir menú"
                edge="start"
                onClick={handleSidebarToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <AdminPanelSettings sx={{ mr: 1 }} />
              <Typography variant="h6" noWrap component="div">
                {title}
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        {/* Contenido de la página */}
        <Box
          sx={{
            pt: { xs: 8, md: 0 }, // Padding top para móvil (AppBar)
            p: 0,
            minHeight: '100vh'
          }}
        >
          {children}
        </Box>

        {/* FAB para abrir sidebar en desktop cuando está cerrado */}
        {!isMobile && !sidebarOpen && (
          <Fab
            color="primary"
            aria-label="abrir menú"
            onClick={handleSidebarToggle}
            sx={{
              position: 'fixed',
              bottom: 16,
              left: 16,
              backgroundColor: primaryColor,
              '&:hover': {
                backgroundColor: '#c10061'
              }
            }}
          >
            <MenuIcon />
          </Fab>
        )}
      </Box>
    </Box>
  );
};

export default AdminLayout;

