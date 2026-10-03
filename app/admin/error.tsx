"use client";

import { useEffect } from "react";
import { CompanyShell } from "@/components/company-shell";

// Round 37 Item 1 -- this app had NO error.tsx anywhere under /admin (or
// anywhere else). Without one, Next.js App Router has no local error
// boundary to catch a client-side exception thrown by any admin screen,
// so the error propagates all the way past CompanyShell (app/admin/
// layout.tsx) to Next's own built-in top-level fallback -- an unstyled,
// shell-less white page. That is the exact "no sidebar, no top nav, raw
// content floating" symptom reported against the Customized Report
// Generation screen. The concrete trigger the coordinator saw there was
// the GET /custom-reports/metadata route-ordering bug (see
// company.routes.ts), now fixed -- but this boundary stays regardless, so
// ANY future uncaught error on ANY admin screen degrades to an in-shell
// error message instead of ever losing the shell again.
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[admin error boundary]", error);
  }, [error]);

  return (
    <CompanyShell>
      <div className="max-w-xl mx-auto mt-10 bg-surface-card rounded-xl shadow-sm p-6 space-y-3 text-center">
        <h2 className="font-headline-sm text-headline-sm text-text-primary">Something went wrong</h2>
        <p className="text-sm text-text-secondary">{error.message || "An unexpected error occurred."}</p>
        <button
          type="button"
          onClick={reset}
          className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-brand-primary-hover transition-all"
        >
          Try again
        </button>
      </div>
    </CompanyShell>
  );
}
