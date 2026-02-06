const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const toApiUrl = (path) => {
  if (!API_BASE) return path;
  return `${API_BASE}${path}`;
};

const parseBody = async (res) => {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  const text = await res.text();
  return text ? { message: text } : {};
};

export const apiFetch = async (path, options = {}) => {
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  const res = await fetch(toApiUrl(path), {
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await parseBody(res);

  if (!res.ok) {
    const message = data?.message || data?.error || "Request failed";
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
};

export const withBuildingId = (path, buildingId) => {
  if (!buildingId) return path;
  const joiner = path.includes("?") ? "&" : "?";
  return `${path}${joiner}buildingId=${encodeURIComponent(buildingId)}`;
};

export const withBuildingIdBody = (body, buildingId) => {
  if (!buildingId) return body;
  return { ...body, buildingId };
};

export const adminApi = {
  listUsers: (buildingId, role) =>
    apiFetch(
      withBuildingId(
        `/api/admin/users${role ? `?role=${role}` : ""}`,
        buildingId
      )
    ),
  createAdmin: (buildingId, payload) =>
    apiFetch("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(withBuildingIdBody(payload, buildingId)),
    }),
  updateUser: (buildingId, id, payload) =>
    apiFetch(withBuildingId(`/api/admin/users/${id}`, buildingId), {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteUser: (buildingId, id) =>
    apiFetch(withBuildingId(`/api/admin/users/${id}`, buildingId), {
      method: "DELETE",
    }),
  deleteCommunityMessage: (buildingId, id) =>
    apiFetch(withBuildingId(`/api/admin/community/messages/${id}`, buildingId), {
      method: "DELETE",
    }),
  deleteThreadMessage: (buildingId, threadId, id) =>
    apiFetch(
      withBuildingId(`/api/admin/threads/${threadId}/messages/${id}`, buildingId),
      {
        method: "DELETE",
      }
    ),
};

export const adminExportUrl = (path, buildingId, format = "pdf") => {
  const joiner = path.includes("?") ? "&" : "?";
  const url = `${path}${joiner}buildingId=${encodeURIComponent(
    buildingId || ""
  )}&format=${encodeURIComponent(format)}`;
  return toApiUrl(url);
};

export const serviceAgentApi = {
  list: (buildingId, params = {}) => {
    const search = new URLSearchParams(params).toString();
    const path = `/api/service-agents${search ? `?${search}` : ""}`;
    return apiFetch(withBuildingId(path, buildingId));
  },
  create: (buildingId, payload) =>
    apiFetch("/api/service-agents", {
      method: "POST",
      body: JSON.stringify(withBuildingIdBody(payload, buildingId)),
    }),
  update: (buildingId, id, payload) =>
    apiFetch(withBuildingId(`/api/service-agents/${id}`, buildingId), {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  remove: (buildingId, id) =>
    apiFetch(withBuildingId(`/api/service-agents/${id}`, buildingId), {
      method: "DELETE",
    }),
};

export const authApi = {
  login: (payload) =>
    apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  logout: () =>
    apiFetch("/api/auth/logout", {
      method: "POST",
    }),
  me: () => apiFetch("/api/auth/me"),
  register: (payload) =>
    apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
