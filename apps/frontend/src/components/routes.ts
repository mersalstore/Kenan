import type { AuthUser } from "./auth";

export const LOGIN_ROUTE = "/login/";
export const ADMIN_ROUTE = "/admin/dashboard/";
export const STAFF_ROUTE = "/dashboard/";
export const CLIENT_ROUTE = "/client/dashboard/";

export type Area = "admin" | "staff" | "client";

/** يصنّف الحساب إلى منطقة واحدة. الأدوار تأتي من السيرفر بالإنجليزية
 *  (ADMIN, PROJECT_MANAGER…) ومن الجلسات القديمة بالعربية، فندعم الاثنين. */
export function areaOf(user: AuthUser): Area {
  const role = (user.role ?? "").trim();
  const upper = role.toUpperCase();

  if (upper === "ADMIN" || role === "مدير عام" || role === "الإدارة") return "admin";
  if (upper === "CLIENT" || role === "عميل") return "client";
  return "staff";
}

/** الصفحة التي يفتحها هذا الحساب بعد تسجيل الدخول. */
export function homeRoute(user: AuthUser): string {
  switch (areaOf(user)) {
    case "admin":
      return ADMIN_ROUTE;
    case "client":
      return CLIENT_ROUTE;
    default:
      return STAFF_ROUTE;
  }
}

export function navigate(path: string) {
  if (typeof window !== "undefined") window.location.href = path;
}
