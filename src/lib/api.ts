import { env } from "./env";
import { supabase } from "./supabase";

const BASE_URL = env.apiUrl;

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

async function authHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return {
    "Content-Type": "application/json",
    ...(session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;

  const json = await res.json();

  if (res.status === 401) {
    // Do NOT sign out here — supabase-js refreshes tokens on its own. Signing
    // out on every 401 cascades: one failed request wipes all auth state.
    throw new Error("Session expired");
  }

  if (!res.ok) throw new Error(json.error ?? json.message ?? "Request failed");

  return json.data as T;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

async function requestPaginated<T>(
  path: string,
): Promise<PaginatedResponse<T>> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}${path}`, { method: "GET", headers });

  if (res.status === 401) throw new Error("Session expired");

  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? json.message ?? "Request failed");

  return { data: json.data as T[], pagination: json.pagination };
}

// Fetch every page of a paginated endpoint and return one flat array. The
// backend caps `limit` at 100 (BaseController.getPagination), so callers that
// genuinely need "all rows" (e.g. the Sales Map — clustering handles the "too
// many pins" problem) have to loop rather than ask for one huge page. Mirrors
// the web app's accountsApi.listAll.
async function requestAll<T>(path: string): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  for (;;) {
    const sep = path.includes("?") ? "&" : "?";
    const res = await requestPaginated<T>(
      `${path}${sep}page=${page}&limit=100`,
    );
    all.push(...res.data);
    if (res.data.length === 0 || page >= res.pagination.totalPages) break;
    page++;
  }
  return all;
}

async function requestForm<T>(path: string, form: FormData): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const headers: Record<string, string> = session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: form,
  });
  return handleResponse<T>(res);
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  getPaginated: <T>(path: string) => requestPaginated<T>(path),
  getAll: <T>(path: string) => requestAll<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
  postForm: <T>(path: string, form: FormData) => requestForm<T>(path, form),
};
