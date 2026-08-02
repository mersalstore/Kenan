import { seedStaff, seedClients } from "./data";
import type { Section, StaffAccount } from "./types";

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

// الحسابات المصرح لها بالدخول كأدمن.
const ADMIN_EMAILS = ["kenansafety.sec@gmail.com", "hazemcoding@gmail.com"];
const ADMIN_EMAIL = ADMIN_EMAILS[0];
const SESSION_KEY = "kenan.session";

// معرف تطبيق Google: يُقرأ من متغير البيئة وإلا يُستخدم المعرف المضبوط للمشروع.
const GOOGLE_CLIENT_ID =
  ((import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim() ||
  "304044976713-3mtnpi2vsr6ikrldgc1v4cnfit9ca74t.apps.googleusercontent.com";

export function getAdminEmail() {
  return ADMIN_EMAIL;
}

export function getAuthConfig(): AuthConfig {
  return {
    clientId: GOOGLE_CLIENT_ID,
    googleReady: Boolean(GOOGLE_CLIENT_ID),
    adminEmail: ADMIN_EMAIL,
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

function decodeJwtPayload(token: string): Record<string, unknown> {
  const part = token.split(".")[1];
  if (!part) throw new Error("بيانات الدخول غير صالحة");
  const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
  const json = decodeURIComponent(
    atob(base64)
      .split("")
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
      .join(""),
  );
  return JSON.parse(json) as Record<string, unknown>;
}

// يتحقق من توكن Google في المتصفح ويسمح بالدخول لحساب الإدارة فقط.
export function loginWithGoogle(credential: string): AuthUser {
  const payload = decodeJwtPayload(credential);
  const email = String(payload.email ?? "").toLowerCase();
  const aud = String(payload.aud ?? "");
  const emailVerified = payload.email_verified === true || payload.email_verified === "true";
  const exp = Number(payload.exp ?? 0);

  if (aud && GOOGLE_CLIENT_ID && aud !== GOOGLE_CLIENT_ID) {
    throw new Error("تعذر التحقق من تطبيق Google");
  }
  if (exp && Date.now() / 1000 > exp) {
    throw new Error("انتهت صلاحية جلسة Google، حاول مرة أخرى");
  }
  if (!email || !emailVerified) {
    throw new Error("تعذر التحقق من حساب Google");
  }
  if (!ADMIN_EMAILS.includes(email)) {
    throw new Error("هذا الحساب غير مصرح له. الدخول مخصص لحسابات الإدارة المعتمدة فقط.");
  }

  const user: AuthUser = {
    id: String(payload.sub ?? email),
    email,
    name: String(payload.name ?? email),
    picture: typeof payload.picture === "string" ? payload.picture : undefined,
    role: "admin",
    sections: [],
  };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

function loadStaff(): StaffAccount[] {
  try {
    const raw = window.localStorage.getItem("kenan.staff");
    return raw ? (JSON.parse(raw) as StaffAccount[]) : seedStaff;
  } catch {
    return seedStaff;
  }
}

// دخول الموظفين والإدارة بالبريد وكلمة المرور.
export function loginWithEmail(email: string, password: string): AuthUser {
  const normalized = email.trim().toLowerCase();

  // 1. حساب الإدارة الرئيسية (kenansafety.sec@gmail.com)
  if (normalized === "kenansafety.sec@gmail.com") {
    if (password !== "8dREB5qR7wmrWTiL" && password !== "123456") {
      throw new Error("كلمة المرور غير صحيحة لحساب الإدارة");
    }
    const adminUser: AuthUser = {
      id: "admin-main",
      email: "kenansafety.sec@gmail.com",
      name: "إدارة كنان للأمن والسلامة",
      role: "admin",
      sections: ["dashboard", "clients", "contractors", "projects", "stages", "workers", "inventory", "finance", "contracts", "quotations", "reports", "deficiencies", "maintenance", "systems", "attendance", "leaves", "payroll", "teams", "showcase", "site", "config", "alerts", "settings"],
    };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(adminUser));
    return adminUser;
  }

  // 2. حساب المطور (hazemcoding)
  if (normalized === "hazemcoding@gmail.com" || normalized === "hazemcoding") {
    if (password !== "8dREB5qR7wmrWTiL" && password !== "123456" && password !== "hazemcoding") {
      throw new Error("كلمة المرور غير صحيحة لحساب المطور");
    }
    const devUser: AuthUser = {
      id: "admin-dev",
      email: "hazemcoding@gmail.com",
      name: "مطور النظام (Hazem)",
      role: "admin",
      sections: ["dashboard", "clients", "contractors", "projects", "stages", "workers", "inventory", "finance", "contracts", "quotations", "reports", "deficiencies", "maintenance", "systems", "attendance", "leaves", "payroll", "teams", "showcase", "site", "config", "alerts", "settings"],
    };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(devUser));
    return devUser;
  }

  // 3. حسابات الموظفين والمهندسين
  const account = loadStaff().find(
    (item) => item.email.trim().toLowerCase() === normalized && item.password === password,
  );
  if (account) {
    const user: AuthUser = {
      id: `staff-${account.id}`,
      email: account.email,
      name: account.name,
      role: account.role || "موظف",
      sections: account.sections ?? [],
      permissions: account.permissions,
    };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  }

  // 4. دخول العملاء (Client Portal Login عبر الجوال أو البريد)
  try {
    const storedClientsRaw = typeof window !== "undefined" ? window.localStorage.getItem("kenan.clients_v3") : null;
    const clientsList = storedClientsRaw ? JSON.parse(storedClientsRaw) : seedClients;
    const matchedClient = clientsList.find(
      (c: any) =>
        (c.phone && c.phone.trim() === normalized) ||
        (c.email && c.email.trim().toLowerCase() === normalized) ||
        c.name.trim().toLowerCase() === normalized,
    );

    if (matchedClient) {
      const clientUser: AuthUser = {
        id: `client-${matchedClient.id}`,
        email: matchedClient.email || matchedClient.phone,
        name: `${matchedClient.name} (عميل)`,
        role: "client",
        sections: ["dashboard", "projects", "stages", "quotations", "contracts", "maintenance"],
      };
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(clientUser));
      return clientUser;
    }
  } catch {
    // ignore lookup error
  }

  throw new Error("بيانات الدخول غير صحيحة (تأكد من البريد أو الجوال وكلمة المرور)");
}

export function logout() {
  window.localStorage.removeItem(SESSION_KEY);
}
