"use client";

import { useEffect, useState } from "react";
import { getAuthConfig, getStoredUser, loginWithEmail, loginWithGoogle } from "./auth";
import { PublicSite } from "./PublicSite";
import { homeRoute, navigate } from "./routes";

/** شاشة تسجيل الدخول الموحدة على /login.
 *  بعد نجاح الدخول توجّه المستخدم إلى لوحته حسب نوع حسابه. */
export function LoginScreen() {
  const [config] = useState(() => getAuthConfig());
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const existing = getStoredUser();
    if (existing) {
      navigate(homeRoute(existing));
      return;
    }
    setChecking(false);
  }, []);

  const afterLogin = (user: Parameters<typeof homeRoute>[0]) => {
    navigate(homeRoute(user));
  };

  const handleGoogleCredential = async (credential: string) => {
    setAuthLoading(true);
    setAuthError("");
    try {
      afterLogin(await loginWithGoogle(credential));
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "فشل تسجيل الدخول");
      setAuthLoading(false);
    }
  };

  const handleEmailLogin = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError("");
    try {
      afterLogin(await loginWithEmail(email, password));
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "فشل تسجيل الدخول");
      setAuthLoading(false);
    }
  };

  if (checking) return null;

  return (
    <PublicSite
      config={config}
      user={null}
      authError={authError}
      authLoading={authLoading}
      mode="login"
      onBackToSite={() => navigate("/")}
      onLoginClick={() => {}}
      onGoogleCredential={handleGoogleCredential}
      onEmailLogin={handleEmailLogin}
      onOpenDashboard={() => {}}
    />
  );
}
