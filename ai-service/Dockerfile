FROM python:3.10-slim

WORKDIR /app

# Khá quan trọng: Copy thư viện và cài đặt trước để tận dụng cache của Docker
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy bộ mã nguồn của AI Service
COPY . .

# Mở port 8000
EXPOSE 8000

# Khởi chạy uvicorn server cho FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
