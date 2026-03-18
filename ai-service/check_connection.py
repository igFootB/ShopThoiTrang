import os
import redis
import pika
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

def check_mysql():
    print("[1] Kiểm tra MySQL...", end=" ")
    try:
        user = str(os.getenv("DB_USER", "root"))
        pw = str(os.getenv("DB_PASSWORD", ""))
        host = str(os.getenv("DB_HOST", "localhost"))
        port = str(os.getenv("DB_PORT", "3306"))
        db = str(os.getenv("DB_NAME", ""))
        url = f"mysql+pymysql://{user}:{pw}@{host}:{port}/{db}"
        engine = create_engine(url)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("OK ✅")
        return True
    except Exception as e:
        print(f"LỖI ❌ ({e})")
        return False

def check_redis():
    print("[2] Kiểm tra Redis...", end=" ")
    try:
        host = str(os.getenv("REDIS_HOST", "localhost"))
        port = int(os.getenv("REDIS_PORT", "6379"))
        r = redis.Redis(host=host, port=port, socket_connect_timeout=2)
        r.ping()
        print("OK ✅")
        return True
    except Exception as e:
        print(f"LỖI ❌ ({e})")
        return False

def check_rabbitmq():
    print("[3] Kiểm tra RabbitMQ...", end=" ")
    try:
        host = str(os.getenv("RABBITMQ_HOST", "localhost"))
        port = int(os.getenv("RABBITMQ_PORT", "5672"))
        user = str(os.getenv("RABBITMQ_USER", "guest"))
        pw = str(os.getenv("RABBITMQ_PASSWORD", "guest"))
        creds = pika.PlainCredentials(user, pw)
        params = pika.ConnectionParameters(host, port=port, credentials=creds, connection_attempts=1, retry_delay=1)
        conn = pika.BlockingConnection(params)
        conn.close()
        print("OK ✅")
        return True
    except Exception as e:
        print(f"LỖI ❌")
        print(f"   Chi tiết: {e}")
        return False

if __name__ == "__main__":
    print("=== KIỂM TRA KẾT NỐI HỆ THỐNG AI ===")
    m = check_mysql()
    r = check_redis()
    rmq = check_rabbitmq()
    print("=" * 35)
    if m and r and rmq:
        print("Sẵn sàng khởi chạy AI Service!")
    else:
        print("Vui lòng kiểm tra lại các service bị lỗi trước khi chạy.")
