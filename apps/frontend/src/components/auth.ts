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
}

export async function loginWithEmail(email: string, password: string): Promise<AuthUser> {
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
