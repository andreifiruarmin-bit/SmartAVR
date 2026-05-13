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

// netlify/functions/deposit-summary.ts
var deposit_summary_exports = {};
__export(deposit_summary_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(deposit_summary_exports);
var handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  try {
    const { savings, rates } = JSON.parse(event.body || "{}");
    let totalRON = 0;
    const byType = {};
    savings.forEach((s) => {
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
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }),
      headers: { "Content-Type": "application/json" }
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid data" })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=deposit-summary.js.map
