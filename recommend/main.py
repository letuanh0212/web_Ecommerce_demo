from fastapi import FastAPI
from db import get_connection
from recommender import tfidf_vectors
from sklearn.metrics.pairwise import cosine_similarity
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite
        "http://localhost:8080",   # nếu có
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/recommend/{user_id}")
def recommend(user_id: int, top_k: int = 10):
    conn = get_connection()
    cursor = conn.cursor()

    # LOAD ITEMS
    # cursor.execute("""
    #     SELECT id, name, description, price
    #     FROM Items
    # """)
    # LOAD ITEMS (Chỉ lấy những item mà user CHƯA từng mua)
    cursor.execute("""
        SELECT id, name, description, price
        FROM Items
        WHERE id NOT IN (
            SELECT oi.item_id 
            FROM OrderItems oi
            JOIN Orders o ON oi.order_id = o.id
            WHERE o.user_id = ?
        )
    """, (user_id,)) # Đừng quên truyền user_id vào đây

    items = cursor.fetchall()

    #  USER HISTORY
    cursor.execute("""
        SELECT TOP 10 i.name, i.description
        FROM OrderItems oi
        JOIN Orders o ON oi.order_id = o.id
        JOIN Items i ON oi.item_id = i.id
        WHERE o.user_id = ?
        ORDER BY o.createdAt DESC
    """, user_id)
    user_history = cursor.fetchall()

    if not user_history:
        return {"message": "User chưa có lịch sử mua"}

    #  TF-IDF
    item_vectors, user_vector = tfidf_vectors(
        items, user_history
    )

    #  COSINE SIMILARITY
    similarities = cosine_similarity(user_vector, item_vectors)[0]

    #  GỘP + SORT
    results = []
    for idx, score in enumerate(similarities):
        item = items[idx]
        results.append({
            "id": item[0],
            "name": item[1],
            "description": item[2],
            "price": float(item[3]),
            "similarity": round(float(score), 4)
        })

    results.sort(key=lambda x: x["similarity"], reverse=True)

    return results[:top_k]
