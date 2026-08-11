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

const DEMO_ACCOUNTS: Record<string, AuthUser> = {
  "kenansafety.sec@gmail.com": {
    id: "admin-master",
    email: "kenansafety.sec@gmail.com",
    name: "إدارة كنان للسلامة",
    role: "ADMIN",
    sections: ["dashboard", "projects", "quotations", "contracts", "inventory", "workers", "maintenance", "finance", "reports"],
  },
  "admin@kenan.com": {
    id: "admin-main",
    email: "admin@kenan.com",
    name: "المدير العام",
    role: "ADMIN",
    sections: ["dashboard", "projects", "quotations", "contracts", "inventory", "workers", "maintenance", "finance", "reports"],
  },
  "engineer@kenan.com": {
    id: "eng-main",
    email: "engineer@kenan.com",
    name: "م. أحمد الشامي (مهندس الموقع)",
    role: "PROJECT_MANAGER",
    sections: ["dashboard", "projects", "maintenance", "reports"],
  },
  "procurement@kenan.com": {
    id: "proc-main",
    email: "procurement@kenan.com",
    name: "مسؤول المشتريات والمخازن",
    role: "PROCUREMENT",
    sections: ["dashboard", "inventory", "quotations"],
  },
  "client@kenan.com": {
    id: "client-demo",
    email: "client@kenan.com",
    name: "شركة المدار للإنشاءات (عميل)",
    role: "CLIENT",
    sections: ["dashboard", "projects", "quotations", "contracts"],
  },
};

export function getDemoAccounts() {
  return [
    { label: "👑 حساب الإدارة العامة", email: "kenansafety.sec@gmail.com", pass: "K9#mXp!vL2@qRz7$wT", role: "مدير النظام" },
    { label: "👷‍♂️ حساب مهندس المشاريع", email: "engineer@kenan.com", pass: "123456", role: "إشراف هندسي" },
    { label: "📦 حساب المشتريات والمخازن", email: "procurement@kenan.com", pass: "123456", role: "مخازن ومشتريات" },
    { label: "🏢 حساب العميل التجريبي", email: "client@kenan.com", pass: "123456", role: "عميل" },
  ];
}

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

function storeSession(data: { accessToken: string; refreshToken: string; user: AuthUser }) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("kanan_access_token", data.accessToken);
  window.localStorage.setItem("kanan_refresh_token", data.refreshToken);
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
}

function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("kanan_access_token");
  window.localStorage.removeItem("kanan_refresh_token");
  window.localStorage.removeItem(SESSION_KEY);
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export async function loginWithGoogle(credential: string): Promise<AuthUser> {
  const data = await apiFetch("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
  storeSession(data);
  return data.user;
}

export async function loginWithEmail(email: string, password: string): Promise<AuthUser> {
  const cleanEmail = email.toLowerCase().trim();
  const data = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: cleanEmail, password }),
  });
  storeSession(data);
  return data.user;
}

export function registerClientAccount(name: string, phoneOrEmail: string): AuthUser {
  const cleanInput = phoneOrEmail.toLowerCase().trim();
  const newUser: AuthUser = {
    id: `client-${Date.now()}`,
    email: cleanInput.includes("@") ? cleanInput : `${cleanInput}@client.kenan.com`,
    name: name || "عميل جديد",
    role: "CLIENT",
    sections: ["dashboard", "projects", "quotations", "contracts"],
  };
  storeSession({
    accessToken: `client_token_${Date.now()}`,
    refreshToken: `client_refresh_${Date.now()}`,
    user: newUser,
  });
  return newUser;
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
