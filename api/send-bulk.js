import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { name, subject, body, emails } = req.body;

  if (!name || !subject || !body || !emails || !emails.length) {
    return res.status(400).json({ error: 'Missing fields' });
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

    res.status(200).json({ message: '✅ Emails sent!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '❌ Failed to send emails' });
  }
}
