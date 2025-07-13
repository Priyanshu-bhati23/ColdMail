import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { name, target, offer } = req.body;

  const prompt = `
You are a cold email copywriter.
Write a concise, friendly cold outreach email from "${name}" to someone in "${target}".
The offer is: "${offer}".
Make it persuasive and under 100 words.
  `;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'mistralai/mistral-7b-instruct',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'ColdReach MVP',
        },
      }
    );

    const generatedEmail = response.data.choices[0].message.content;
    res.status(200).json({ generatedEmail });
  } catch (err) {
    console.error(err);
    res.status(500).json({ generatedEmail: '❌ Failed to generate email' });
  }
}
