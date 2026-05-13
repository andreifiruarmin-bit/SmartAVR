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

// netlify/functions/exchange-rates.ts
var exchange_rates_exports = {};
__export(exchange_rates_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(exchange_rates_exports);
var handler = async (event, context) => {
  const sources = [
    "https://open.er-api.com/v6/latest/RON",
    "https://api.frankfurter.app/latest?from=RON"
  ];
  for (const url of sources) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const data = await response.json();
      const rates = { RON: 1 };
      if (data.rates) {
        Object.entries(data.rates).forEach(([cur, val]) => {
          if (cur !== "RON") {
            rates[cur] = 1 / val;
          }
        });
        if (!rates["XAU"]) {
          rates["XAU"] = 350;
        }
        return {
          statusCode: 200,
          body: JSON.stringify({ rates, timestamp: (/* @__PURE__ */ new Date()).toISOString() }),
          headers: { "Content-Type": "application/json" }
        };
      }
    } catch (error) {
      console.warn(`Failed to fetch from ${url}:`, error);
    }
  }
  return {
    statusCode: 500,
    body: JSON.stringify({ error: "Failed to fetch exchange rates" })
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=exchange-rates.js.map
