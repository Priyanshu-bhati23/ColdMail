import axios from 'axios';

export async function POST(req) {
  try {
    const { name, target, offer } = await req.json();

    const prompt = `
You are a cold email copywriter.
Write a concise, friendly cold outreach email from "${name}" to someone in "${target}".
The offer is: "${offer}".
Make it persuasive and under 100 words.
    `;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'mistralai/mistral-7b-instruct',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://coldmail-green.vercel.app', // your deployed domain
          'X-Title': 'ColdReach MVP'
        }
      }
    );

    const generatedEmail = response.data.choices[0].message.content;
    return Response.json({ generatedEmail });
  } catch (err) {
    console.error('❌ OpenRouter Error:', err.message);
    return Response.json({ generatedEmail: '❌ Failed to generate email.' }, { status: 500 });
  }
}
