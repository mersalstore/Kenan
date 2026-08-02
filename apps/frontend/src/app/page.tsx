"use client";

import { useEffect, useState } from "react";
import { getAuthConfig, getStoredUser, type AuthUser } from "../components/auth";
import { PublicSite, ContactPage } from "../components/PublicSite";

export default function App() {
  const [config] = useState(() => getAuthConfig());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (typeof window !== "undefined" && window.location.pathname === "/contact") {
    return <ContactPage />;
  }

  return (
    <PublicSite
      config={config}
      user={user}
      authError=""
      authLoading={false}
      mode="site"
      onBackToSite={() => {}}
      onLoginClick={() => { window.location.href = "/admin/hazem/dashboard"; }}
      onGoogleCredential={async () => {}}
      onEmailLogin={async () => {}}
      onOpenDashboard={() => { window.location.href = "/admin/hazem/dashboard"; }}
    />
  );
}
