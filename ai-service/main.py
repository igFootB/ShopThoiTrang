"""
main.py — FastAPI AI Recommendation Microservice
Cung cấp REST API cho Spring Boot gọi predict.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from model import train_model, predict_for_user, predict_and_save, is_trained
from cache import get_recommendations, set_recommendations
from consumer import start_consumer
from scheduler import start_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup & shutdown events"""
    print("=" * 50)
    print("🧠 AI Recommendation Service — Starting...")
    print("=" * 50)

    # 1. Train model lần đầu
    train_model()

    # 2. Start RabbitMQ consumer (background thread)
    start_consumer()

    # 3. Start nightly scheduler
    start_scheduler()

    print("✅ AI Service sẵn sàng!")
    yield
    print("⏹️ AI Service tắt.")


app = FastAPI(
    title="AI Recommendation Service",
    description="Collaborative Filtering (SVD) cho ShopThoiTrang",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "ok",
        "model_trained": is_trained(),
    }


@app.post("/train")
async def trigger_train():
    """Trigger train model thủ công"""
    success = train_model()
    return {
        "success": success,
        "message": "Model đã được train lại" if success else "Không đủ dữ liệu để train",
    }


@app.get("/predict/{user_id}")
async def predict(user_id: int, top_n: int = Query(default=20, ge=1, le=50)):
    """
    Predict gợi ý cho 1 user.
    
    Flow:
    1. Check Redis cache
    2. Cache miss → predict bằng SVD model
    3. Lưu kết quả vào Redis + DB
    """
    # 1. Check cache
    cached = get_recommendations(user_id)
    if cached:
        return {
            "user_id": user_id,
            "source": "cache",
            "recommendations": cached[:top_n],
        }

    # 2. Predict + lưu
    results = predict_and_save(user_id, top_n)

    return {
        "user_id": user_id,
        "source": "model" if is_trained() else "popular",
        "recommendations": results,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
