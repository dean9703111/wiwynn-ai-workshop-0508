import { useAuthStore } from "@/stores/auth";

export class ApiError extends Error {
  status: number;
  field?: string;
  payload?: unknown;
  constructor(
    status: number,
    message: string,
    options?: { field?: string; payload?: unknown }
  ) {
    super(message);
    this.status = status;
    this.field = options?.field;
    this.payload = options?.payload;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: Record<string, string | number | undefined | null>;
}

const STATUS_MESSAGES: Record<number, string> = {
  400: "請求內容有誤",
  401: "尚未登入或登入逾期",
  403: "權限不足",
  404: "找不到資料",
  409: "資料已存在",
};

function buildUrl(
  path: string,
  query?: RequestOptions["query"]
): string {
  if (!query) return path;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token } = useAuthStore.getState();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const { body, query: _query, ...rest } = options;
  void _query;
  const init: RequestInit = {
    ...rest,
    headers,
  };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const res = await fetch(buildUrl(path, options.query), init);
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    const fallback = STATUS_MESSAGES[res.status] ?? "請求失敗";
    const message =
      (typeof data === "object" && data !== null && "message" in data
        ? String((data as { message: unknown }).message)
        : null) ?? fallback;
    const field =
      typeof data === "object" && data !== null && "field" in data
        ? String((data as { field: unknown }).field)
        : undefined;
    if (res.status === 401) {
      useAuthStore.getState().logout();
    }
    throw new ApiError(res.status, message, { field, payload: data });
  }
  return data as T;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
};
