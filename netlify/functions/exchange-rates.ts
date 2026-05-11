import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  const sources = [
    'https://open.er-api.com/v6/latest/RON',
    'https://api.frankfurter.app/latest?from=RON'
  ];

  for (const url of sources) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      
      const data = await response.json();
      const rates: Record<string, number> = { RON: 1 };
      
      if (data.rates) {
        Object.entries(data.rates).forEach(([cur, val]) => {
          if (cur !== 'RON') {
            rates[cur] = 1 / (val as number);
          }
        });

        // XAU (Gold) fallback (Price per gram in RON)
        if (!rates['XAU']) {
          rates['XAU'] = 350; 
        }

        return {
          statusCode: 200,
          body: JSON.stringify({ rates, timestamp: new Date().toISOString() }),
          headers: { 'Content-Type': 'application/json' }
        };
      }
    } catch (error) {
      console.warn(`Failed to fetch from ${url}:`, error);
    }
  }

  return {
    statusCode: 500,
    body: JSON.stringify({ error: 'Failed to fetch exchange rates' }),
  };
};
