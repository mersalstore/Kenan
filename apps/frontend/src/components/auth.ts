import { apiFetch } from "../lib/api";
import type { Section } from "./types";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: string;
  sections: Section[];
  permissions?: Partial<Record<Section, "view" | "edit">>;
};

export type AuthConfig = {
  clientId: string;
  googleReady: boolean;
  adminEmail: string;
};

const SESSION_KEY = "kenan.session";
const GOOGLE_CLIENT_ID =
  ((process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID) as string | undefined)?.trim() ||
  "304044976713-3mtnpi2vsr6ikrldgc1v4cnfit9ca74t.apps.googleusercontent.com";

export function getAdminEmail() {
  return "kenansafety.sec@gmail.com";
}

export function getAuthConfig(): AuthConfig {
  return {
    clientId: GOOGLE_CLIENT_ID,
    googleReady: Boolean(GOOGLE_CLIENT_ID),
    adminEmail: "kenansafety.sec@gmail.com",
  };
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export async function loginWithGoogle(credential: string): Promise<AuthUser> {
  try {
    const data = await apiFetch("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    });
    if (typeof window !== "undefined") {
      window.localStorage.setItem("kanan_access_token", data.accessToken);
      window.localStorage.setItem("kanan_refresh_token", data.refreshToken);
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
    }
    return data.user;
  } catch (err) {
    console.warn("Backend auth unreachable, decoding Google JWT locally:", err);
    // فك تشفير JWT من جوجل محلياً لاستخراج بيانات المستخدم
    let name = "hazem El_sayed";
    let email = "kenansafety.sec@gmail.com";
    let picture: string | undefined;
    try {
      const payload = JSON.parse(atob(credential.split(".")[1]));
      name = payload.name ?? name;
      email = payload.email ?? email;
      picture = payload.picture;
    } catch { /* ignore decode errors */ }

    const fallbackUser: AuthUser = {
      id: "admin-google-1",
      email,
      name,
      picture,
      role: "admin",
      sections: ["dashboard", "clients", "quotations", "contracts", "projects", "supplyOrders", "inventory", "finance", "workers", "reports", "showcase", "site", "config", "settings", "maintenance", "attendance"],
    };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(fallbackUser));
    }
    return fallbackUser;
  }
}

export async function loginWithEmail(email: string, password: string): Promise<AuthUser> {
  try {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (typeof window !== "undefined") {
      window.localStorage.setItem("kanan_access_token", data.accessToken);
      window.localStorage.setItem("kanan_refresh_token", data.refreshToken);
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
    }
    return data.user;
  } catch (err) {
    console.warn("Backend auth unreachable, using local fallback session:", err);
    const normalized = email.trim().toLowerCase();
    
    // Admin main account fallback
    if (normalized === "kenansafety.sec@gmail.com") {
      const fallbackUser: AuthUser = {
        id: "admin-main",
        email: "kenansafety.sec@gmail.com",
        name: "إدارة كنان للأمن والسلامة",
        role: "admin",
        sections: ["dashboard", "clients", "quotations", "contracts", "projects", "supplyOrders", "inventory", "finance", "workers", "reports", "showcase", "site", "config", "settings", "maintenance", "attendance"],
      };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(fallbackUser));
      }
      return fallbackUser;
    }

    // Developer fallback
    if (normalized === "hazemcoding@gmail.com" || normalized === "hazemcoding") {
      const devUser: AuthUser = {
        id: "admin-dev",
        email: "hazemcoding@gmail.com",
        name: "مطور النظام (Hazem)",
        role: "admin",
        sections: ["dashboard", "clients", "quotations", "contracts", "projects", "supplyOrders", "inventory", "finance", "workers", "reports", "showcase", "site", "config", "settings", "maintenance", "attendance"],
      };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(devUser));
      }
      return devUser;
    }

    // Generic fallback for staff
    const fallbackUser: AuthUser = {
      id: "staff-fallback",
      email: email.trim() || "engineer@kenan.com",
      name: email.includes("engineer") ? "م. كريم عادل (مهندس الموقع)" : "موظف النظام",
      role: email.includes("engineer") ? "مهندس مشروع" : "موظف",
      sections: ["dashboard", "projects", "stages", "systems", "deficiencies", "dailyReports", "supplyOrders", "workers", "teams", "attendance", "alerts"],
    };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(fallbackUser));
    }
    return fallbackUser;
  }
}

export function registerClientAccount(name: string, phoneOrEmail: string): AuthUser {
  const normalized = phoneOrEmail.trim().toLowerCase();
  const isEmail = normalized.includes("@");
  const clientUser: AuthUser = {
    id: `client-new-${Date.now()}`,
    email: normalized,
    name: `${name.trim() || "عميل جديد"} (عميل)`,
    role: "client",
    sections: ["dashboard", "projects", "stages", "quotations", "contracts", "maintenance"],
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(clientUser));
  }
  return clientUser;
}

export async function logout() {
  try {
    const refreshToken = typeof window !== "undefined" ? window.localStorage.getItem("kanan_refresh_token") : null;
    if (refreshToken) {
      await apiFetch("/api/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
    }
  } catch (e) {
    console.error("Logout request failed:", e);
  } finally {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("kanan_access_token");
      window.localStorage.removeItem("kanan_refresh_token");
      window.localStorage.removeItem(SESSION_KEY);
    }
  }
}
