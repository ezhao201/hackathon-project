const TOKEN_KEY = 'kemm_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getToken();
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text };
  }

  if (!res.ok) {
    if (res.status === 401 && token) {
      setToken(null);
      window.dispatchEvent(new Event('kemm:unauthorized'));
    }
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status, data);
  }
  return data;
}

export const api = {
  auth: {
    register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
    login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
    me: () => request('/auth/me'),
  },
  user: {
    profile: () => request('/user/profile'),
    updateProfile: (payload) => request('/user/profile', { method: 'PUT', body: payload }),
    savings: () => request('/user/savings'),
  },
  discounts: {
    feed: ({ category = 'All', sort = 'newest', includeExpired = false } = {}) =>
      request(`/discounts/feed?category=${encodeURIComponent(category)}&sort=${sort}&includeExpired=${includeExpired}`),
    search: (q) => request(`/discounts/search?q=${encodeURIComponent(q)}`),
    alerts: () => request('/discounts/alerts'),
    matchCount: (eligibility) => request('/discounts/match-count', { method: 'POST', body: { eligibility } }),
    claim: (id) => request(`/discounts/${id}/claim`, { method: 'POST' }),
  },
};
