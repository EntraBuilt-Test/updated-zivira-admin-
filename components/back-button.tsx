"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
export function BackButton({ fallback = "/admin/home" }: { fallback?: string }) {
  const router = useRouter();
  return (
    <button
      className="flex items-center gap-2 bg-surface-card border border-border-subtle hover:bg-surface-subtle text-text-primary px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
          return;
        }
        router.push(fallback);
      }}
      type="button"
    >
      <ArrowLeft size={17} />
      Back
    </button>
  );
}
