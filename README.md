# 🛍️ Shop Thời Trang - Đồ Án E-Commerce Hoàn Chỉnh

Đây là kho lưu trữ mã nguồn cho **Shop Thời Trang**, một hệ thống thương mại điện tử chuyên cung cấp quần áo Nam, Nữ, Bộ sưu tập Lookbook, và Mix & Match. Hệ thống được xây dựng theo kiến trúc Microservices hiện đại, hỗ trợ Gợi ý Sản phẩm thông minh (AI/Collaborative Filtering), cổng thanh toán VNPAY, cùng hệ thống quản trị nội dung chi tiết.

## 🌟 Điểm nổi bật & Các Tính năng chính

### 👤 1. Giao diện Dành cho Khách hàng (User Features)
- **Thiết kế Hiện đại (Modern UI):** Giao diện đẹp mắt, thân thiện, và tương thích mọi thiết bị di động / PC (Responsive Web Design).
- **Hệ thống Gợi ý (AI Recommendation):** Các sản phẩm được cá nhân hóa trong mục **"Gợi ý cho Bạn"** dựa trên sở thích và hành vi của người dùng, sử dụng thuật toán Singular Value Decomposition (SVD).
- **Quản lý Giỏ Hàng & Yêu Thích (Cart & Wishlist):** Thêm, xóa linh hoạt sản phẩm yêu thích và lưu trữ giỏ hàng, cập nhật state đồng bộ qua API.
- **Thanh toán Trực Tuyến & COD:** Hỗ trợ quy trình thanh toán đầy đủ, tự động chuyển hướng cổng VNPAY an toàn.
- **Quản lý Tài khoản (Profile & Order History):** Theo dõi trạng thái đơn mua hàng. Tính năng Profile có hỗ trợ giao diện **Dark Mode** hoàn chỉnh.
- **Lookbook & Blog:** Tích hợp bộ sưu tập theo mùa nổi bật với thư viện ảnh Lookbook chuyên nghiệp.

### 🛠 2. Dành cho Quản trị viên (Admin & Dashboard)
- **Admin Portal (Bảng điều khiển):** Thống kê và theo dõi tổng quan các dữ liệu về doanh thu/đơn hàng.
- **Quản lý Sản phẩm / Danh mục / Hero Slider:** Thêm, xem, sửa, và xóa mọi thuộc tính của sản phẩm.
- **Quản lý Lookbook & Hình ảnh:** Tạo và thay thế các ảnh quảng cáo trên giao diện "Lookbook" và "Mix & Match".
- **Quản lý Đơn hàng & Thanh toán:** Duyệt đơn, cập nhật trạng thái gói hàng và tình trạng của VNPAY.

---

## 🏗 Kiến trúc Hệ thống & Framework

Hệ thống được thiết kế mở và sử dụng các công nghệ tiên tiến, chia thành 3 dự án nhỏ biệt lập:

### 🌐 Frontend (Giao diện Khách & Admin)
- **Framework Chính:** Next.js 16 (App Router), React 19
- **Ngôn ngữ:** TypeScript
- **Styling:** Tailwind CSS v4
- **Thư viện khác:** Axios (Giao tiếp API), Next-Cloudinary (Xử lý hình ảnh trả về), Lucide-React (Biểu tượng), React Hot Toast (Thông báo nổi).

### ⚙️ Backend (Tầng xử lý dữ liệu lõi & Bảo mật)
- **Framework Chính:** Spring Boot 3.5 (Ngôn ngữ: Java 17)
- **Database:** MySQL (Dùng Spring Data JPA / Hibernate)
- **Bảo mật:** Spring Security cùng kết hợp JWT Token cho việc phân quyền Admin/User.
- **Caching & Message Queue:** Sử dụng Redis Cache và RabbitMQ để xử lý dữ liệu hành vi đồng bộ cho Service AI.
- **Dependency Tool:** Maven, Lombok.

### 🧠 AI Service (Hệ thống gợi ý thông minh - Microservice)
- **Framework:** FastAPI (Python 3.10+)
- **Machine Learning Tool:** Scikit-learn, Surprise (Collaborative Filtering/SVD), Pandas, SciPy.
- **Cơ sở dữ liệu:** SQLAlchemy để lấy tập dữ liệu lịch sử trên MySQL.
- Bắt sự kiện bằng **Pika** (RabbitMQ Client) & **Redis** để đồng bộ dữ liệu nhanh và real-time qua Web/Backend.

---

## 🚀 Hướng dẫn Cài đặt & Chạy trên Môi trường Local

Bạn cần chắc chắn máy tính của bạn đã có cài đặt sẵn **Node.js (v20+)**, **Java (JDK 17)**, **Maven**, **Python (v3.10+)** và **Docker** trước khi tiến hành cài đặt dự án này.

### Bước 1: Clone Repository
```bash
git clone https://github.com/<your-username>/ShopThoiTrang.git
cd ShopThoiTrang
```

### Bước 2: Chuẩn bị CSDL (RabbitMQ & Redis)
Khởi động nhanh Messaging Queue và Caching qua Docker:
```bash
docker-compose up -d
```
Tiếp theo, hãy cài đặt một MySQL Server bản địa (hoặc Docker), tải, cài đặt và tạo sẵn Database rỗng mang tên: `shopdb`.

### Bước 3: Khởi chạy Backend (Spring Boot)
1. Truy cập thư mục `backend`:
   ```bash
   cd backend
   ```
2. Cấu hình file `src/main/resources/application.properties`. Chỉnh sửa lại Username, Password của MySQL phù hợp với máy nhánh của bạn. Khai báo thêm Cloudinary API keys, VNPAY Config.
3. Build và chạy Core API:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
   *Quá trình này sẽ sinh ra các table. Backend mặc định chạy ở: `http://localhost:8080/`*

### Bước 4: Khởi chạy AI/ML Service
1. Truy cập vào folder `ai-service`:
   ```bash
   cd ai-service
   ```
2. Tạo Môi trường ảo (Virtual Env) và kích hoạt nó lên:
   ```bash
   python -m venv venv
   # Nếu bạn chạy Windows:
   venv\Scripts\activate
   # Nếu bạn chạy MacOS/Linux:
   source venv/bin/activate
   ```
3. Cài đặt các thư viện lõi của Python:
   ```bash
   pip install -r requirements.txt
   ```
4. Setting file cơ sở (VD `.env` có sẵn) liên kết với RabbitMQ / MySQL. Chạy Machine Learning API:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *AI chạy tại port 8000: `http://localhost:8000/`*

### Bước 5: Khởi chạy ứng dụng Web Frontend
1. Vào mục Frontend:
   ```bash
   cd frontend
   ```
2. Cài tất cả Node Modules:
   ```bash
   npm install
   ```
3. Khởi tạo file biến cục bộ `.env.local` bên trong folder frontend:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
   ```
4. Khởi chạy Web Application:
   ```bash
   npm run dev
   ```
   *Vào trình duyệt và kiểm tra toàn bộ website ứng dụng ở: `http://localhost:3000/`*

---

## 🌍 Hướng Dẫn Đẩy Code Lên GitHub

Đưa mã nguồn của bạn lên GitHub là bước đầu tiên để triển khai nó lên các nền tảng online.

1. **Khởi tạo và đẩy mã nguồn:**
   - Mở terminal tại thư mục gốc của dự án (`ShopThoiTrang`):
     ```bash
     git init
     git add .
     git commit -m "First commit - Hoàn thành Đồ án Shop Thời Trang"
     ```
2. **Tạo Repository trên GitHub:**
   - Đăng nhập vào GitHub, tạo một Repository mới (ví dụ: `ShopThoiTrang_DoAn`).
   - Copy đường dẫn Repository (dạng `https://github.com/your-username/ShopThoiTrang_DoAn.git`).
3. **Liên kết và Push (Đẩy) code:**
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/ShopThoiTrang_DoAn.git
   git push -u origin main
   ```

---

## ☁️ Hướng Dẫn Triển Khai (Deploy) Lên Các Nền Tảng Online

Vì dự án theo kiến trúc Microservices gồm 3 phần (Frontend, Backend, AI), bạn nên dùng các nền tảng Platform as a Service (PaaS) miễn phí hoặc trả phí thấp để triển khai tách biệt. Khuyến nghị: **Vercel** cho Frontend và **Render / Railway** cho Backend và AI Service.

### 1. Triển khai Cơ sở dữ liệu (MySQL / Redis / RabbitMQ) online
- **Aiven (Đề xuất cho MySQL / Redis):** Đăng ký tài khoản miễn phí trên [Aiven](https://aiven.io), tạo một Service cho MySQL và một Service cho Redis. Sau đó, lấy địa chỉ (Host), Password và Port.
- **CloudAMQP (Cho RabbitMQ):** Đăng ký tài khoản miễn phí [CloudAMQP](https://www.cloudamqp.com/), tạo một instance (gói Little Lemur miễn phí), và lấy URL `amqps://...`.

### 2. Triển khai Backend (Spring Boot)
Nền tảng tốt nhất: **Railway** hoặc **Render**
- Tạo tài khoản trên [Render](https://render.com/).
- Tạo một **Web Service** mới, liên kết với GitHub Repository của bạn.
- Cấu hình cho Render:
  - **Root Directory:** `backend`
  - **Environment:** Docker (Có thể tạo thêm Dockerfile trong `backend`) hoặc Java
  - **Build Command:** `./mvnw clean package -DskipTests` (Nếu Render hỗ trợ Java native).
  - **Start Command:** `java -jar target/shop-fashion-0.0.1-SNAPSHOT.jar`
- Thêm tất cả **Environment Variables** (MySQL Host URL, Redis URL, RabbitMQ URL, Cấu hình JWT, Cloudinary, VNPAY) như trong `application.properties`.

### 3. Triển khai AI Service (FastAPI)
Nền tảng tốt nhất: **Render**
- Tạo một **Web Service** tiếp theo trên Render.
- Cấu hình:
  - **Root Directory:** `ai-service`
  - **Environment:** Python 3
  - **Build Command:** `pip install -r requirements.txt`
  - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Khai báo lại các biến môi trường cho Database, RabbitMQ, Redis giống như backend.

### 4. Triển khai Frontend (Next.js)
Nền tảng tốt nhất: **Vercel**
- Đăng nhập [Vercel](https://vercel.com/) và tạo Project mới, liên kết từ GitHub Account.
- Chọn framework là **Next.js**.
- Cấu hình thư mục gốc (Root Directory) là `frontend`.
- Trong mục **Environment Variables**, thêm:
  - `NEXT_PUBLIC_API_URL` bằng URL của Backend Spring Boot đã được tạo ở Render/Railway.
- Nhấn **Deploy**. Quá trình Vercel build frontend mất khoảng vài phút.

---
🔑 Tài Khoản Dùng Thử

- **Quản trị viên (Admin):** admintest — `bao@gmail.com` / `123456`
- **Khách hàng:** Nguyễn Vỹ Khang — `vykhang@gmail.com` / `123456`

## 👨‍💻 Tác giả / Nhóm Đồ án
Phát triển bởi Đường Gia Bảo (225640) phục vụ Đồ án 2 và học thuật mở e-commerce architectures.
Vui lòng tham khảo mã nguồn các thành phần như Wishlist, Dark Mode Layout và RabbitMQ Consumer Python ở lịch sử Commit chi tiết.
