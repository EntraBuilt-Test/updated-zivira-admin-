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
    <main className="min-h-screen w-full flex items-center justify-center bg-surface-canvas p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      <div 
        className={`w-full max-w-md bg-surface-card border border-border-subtle rounded-2xl shadow-xl shadow-black/5 overflow-hidden transition-all duration-700 ease-out transform ${
          showCard ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
              Z
            </div>
            <span className="font-display-lg text-xl font-bold text-text-primary tracking-tight">
              Zivira Labs
            </span>
          </div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Admin Sign In</h2>
            <p className="text-sm text-text-muted">Seed user: adminzivira</p>
          </div>
          
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
