"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { publicBannerApi } from "@/lib/api";

type BannerData = {
  id: number;
  image: string;
  slogan: string;
  link: string;
};

const FALLBACK_SLIDES: BannerData[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1600&auto=format&fit=crop",
    slogan: "New Year New Elegance",
    link: "/category/nu",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1490240989397-ff0b51eb6404?q=80&w=1600&auto=format&fit=crop",
    slogan: "Embrace The Uniqueness",
    link: "/category/nam",
  }
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState<BannerData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch banners
  useEffect(() => {
    let active = true;
    publicBannerApi.getBanners({ page: 0, limit: 10 })
      .then(res => {
        if (!active) return;
        const items = res.data?.content || [];
        if (items.length > 0) {
          const formatted = items.map((b: any) => ({
            id: b.id,
            image: b.hinhAnh,
            slogan: b.tieuDe || "",
            link: b.duongDan || "",
          }));
          setSlides(formatted);
        } else {
          setSlides(FALLBACK_SLIDES);
        }
      })
      .catch((e) => {
        if (!active) return;
        console.error("Lỗi do tải banners:", e);
        setSlides(FALLBACK_SLIDES);
      }).finally(() => {
        if (active) setLoading(false);
      });
      return () => { active = false };
  }, []);

  // Auto slide
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prevSlide = () => setCurrent(current === 0 ? slides.length - 1 : current - 1);
  const nextSlide = () => setCurrent(current === slides.length - 1 ? 0 : current + 1);

  if (loading) {
    return (
      <div className="relative w-full h-[50vh] md:h-[80vh] bg-[#f5f5f5] animate-pulse flex items-center justify-center">
         <div className="w-10 h-10 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full h-[50vh] md:h-[80vh] overflow-hidden">
      <div 
        className="flex transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] h-full w-full relative"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="min-w-full h-full relative group cursor-pointer" onClick={() => { if(slide.link) window.location.href = slide.link; }}>
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${slide.image}')` }}
            >
              <div className="absolute inset-0 bg-black/10" />
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center">
               <h1 className="text-4xl md:text-5xl lg:text-7xl font-sans font-black text-white/90 drop-shadow-md">
                 {/*  We could add typography here later, keeping slogan empty/hidden for now to emphasize the image like JH */}
               </h1>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/70 hover:bg-white text-black rounded-full backdrop-blur-sm transition-all shadow-md group"
      >
        <ChevronLeft size={24} strokeWidth={1.5} className="group-hover:-translate-x-0.5 transition-transform" />
      </button>

      <button 
        onClick={nextSlide}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/70 hover:bg-white text-black rounded-full backdrop-blur-sm transition-all shadow-md group"
      >
        <ChevronRight size={24} strokeWidth={1.5} className="group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_: BannerData, idx: number) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-2 h-2 rounded-full transition-all ${current === idx ? "bg-white scale-125" : "bg-white/40 hover:bg-white/80"}`}
          />
        ))}
      </div>
    </div>
  );
}
