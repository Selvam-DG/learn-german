const API = "/api";

export function getToken() {
  return localStorage.getItem("token");
}

export async function login(username, password) {
  const res = await fetch(`${API}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

async function authedFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };
  return fetch(url, { ...options, headers });
}

export async function adminList(pos) {
  const qs = pos ? `?pos=${encodeURIComponent(pos)}` : "";
  const res = await authedFetch(`${API}/admin/vocab${qs}`);
  if (!res.ok) throw new Error("Admin list failed");
  return res.json();
}

export async function adminCreate(payload) {
  const res = await authedFetch(`${API}/admin/vocab`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
   // Read body ONCE
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : { error: await res.text() };

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return data;
}

export async function adminUpdate(id, payload) {
  const res = await authedFetch(`${API}/admin/vocab/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function adminDelete(id) {
  const res = await authedFetch(`${API}/admin/vocab/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
  return res.json();
}

export async function learnRandom({ pos, limit }) {
  const qs = new URLSearchParams();
  if (pos) qs.set("pos", pos);
  if (limit) qs.set("limit", String(limit));
  const res = await fetch(`${API}/vocab?${qs.toString()}`);
  if (!res.ok) throw new Error("Learn fetch failed");
  return res.json();
}

export async function learnDaily({ pos, n }) {
  const qs = new URLSearchParams();
  if (pos) qs.set("pos", pos);
  if (n) qs.set("n", String(n));
  const res = await fetch(`${API}/vocab/daily?${qs.toString()}`);
  if (!res.ok) throw new Error("Daily fetch failed");
  return res.json();
}