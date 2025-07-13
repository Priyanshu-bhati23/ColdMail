import { NextResponse } from 'next/server';

export async function POST(req) {
  console.log('🔑 OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY || 'NOT FOUND');

  const body = await req.json();
  const { name, target, offer } = body;

  if (!name || !target || !offer) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const prompt = `
You are a cold email copywriter.
Write a concise, friendly cold outreach email from "${name}" to someone in "${target}".
The offer is: "${offer}".
Make it persuasive and under 100 words.
`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://coldmail-green.vercel.app',
        'X-Title': 'ColdReach MVP',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    console.log('🧠 OpenRouter Response:', JSON.stringify(data, null, 2));

    const generated = data?.choices?.[0]?.message?.content;

    if (!generated) {
      return NextResponse.json(
        { error: 'No content returned from OpenRouter', raw: data },
        { status: 500 }
      );
    }

    return NextResponse.json({ generatedEmail: generated });
  } catch (error) {
    const text = await error?.response?.text?.();
    console.error('❌ OpenRouter fetch error:', error);
    console.error('🔍 Raw response text:', text);
    return NextResponse.json({ error: 'Failed to generate email', details: text || error.message }, { status: 500 });
  }
}
