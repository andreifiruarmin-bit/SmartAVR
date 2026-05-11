import { Handler } from '@netlify/functions';
import { GoogleGenAI } from '@google/genai';

export const handler: Handler = async (event, context) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'GEMINI_API_KEY is not configured on server' }),
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { messages } = JSON.parse(event.body || '{}');
    const ai = new GoogleGenAI({ apiKey });

    const prompt = messages[messages.length - 1].content;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ content: response.text }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
