"""
model.py — Collaborative Filtering sử dụng cosine similarity (scikit-learn)

Thuật toán:
1. Xây dựng User-Item rating matrix từ hành vi người dùng
2. Tính cosine similarity giữa các users (User-based CF)
3. Dự đoán rating cho sản phẩm chưa tương tác dựa trên user tương tự
"""
import threading
import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix
from sklearn.metrics.pairwise import cosine_similarity
from database import get_behaviors, get_active_products, save_recommendations, get_all_user_ids
from cache import set_recommendations

# Trọng số hành vi → rating
BEHAVIOR_WEIGHTS = {
    "VIEW": 1.0,
    "WISHLIST": 2.0,
    "ADD_TO_CART": 3.0,
    "PURCHASE": 5.0,
}

# Global model data
_user_item_matrix = None
_similarity_matrix = None
_user_index = None      # user_id → row index
_item_index = None      # product_id → col index
_user_ids_list = None
_item_ids_list = None
_model_lock = threading.Lock()
_trained = False


def is_trained() -> bool:
    return _trained


def _build_rating_matrix(df: pd.DataFrame):
    """
    Xây dựng User-Item matrix từ hành vi.
    Trả về: sparse matrix, user_index dict, item_index dict
    """
    if df.empty:
        return None, None, None

    df = df.copy()
    df["rating"] = df["loai_hanh_vi"].map(BEHAVIOR_WEIGHTS).fillna(1.0)

    # Group by user + product, lấy max rating
    ratings = df.groupby(["user_id", "product_id"])["rating"].max().reset_index()

    # Tạo index mapping
    user_ids = sorted(ratings["user_id"].unique())
    item_ids = sorted(ratings["product_id"].unique())

    user_idx = {uid: i for i, uid in enumerate(user_ids)}
    item_idx = {pid: i for i, pid in enumerate(item_ids)}

    # Build sparse matrix
    rows = ratings["user_id"].map(user_idx).values
    cols = ratings["product_id"].map(item_idx).values
    vals = ratings["rating"].values

    matrix = csr_matrix((vals, (rows, cols)), shape=(len(user_ids), len(item_ids)))

    return matrix, user_idx, item_idx, user_ids, item_ids


def train_model():
    """Train: Xây dựng User-Item matrix và tính Cosine Similarity"""
    global _user_item_matrix, _similarity_matrix, _user_index, _item_index
    global _user_ids_list, _item_ids_list, _trained

    print("[MODEL] Bắt đầu train Collaborative Filtering model...")

    behaviors = get_behaviors()
    if behaviors.empty or len(behaviors) < 3:
        print("[MODEL] Không đủ dữ liệu để train (cần ít nhất 3 hành vi)")
        _trained = False
        return False

    result = _build_rating_matrix(behaviors)
    if result[0] is None:
        _trained = False
        return False

    matrix, user_idx, item_idx, user_ids, item_ids = result

    # Tính Cosine Similarity giữa các users
    with _model_lock:
        _user_item_matrix = matrix
        _user_index = user_idx
        _item_index = item_idx
        _user_ids_list = user_ids
        _item_ids_list = item_ids
        _similarity_matrix = cosine_similarity(matrix)
        _trained = True

    print(f"[MODEL] Train xong! {matrix.nnz} ratings, {len(user_ids)} users, {len(item_ids)} items")
    return True


def predict_for_user(user_id: int, top_n: int = 20) -> list:
    """
    Predict top N sản phẩm cho 1 user bằng User-based Collaborative Filtering.
    
    Công thức:  predicted_rating(u, i) = Σ (sim(u, v) * rating(v, i)) / Σ |sim(u, v)|
    trong đó v là các user tương tự đã tương tác với item i
    """
    global _user_item_matrix, _similarity_matrix, _user_index, _item_index
    global _item_ids_list

    if not _trained or _user_item_matrix is None:
        print(f"[MODEL] Model chưa train, fallback popular items cho user {user_id}")
        return _fallback_popular(top_n)

    if user_id not in _user_index:
        print(f"[MODEL] User {user_id} chưa có tương tác, fallback popular items")
        return _fallback_popular(top_n)

    with _model_lock:
        u_idx = _user_index[user_id]
        user_similarities = _similarity_matrix[u_idx]
        user_ratings = _user_item_matrix[u_idx].toarray().flatten()

        # Lấy active products
        active_product_ids = set(get_active_products())

        predictions = []
        for pid, j in _item_index.items():
            # Bỏ qua sản phẩm đã tương tác hoặc không active
            if user_ratings[j] > 0 or pid not in active_product_ids:
                continue

            # Tính predicted rating: weighted average of similar users' ratings
            item_ratings = _user_item_matrix[:, j].toarray().flatten()
            # Chỉ lấy users đã rate item này
            rated_mask = item_ratings > 0
            if not np.any(rated_mask):
                continue

            sim_scores = user_similarities[rated_mask]
            item_scores = item_ratings[rated_mask]

            denom = np.sum(np.abs(sim_scores))
            if denom == 0:
                continue

            predicted = np.dot(sim_scores, item_scores) / denom
            predictions.append({"product_id": int(pid), "score": round(float(predicted), 4)})

    # Sort theo score giảm dần
    predictions.sort(key=lambda x: x["score"], reverse=True)
    return predictions[:top_n]


def predict_and_save(user_id: int, top_n: int = 20) -> list:
    """Predict + lưu DB + lưu Redis cache"""
    results = predict_for_user(user_id, top_n)
    if results:
        save_recommendations(user_id, results)
        set_recommendations(user_id, results)
    return results


def predict_all_users(top_n: int = 20):
    """Predict cho tất cả user (dùng cho nightly job)"""
    user_ids = get_all_user_ids()
    print(f"[MODEL] Predict cho {len(user_ids)} users...")
    for uid in user_ids:
        try:
            predict_and_save(uid, top_n)
        except Exception as e:
            print(f"[MODEL] Lỗi predict user {uid}: {e}")
    print("[MODEL] Hoàn tất predict tất cả users!")


def _fallback_popular(top_n: int) -> list:
    """Fallback: trả về sản phẩm phổ biến nhất (nhiều tương tác nhất)"""
    behaviors = get_behaviors()
    if behaviors.empty:
        return []
    popular = (
        behaviors.groupby("product_id")
        .size()
        .reset_index(name="count")
        .sort_values("count", ascending=False)
        .head(top_n)
    )
    return [{"product_id": int(row["product_id"]), "score": float(row["count"])} for _, row in popular.iterrows()]
