import { NextRequest, NextResponse } from 'next/server';
import { googleCalendarManager } from '@/lib/google-calendar';
import { GoogleCredentials } from '@/lib/google-auth';

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
      credentials
    } = body;

    // Validar datos requeridos
    if (!title || !startDateTime || !endDateTime || !attendeeEmail || !credentials) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Crear evento en Google Calendar con Meet
    const meetingDetails = await googleCalendarManager.createMeetingEvent(
      {
        title,
        description: description || `Reunión agendada con ${attendeeName || attendeeEmail}`,
        startDateTime,
        endDateTime,
        attendeeEmail,
        attendeeName,
      },
      credentials as GoogleCredentials
    );

    return NextResponse.json({
      success: true,
      data: meetingDetails,
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create meeting',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

