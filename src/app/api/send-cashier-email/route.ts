import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, name, accessCode } = (await req.json()) as {
      email: string;
      name?: string;
      accessCode?: string;
    };

    if (!email) {
      return NextResponse.json({ message: 'Missing email' }, { status: 400 });
    }

    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT || 465);
    const secure = String(process.env.SMTP_SECURE || 'true') === 'true';
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
      return NextResponse.json(
        { message: 'SMTP_USER or SMTP_PASS missing' },
        { status: 500 }
      );
    }

    // Crear transporte con las variables del .env
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure, // true para 465, false para 587
      auth: { user, pass },
    });

    // Construir el HTML del correo
    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; line-height:1.5; color:#333;">
        <h2 style="color:#f82abaff;">Welcome to the Sweepstouch Team!</h2>
        <p>Hello</p>
        <p>Your registration has been successfully completed. Below you’ll find your personal <strong>Access Code</strong>:</p>
        <p style="font-size: 18px; font-weight: bold; color: #f82abaff;">${accessCode ?? '---'}</p>
        <p>Please keep this code safe, as you’ll need it to log in to the system.</p>
        <br />
        <p>Thank you for being part of Sweepstouch!</p>
        <p>Best regards,<br /><strong>The Sweepstouch Team</strong></p>
      </div>
    `;

    // Enviar el correo
    const info = await transporter.sendMail({
      from: `"Sweepstouch" <${user}>`,
      to: email,
      subject: 'Tus credenciales de acceso - Sweepstouch',
      html,
    });

    console.log('Email sent:', info.messageId);
    return NextResponse.json({ ok: true, messageId: info.messageId });
  } catch (e: any) {
    console.error('SMTP error:', e);
    return NextResponse.json(
      { message: e?.message ?? 'Server error' },
      { status: 500 }
    );
  }
}
