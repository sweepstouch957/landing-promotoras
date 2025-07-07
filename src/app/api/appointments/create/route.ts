import { NextRequest, NextResponse } from 'next/server';
import { googleCalendarManager } from '@/lib/google-calendar';
import { emailService } from '@/lib/email-service';
import { GoogleCredentials } from '@/lib/google-auth';
import { format, addHours } from 'date-fns';
import { es } from 'date-fns/locale';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      // Datos del formulario
      nombre,
      apellido,
      telefono,
      correo,
      edad,
      zip,
      supermercado,
      // Datos de la cita
      date, // YYYY-MM-DD
      time, // HH:mm
      // Credenciales de Google
      credentials
    } = body;

    // Validar datos requeridos
    if (!nombre || !apellido || !correo || !date || !time || !credentials) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Crear fechas ISO para el evento
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    const startDate = new Date(year, month - 1, day, hour, minute);
    const endDate = addHours(startDate, 1); // Reunión de 1 hora

    const startDateTime = startDate.toISOString();
    const endDateTime = endDate.toISOString();

    // Formatear fecha para mostrar
    const formattedDate = format(startDate, 'PPP', { locale: es });
    const formattedTime = format(startDate, 'HH:mm');

    const userName = `${nombre} ${apellido}`;

    try {
      // 1. Crear evento en Google Calendar con Meet
      const meetingDetails = await googleCalendarManager.createMeetingEvent(
        {
          title: `Reunión con ${userName}`,
          description: `Reunión agendada con ${userName} (${correo})`,
          startDateTime,
          endDateTime,
          attendeeEmail: correo,
          attendeeName: userName,
        },
        credentials as GoogleCredentials
      );

      // 2. Enviar emails
      const emailData = {
        userEmail: correo,
        userName,
        appointmentDate: formattedDate,
        appointmentTime: formattedTime,
        meetLink: meetingDetails.meetLink,
        userPhone: telefono,
        userAge: edad,
        userZip: zip,
        userSupermarket: supermercado,
      };

      // Enviar emails en paralelo
      const emailPromises = [
        emailService.sendUserConfirmationEmail(emailData),
        emailService.sendAdminNotificationEmail(emailData),
      ];

      const emailResults = await Promise.allSettled(emailPromises);
      
      // Verificar resultados de emails
      const userEmailSuccess = emailResults[0].status === 'fulfilled';
      const adminEmailSuccess = emailResults[1].status === 'fulfilled';

      // 3. Preparar datos de la cita para guardar
      const appointmentData = {
        date,
        time,
        nombre,
        apellido,
        telefono,
        correo,
        edad,
        zip,
        supermercado,
        meetLink: meetingDetails.meetLink,
        eventId: meetingDetails.eventId,
        htmlLink: meetingDetails.htmlLink,
      };

      return NextResponse.json({
        success: true,
        data: {
          appointment: appointmentData,
          meeting: meetingDetails,
          emails: {
            userSent: userEmailSuccess,
            adminSent: adminEmailSuccess,
            errors: emailResults
              .filter(result => result.status === 'rejected')
              .map(result => (result as PromiseRejectedResult).reason.message),
          },
        },
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      return NextResponse.json(
        { 
          error: 'Failed to create appointment',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error parsing request:', error);
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}

