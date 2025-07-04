'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  TablePagination,
  useMediaQuery,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface ScheduleData {
  date: string;
  time: string;
}

export default function AdminScheduleList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [meetings, setMeetings] = useState<ScheduleData[]>([]);
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  useEffect(() => {
    const stored = localStorage.getItem('scheduledMeetings');
    if (stored) {
      setMeetings(JSON.parse(stored));
    }
  }, []);

  const filteredMeetings = meetings.filter((m) => {
    if (filterStart && m.date < filterStart) return false;
    if (filterEnd && m.date > filterEnd) return false;
    return true;
  });

  const paginatedMeetings = filteredMeetings.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleExport = () => {
    if (filteredMeetings.length === 0) {
      alert('No hay citas para exportar.');
      return;
    }

    const json = JSON.stringify(filteredMeetings, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'citas_agendadas.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm('¿Seguro que deseas borrar todas las citas?')) {
      localStorage.removeItem('scheduledMeetings');
      setMeetings([]);
      alert('Citas eliminadas.');
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: '#ffffff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        pt: 8,
        px: 2,
        fontFamily: 'Inter, sans-serif',
        paddingBottom: '80px',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 700,
          backgroundColor: '#fff',
          borderRadius: 4,
          px: 4,
          py: 3,
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Typography
          variant="h5"
          fontWeight="700"
          color="#ED1F80"
          textAlign="center"
          gutterBottom
        >
          Lista de reuniones agendadas
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Box
          display="flex"
          gap={2}
          flexWrap="wrap"
          mb={3}
          justifyContent="center"
        >
          <TextField
            label="Filtrar desde"
            type="date"
            value={filterStart}
            onChange={(e) => {
              setFilterStart(e.target.value);
              setPage(0);
            }}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            label="Filtrar hasta"
            type="date"
            value={filterEnd}
            onChange={(e) => {
              setFilterEnd(e.target.value);
              setPage(0);
            }}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Box>

        {filteredMeetings.length === 0 ? (
          <Typography align="center" sx={{ color: '#666', mb: 2 }}>
            No hay reuniones agendadas.
          </Typography>
        ) : (
          <>
            <Table size="small" sx={{ mb: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography fontWeight={600}>Fecha</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>Hora</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedMeetings.map((meeting, index) => (
                  <TableRow key={index}>
                    <TableCell>{meeting.date}</TableCell>
                    <TableCell>{meeting.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={filteredMeetings.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[rowsPerPage]}
            />
          </>
        )}

        <Box
          mt={3}
          display="flex"
          gap={2}
          flexDirection={isMobile ? 'column' : 'row'}
        >
          <Button
            variant="outlined"
            onClick={handleExport}
            sx={{
              borderColor: '#ED1F80',
              color: '#ED1F80',
              fontWeight: 'bold',
              borderRadius: 3,
              py: 1.2,
              flex: 1,
              '&:hover': {
                backgroundColor: '#fce4ec',
                borderColor: '#d0176e',
              },
            }}
          >
            Exportar citas JSON
          </Button>

          <Button
            variant="outlined"
            onClick={handleClear}
            sx={{
              borderColor: '#ED1F80',
              color: '#ED1F80',
              fontWeight: 'bold',
              borderRadius: 3,
              py: 1.2,
              flex: 1,
              '&:hover': {
                backgroundColor: '#fce4ec',
                borderColor: '#d0176e',
              },
            }}
          >
            Borrar todas las citas
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
