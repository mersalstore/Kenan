"use client";

import { useEffect } from "react";
import { getStoredUser } from "../../../../components/auth";
import { homeRoute, navigate, LOGIN_ROUTE } from "../../../../components/routes";

/** الرابط القديم للنظام. أُبقي عليه لأن المستخدمين حفظوه في المفضلة،
 *  ويحوّل الآن إلى /login أو إلى لوحة الحساب حسب الجلسة. */
export default function LegacyDashboardPage() {
  useEffect(() => {
    const user = getStoredUser();
    navigate(user ? homeRoute(user) : LOGIN_ROUTE);
  }, []);

  return null;
}
