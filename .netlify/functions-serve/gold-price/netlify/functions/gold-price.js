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

// netlify/functions/gold-price.ts
var gold_price_exports = {};
__export(gold_price_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(gold_price_exports);
var cachedPrice = null;
var cacheExpiry = 0;
var handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
  try {
    const now = Date.now();
    if (cachedPrice && now < cacheExpiry) {
      return {
        statusCode: 200,
        body: JSON.stringify(cachedPrice),
        headers
      };
    }
    const apiKey = process.env.GOLD_API_KEY;
    if (!apiKey) {
      console.log("Using fallback gold API (metals.live)");
      try {
        const response2 = await fetch("https://api.metals.live/v1/spot", {
          method: "GET",
          headers: {
            "x-access-token": apiKey
          }
        });
        if (!response2.ok) {
          throw new Error("Failed to fetch gold price from metals.live");
        }
        const data2 = await response2.json();
        const goldData = data2.find((item) => item.currency === "XAU");
        if (!goldData) {
          throw new Error("Gold price not found in response");
        }
        const priceResponse2 = {
          pricePerGram: goldData.price,
          pricePerOunce: goldData.price * 31.1035,
          // 1 ounce = 31.1035 grams
          currency: "RON",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
        cachedPrice = priceResponse2;
        cacheExpiry = now + 60 * 60 * 1e3;
        return {
          statusCode: 200,
          body: JSON.stringify(priceResponse2),
          headers
        };
      } catch (error) {
        console.error("Fallback API error:", error);
        try {
          const bnrResponse = await fetch("https://www.bnr.ro/");
          const bnrText = await bnrResponse.text();
          const goldPriceMatch = bnrText.match(/XAU\s*?[:]\s*([\d,]+)\s*RON/);
          if (goldPriceMatch) {
            const pricePerGram2 = parseFloat(goldPriceMatch[1]);
            const priceResponse2 = {
              pricePerGram: pricePerGram2,
              pricePerOunce: pricePerGram2 * 31.1035,
              currency: "RON",
              timestamp: (/* @__PURE__ */ new Date()).toISOString()
            };
            cachedPrice = priceResponse2;
            cacheExpiry = now + 60 * 60 * 1e3;
            return {
              statusCode: 200,
              body: JSON.stringify(priceResponse2),
              headers
            };
          }
        } catch (bnrError) {
          console.error("BNR fallback error:", bnrError);
          const mockPrice = 280;
          const priceResponse2 = {
            pricePerGram: mockPrice,
            pricePerOunce: mockPrice * 31.1035,
            currency: "RON",
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          };
          return {
            statusCode: 200,
            body: JSON.stringify(priceResponse2),
            headers
          };
        }
      }
    }
    console.log("Using paid gold API");
    const response = await fetch("https://www.goldapi.io/api/XAU/RON", {
      method: "GET",
      headers: {
        "x-access-token": apiKey
      }
    });
    if (!response.ok) {
      throw new Error("Failed to fetch gold price from goldapi.io");
    }
    const data = await response.json();
    const pricePerGram = data.price;
    const priceResponse = {
      pricePerGram,
      pricePerOunce: pricePerGram * 31.1035,
      currency: "RON",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    cachedPrice = priceResponse;
    cacheExpiry = now + 60 * 60 * 1e3;
    return {
      statusCode: 200,
      body: JSON.stringify(priceResponse),
      headers
    };
  } catch (error) {
    console.error("Gold price API error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to fetch gold price",
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
//# sourceMappingURL=gold-price.js.map
