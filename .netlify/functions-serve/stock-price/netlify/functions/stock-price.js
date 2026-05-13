var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// netlify/functions/stock-price.ts
var stock_price_exports = {};
__export(stock_price_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(stock_price_exports);
var cachedPrice = {};
var cacheExpiry = 0;
var handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
  try {
    const symbol = event.queryStringParameters?.symbol;
    if (!symbol) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: "Symbol parameter is required",
          message: "Please provide a stock symbol (e.g., TLV, H2O, SNG)"
        }),
        headers
      };
    }
    const now = Date.now();
    if (cachedPrice[symbol] && now < cacheExpiry) {
      return {
        statusCode: 200,
        body: JSON.stringify(cachedPrice[symbol]),
        headers
      };
    }
    const apiKey = process.env.BVB_API_KEY;
    if (!apiKey) {
      console.log(`Using Yahoo Finance API for symbol: ${symbol}`);
      try {
        const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.BX?interval=1d&range=3mo`);
        if (!response.ok) {
          throw new Error(`Failed to fetch stock price from Yahoo Finance for ${symbol}`);
        }
        const data = await response.json();
        const chartData = data.chart?.result?.[0] || [];
        const latestData = chartData[chartData.length - 1];
        if (!latestData || latestData.close === void 0) {
          throw new Error(`No price data found for ${symbol}`);
        }
        const currentPrice = latestData.close;
        const previousClose = chartData[chartData.length - 2]?.close || latestData.close;
        const changePercent = previousClose ? (currentPrice - previousClose) / previousClose * 100 : 0;
        const priceResponse = {
          symbol,
          currentPrice,
          currency: "RON",
          changePercent,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
        cachedPrice[symbol] = priceResponse;
        cacheExpiry = now + 60 * 60 * 1e3;
        return {
          statusCode: 200,
          body: JSON.stringify(priceResponse),
          headers
        };
      } catch (error) {
        console.error("Yahoo Finance API error:", error);
        const mockPrices = {
          "TLV": 85.5,
          "H2O": 125.3,
          "SNG": 45.8
        };
        const mockPrice = mockPrices[symbol] || 100;
        const priceResponse = {
          symbol,
          currentPrice: mockPrice,
          currency: "RON",
          changePercent: 0,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
        return {
          statusCode: 200,
          body: JSON.stringify(priceResponse),
          headers
        };
      }
    }
    console.log(`Using BVB API for symbol: ${symbol}`);
    try {
      const bvbResponse = await fetch(`https://bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=${symbol}`);
      if (bvbResponse.ok) {
        const html = await bvbResponse.text();
        const priceMatch = html.match(/<span[^>]*>([\d,]+)\s*<\/span>/);
        if (priceMatch) {
          const currentPrice2 = parseFloat(priceMatch[1].replace(/\./g, ""));
          const priceResponse2 = {
            symbol,
            currentPrice: currentPrice2,
            currency: "RON",
            changePercent: 0,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          };
          cachedPrice[symbol] = priceResponse2;
          cacheExpiry = now + 60 * 60 * 1e3;
          return {
            statusCode: 200,
            body: JSON.stringify(priceResponse2),
            headers
          };
        }
      }
      console.log("BVB scraping failed, falling back to public API");
      const publicResponse = await fetch(`https://api.bvb.ro/${symbol}`);
      if (!publicResponse.ok) {
        throw new Error(`Failed to fetch stock price from BVB public API for ${symbol}`);
      }
      const data = await publicResponse.json();
      const currentPrice = data.price || 0;
      const changePercent = data.changePercent || 0;
      const priceResponse = {
        symbol,
        currentPrice,
        currency: "RON",
        changePercent,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      cachedPrice[symbol] = priceResponse;
      cacheExpiry = now + 60 * 60 * 1e3;
      return {
        statusCode: 200,
        body: JSON.stringify(priceResponse),
        headers
      };
    } catch (error) {
      console.error("BVB API error:", error);
      const mockPrices = {
        "TLV": 85.5,
        "H2O": 125.3,
        "SNG": 45.8
      };
      const mockPrice = mockPrices[symbol] || 100;
      const priceResponse = {
        symbol,
        currentPrice: mockPrice,
        currency: "RON",
        changePercent: 0,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      return {
        statusCode: 200,
        body: JSON.stringify(priceResponse),
        headers
      };
    }
  } catch (error) {
    console.error("Stock price API error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to fetch stock price",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      headers
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=stock-price.js.map
