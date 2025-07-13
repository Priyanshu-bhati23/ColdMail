import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const { name, subject, body, emails } = await req.json();

    if (!name || !subject || !body || !emails || !emails.length) {
      return Response.json({ error: 'Missing fields' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    for (const to of emails) {
      await transporter.sendMail({
        from: `"${name}" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html: `<div style="font-family:sans-serif;">${body.replace(/\n/g, '<br>')}</div>`,
      });
    }

    return Response.json({ message: '✅ Emails sent!' });
  } catch (err) {
    console.error('❌ Email error:', err);
    return Response.json({ error: '❌ Failed to send emails' }, { status: 500 });
  }
}
