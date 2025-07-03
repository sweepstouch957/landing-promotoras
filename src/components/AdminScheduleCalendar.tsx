'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import es from 'date-fns/locale/es';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface ScheduleData {
  date: string; // formato YYYY-MM-DD
  time: string; // formato HH:mm
}

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
  const [selectedDateEvents, setSelectedDateEvents] = useState<Event[]>([]);

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
      } as Event;
    });
  }, [meetings]);

  const handleSelectSlot = (slotInfo: any) => {
    const clickedDate = format(slotInfo.start, 'yyyy-MM-dd');
    const dayEvents = events.filter(
      (e) => format(e.start as Date, 'yyyy-MM-dd') === clickedDate
    );
    setSelectedDateEvents(dayEvents);
  };

  return (
    <Box
      sx={{
        maxWidth: 900,
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
        Calendario de citas
      </Typography>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectSlot}
        views={['month']}
        popup
        eventPropGetter={() => ({
          style: {
            backgroundColor: '#ED1F80',
            color: 'white',
            borderRadius: '5px',
            border: 'none',
            padding: '2px 4px',
          },
        })}
      />

      {selectedDateEvents.length > 0 && (
        <Box mt={2}>
          <Typography variant="subtitle1" fontWeight="bold" mb={1}>
            Citas para el{' '}
            {format(selectedDateEvents[0].start as Date, 'PPP', { locale: es })}
          </Typography>
          {selectedDateEvents.map((e, index) => (
            <Typography key={index}>
              {format(e.start as Date, 'HH:mm')}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
}
