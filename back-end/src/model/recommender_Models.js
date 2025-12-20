// ===== Stop Words Tiếng Việt + Tiếng Anh =====
const vietnameseStopWords = [
  'và','hoặc','nhưng','vì','vậy','thì','là','có','không','được',
  'rất','của','cho','từ','trong','với','đến','tại','bởi','về',
  'như','để','sẽ','đã','còn','mà','nếu','khi','lại','hay','cũng',
  'đều','đây','đó','kia','này','ấy','tôi','bạn','anh','chị','em','ông','bà',
  'chúng','ta','mình','họ'
];

const englishStopWords = [
  'a','an','the','and','or','but','if','then','is','are','was','were','be',
  'been','being','of','in','on','at','by','for','with','about','against',
  'between','into','through','during','before','after','above','below','to',
  'from','up','down','out','over','under','again','further','once','here',
  'there','when','where','why','how','all','any','both','each','few','more','most',
  'other','some','such','no','nor','not','only','own','same','so','than','too','very'
];

const stopWords = new Set([...vietnameseStopWords, ...englishStopWords]);

// ===== Preprocess + Tokenize =====
function preprocessText(text) {
  return text
    .toLowerCase()
    .replace(/[\.\,\!\?\;\:\(\)\[\]\{\}\"\'\\\/\-_\+\=\*\&\^\%\$\#\@\~\`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 1 && !stopWords.has(word));
}

// ===== Build TF-IDF =====
class calculatorTFIDF {
  constructor() {
    this.docs = [];       // mảng mảng token của các document
    this.df = {};         // document frequency cho từng term
  }

  addDocument(tokens) {
    this.docs.push(tokens);
    const seen = new Set();
    tokens.forEach(t => {
      if (!seen.has(t)) {
        this.df[t] = (this.df[t] || 0) + 1;
        seen.add(t);
      }
    });
  }

  tf(term, tokens) {
    let count = 0;
    tokens.forEach(t => { if (t === term) count++; });
    return count / tokens.length;
  }

  idf(term) {
    const N = this.docs.length;
    const df = this.df[term] || 0;
    return Math.log((N + 1) / (df + 1)) + 1; // smooth
  }

  tfidfVector(tokens) {
    const vec = {};
    tokens.forEach(t => {
      vec[t] = this.tf(t, tokens) * this.idf(t);
    });
    return vec;
  }
}

// ===== Cosine Similarity =====
function cosineSimilarity(vecA, vecB) {
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

//===== Recommendation Example =====
function recommend(items, userHistoryIds, topN = 5) {
  const tfidf = new calculatorTFIDF();

  // Build docs
  items.forEach(item => {
    const tokens = preprocessText(item.text);
    tfidf.addDocument(tokens);
    item.tokens = tokens; // save for later
  });

  // User vector: trung bình token của các item user đã xem
  const userVector = {};
  let count = 0;
  userHistoryIds.forEach(uid => {
    const item = items.find(i => i.id === uid);
    if (!item) return;
    count++;
    const vec = tfidf.tfidfVector(item.tokens);
    for (const k in vec) {
      userVector[k] = (userVector[k] || 0) + vec[k];
    }
  });
  if (count > 0) {
    for (const k in userVector) userVector[k] /= count;
  }

  // Tính cosine similarity cho các item khác
  const scores = items
    .filter(i => !userHistoryIds.includes(i.id))
    .map(i => {
      const vec = tfidf.tfidfVector(i.tokens);
      return { id: i.id, name: i.name, score: cosineSimilarity(userVector, vec) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  return scores;
}


