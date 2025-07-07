import nodemailer from 'nodemailer';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface AppointmentEmailData {
  userEmail: string;
  userName: string;
  appointmentDate: string;
  appointmentTime: string;
  meetLink: string;
  userPhone?: string;
  userAge?: number;
  userZip?: string;
  userSupermarket?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // Contraseña de aplicación de Gmail
      },
    });
  }

  // Enviar email genérico
  async sendEmail(emailData: EmailData): Promise<void> {
    try {
      const mailOptions = {
        from: `"Landing Promotoras" <${process.env.SMTP_USER}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error}`);
    }
  }

  // Generar HTML para email de confirmación al usuario
  private generateUserConfirmationHTML(data: AppointmentEmailData): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Cita</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            color: #ED1F80;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .title {
            color: #ED1F80;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .appointment-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #ED1F80;
          }
          .detail-row {
            margin: 10px 0;
            display: flex;
            align-items: center;
          }
          .detail-label {
            font-weight: bold;
            color: #ED1F80;
            min-width: 120px;
          }
          .meet-button {
            display: inline-block;
            background-color: #ED1F80;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
          .important-note {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Landing Promotoras</div>
            <h1 class="title">¡Tu cita ha sido confirmada!</h1>
          </div>

          <p>Hola <strong>${data.userName}</strong>,</p>
          
          <p>Nos complace confirmar que tu cita ha sido agendada exitosamente. A continuación encontrarás todos los detalles:</p>

          <div class="appointment-details">
            <h3 style="color: #ED1F80; margin-top: 0;">Detalles de tu Cita</h3>
            <div class="detail-row">
              <span class="detail-label">📅 Fecha:</span>
              <span>${data.appointmentDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">🕐 Hora:</span>
              <span>${data.appointmentTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">👤 Participante:</span>
              <span>${data.userName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📧 Email:</span>
              <span>${data.userEmail}</span>
            </div>
          </div>

          <div class="important-note">
            <strong>📝 Importante:</strong> Tu reunión se realizará por Google Meet. Haz clic en el botón de abajo para unirte a la videollamada en el horario programado.
          </div>

          <div style="text-align: center;">
            <a href="${data.meetLink}" class="meet-button">
              🎥 Unirse a Google Meet
            </a>
          </div>

          <div class="important-note">
            <strong>💡 Consejos para tu reunión:</strong>
            <ul>
              <li>Asegúrate de tener una conexión a internet estable</li>
              <li>Prueba tu cámara y micrófono antes de la reunión</li>
              <li>Únete unos minutos antes de la hora programada</li>
              <li>Ten a mano cualquier documento que puedas necesitar</li>
            </ul>
          </div>

          <p>Si necesitas reprogramar o cancelar tu cita, por favor contáctanos con anticipación.</p>

          <div class="footer">
            <p>¡Esperamos verte pronto!</p>
            <p><strong>Equipo de Landing Promotoras</strong></p>
            <p style="font-size: 12px; color: #999;">
              Este es un email automático, por favor no respondas a este mensaje.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generar HTML para email de notificación al administrador
  private generateAdminNotificationHTML(data: AppointmentEmailData): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nueva Cita Agendada</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            background-color: #ED1F80;
            color: white;
            padding: 20px;
            border-radius: 8px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
          }
          .user-info {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #ED1F80;
          }
          .detail-row {
            margin: 10px 0;
            display: flex;
            align-items: center;
          }
          .detail-label {
            font-weight: bold;
            color: #ED1F80;
            min-width: 140px;
          }
          .meet-button {
            display: inline-block;
            background-color: #ED1F80;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 20px;
            font-weight: bold;
            margin: 15px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">🎉 Nueva Cita Agendada</h1>
            <p style="margin: 0;">Se ha registrado una nueva cita en el sistema</p>
          </div>

          <div class="user-info">
            <h3 style="color: #ED1F80; margin-top: 0;">Información del Usuario</h3>
            <div class="detail-row">
              <span class="detail-label">👤 Nombre:</span>
              <span>${data.userName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📧 Email:</span>
              <span>${data.userEmail}</span>
            </div>
            ${
              data.userPhone
                ? `
            <div class="detail-row">
              <span class="detail-label">📱 Teléfono:</span>
              <span>${data.userPhone}</span>
            </div>
            `
                : ''
            }
            ${
              data.userAge
                ? `
            <div class="detail-row">
              <span class="detail-label">🎂 Edad:</span>
              <span>${data.userAge} años</span>
            </div>
            `
                : ''
            }
            ${
              data.userZip
                ? `
            <div class="detail-row">
              <span class="detail-label">📍 Código Postal:</span>
              <span>${data.userZip}</span>
            </div>
            `
                : ''
            }
            ${
              data.userSupermarket
                ? `
            <div class="detail-row">
              <span class="detail-label">🏪 Supermercado:</span>
              <span>${data.userSupermarket}</span>
            </div>
            `
                : ''
            }
          </div>

          <div class="user-info">
            <h3 style="color: #ED1F80; margin-top: 0;">Detalles de la Cita</h3>
            <div class="detail-row">
              <span class="detail-label">📅 Fecha:</span>
              <span>${data.appointmentDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">🕐 Hora:</span>
              <span>${data.appointmentTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">🎥 Google Meet:</span>
              <a href="${
                data.meetLink
              }" class="meet-button">Unirse a la reunión</a>
            </div>
          </div>

          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>✅ Acciones realizadas automáticamente:</strong>
            <ul>
              <li>Evento creado en Google Calendar</li>
              <li>Enlace de Google Meet generado</li>
              <li>Email de confirmación enviado al usuario</li>
              <li>Invitación de calendario enviada al usuario</li>
            </ul>
          </div>

          <div class="footer">
            <p><strong>Sistema de Gestión de Citas - Landing Promotoras</strong></p>
            <p style="font-size: 12px; color: #999;">
              Este es un email automático generado por el sistema.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Enviar email de confirmación al usuario
  async sendUserConfirmationEmail(data: AppointmentEmailData): Promise<void> {
    const emailData: EmailData = {
      to: data.userEmail,
      subject: `✅ Confirmación de Cita - ${data.appointmentDate} a las ${data.appointmentTime}`,
      html: this.generateUserConfirmationHTML(data),
      text: `Hola ${data.userName}, tu cita ha sido confirmada para el ${data.appointmentDate} a las ${data.appointmentTime}. Enlace de Google Meet: ${data.meetLink}`,
    };

    await this.sendEmail(emailData);
  }

  // Enviar email de notificación al administrador
  async sendAdminNotificationEmail(data: AppointmentEmailData): Promise<void> {
    const emailData: EmailData = {
      to: 'aldairleiva42@gmail.com',
      subject: `🎉 Nueva Cita Agendada - ${data.userName} (${data.appointmentDate})`,
      html: this.generateAdminNotificationHTML(data),
      text: `Nueva cita agendada: ${data.userName} (${data.userEmail}) para el ${data.appointmentDate} a las ${data.appointmentTime}. Google Meet: ${data.meetLink}`,
    };

    await this.sendEmail(emailData);
  }
}

// Instancia singleton
export const emailService = new EmailService();
