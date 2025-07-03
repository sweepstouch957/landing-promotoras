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
        maxWidth: 700,
        mx: 'auto',
        mt: 4,
        p: isMobile ? 2 : 4,
        border: '1px solid #ccc',
        borderRadius: 2,
      }}
    >
      <Typography
        variant="h6"
        fontWeight="bold"
        color="#ED1F80"
        align="center"
        mb={2}
      >
        Lista de reuniones agendadas
      </Typography>

      <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
        <TextField
          label="Filtrar desde"
          type="date"
          value={filterStart}
          onChange={(e) => {
            setFilterStart(e.target.value);
            setPage(0); // reset page on filter change
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
            setPage(0); // reset page on filter change
          }}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
      </Box>

      {filteredMeetings.length === 0 ? (
        <Typography align="center">No hay reuniones agendadas.</Typography>
      ) : (
        <>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Fecha</strong>
                </TableCell>
                <TableCell>
                  <strong>Hora</strong>
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
        mt={2}
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
            borderRadius: '25px',
            py: 1,
            flex: 1,
            '&:hover': {
              backgroundColor: '#fce4ec',
              borderColor: '#e50575',
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
            borderRadius: '25px',
            py: 1,
            flex: 1,
            '&:hover': {
              backgroundColor: '#fce4ec',
              borderColor: '#e50575',
            },
          }}
        >
          Borrar todas las citas
        </Button>
      </Box>
    </Box>
  );
}
