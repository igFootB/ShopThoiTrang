CREATE DATABASE shop_thoi_trang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shop_thoi_trang;

-- 1. Bảng roles
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ten_quyen VARCHAR(50) NOT NULL
);

-- 2. Bảng users
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ten VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    mat_khau VARCHAR(255),
    so_dien_thoai VARCHAR(20),
    role_id BIGINT,
    trang_thai TINYINT DEFAULT 1, -- 1: Active, 0: Banned
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- 3. Bảng categories
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ten_danh_muc VARCHAR(100) NOT NULL,
    mo_ta TEXT,
    trang_thai TINYINT DEFAULT 1
);

-- 4. Bảng brands
CREATE TABLE brands (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ten_thuong_hieu VARCHAR(100) NOT NULL,
    trang_thai TINYINT DEFAULT 1
);

-- 5. Bảng products
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ten_san_pham VARCHAR(200),
    mo_ta TEXT,
    gia DECIMAL(10,2), -- Có thể cân nhắc dùng BIGINT nếu tiền VNĐ không có số lẻ
    category_id BIGINT,
    brand_id BIGINT,
    trang_thai TINYINT DEFAULT 1, -- 1: Đang bán, 0: Ngừng kinh doanh
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (brand_id) REFERENCES brands(id)
);

-- 6. Bảng product_images
CREATE TABLE product_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT,
    duong_dan_anh TEXT,
    is_thumbnail TINYINT DEFAULT 0, -- Xác định ảnh đại diện của sản phẩm
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 7. Bảng product_variants (Rất quan trọng cho thời trang)
CREATE TABLE product_variants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT,
    size VARCHAR(10),
    mau_sac VARCHAR(50),
    so_luong INT DEFAULT 0, -- Số lượng tồn kho
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 8. Bảng carts
CREATE TABLE carts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. Bảng cart_items (ĐÃ SỬA: Liên kết với product_variants)
CREATE TABLE cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT,
    variant_id BIGINT, -- Lưu biến thể cụ thể (size, màu)
    so_luong INT,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);

-- 10. Bảng shipping_addresses
CREATE TABLE shipping_addresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    ten_nguoi_nhan VARCHAR(100), -- Thêm tên người nhận
    so_dien_thoai VARCHAR(20),
    dia_chi TEXT,
    thanh_pho VARCHAR(100),
    is_default TINYINT DEFAULT 0, -- Địa chỉ mặc định
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 11. Bảng coupons (ĐÃ SỬA: Thêm điều kiện sử dụng)
CREATE TABLE coupons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ma_giam_gia VARCHAR(50) UNIQUE,
    loai_giam_gia VARCHAR(20), -- 'PERCENT' hoặc 'FIXED_AMOUNT'
    gia_tri_giam DECIMAL(10,2),
    don_toi_thieu DECIMAL(10,2) DEFAULT 0, -- Đơn hàng tối thiểu để áp dụng
    so_luong_con_lai INT, -- Giới hạn số lần dùng
    ngay_het_han DATETIME,
    trang_thai TINYINT DEFAULT 1
);

-- 12. Bảng orders (ĐÃ SỬA: Thêm phí ship, coupon)
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    address_id BIGINT,
    coupon_id BIGINT NULL,
    phi_van_chuyen DECIMAL(10,2) DEFAULT 0,
    so_tien_giam DECIMAL(10,2) DEFAULT 0,
    tong_tien DECIMAL(10,2), -- (Tổng tiền hàng + phí ship - tiền giảm)
    trang_thai VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (address_id) REFERENCES shipping_addresses(id),
    FOREIGN KEY (coupon_id) REFERENCES coupons(id)
);

-- 13. Bảng order_items (ĐÃ SỬA: Liên kết variant và lưu snapshot)
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT,
    variant_id BIGINT,
    ten_san_pham_luc_mua VARCHAR(200), -- Lưu lại tên lỡ sau này shop đổi tên
    mau_sac_luc_mua VARCHAR(50),
    size_luc_mua VARCHAR(10),
    so_luong INT,
    gia_luc_mua DECIMAL(10,2), -- Lưu giá tại thời điểm mua
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);

-- 14. Bảng payments
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT,
    phuong_thuc VARCHAR(50), -- COD, VNPAY
    trang_thai VARCHAR(50), -- PENDING, SUCCESS, FAILED
    ma_giao_dich VARCHAR(100), -- Mã tham chiếu từ VNPay (nếu có)
    ngay_thanh_toan TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 15. Bảng reviews
CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    product_id BIGINT,
    order_id BIGINT, -- Chỉ người đã mua đơn hàng này mới được đánh giá
    danh_gia INT CHECK (danh_gia >= 1 AND danh_gia <= 5),
    binh_luan TEXT,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- 16. Bảng hành vi người dùng (AI Recommendation)
CREATE TABLE hanh_vi_nguoi_dung (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    product_id BIGINT,
    loai_hanh_vi VARCHAR(50), -- VIEW, ADD_TO_CART, PURCHASE, SEARCH
    thoi_gian TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 17. Bảng gợi ý sản phẩm AI (Kết quả chạy batch/cronjob của AI)
CREATE TABLE goi_y_san_pham (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    product_id BIGINT,
    diem_goi_y FLOAT, -- Điểm phù hợp (Score)
    ngay_goi_y TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 18. Bảng lịch sử chatbot
CREATE TABLE chatbot_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    noi_dung TEXT,
    nguoi_gui VARCHAR(20), -- USER hoặc BOT
    thoi_gian TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 19. Bảng FAQ chatbot
CREATE TABLE chatbot_faq (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cau_hoi TEXT,
    cau_tra_loi TEXT,
    thu_tu_uu_tien INT DEFAULT 0
);