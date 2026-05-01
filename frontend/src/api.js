const API = import.meta.env.VITE_API_URL;

console.log("API is : ", API);

export function getAccessToken() {
  return localStorage.getItem("access_token");
}

export function getRefreshToken() {
  return localStorage.getItem("refresh_token");
}

export function setTokens({ access_token, refresh_token }) {
  if (access_token) {
    localStorage.setItem("access_token", access_token);
  }

  if (refresh_token) {
    localStorage.setItem("refresh_token", refresh_token);
  }
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");

  // Optional old key cleanup from your previous setup
  localStorage.removeItem("token");
}

export function isLoggedIn() {
  return Boolean(getAccessToken() || getRefreshToken());
}

export async function login(username, password) {
  const res = await fetch(`${API}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }

  setTokens(data);

  return data;
}

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  const res = await fetch(`${API}/admin/refresh`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || data.msg || "Refresh failed");
  }

  setTokens({
    access_token: data.access_token,
  });

  return data.access_token;
}

function redirectToLogin() {
  clearTokens();

  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

async function authedFetch(url, options = {}, retry = true) {
  const accessToken = getAccessToken();

  const headers = {
    ...(options.headers || {}),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 401 && retry) {
    try {
      const newAccessToken = await refreshAccessToken();

      const retryHeaders = {
        ...(options.headers || {}),
        Authorization: `Bearer ${newAccessToken}`,
      };

      res = await fetch(url, {
        ...options,
        headers: retryHeaders,
      });
    } catch {
      redirectToLogin();
      throw new Error("Session expired. Please log in again.");
    }
  }

  return res;
}
export function getToken() {
  return getAccessToken();
}
export function logout() {
  clearTokens();
  window.location.href = "/login";
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
  console.log(res);
  if (!res.ok) throw new Error("Daily fetch failed");
  return res.json();
}


export async function searchVocab(query, direction = "de-en") {
  // direction: "de-en" = search german words, "en-de" = search english words
  const qs = new URLSearchParams({ q: query, direction });
  const res = await fetch(`${API}/vocab/search?${qs.toString()}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function vocabByLetter(letter) {
  const res = await fetch(`${API}/vocab/browse?letter=${encodeURIComponent(letter)}`);
  if (!res.ok) throw new Error("Browse failed");
  return res.json();
}

export async function vocabDetail(id) {
  const res = await fetch(`${API}/vocab/${id}`);
  if (!res.ok) throw new Error("Detail fetch failed");
  return res.json();
}

// stories api routes
export async function listStories() {
  const res = await fetch(`${API}/stories`);
  if (!res.ok) throw new Error("Stories fetch failed");
  return res.json();
}

export async function storyDetail(id) {
  const res = await fetch(`${API}/stories/${id}`);
  if (!res.ok) throw new Error("Story detail fetch failed");
  return res.json();
}

export async function adminListStories() {
  const res = await authedFetch(`${API}/admin/stories`);
  if (!res.ok) throw new Error("Admin stories list failed");
  return res.json();
}

export async function adminCreateStory(payload) {
  const res = await authedFetch(`${API}/admin/stories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : { error: await res.text() };

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return data;
}

export async function adminUpdateStory(id, payload) {
  const res = await authedFetch(`${API}/admin/stories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : { error: await res.text() };

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return data;
}

export async function adminDeleteStory(id) {
  const res = await authedFetch(`${API}/admin/stories/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Delete story failed");
  return res.json();
}

export async function adminStats() {
  const res = await authedFetch(`${API}/admin/stats`);
  if (!res.ok) throw new Error("Admin stats failed");
  return res.json();
}

export async function adminSearchVocab(query, limit = 20) {
  const qs = new URLSearchParams();

  if (query) qs.set("q", query);
  if (limit) qs.set("limit", String(limit));

  const res = await authedFetch(`${API}/admin/vocab/search?${qs.toString()}`);

  if (!res.ok) throw new Error("Admin vocab search failed");

  return res.json();
}