"""
consumer.py — RabbitMQ consumer: lắng nghe event hành vi real-time
"""
import os
import json
import threading
import pika
from dotenv import load_dotenv

load_dotenv()

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", os.getenv("SPRING_RABBITMQ_HOST", "localhost"))
RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", os.getenv("SPRING_RABBITMQ_PORT", "5672")))
RABBITMQ_USER = os.getenv("RABBITMQ_USER", os.getenv("SPRING_RABBITMQ_USERNAME", "guest"))
RABBITMQ_PASSWORD = os.getenv("RABBITMQ_PASSWORD", os.getenv("SPRING_RABBITMQ_PASSWORD", "guest"))

QUEUE_NAME = "behavior.events"

_consumer_thread = None


def _on_message(ch, method, properties, body):
    """Xử lý event khi nhận được hành vi mới"""
    try:
        event = json.loads(body)
        user_id = event.get("userId")
        product_id = event.get("productId")
        behavior = event.get("loaiHanhVi", "")

        print(f"[CONSUMER] Nhận event: user={user_id}, product={product_id}, behavior={behavior}")

        if user_id and behavior in ("ADD_TO_CART", "PURCHASE"):
            # Import here to avoid circular
            from model import predict_and_save
            predict_and_save(user_id, top_n=20)
            print(f"[CONSUMER] Đã re-predict & cập nhật gợi ý cho user {user_id}")

        ch.basic_ack(delivery_tag=method.delivery_tag)

    except Exception as e:
        print(f"[CONSUMER] Lỗi xử lý event: {e}")
        ch.basic_ack(delivery_tag=method.delivery_tag)


def _run_consumer():
    """Chạy consumer loop (blocking)"""
    try:
        credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
        params = pika.ConnectionParameters(
            host=RABBITMQ_HOST,
            port=RABBITMQ_PORT,
            credentials=credentials,
            heartbeat=600,
            blocked_connection_timeout=300,
        )

        connection = pika.BlockingConnection(params)
        channel = connection.channel()

        # Khai báo queue (idempotent)
        channel.queue_declare(queue=QUEUE_NAME, durable=True)

        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(queue=QUEUE_NAME, on_message_callback=_on_message)

        print(f"[CONSUMER] Đang lắng nghe queue '{QUEUE_NAME}'...")
        channel.start_consuming()

    except Exception as e:
        print(f"[CONSUMER] Không thể kết nối RabbitMQ: {e}")
        print("[CONSUMER] RabbitMQ consumer sẽ không hoạt động (gợi ý vẫn chạy qua HTTP)")


def start_consumer():
    """Start consumer trong background thread"""
    global _consumer_thread
    if _consumer_thread and _consumer_thread.is_alive():
        return

    _consumer_thread = threading.Thread(target=_run_consumer, daemon=True)
    _consumer_thread.start()
    print("[CONSUMER] Consumer thread đã khởi động")
