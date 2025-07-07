'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import AdminScheduleCalendar from './AdminScheduleCalendar';
import AdminScheduleList from './AdminScheduleList';
import AdminDashboard from './AdminDashboard';
import GoogleAuthSetup from './GoogleAuthSetup';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function AdminDashboardTabs() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Detecta si hay tokens en la URL y abre el tab 3 automáticamente
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokens = urlParams.get('tokens');
    if (tokens) {
      setTabValue(3); // índice de la pestaña "Google Calendar"
    }
  }, []);

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        color="#ED1F80"
        align="center"
        sx={{ py: 3 }}
      >
        Panel de Administración
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          centered
          sx={{
            '& .MuiTab-root': {
              color: '#666',
              fontWeight: 'bold',
              '&.Mui-selected': {
                color: '#ED1F80',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#ED1F80',
            },
          }}
        >
          <Tab label="Calendario" />
          <Tab label="Lista de Citas" />
          <Tab label="Configuración" />
          <Tab label="Google Calendar" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <AdminScheduleCalendar />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <AdminScheduleList />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <AdminDashboard />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <GoogleAuthSetup />
      </TabPanel>
    </Box>
  );
}
