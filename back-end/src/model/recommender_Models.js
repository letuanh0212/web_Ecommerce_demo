const natural = require("natural");
const TfIdf = natural.TfIdf;
function recommendTFIDF(items, userHistory, topN = 10) {

    // Trường hợp user chưa mua gì
    if (userHistory.length === 0) {
        console.log("User chưa mua -> trả về top N item mới nhất");

        return items
            .slice(0, topN)   // vì đã ORDER BY id DESC trong SQL
            .map(i => ({
                id: i.id,
                name: i.name,
                score: 0
            }));
    }

    const tfidf = new TfIdf();

    // Thêm document để TF-IDF xử lý
    items.forEach(item => tfidf.addDocument(item.text));

    // Vector TF-IDF của user
    let userVector = {};

    userHistory.forEach(itemId => {
        const idx = items.findIndex(x => x.id === itemId);
        if (idx === -1) return;

        tfidf.listTerms(idx).forEach(term => {
            if (!userVector[term.term]) userVector[term.term] = 0;
            userVector[term.term] += term.tfidf;
        });
    });

    // Normalize
    const keys = Object.keys(userVector);
    keys.forEach(k => userVector[k] /= userHistory.length);

    // Tính similarity
    const recommended = items
        .filter(i => !userHistory.includes(i.id))
        .map(i => {
            const index = items.findIndex(it => it.id === i.id);

            let docVector = {};
            tfidf.listTerms(index).forEach(t => {
                docVector[t.term] = t.tfidf;
            });

            let dot = 0, normA = 0, normB = 0;

            keys.forEach(term => {
                const a = userVector[term] || 0;
                const b = docVector[term] || 0;
                dot += a * b;
                normA += a * a;
                normB += b * b;
            });

            const score = dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);

            return { id: i.id, name: i.name, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, topN);

    return recommended;
}

module.exports = { recommendTFIDF };
