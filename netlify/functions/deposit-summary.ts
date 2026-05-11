import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { savings, rates } = JSON.parse(event.body || '{}');
    
    // Simple summary logic (could be more complex like interest calculations)
    let totalRON = 0;
    const byType: Record<string, number> = {};

    savings.forEach((s: any) => {
      const rate = rates[s.currency] || 1;
      const valueRON = s.amount * rate;
      totalRON += valueRON;
      byType[s.type] = (byType[s.type] || 0) + valueRON;
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        totalRON,
        byType,
        timestamp: new Date().toISOString()
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid data' }),
    };
  }
};
