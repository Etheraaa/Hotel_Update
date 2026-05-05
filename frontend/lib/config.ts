function resolveApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  if (typeof window === "undefined") {
    return process.env.INTERNAL_API_BASE_URL ?? "http://127.0.0.1:3000";
  }

  return "";
}

export const apiBaseUrl = resolveApiBaseUrl();
