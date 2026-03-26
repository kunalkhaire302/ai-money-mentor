"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://ai-money-mentor-n5kt.onrender.com";

interface FetchOptions extends RequestInit {
  auth?: boolean;
}

export async function apiFetch(endpoint: string, options: FetchOptions = {}) {
  const { auth = true, ...rest } = options;
  const headers = new Headers(rest.headers || {});

  if (auth) {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  if (!(rest.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...rest,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    if (typeof window !== "undefined" && !window.location.pathname.includes("/auth")) {
      window.location.href = "/auth/login";
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || "Request failed");
  }

  return response.json();
}
