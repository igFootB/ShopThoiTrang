import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Chatbot from "@/components/chat/Chatbot";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white">
      <Navbar />
      {/* 
        Add padding top to account for fixed header on most pages.
        Homepage will use negative margin to pull itself up.
      */}
      <main className="w-full pt-28">{children}</main>
      <Footer />
      <Chatbot />
    </div>
  );
}
