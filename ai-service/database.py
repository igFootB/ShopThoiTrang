"""
database.py — Kết nối MySQL, đọc dữ liệu hành vi & sản phẩm
"""
import os
import pandas as pd
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "shop_thoi_trang")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "123456")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=3600)


def get_behaviors() -> pd.DataFrame:
    """Đọc toàn bộ hành vi người dùng từ DB"""
    query = """
        SELECT user_id, product_id, loai_hanh_vi, thoi_gian
        FROM hanh_vi_nguoi_dung
        ORDER BY thoi_gian DESC
    """
    with engine.connect() as conn:
        df = pd.read_sql(text(query), conn)
    return df


def get_active_products() -> list:
    """Lấy danh sách ID sản phẩm đang active"""
    query = "SELECT id FROM products WHERE trang_thai = 1"
    with engine.connect() as conn:
        result = conn.execute(text(query))
        return [row[0] for row in result]


def get_all_user_ids() -> list:
    """Lấy danh sách ID tất cả user"""
    query = "SELECT id FROM users"
    with engine.connect() as conn:
        result = conn.execute(text(query))
        return [row[0] for row in result]


def save_recommendations(user_id: int, recommendations: list):
    """
    Lưu kết quả gợi ý vào bảng goi_y_san_pham
    recommendations: list of {product_id, score}
    """
    with engine.begin() as conn:
        # Xóa gợi ý cũ
        conn.execute(text("DELETE FROM goi_y_san_pham WHERE user_id = :uid"), {"uid": user_id})

        # Insert gợi ý mới
        for rec in recommendations:
            conn.execute(
                text("""
                    INSERT INTO goi_y_san_pham (user_id, product_id, diem_goi_y, ngay_goi_y)
                    VALUES (:uid, :pid, :score, NOW())
                """),
                {"uid": user_id, "pid": rec["product_id"], "score": rec["score"]}
            )
