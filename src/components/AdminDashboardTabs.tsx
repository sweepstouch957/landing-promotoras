'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import AdminScheduleCalendar from './AdminScheduleCalendar';
import AdminScheduleList from './AdminScheduleList';
import AdminDashboard from './AdminDashboard';
import GoogleAuthSetup from './GoogleAuthSetup';
import TodayAppointments from './TodayAppointments';
import ApprovedCandidates from './ApprovedCandidates';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  customSx?: object;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, customSx, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box
          sx={{
            mt: 4,
            px: { xs: 2, sm: 4, md: 6 },
            maxWidth: 1200,
            mx: 'auto',
            ...(customSx || {}),
          }}
        >
          {children}
        </Box>
      )}
    </div>
  );
}

export default function AdminDashboardTabs() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokens = urlParams.get('tokens');
    if (tokens) {
      setTabValue(5); // Google Calendar
    }
  }, []);

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        color="#ff0f6e"
        align="center"
        sx={{ py: 3 }}
      >
        Panel de Administración
      </Typography>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          px: { xs: 2, sm: 4, md: 6 },
          mb: 4,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 1000,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            centered
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                color: '#666',
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '0.9rem', // Tamaño reducido
                minWidth: 120,
                '&.Mui-selected': {
                  color: '#ff0f6e',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#ff0f6e',
                height: 3,
              },
            }}
          >
            <Tab label="Calendario" />
            <Tab label="Gestión de Usuarios" />
            <Tab label="Citas de Hoy" />
            <Tab label="Candidatos Aprobados" />
            <Tab label="Configuración" />
            <Tab label="Google Calendar" />
          </Tabs>
        </Box>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <AdminScheduleCalendar />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <AdminScheduleList />
      </TabPanel>
      <TabPanel
        value={tabValue}
        index={2}
        customSx={{
          m: 6,
          mb: 6,
          p: 3,
          pb: 6,
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.5)',
          backgroundColor: 'white',
          borderRadius: 2,
        }}
      >
        <TodayAppointments />
      </TabPanel>
      <TabPanel
        value={tabValue}
        index={3}
        customSx={{
          m: 6,
          mb: 6,
          p: 3,
          pb: 6,
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.5)',
          backgroundColor: 'white',
          borderRadius: 2,
        }}
      >
        <ApprovedCandidates />
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <AdminDashboard />
      </TabPanel>
      <TabPanel value={tabValue} index={5}>
        <GoogleAuthSetup />
      </TabPanel>
    </Box>
  );
}
