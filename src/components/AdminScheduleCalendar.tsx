'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface ScheduleData {
  date: string; // formato YYYY-MM-DD
  time: string; // formato HH:mm
}

type MyEvent = {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
};

const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function AdminScheduleCalendar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [meetings, setMeetings] = useState<ScheduleData[]>([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState<MyEvent[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('scheduledMeetings');
    if (stored) {
      setMeetings(JSON.parse(stored));
    }
  }, []);

  const events = useMemo(() => {
    return meetings.map((m) => {
      const [year, month, day] = m.date.split('-').map(Number);
      const [hour, minute] = m.time.split(':').map(Number);
      const date = new Date(year, month - 1, day, hour, minute);
      return {
        title: m.time,
        start: date,
        end: date,
        allDay: false,
      } as MyEvent;
    });
  }, [meetings]);

  const handleSelectSlot = (slotInfo: {
    start: Date;
    end: Date;
    action: string;
  }) => {
    const clickedDate = format(slotInfo.start, 'yyyy-MM-dd');
    const dayEvents = events.filter(
      (e) => format(e.start, 'yyyy-MM-dd') === clickedDate
    );
    setSelectedDateEvents(dayEvents);
  };

  const handleSelectEvent = (event: MyEvent) => {
    setSelectedDateEvents([event]);
  };

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: 'auto',
        mt: 4,
        p: isMobile ? 2 : 4,
        bgcolor: '#ffffff',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        marginBottom: '80px',
      }}
    >
      <Typography
        variant="h5"
        fontWeight="bold"
        color="#ED1F80"
        align="center"
        mb={3}
      >
        Calendario de Citas
      </Typography>

      <Box
        sx={{
          '& .rbc-calendar': {
            backgroundColor: '#fff',
          },
          '& .rbc-toolbar': {
            backgroundColor: '#f8f8f8',
            borderRadius: 2,
            padding: '8px',
            marginBottom: 2,
          },
          '& .rbc-toolbar-label': {
            fontWeight: 'bold',
            fontSize: '1.1rem',
          },
          '& .rbc-month-view, & .rbc-time-view': {
            border: 'none',
          },
          '& .rbc-day-bg + .rbc-day-bg': {
            borderLeft: '1px solid #e0e0e0',
          },
          '& .rbc-header': {
            backgroundColor: '#fafafa',
            fontWeight: '600',
            fontSize: '0.9rem',
            borderBottom: '1px solid #e0e0e0',
          },
          '& .rbc-date-cell': {
            padding: '4px',
          },
          '& .rbc-event': {
            borderRadius: '6px',
            padding: '2px 4px',
          },
        }}
      >
        <Calendar<MyEvent>
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          views={['month']}
          popup
          eventPropGetter={() => ({
            style: {
              backgroundColor: '#ED1F80',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              padding: '2px 6px',
              fontSize: '0.8rem',
            },
          })}
        />
      </Box>

      {selectedDateEvents.length > 0 && (
        <Box mt={3}>
          <Typography variant="subtitle1" fontWeight="bold" mb={1}>
            Citas para el{' '}
            {format(selectedDateEvents[0].start, 'PPP', { locale: es })}
          </Typography>
          {selectedDateEvents.map((e, index) => (
            <Typography key={index} sx={{ fontSize: '0.95rem' }}>
              {format(e.start, 'HH:mm')}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
}
