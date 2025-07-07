import { NextRequest, NextResponse } from 'next/server';
import { emailService, AppointmentEmailData } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userEmail,
      userName,
      appointmentDate,
      appointmentTime,
      meetLink,
      userPhone,
      userAge,
      userZip,
      userSupermarket,
      sendToAdmin = true,
      sendToUser = true
    } = body;

    // Validar datos requeridos
    if (!userEmail || !userName || !appointmentDate || !appointmentTime || !meetLink) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const emailData: AppointmentEmailData = {
      userEmail,
      userName,
      appointmentDate,
      appointmentTime,
      meetLink,
      userPhone,
      userAge,
      userZip,
      userSupermarket,
    };

    const results = {
      userEmailSent: false,
      adminEmailSent: false,
      errors: [] as string[],
    };

    // Enviar email al usuario
    if (sendToUser) {
      try {
        await emailService.sendUserConfirmationEmail(emailData);
        results.userEmailSent = true;
      } catch (error) {
        console.error('Error sending user email:', error);
        results.errors.push(`Failed to send user email: ${error}`);
      }
    }

    // Enviar email al administrador
    if (sendToAdmin) {
      try {
        await emailService.sendAdminNotificationEmail(emailData);
        results.adminEmailSent = true;
      } catch (error) {
        console.error('Error sending admin email:', error);
        results.errors.push(`Failed to send admin email: ${error}`);
      }
    }

    // Determinar el estado de la respuesta
    const hasErrors = results.errors.length > 0;
    const allEmailsSent = (!sendToUser || results.userEmailSent) && (!sendToAdmin || results.adminEmailSent);

    return NextResponse.json({
      success: allEmailsSent && !hasErrors,
      data: results,
    }, {
      status: allEmailsSent && !hasErrors ? 200 : 207 // 207 Multi-Status para éxito parcial
    });
  } catch (error) {
    console.error('Error in email sending API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send emails',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

