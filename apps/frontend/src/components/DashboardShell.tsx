"use client";

import { useEffect, useState } from "react";
import { getStoredUser, logout, type AuthUser } from "./auth";
import { InternalApp } from "./InternalApp";
import { areaOf, homeRoute, navigate, LOGIN_ROUTE, type Area } from "./routes";

/** لوحة محمية لمنطقة واحدة.
 *
 *  - بلا جلسة صالحة → صفحة تسجيل الدخول.
 *  - جلسة من منطقة أخرى → لوحة صاحبها، حتى لا يفتح موظف رابط الإدارة
 *    ويرى شاشة لا تخصه.
 */
export function DashboardShell({ area }: { area: Area }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      navigate(LOGIN_ROUTE);
      return;
    }
    if (areaOf(stored) !== area) {
      navigate(homeRoute(stored));
      return;
    }
    setUser(stored);
    setReady(true);
  }, [area]);

  const handleLogout = async () => {
    await logout();
    navigate(LOGIN_ROUTE);
  };

  if (!ready || !user) return null;

  return (
    <InternalApp
      user={user}
      onLogout={handleLogout}
      onOpenSite={() => navigate("/")}
    />
  );
}
