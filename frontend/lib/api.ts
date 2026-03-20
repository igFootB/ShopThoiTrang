import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const TOKEN_KEY = "accessToken";
const USER_KEY = "authUser";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error?.response?.status === 401) {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
      window.dispatchEvent(new Event("auth:unauthorized"));
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export const authStorage = {
  tokenKey: TOKEN_KEY,
  userKey: USER_KEY,
};

/* ── Public API: không gắn token, không redirect login ── */
export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const publicCategoriesApi = {
  getCategories: () => publicApi.get("/categories"),
};

export const publicBannerApi = {
  getBanners: (params?: { page?: number; limit?: number }) =>
    publicApi.get("/public/banners", { params }),
};

export const publicLookbookApi = {
  getLookbooks: (params?: { page?: number; limit?: number }) =>
    publicApi.get("/public/lookbooks", { params }),
};

export const publicProductsApi = {
  getProducts: (params?: { categoryId?: number; keyword?: string; page?: number; limit?: number }) =>
    publicApi.get("/products", { params }),
  getProductDetail: (id: number) => publicApi.get(`/products/${id}`),
};

/* ── Admin API Endpoints ── */
export const adminApi = {
  // Dashboard
  getDashboard: () => api.get("/admin/dashboard"),

  // Products
  getProducts: () => api.get("/admin/products"),
  createProduct: (data: any) => api.post("/admin/products", data),
  updateProduct: (id: number, data: any) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id: number) => api.delete(`/admin/products/${id}`),
  deleteProductHard: (id: number) => api.delete(`/admin/products/hard/${id}`),

  // Product Variants
  getProductVariants: (productId: number) => api.get(`/admin/products/${productId}/variants`),
  addProductVariant: (productId: number, data: any) => api.post(`/admin/products/${productId}/variants`, data),
  updateProductVariantQuantity: (productId: number, variantId: number, soLuong: number) => api.put(`/admin/products/${productId}/variants/${variantId}`, { soLuong }),
  deleteProductVariant: (productId: number, variantId: number) => api.delete(`/admin/products/${productId}/variants/${variantId}`),

  getCategories: () => api.get("/admin/categories"),
  createCategory: (data: any) => api.post("/admin/categories", data),
  updateCategory: (id: number, data: any) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id: number) => api.delete(`/admin/categories/${id}`),
  deleteCategoryHard: (id: number) => api.delete(`/admin/categories/hard/${id}`),
  
  // Banners
  getBanners: (params?: { page?: number; limit?: number }) => api.get("/admin/banners", { params }),
  createBanner: (data: any) => api.post("/admin/banners", data),
  updateBanner: (id: number, data: any) => api.put(`/admin/banners/${id}`, data),
  deleteBanner: (id: number) => api.delete(`/admin/banners/${id}`),

  // Lookbooks
  getLookbooks: (params?: { page?: number; limit?: number }) => api.get("/admin/lookbooks", { params }),
  createLookbook: (data: any) => api.post("/admin/lookbooks", data),
  updateLookbook: (id: number, data: any) => api.put(`/admin/lookbooks/${id}`, data),
  deleteLookbook: (id: number) => api.delete(`/admin/lookbooks/${id}`),

  // Orders
  getOrders: () => api.get("/admin/orders"),
  getOrderDetail: (id: number) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id: number, status: string) => api.put(`/admin/orders/${id}/status`, { trangThai: status }),

  // Payments
  getPayments: () => api.get("/admin/payments"),

  // Reviews
  getReviews: () => api.get("/admin/reviews"),
  deleteReview: (id: number) => api.delete(`/admin/reviews/${id}`),

  // Users / Accounts
  getUsers: () => api.get("/admin/users"),
  getRoles: () => api.get("/admin/users/roles"),
  updateUserStatus: (id: number, status: number) => api.put(`/admin/users/${id}/status`, { trangThai: status }),
  updateUserRole: (id: number, roleId: number) => api.put(`/admin/users/${id}/role`, { roleId }),

  // Coupons / Vouchers
  getCoupons: () => api.get("/admin/coupons"),
  createCoupon: (data: any) => api.post("/admin/coupons", data),
  updateCoupon: (id: number, data: any) => api.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id: number) => api.delete(`/admin/coupons/${id}`),
};

/* ── Tracking API: ghi hành vi người dùng (cần đăng nhập) ── */
export const trackingApi = {
  logBehavior: (productId: number, loaiHanhVi: string) =>
    api.post("/tracking/behavior", { productId, loaiHanhVi }).catch(() => {
      // Silent fail — tracking không nên ảnh hưởng UX
    }),
};

/* ── Recommendation API: gợi ý AI ── */
export const recommendationApi = {
  getRecommendations: () => api.get("/recommendations"),
  getSimilarProducts: (productId: number, limit: number = 8) =>
    publicApi.get(`/recommendations/similar/${productId}`, { params: { limit } }),
};

/* ── Wishlist API ── */
export const wishlistApi = {
  getWishlist: () => api.get("/wishlist"),
  addToWishlist: (productId: number) => api.post(`/wishlist/add/${productId}`),
  removeFromWishlist: (productId: number) => api.delete(`/wishlist/remove/${productId}`),
  checkFavorite: (productId: number) => api.get(`/wishlist/check/${productId}`),
};
