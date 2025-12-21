from underthesea import word_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer

def vn_tokenize(text):
    return word_tokenize(text.lower(), format="text")

def tfidf_vectors(items, user_history):
    item_ids = []
    item_texts = []

    #  ITEMS 
    for item in items:
        item_ids.append(item[0])  # id
        raw = f"{item[1]} {item[2]}"  # name + description
        item_texts.append(" ".join(vn_tokenize(raw)))

    #  USER PROFILE
    user_docs = []
    for h in user_history:
        raw = f"{h[0]} {h[1]}"  # name + description
        user_docs.append(" ".join(vn_tokenize(raw)))

    user_profile = " ".join(user_docs)

    vectorizer = TfidfVectorizer(
        token_pattern=r"(?u)\b\w+\b"
    )

    item_tfidf = vectorizer.fit_transform(item_texts)
    print  ("ITEM TF-IDF SHAPE:", item_tfidf.shape)
    user_tfidf = vectorizer.transform([user_profile])
    print  ("USER TF-IDF SHAPE:", user_tfidf.shape)

    return item_tfidf, user_tfidf
