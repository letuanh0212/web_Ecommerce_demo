// src/model/recommender_Models.js
const natural = require("natural");
const TfIdf = natural.TfIdf;

function cosineSimilarityFromVectors(vecA, vecB) {
  let dot = 0, na = 0, nb = 0;
  const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  for (const k of keys) {
    const a = vecA[k] || 0;
    const b = vecB[k] || 0;
    dot += a * b;
    na += a * a;
    nb += b * b;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

function recommendTFIDF(items, userHistory, topN = 10) {
  if (!Array.isArray(items) || items.length === 0) return [];

  // Cold-start fallback
  if (!userHistory || userHistory.length === 0) {
    return items.slice(0, topN).map(i => ({ id: i.id, name: i.name, score: 0 }));
  }

  const tfidf = new TfIdf();

  // add combined text docs
  items.forEach(item => tfidf.addDocument(item.text || ""));

  // build user vector as average tfidf of purchased docs
  const userVector = {};
  let count = 0;
  userHistory.forEach(pid => {
    const idx = items.findIndex(it => it.id === pid);
    if (idx === -1) return;
    count++;
    tfidf.listTerms(idx).forEach(t => {
      userVector[t.term] = (userVector[t.term] || 0) + t.tfidf;
    });
  });

  if (count === 0) {
    // userHistory doesn't match current items -> fallback
    return items.slice(0, topN).map(i => ({ id: i.id, name: i.name, score: 0 }));
  }

  Object.keys(userVector).forEach(k => userVector[k] /= count);

  // compute scores
  const scores = items
    .filter(i => !userHistory.includes(i.id))
    .map(i => {
      const idx = items.findIndex(it => it.id === i.id);
      const docVec = {};
      tfidf.listTerms(idx).forEach(t => docVec[t.term] = t.tfidf);
      const score = cosineSimilarityFromVectors(userVector, docVec);
      return { id: i.id, name: i.name, score };
    })
    .sort((a,b) => b.score - a.score)
    .slice(0, topN);

  return scores;
}

module.exports = { recommendTFIDF };
