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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="username" className="block text-sm font-medium text-text-secondary">Username</label>
        <div className="relative">
          <select 
            id="username" 
            value={username} 
            onChange={(event) => setUsername(event.target.value)}
            className="w-full h-11 bg-surface-subtle border border-border-subtle rounded-lg px-4 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors appearance-none"
          >
            <option value="adminzivira">Zivira Labs Admin (adminzivira)</option>
            <option value="Zivira-SuperAdmin">Zivira-SuperAdmin</option>
            <option value="Zivira-Manager">Zivira-Manager</option>
            <option value="Zivira-fieldRepo">Zivira-fieldRepo</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-text-muted">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-text-secondary">Password</label>
        <input 
          id="password" 
          type="password" 
          value={password} 
          onChange={(event) => setPassword(event.target.value)} 
          className="w-full h-11 bg-surface-subtle border border-border-subtle rounded-lg px-4 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
        />
      </div>
      
      {error && (
        <div className="p-3 rounded-lg bg-status-danger-bg border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}
      
      <button 
        className="w-full h-11 mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none" 
        disabled={submitting} 
        type="submit"
      >
        {submitting ? "Signing in..." : "Enter portal"}
        {!submitting && <ArrowRight size={17} />}
      </button>
    </form>
  );
}
