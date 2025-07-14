import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

interface CalendarEvent {
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

interface MeetingDetails {
  eventId: string;
  meetLink: string;
  htmlLink: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      startDateTime,
      endDateTime,
      attendeeEmail,
      attendeeName,
      credentials,
    } = body;

    // Validar que tenemos las credenciales necesarias
    if (!credentials || !credentials.access_token) {
      return NextResponse.json(
        { success: false, message: 'Credenciales de Google no proporcionadas' },
        { status: 400 }
      );
    }

    // Configurar OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Establecer las credenciales
    oauth2Client.setCredentials({
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token,
      token_type: credentials.token_type,
    });

    // Verificar si el token necesita ser refrescado
    try {
      const tokenInfo = await oauth2Client.getAccessToken();
      if (!tokenInfo.token) {
        throw new Error('Token inválido');
      }
    } catch (error) {
      console.log(error);

      try {
        const { credentials: newCredentials } =
          await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(newCredentials);
      } catch (refreshError) {
        console.log(refreshError);

        return NextResponse.json(
          { success: false, message: 'Error al refrescar token de Google' },
          { status: 401 }
        );
      }
    }

    // Inicializar Google Calendar API
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Crear el evento
    const event: CalendarEvent = {
      summary: title,
      description: description,
      start: {
        dateTime: startDateTime,
        timeZone: 'America/New_York', // Ajustar según tu zona horaria
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'America/New_York',
      },
      attendees: [
        {
          email: attendeeEmail,
          displayName: attendeeName,
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

    // Crear el evento en Google Calendar
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all', // Enviar invitaciones automáticamente
    });

    const createdEvent = response.data;
    const meetLink =
      createdEvent.conferenceData?.entryPoints?.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (entry: any) => entry.entryPointType === 'video'
      )?.uri || '';

    const meetingDetails: MeetingDetails = {
      eventId: createdEvent.id || '',
      meetLink,
      htmlLink: createdEvent.htmlLink || '',
    };

    return NextResponse.json({
      success: true,
      message: 'Evento creado exitosamente',
      data: meetingDetails,
    });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      {
        success: false,
        message: `Error al crear el evento: ${
          error instanceof Error ? error.message : 'Error desconocido'
        }`,
      },
      { status: 500 }
    );
  }
}
