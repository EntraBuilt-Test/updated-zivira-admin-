"use client";

import { useEffect, useState } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCard(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main 
      className="min-h-screen w-full flex items-center justify-end p-4 md:pr-[15%] relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/log in page.png")' }}
    >
      <div 
        className={`w-full max-w-[380px] bg-[#ebe1dc]/95 backdrop-blur-sm border border-white/40 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden transition-all duration-700 ease-out transform relative z-10 ${
          showCard ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="p-8">
          <div className="flex items-center gap-4.5 mb-6">
            <div className="w-7 h-7 rounded-md bg-[#f7931e] flex items-center justify-center text-white font-bold text-sm shadow-sm">
              Z
            </div>
            <span className="font-bold text-[#31234c] tracking-tight text-sm">
              Zivira Labs
            </span>
          </div>
          
          <div className="mb-6">
            <h2 className="text-2xl font-black text-[#31234c] mb-1">Admin Sign In</h2>
            <p className="text-xs text-gray-500">Seed user: adminzivira</p>
          </div>
          
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
