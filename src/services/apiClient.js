const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  if (response.status === 204) return null
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(payload.error?.message || 'Le serveur ne répond pas correctement.')
    error.code = payload.error?.code
    throw error
  }
  return payload
}

export const apiClient = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  logout: (token) => request('/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
  today: () => request('/wods/today').then((data) => data.wods),
  history: () => request('/wods').then((data) => data.wods),
  detail: (id) => request(`/wods/${id}`).then((data) => data.wod),
  create: (session, token) => request('/admin/wods', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(session) }).then((data) => data.wod),
  update: (id, session, token) => request(`/admin/wods/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(session) }).then((data) => data.wod),
}
