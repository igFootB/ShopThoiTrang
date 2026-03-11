"use client";

import { useState } from "react";
import { MapPin, Phone, Clock, ChevronDown, Navigation } from "lucide-react";

/* ─── Dữ liệu mẫu cửa hàng ─── */
const STORES = [
  {
    id: 1,
    name: "JOHN HENRY – QUẬN 1",
    address: "123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    phone: "028 3822 1234",
    hours: "09:00 – 21:30 (Thứ 2 – Chủ Nhật)",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop",
    city: "Hồ Chí Minh",
    mapUrl: "https://maps.google.com/?q=10.7731,106.7030",
    featured: true,
  },
  {
    id: 2,
    name: "JOHN HENRY – QUẬN 3",
    address: "456 Đường Võ Văn Tần, Phường 5, Quận 3, TP. Hồ Chí Minh",
    phone: "028 3930 5678",
    hours: "09:00 – 21:00 (Thứ 2 – Chủ Nhật)",
    image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=800&auto=format&fit=crop",
    city: "Hồ Chí Minh",
    mapUrl: "https://maps.google.com/?q=10.7800,106.6900",
    featured: false,
  },
  {
    id: 3,
    name: "JOHN HENRY – QUẬN 7",
    address: "789 Đường Nguyễn Lương Bằng, Phường Tân Phú, Quận 7, TP. Hồ Chí Minh",
    phone: "028 5413 9012",
    hours: "09:30 – 22:00 (Thứ 2 – Chủ Nhật)",
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=800&auto=format&fit=crop",
    city: "Hồ Chí Minh",
    mapUrl: "https://maps.google.com/?q=10.7295,106.7218",
    featured: false,
  },
  {
    id: 4,
    name: "JOHN HENRY – HOÀN KIẾM",
    address: "32 Đường Tràng Tiền, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội",
    phone: "024 3826 3456",
    hours: "09:00 – 21:30 (Thứ 2 – Chủ Nhật)",
    image: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?q=80&w=800&auto=format&fit=crop",
    city: "Hà Nội",
    mapUrl: "https://maps.google.com/?q=21.0245,105.8542",
    featured: true,
  },
  {
    id: 5,
    name: "JOHN HENRY – CẦU GIẤY",
    address: "168 Đường Xuân Thuỷ, Phường Dịch Vọng Hậu, Quận Cầu Giấy, Hà Nội",
    phone: "024 3793 7890",
    hours: "09:30 – 21:00 (Thứ 2 – Chủ Nhật)",
    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=800&auto=format&fit=crop",
    city: "Hà Nội",
    mapUrl: "https://maps.google.com/?q=21.0380,105.7820",
    featured: false,
  },
  {
    id: 6,
    name: "JOHN HENRY – ĐÀ NẴNG",
    address: "25 Đường Bạch Đằng, Phường Thạch Thang, Quận Hải Châu, Đà Nẵng",
    phone: "0236 3823 4567",
    hours: "09:00 – 21:00 (Thứ 2 – Chủ Nhật)",
    image: "https://images.unsplash.com/photo-1572083738268-8ab9f3233ebd?q=80&w=800&auto=format&fit=crop",
    city: "Đà Nẵng",
    mapUrl: "https://maps.google.com/?q=16.0680,108.2235",
    featured: false,
  },
];

const CITIES = ["Tất cả", "Hồ Chí Minh", "Hà Nội", "Đà Nẵng"];

export default function StoresPage() {
  const [selectedCity, setSelectedCity] = useState("Tất cả");
  const [expandedStore, setExpandedStore] = useState<number | null>(null);

  const filteredStores = selectedCity === "Tất cả"
    ? STORES
    : STORES.filter((s) => s.city === selectedCity);

  return (
    <div className="bg-[#111] w-full min-h-screen">
      {/* ── Hero Banner ── */}
      <section className="relative w-full h-[280px] md:h-[380px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1920&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-[0.2em] mb-4">
            HỆ THỐNG CỬA HÀNG
          </h1>
          <p className="text-sm md:text-base text-gray-300 max-w-xl tracking-wider">
            Ghé thăm cửa hàng John Henry gần nhất để trải nghiệm và lựa chọn sản phẩm trực tiếp.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Thống kê nhanh ── */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 mb-12">
          {[
            { num: "06", label: "Cửa hàng" },
            { num: "03", label: "Thành phố" },
            { num: "7/7", label: "Ngày mở cửa" },
          ].map((stat) => (
            <div key={stat.label} className="text-center py-6 bg-[#1a1a1a] rounded-xl border border-white/5">
              <p className="text-2xl md:text-3xl font-black text-[#b91c1c] tracking-widest">{stat.num}</p>
              <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-[0.15em] mt-1 font-bold">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Bộ lọc thành phố ── */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CITIES.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`py-2 px-5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                selectedCity === city
                  ? "bg-[#b91c1c] text-white"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* ── Danh sách cửa hàng ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredStores.map((store) => (
            <article
              key={store.id}
              className="group bg-[#1a1a1a] rounded-xl border border-white/5 hover:border-white/10 overflow-hidden transition-all"
            >
              {/* Ảnh */}
              <div className="relative h-48 md:h-56 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${store.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
                {store.featured && (
                  <span className="absolute top-4 left-4 bg-[#b91c1c] text-[9px] font-black text-white uppercase tracking-[0.15em] px-3 py-1.5 rounded-full">
                    Cửa hàng chính
                  </span>
                )}
              </div>

              {/* Thông tin */}
              <div className="p-6">
                <h3 className="text-sm font-black text-white uppercase tracking-[0.1em] mb-4">
                  {store.name}
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin size={15} className="text-[#b91c1c] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-400 leading-relaxed">{store.address}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={15} className="text-[#b91c1c] flex-shrink-0" />
                    <p className="text-xs text-gray-400">{store.phone}</p>
                  </div>

                  {/* Giờ mở cửa (mở rộng) */}
                  <button
                    onClick={() => setExpandedStore(expandedStore === store.id ? null : store.id)}
                    className="flex items-center gap-3 w-full text-left group/btn"
                  >
                    <Clock size={15} className="text-[#b91c1c] flex-shrink-0" />
                    <p className="text-xs text-gray-400 flex-1">Giờ mở cửa</p>
                    <ChevronDown
                      size={14}
                      className={`text-gray-500 transition-transform duration-200 ${expandedStore === store.id ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expandedStore === store.id && (
                    <div className="ml-8 text-xs text-gray-500 bg-white/5 rounded-lg px-4 py-3 animate-[fadeIn_0.2s_ease-out]">
                      {store.hours}
                    </div>
                  )}
                </div>

                {/* Nút chỉ đường */}
                <a
                  href={store.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-white/10 text-xs font-bold text-gray-400 uppercase tracking-widest hover:bg-white/5 hover:text-white hover:border-white/20 transition-all"
                >
                  <Navigation size={14} />
                  Chỉ đường
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* ── Liên hệ ── */}
        <section className="mt-16 text-center py-12 px-6 bg-[#1a1a1a] rounded-xl border border-white/5">
          <h2 className="text-lg font-black text-white uppercase tracking-[0.15em] mb-3">Cần hỗ trợ?</h2>
          <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
            Liên hệ tổng đài miễn phí để được tư vấn và hỗ trợ tìm cửa hàng gần nhất.
          </p>
          <a
            href="tel:19001234"
            className="inline-flex items-center gap-2 bg-[#b91c1c] text-white text-sm font-black uppercase tracking-widest px-8 py-3.5 rounded-lg hover:bg-[#991b1b] transition-all"
          >
            <Phone size={16} />
            1900 1234
          </a>
        </section>
      </div>
    </div>
  );
}
