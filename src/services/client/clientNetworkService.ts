"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_KEYPOINT_API_URL ?? "";

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
};

function buildUrl(endpoint: string, params?: RequestOptions["params"]) {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = new URL(normalizedEndpoint, API_BASE_URL || window.location.origin);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  return API_BASE_URL ? url.toString() : `${url.pathname}${url.search}`;
}

async function requestJson<T>(endpoint: string, options: RequestOptions = {}) {
  const { params, headers, ...requestOptions } = options;
  const response = await fetch(buildUrl(endpoint, params), {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const clientNetworkService = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    requestJson<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    requestJson<T>(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    requestJson<T>(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    requestJson<T>(endpoint, { ...options, method: "DELETE" }),
};
