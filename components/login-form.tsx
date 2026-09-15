"use client";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiClient, setToken } from "@/lib/api-client";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("adminzivira");
  const [password, setPassword] = useState("ziviramumbai");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await apiClient.login(username, password);
      setToken(response.data.token);
      router.push("/admin/home");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="username" className="block text-xs font-bold text-[#31234c]">Username</label>
        <div className="relative">
          <select className="input" 
            id="username" 
            value={username} 
            onChange={(event) => setUsername(event.target.value)}
            className="w-full h-10 bg-white border border-white/50 rounded-lg px-3 text-[#31234c] text-sm focus:outline-none focus:ring-2 focus:ring-[#f7931e]/50 focus:border-[#f7931e] transition-colors appearance-none shadow-sm"
          >
            <option value="adminzivira">Zivira Labs Admin (adminzivira)</option>
            <option value="Zivira-SuperAdmin">Zivira-SuperAdmin</option>
            <option value="Zivira-Manager">Zivira-Manager</option>
            <option value="Zivira-fieldRepo">Zivira-fieldRepo</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#31234c]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      </div>
      
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-xs font-bold text-[#31234c]">Password</label>
        <input 
          id="password" 
          type="password" 
          value={password} 
          onChange={(event) => setPassword(event.target.value)} 
          className="w-full h-10 bg-white border border-white/50 rounded-lg px-3 text-[#31234c] text-sm tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-[#f7931e]/50 focus:border-[#f7931e] transition-colors shadow-sm"
        />
      </div>
      
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
          {error}
        </div>
      )}
      
      <button 
        className="w-full h-10 mt-6 bg-[#f7931e] hover:bg-[#e68212] text-white rounded-lg font-bold text-sm flex items-center justify-center gap-4 transition-all shadow-md shadow-orange-500/20 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none" 
        disabled={submitting} 
        type="submit"
      >
        {submitting ? "Signing in..." : "Enter portal"}
        {!submitting && <ArrowRight size={16} strokeWidth={2.5} />}
      </button>
    </form>
  );
}
