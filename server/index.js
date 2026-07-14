import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import express from "express";
import { OAuth2Client } from "google-auth-library";

const app = express();
const port = Number(process.env.PORT ?? 8787);
const sessionCookie = "kenan_session";
const sessions = new Map();
const adminEmails = ["kenansafety.sec@gmail.com", "hazemcoding@gmail.com"];
const adminEmail = adminEmails[0];

app.use(express.json({ limit: "1mb" }));

function findGoogleConfigFile() {
  if (process.env.GOOGLE_CLIENT_SECRET_FILE) {
    return process.env.GOOGLE_CLIENT_SECRET_FILE;
  }

  const match = fs
    .readdirSync(process.cwd())
    .find((file) => file.startsWith("client_secret_") && file.endsWith(".json"));

  return match ? path.join(process.cwd(), match) : null;
}

function readGoogleConfig() {
  const file = findGoogleConfigFile();
  const envClientId = process.env.GOOGLE_CLIENT_ID;
  if (!file && envClientId) {
    return { clientId: envClientId };
  }
  if (!file) {
    return { clientId: "" };
  }

  const raw = JSON.parse(fs.readFileSync(file, "utf8"));
  const config = raw.web ?? raw.installed ?? {};
  return {
    clientId: envClientId ?? config.client_id ?? "",
  };
}

const googleConfig = readGoogleConfig();
const googleClient = new OAuth2Client(googleConfig.clientId);

function parseCookies(header = "") {
  return Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      }),
  );
}

function setSessionCookie(res, token) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${sessionCookie}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 8}${secure}`,
  );
}

function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", `${sessionCookie}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

function currentUser(req) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[sessionCookie];
  return token ? sessions.get(token) ?? null : null;
}

function isAllowedUser(payload) {
  const configuredEmails = (process.env.ALLOWED_GOOGLE_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const allowedEmails = configuredEmails.length > 0 ? configuredEmails : adminEmails;
  const allowedDomain = (process.env.ALLOWED_GOOGLE_DOMAIN ?? "").trim().toLowerCase();
  const email = String(payload.email ?? "").toLowerCase();

  if (allowedEmails.length > 0 && !allowedEmails.includes(email)) return false;
  if (allowedDomain && !email.endsWith(`@${allowedDomain}`)) return false;
  return true;
}

app.get("/api/auth/config", (_req, res) => {
  res.json({
    clientId: googleConfig.clientId,
    googleReady: Boolean(googleConfig.clientId),
    allowedDomain: process.env.ALLOWED_GOOGLE_DOMAIN ?? "",
    adminEmail,
  });
});

app.get("/api/auth/me", (req, res) => {
  res.json({ user: currentUser(req) });
});

app.post("/api/auth/google", async (req, res) => {
  try {
    if (!googleConfig.clientId) {
      return res.status(500).json({ message: "Google client ID غير مضبوط على السيرفر" });
    }

    const credential = req.body?.credential;
    if (!credential) {
      return res.status(400).json({ message: "بيانات الدخول غير مكتملة" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: googleConfig.clientId,
    });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload?.sub) {
      return res.status(401).json({ message: "تعذر التحقق من حساب Google" });
    }

    if (!isAllowedUser(payload)) {
      return res.status(403).json({ message: "هذا البريد غير مصرح له بدخول النظام" });
    }

    const user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name ?? payload.email,
      picture: payload.picture,
      role: adminEmails.includes(payload.email.toLowerCase()) ? "admin" : "engineer",
    };
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, user);
    setSessionCookie(res, token);

    return res.json({ user });
  } catch (error) {
    return res.status(401).json({
      message: "فشل التحقق من Google. راجع إعدادات OAuth والـ authorized origins.",
    });
  }
});

app.post("/api/auth/logout", (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  if (cookies[sessionCookie]) {
    sessions.delete(cookies[sessionCookie]);
  }
  clearSessionCookie(res);
  res.json({ ok: true });
});

const distPath = path.join(process.cwd(), "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(port, "127.0.0.1", () => {
  console.log(`KENAN API ready at http://127.0.0.1:${port}`);
});
