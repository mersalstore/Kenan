const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8787";

/** يمسح الجلسة ويعيد المستخدم لصفحة الدخول.
 *  المفاتيح هنا يجب أن تطابق ما يكتبه components/auth.ts — كان الكود السابق
 *  يمسح "kanan_user" وهو مفتاح غير موجود، فتبقى الجلسة الميتة في المتصفح. */
function endSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("kanan_access_token");
  localStorage.removeItem("kanan_refresh_token");
  localStorage.removeItem("kenan.session");
  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = "/login/";
  }
}

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const cleanBackend = BACKEND_URL.replace(/\/$/, "");
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${cleanBackend}${cleanEndpoint}`;
  const accessToken = typeof window !== "undefined" ? localStorage.getItem("kanan_access_token") : null;

  const headers = new Headers(options.headers || {});
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (netErr) {
    throw new Error("تعذر الاتصال بالسيرفر (يعمل التطبيق في الوضع المحلي)");
  }

  if (response.status === 401) {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("kanan_refresh_token") : null;

    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${cleanBackend}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem("kanan_access_token", data.accessToken);
          localStorage.setItem("kanan_refresh_token", data.refreshToken);

          // Retry original request
          headers.set("Authorization", `Bearer ${data.accessToken}`);
          const retryResponse = await fetch(url, { ...options, headers });
          if (!retryResponse.ok) {
            const err = await retryResponse.json().catch(() => ({}));
            throw new Error(err.message || "فشلت العملية على السيرفر");
          }
          return retryResponse.json();
        }
      } catch {
        // نتجاهل الاستثناء هنا ونُنهي الجلسة بالأسفل
      }
    }

    if (accessToken) {
      endSession();
      throw new Error("انتهت الجلسة. يرجى تسجيل الدخول من جديد.");
    } else {
      throw new Error("تطلب هذه العملية الاتصال بالسيرفر");
    }
  }

  if (response.status === 429) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "تم تجاوز عدد محاولات الدخول المسموح بها. يرجى الانتظار قليلاً قبل المحاولة مجدداً.");
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "حدث خطأ أثناء معالجة الطلب على السيرفر");
  }

  // Handle files/blobs for reports or quotations export
  const contentType = response.headers.get("Content-Type");
  if (contentType && (contentType.includes("application/pdf") || contentType.includes("sheet"))) {
    return response.blob();
  }

  return response.json();
}
