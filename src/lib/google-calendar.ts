import { google } from 'googleapis';
import { GoogleAuthManager, GoogleCredentials } from './google-auth';

export interface CalendarEvent {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees: Array<{
    email: string;
    displayName?: string;
  }>;
  conferenceData: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: {
        type: string;
      };
    };
  };
}

export interface MeetingDetails {
  eventId: string;
  meetLink: string;
  htmlLink: string;
}

export class GoogleCalendarManager {
  private authManager: GoogleAuthManager;
  private calendar: ReturnType<typeof google.calendar> | null = null;

  constructor(authManager: GoogleAuthManager) {
    this.authManager = authManager;
  }

  // Inicializar cliente de Calendar
  private initializeCalendar(credentials: GoogleCredentials) {
    this.authManager.setCredentials(credentials);
    const auth = this.authManager.getAuthenticatedClient();
    this.calendar = google.calendar({ version: 'v3', auth });
  }

  // Crear evento con Google Meet
  async createMeetingEvent(
    eventData: {
      title: string;
      description: string;
      startDateTime: string; // ISO string
      endDateTime: string; // ISO string
      attendeeEmail: string;
      attendeeName?: string;
    },
    credentials: GoogleCredentials
  ): Promise<MeetingDetails> {
    try {
      // Verificar y refrescar token si es necesario
      let validCredentials = credentials;
      if (!this.authManager.isTokenValid(credentials)) {
        validCredentials = await this.authManager.refreshAccessToken(
          credentials.refresh_token
        );
      }

      this.initializeCalendar(validCredentials);

      const event: CalendarEvent = {
        summary: eventData.title,
        description: eventData.description,
        start: {
          dateTime: eventData.startDateTime,
          timeZone: 'America/New_York', // Ajustar según tu zona horaria
        },
        end: {
          dateTime: eventData.endDateTime,
          timeZone: 'America/New_York',
        },
        attendees: [
          {
            email: eventData.attendeeEmail,
            displayName: eventData.attendeeName,
          },
        ],
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
      };
      // @ts-expect-error: la propiedad 'resource' es aceptada por la API aunque el tipo no la reconozca
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all', // Enviar invitaciones automáticamente
      });

      // @ts-expect-error: ignorar error de propiedad 'data' no reconocida
      const createdEvent = response.data;
      const meetLink =
        createdEvent.conferenceData?.entryPoints?.find(
          (entry: { entryPointType: string; uri?: string }) =>
            entry.entryPointType === 'video'
        )?.uri || '';

      return {
        eventId: createdEvent.id,
        meetLink,
        htmlLink: createdEvent.htmlLink,
      };
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw new Error(`Failed to create calendar event: ${error}`);
    }
  }

  // Actualizar evento
  async updateMeetingEvent(
    eventId: string,
    eventData: Partial<{
      title: string;
      description: string;
      startDateTime: string;
      endDateTime: string;
    }>,
    credentials: GoogleCredentials
  ): Promise<void> {
    try {
      let validCredentials = credentials;
      if (!this.authManager.isTokenValid(credentials)) {
        validCredentials = await this.authManager.refreshAccessToken(
          credentials.refresh_token
        );
      }

      this.initializeCalendar(validCredentials);

      const updateData: Record<string, unknown> = {};

      if (eventData.title) updateData.summary = eventData.title;
      if (eventData.description) updateData.description = eventData.description;
      if (eventData.startDateTime) {
        updateData.start = {
          dateTime: eventData.startDateTime,
          timeZone: 'America/New_York',
        };
      }
      if (eventData.endDateTime) {
        updateData.end = {
          dateTime: eventData.endDateTime,
          timeZone: 'America/New_York',
        };
      }

      // @ts-expect-error: ignorar error de propiedad 'data' no reconocida
      await this.calendar.events.update({
        calendarId: 'primary',
        eventId,
        resource: updateData,
        sendUpdates: 'all',
      });
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw new Error(`Failed to update calendar event: ${error}`);
    }
  }

  // Eliminar evento
  async deleteMeetingEvent(
    eventId: string,
    credentials: GoogleCredentials
  ): Promise<void> {
    try {
      let validCredentials = credentials;
      if (!this.authManager.isTokenValid(credentials)) {
        validCredentials = await this.authManager.refreshAccessToken(
          credentials.refresh_token
        );
      }

      this.initializeCalendar(validCredentials);

      // @ts-expect-error: ignorar error de propiedad 'data' no reconocida
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId,
        sendUpdates: 'all',
      });
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw new Error(`Failed to delete calendar event: ${error}`);
    }
  }
}

import { googleAuthManager } from './google-auth';

// Instancia singleton
export const googleCalendarManager = new GoogleCalendarManager(
  googleAuthManager
);
