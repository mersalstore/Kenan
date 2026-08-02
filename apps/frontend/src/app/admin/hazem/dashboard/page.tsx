"use client";

import { useEffect, useState } from "react";
import { getAuthConfig, getStoredUser, loginWithEmail, loginWithGoogle, logout, type AuthUser } from "../../../../components/auth";
import { InternalApp } from "../../../../components/InternalApp";
import { PublicSite } from "../../../../components/PublicSite";

export default function AdminDashboardPage() {
  const [config] = useState(() => getAuthConfig());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    setMounted(true);
  }, []);

  const handleGoogleCredential = async (credential: string) => {
    setAuthLoading(true);
    setAuthError("");
    try {
      await loginWithGoogle(credential);
      // reload لالتقاط الجلسة من localStorage وفتح لوحة التحكم
      window.location.reload();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "فشل تسجيل الدخول");
      setAuthLoading(false);
    }
  };

  const handleEmailLogin = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError("");
    try {
      await loginWithEmail(email, password);
      // reload لالتقاط الجلسة من localStorage وفتح لوحة التحكم
      window.location.reload();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "فشل تسجيل الدخول");
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };

  if (!mounted) return null;

  // ✅ مسجل دخول → لوحة التحكم مباشرة
  if (user) {
    return (
      <InternalApp
        user={user}
        onLogout={handleLogout}
        onOpenSite={() => { window.location.href = "/"; }}
      />
    );
  }

  // 🔐 مش مسجل → صفحة تسجيل الدخول الأصلية
  return (
    <PublicSite
      config={config}
      user={null}
      authError={authError}
      authLoading={authLoading}
      mode="login"
      onBackToSite={() => { window.location.href = "/"; }}
      onLoginClick={() => {}}
      onGoogleCredential={handleGoogleCredential}
      onEmailLogin={handleEmailLogin}
      onOpenDashboard={() => {}}
    />
  );
}
