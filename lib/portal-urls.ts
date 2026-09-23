// Deployed base URLs for the two employee-facing portals this Admin app can
// hand a real login session off to (Vacant MR Login - Access). Overridable
// via env vars because Vercel project URLs can be renamed independently of
// this repo — set NEXT_PUBLIC_FIELD_PORTAL_URL / NEXT_PUBLIC_MANAGER_PORTAL_URL
// in the Admin app's Vercel project settings if the actual deployed URLs
// differ from these defaults (best-guess from each app's own repo/project
// naming — please confirm and update if wrong).
export const FIELD_PORTAL_URL =
  (process.env.NEXT_PUBLIC_FIELD_PORTAL_URL || "https://updated-filed-repo.vercel.app").replace(/\/$/, "");

export const MANAGER_PORTAL_URL =
  (process.env.NEXT_PUBLIC_MANAGER_PORTAL_URL || "https://updated-zivira-manager-portal.vercel.app").replace(/\/$/, "");

export function autoLoginUrl(portalType: "manager" | "field", token: string) {
  const base = portalType === "manager" ? MANAGER_PORTAL_URL : FIELD_PORTAL_URL;
  const path = portalType === "manager" ? "/manager/auto-login" : "/field/auto-login";
  return `${base}${path}?token=${encodeURIComponent(token)}`;
}
