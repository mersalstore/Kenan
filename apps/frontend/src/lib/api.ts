function getBackendUrl(): string {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.trim();
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      return "https://api.kenan4saftey.com";
    }
  }
  return "http://localhost:8787";
}

/** يمسح الجلسة ويعيد المستخدم لصفحة الدخول. */
function endSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("kanan_access_token");
  localStorage.removeItem("kanan_refresh_token");
  localStorage.removeItem("kenan.session");
  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = "/login/";
  }
}

/**
 * توكينات وهمية خلّفتها نسخة قديمة من الواجهة كانت تُلفّق جلسة محلية عند تعذر
 * الوصول للسيرفر. السيرفر يرفضها دائماً بـ 401، فيبدو النظام وكأنه "لا يزامن"
 * إلى الأبد. نتخلص منها فور اكتشافها بدل إرسالها في كل طلب.
 */
function isFabricatedToken(token: string | null): boolean {
  if (!token) return false;
  return /^(demo_|local_|google-admin)/.test(token);
}

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const cleanBackend = getBackendUrl().replace(/\/$/, "");
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${cleanBackend}${cleanEndpoint}`;
  const accessToken = typeof window !== "undefined" ? localStorage.getItem("kanan_access_token") : null;

  if (isFabricatedToken(accessToken) && !cleanEndpoint.startsWith("/api/auth/")) {
    endSession();
    throw new Error("انتهت صلاحية الجلسة. يرجى تسجيل الدخول من جديد.");
  }

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

  if (cleanEndpoint.startsWith("/api/auth/")) {
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "فشلت عملية المصادقة");
    }
    return response.json();
  }

  if (response.status === 401) {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("kanan_refresh_token") : null;

    if (refreshToken && !isFabricatedToken(refreshToken)) {
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

    // تجديد التوكين فشل: الجلسة انتهت فعلاً. إبقاء المستخدم داخل النظام هنا
    // يجعل كل حفظ لاحق يفشل بنفس الرسالة بلا مخرج، فنعيده لصفحة الدخول.
    if (accessToken) {
      endSession();
      throw new Error("انتهت صلاحية الجلسة. يرجى تسجيل الدخول من جديد.");
    }
    throw new Error("تطلب هذه العملية تسجيل الدخول أولاً");
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
