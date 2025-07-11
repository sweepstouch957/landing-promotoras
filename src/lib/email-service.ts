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
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // Gmail app password
      },
    });
  }

  // Send a generic email
  async sendEmail(emailData: EmailData): Promise<void> {
    try {
      const mailOptions = {
        from: `"Landing Promoters" <${process.env.SMTP_USER}>`,
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

  // Generate HTML for user confirmation email
  private generateUserConfirmationHTML(data: AppointmentEmailData): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Confirmation</title>
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
            <div class="logo">Sweepstouch Booster Program</div>
            <h1 class="title">All set! Your appointment to learn about the program is scheduled.</h1>
          </div>

          <p>Hello <strong>${data.userName}</strong>,</p>
          
          <p>Thank you for scheduling your appointment with us! Your video call is now confirmed, and we’re excited to move forward with you in the selection process:</p>
          <p>Here are the details:</p>

          <div class="appointment-details">
            <h3 style="color: #ED1F80; margin-top: 0;">Appointment Details</h3>
            <div class="detail-row">
              <span class="detail-label">📅 Date:</span>
              <span>${data.appointmentDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">🕐 Time:</span>
              <span>${data.appointmentTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">👤 Name:</span>
              <span>${data.userName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📧 Email:</span>
              <span>${data.userEmail}</span>
            </div>
          </div>

          <div class="important-note">
            <strong>📝 Important:</strong> Your meeting will be held via Google Meet. Click the button below to join the video call at your scheduled time.
          </div>
          <div class="important-note">
            <strong>💡 Tips for your meeting:</strong>
            Join a few minutes early to make sure your camera, audio, and internet connection are working properly.
            This is a great opportunity for us to get to know you, answer your questions, and explain the Sweepstouch Brand Promoter Program.
          </div>

          <div style="text-align: center; color: white;">
            <a href="${data.meetLink}" class="meet-button">
              🎥 Join Google Meet
            </a>
          </div>

          <p>If you need to reschedule or cancel your appointment, please contact us in advance.</p>

          <div class="footer">
            <p>We look forward to meeting you!</p>
            <p><strong>Sweepstouch Team</strong></p>
            <p style="font-size: 12px; color: #999;">
              This is an automated email, please do not reply.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate HTML for admin notification email
  private generateAdminNotificationHTML(data: AppointmentEmailData): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Appointment Scheduled</title>
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
            color: white;
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
            <h1 class="title">🎉 New Appointment Scheduled</h1>
            <p style="margin: 0;">A new appointment has been registered in the system</p>
          </div>

          <div class="user-info">
            <h3 style="color: #ED1F80; margin-top: 0;">User Information</h3>
            <div class="detail-row">
              <span class="detail-label">👤 Name:</span>
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
              <span class="detail-label">📱 Phone:</span>
              <span>${data.userPhone}</span>
            </div>
            `
                : ''
            }
            ${
              data.userAge
                ? `
            <div class="detail-row">
              <span class="detail-label">🎂 Age:</span>
              <span>${data.userAge} years</span>
            </div>
            `
                : ''
            }
            ${
              data.userZip
                ? `
            <div class="detail-row">
              <span class="detail-label">📍 ZIP Code:</span>
              <span>${data.userZip}</span>
            </div>
            `
                : ''
            }
            ${
              data.userSupermarket
                ? `
            <div class="detail-row">
              <span class="detail-label">🏪 Supermarket:</span>
              <span>${data.userSupermarket}</span>
            </div>
            `
                : ''
            }
          </div>

          <div class="user-info">
            <h3 style="color: #ED1F80; margin-top: 0;">Appointment Details</h3>
            <div class="detail-row">
              <span class="detail-label">📅 Date:</span>
              <span>${data.appointmentDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">🕐 Time:</span>
              <span>${data.appointmentTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">🎥 Google Meet:</span>
              <a href="${data.meetLink}" class="meet-button">Join Meeting</a>
            </div>
          </div>

          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>✅ Automatically completed actions:</strong>
            <ul>
              <li>Event created in Google Calendar</li>
              <li>Google Meet link generated</li>
              <li>Confirmation email sent to user</li>
              <li>Calendar invitation sent to user</li>
            </ul>
          </div>

          <div class="footer">
            <p><strong>Appointment Management System - Landing Promoters</strong></p>
            <p style="font-size: 12px; color: #999;">
              This is an automated email generated by the system.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send confirmation email to user
  async sendUserConfirmationEmail(data: AppointmentEmailData): Promise<void> {
    const emailData: EmailData = {
      to: data.userEmail,
      subject: `✅ Appointment Confirmation - ${data.appointmentDate} at ${data.appointmentTime}`,
      html: this.generateUserConfirmationHTML(data),
      text: `Hi ${data.userName}, your appointment is confirmed for ${data.appointmentDate} at ${data.appointmentTime}. Google Meet link: ${data.meetLink}`,
    };

    await this.sendEmail(emailData);
  }

  // Send notification email to admin
  async sendAdminNotificationEmail(data: AppointmentEmailData): Promise<void> {
    const emailData: EmailData = {
      to: 'cesar@sweepstouch.com',
      subject: `🎉 New Appointment - ${data.userName} (${data.appointmentDate})`,
      html: this.generateAdminNotificationHTML(data),
      text: `New appointment scheduled: ${data.userName} (${data.userEmail}) on ${data.appointmentDate} at ${data.appointmentTime}. Google Meet: ${data.meetLink}`,
    };

    await this.sendEmail(emailData);
  }

  // En email-service.ts, dentro de la clase EmailService
  async sendRawEmail(data: EmailData): Promise<void> {
    await this.sendEmail(data);
  }
}

// Singleton instance
export const emailService = new EmailService();
