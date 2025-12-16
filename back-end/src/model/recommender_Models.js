const natural = require("natural");
const TfIdf = natural.TfIdf;

// Stop words cho tiếng Việt
const vietnameseStopWords = new Set([
  'và', 'hoặc', 'nhưng', 'vì', 'vậy', 'thì', 'là', 'có', 'không', 'được', 'rất', 'của', 'cho', 'từ', 'trong', 'với', 'đến', 'tại', 'bởi', 'về', 'như', 'để', 'sẽ', 'đã', 'còn', 'mà', 'nếu', 'khi', 'thì', 'lại', 'hay', 'cũng', 'đều', 'đây', 'đó', 'kia', 'này', 'ấy', 'tôi', 'bạn', 'anh', 'chị', 'em', 'ông', 'bà', 'chúng', 'ta', 'mình', 'họ'
]);

function preprocessText(text) {
  // Chuyển về lowercase, loại bỏ ký tự đặc biệt, tách từ
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1 && !vietnameseStopWords.has(word))
    .join(' ');
}

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

  if (!userHistory || userHistory.length === 0) {
    return items.slice(0, topN).map(i => ({ id: i.id, name: i.name, score: 0 }));
  }

  const tfidf = new TfIdf();
  items.forEach(item => {
    const processedText = preprocessText(item.text);
    tfidf.addDocument(processedText);
  });

  const userVector = {};
  let count = 0;

  userHistory.forEach(pid => {
    const index = items.findIndex(i => i.id === pid);
    if (index === -1) return;
    count++;

    tfidf.listTerms(index).forEach(t => {
      userVector[t.term] = (userVector[t.term] || 0) + t.tfidf;
    });
  });

  if (count === 0) {
    return items.slice(0, topN).map(i => ({ id: i.id, name: i.name, score: 0 }));
  }

  Object.keys(userVector).forEach(k => userVector[k] /= count);

  const scores = items
    .filter(i => !userHistory.includes(i.id))
    .map(i => {
      const idx = items.findIndex(it => it.id === i.id);
      const docVec = {};
      tfidf.listTerms(idx).forEach(t => docVec[t.term] = t.tfidf);
      return {
        id: i.id,
        name: i.name,
        score: cosineSimilarityFromVectors(userVector, docVec)
      };
    })
    .sort((a,b) => b.score - a.score)
    .slice(0, topN);

  return scores;
}

module.exports = { recommendTFIDF };
