const client = require('../config/elasticClient');

async function analyzeTextES(text) {
  if (!text) return "";

  const res = await client.indices.analyze({
    index: "items",
    body: {
      analyzer: "standard",
      text
    }
  });

  return res.tokens.map(t => t.token).join(" ");
}

module.exports = { analyzeTextES };
