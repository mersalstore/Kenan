import { useCallback, useState } from "react";
import { getAuthConfig, getStoredUser, loginWithEmail, loginWithGoogle, logout, type AuthUser } from "./auth";
import { InternalApp } from "./InternalApp";
import { PublicSite, ContactPage } from "./PublicSite";

export function App() {
  const [config] = useState(() => getAuthConfig());
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [mode, setMode] = useState<"site" | "login">("site");
  const [view, setView] = useState<"site" | "app">("app");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleGoogleCredential = useCallback((credential: string) => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const nextUser = loginWithGoogle(credential);
      setUser(nextUser);
      setMode("site");
      setView("app");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "فشل تسجيل الدخول");
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleEmailLogin = useCallback((email: string, password: string) => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const nextUser = loginWithEmail(email, password);
      setUser(nextUser);
      setMode("site");
      setView("app");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "فشل تسجيل الدخول");
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setUser(null);
    setView("app");
    setMode("site");
  }, []);

  // صفحة التواصل المستقلة — تشتغل بدون تسجيل دخول
  if (window.location.pathname === "/contact") {
    return <ContactPage />;
  }

  if (user && view === "app") {
    return <InternalApp user={user} onLogout={handleLogout} onOpenSite={() => setView("site")} />;
  }

  return (
    <PublicSite
      config={config}
      user={user}
      authError={authError}
      authLoading={authLoading}
      mode={user ? "site" : mode}
      onBackToSite={() => setMode("site")}
      onLoginClick={() => setMode("login")}
      onGoogleCredential={handleGoogleCredential}
      onEmailLogin={handleEmailLogin}
      onOpenDashboard={() => setView("app")}
    />
  );
}
