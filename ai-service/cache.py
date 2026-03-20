"""
cache.py — Redis cache wrapper cho gợi ý sản phẩm
"""
import os
import json
import redis
from dotenv import load_dotenv

load_dotenv()

REDIS_HOST = os.getenv("REDIS_HOST", os.getenv("SPRING_DATA_REDIS_HOST", "localhost"))
REDIS_PORT = int(os.getenv("REDIS_PORT", os.getenv("SPRING_DATA_REDIS_PORT", "6379")))

# TTL 24 giờ
CACHE_TTL = 60 * 60 * 24

_redis_client = None


def get_redis():
    """Lazy init Redis client"""
    global _redis_client
    if _redis_client is None:
        try:
            _redis_client = redis.Redis(
                host=REDIS_HOST,
                port=REDIS_PORT,
                db=0,
                decode_responses=True,
                socket_connect_timeout=3,
            )
            _redis_client.ping()
        except Exception as e:
            print(f"[CACHE] Redis không khả dụng: {e}")
            _redis_client = None
    return _redis_client


def _key(user_id: int) -> str:
    return f"rec:user:{user_id}"


def get_recommendations(user_id: int) -> list | None:
    """Lấy gợi ý từ cache. Trả về None nếu cache miss hoặc Redis down."""
    r = get_redis()
    if r is None:
        return None
    try:
        data = r.get(_key(user_id))
        if data:
            return json.loads(data)
    except Exception:
        pass
    return None


def set_recommendations(user_id: int, data: list):
    """Lưu gợi ý vào cache với TTL 24h"""
    r = get_redis()
    if r is None:
        return
    try:
        r.setex(_key(user_id), CACHE_TTL, json.dumps(data))
    except Exception:
        pass


def invalidate(user_id: int):
    """Xóa cache của user (dùng khi cần re-predict)"""
    r = get_redis()
    if r is None:
        return
    try:
        r.delete(_key(user_id))
    except Exception:
        pass
