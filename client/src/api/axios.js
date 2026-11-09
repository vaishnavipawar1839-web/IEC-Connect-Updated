import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  withCredentials: true, // ensures cookies (refresh token) are sent on every request,
  // including retried ones — axios inherits this from the instance
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const REFRESH_URL = "/users/refresh-token";

/**
 * Wipes local auth state and hard-redirects to login.
 * Preserves the current path so the user lands back where they were
 * after re-authenticating.
 */
function clearAuthAndRedirect() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("userRole");

  const currentPath = window.location.pathname + window.location.search;
  window.location.replace(
    `/login?redirect=${encodeURIComponent(currentPath)}`
  );
}

// ─── Request interceptor ──────────────────────────────────────────────────────
// Attaches the stored JWT to every outgoing request.
// Does NOT mutate api.defaults — that would affect all future requests even
// after logout, and could bleed into unrelated axios instances.

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Token-refresh queue ──────────────────────────────────────────────────────
// If multiple requests fail with 401 simultaneously, only ONE refresh call is
// made. All other failing requests are held in failedQueue and retried once the
// new token arrives (or rejected together if the refresh itself fails).

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
}

// ─── Response interceptor ────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // ── Guard: if the refresh endpoint itself returns any auth error,
    //    bail out immediately — retrying would loop forever.
    if (originalRequest?.url?.includes(REFRESH_URL)) {
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    // ── 401: access token is missing or expired ───────────────────────────────
    if (status === 401 && !originalRequest._retry) {

      // If a refresh is already in flight, queue this request instead of
      // firing a second refresh call.
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        });
        // If processQueue is eventually called with an error, the Promise
        // rejects and propagates to the original caller's .catch().
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // The refresh token lives in an HttpOnly cookie.
        // withCredentials (set on the instance) sends it automatically.
        const res = await api.post(REFRESH_URL);
        const newToken = res.data.accessToken;

        // Persist so the request interceptor picks it up on future calls.
        localStorage.setItem("token", newToken);

        // Unblock all queued requests.
        processQueue(null, newToken);

        // Retry the request that originally triggered this refresh.
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token is expired or revoked — session is unrecoverable.
        processQueue(refreshError, null);
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── Everything else passes through unchanged ──────────────────────────────
    return Promise.reject(error);
  }
);

export default api;