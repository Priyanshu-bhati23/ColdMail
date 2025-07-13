// client/app/api/send-bulk/route.js
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { name, subject, body, emails } = await req.json();

  if (!name || !subject || !body || !emails || !emails.length) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  try {
    for (const to of emails) {
      await transporter.sendMail({
        from: `"${name}" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html: `<div style="font-family:sans-serif;">${body.replace(/\n/g, '<br>')}</div>`,
      });
    }

    return NextResponse.json({ message: '✅ Emails sent!' });
  } catch (err) {
    console.error('Nodemailer error:', err);
    return NextResponse.json({ error: '❌ Failed to send emails' }, { status: 500 });
  }
}
