import Link from "next/link";
import { ArrowRight } from "lucide-react";

const COLLECTIONS = [
  {
    id: 1,
    title: "GIẢM GIÁ 50%",
    subtitle: "ÁO NAM & NỮ",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop",
    link: "/category/nam"
  },
  {
    id: 2,
    title: "SALE UP TO 40%",
    subtitle: "BST MÙA XUÂN 2026",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop",
    link: "/category/nu"
  },
  {
    id: 3,
    title: "MUA 2 GIẢM 30%",
    subtitle: "PHỤ KIỆN & GIÀY DÉP",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop",
    link: "/category/nam"
  }
];

export default function HighlightCollection() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-8 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLLECTIONS.map((collection) => (
          <div key={collection.id} className="group relative overflow-hidden aspect-[3/4] md:aspect-[4/5] bg-gray-100 cursor-pointer">
            {/* Background Image with Zoom on Hover */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
              style={{ backgroundImage: `url('${collection.image}')` }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
            
            {/* Content */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white z-10">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b91c1c] mb-1 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 ease-out">
                {collection.subtitle}
              </span>
              <h3 className="text-xl md:text-2xl font-bold tracking-[0.1em] mb-4 transform translate-y-4 group-hover:translate-y-0 text-shadow-sm transition-all duration-500 ease-out">
                {collection.title}
              </h3>
              
              <Link 
                href={collection.link}
                className="inline-flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest opacity-0 transform translate-y-4 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100 hover:text-gray-300"
              >
                Mua ngay <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
