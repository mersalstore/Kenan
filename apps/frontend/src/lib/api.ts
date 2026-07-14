const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8787";

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${BACKEND_URL}${endpoint}`;
  const accessToken = typeof window !== "undefined" ? localStorage.getItem("kanan_access_token") : null;

  const headers = new Headers(options.headers || {});
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Attempt Token Refresh
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("kanan_refresh_token") : null;
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
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
            const err = await retryResponse.json();
            throw new Error(err.message || "Request failed");
          }
          return retryResponse.json();
        }
      } catch (e) {
        // Clear auth and redirect
        localStorage.removeItem("kanan_access_token");
        localStorage.removeItem("kanan_refresh_token");
        localStorage.removeItem("kanan_user");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "حدث خطأ ما في الطلب");
  }

  // Handle files/blobs for reports or quotations export
  const contentType = response.headers.get("Content-Type");
  if (contentType && (contentType.includes("application/pdf") || contentType.includes("sheet"))) {
    return response.blob();
  }

  return response.json();
}
