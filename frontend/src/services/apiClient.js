const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000/api'

const request = async (path, options = {}) => {
  const headers = { ...options.headers }
  if (options.body) headers['Content-Type'] = 'application/json'
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  } catch {
    throw new Error('Connexion indisponible. Vérifiez le réseau puis réessayez ; votre saisie est conservée.')
  }
  if (response.status === 204) return null
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const serverMessage = typeof payload.error === 'string' ? payload.error : payload.error?.message
    const error = new Error(response.status >= 500 ? 'Le serveur est indisponible. Réessayez dans un instant ; votre saisie est conservée.' : serverMessage || 'Le serveur ne répond pas correctement.')
    error.status = response.status
    error.code = payload.error?.code
    if (headers.Authorization && [401, 403].includes(response.status)) window.dispatchEvent(new CustomEvent('boxtrack:auth-error', { detail: response.status }))
    throw error
  }
  return payload
}

export const apiClient = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  logout: (token) => request('/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
  tvNow: () => request('/wods/tv-now'),
  today: () => request('/wods/today').then((data) => data.wods),
  history: () => request('/wods').then((data) => data.wods),
  detail: (id) => request(`/wods/${id}`).then((data) => data.wod),
  create: (session, token) => request('/admin/wods', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(session) }).then((data) => data.wod),
  remove: (id, token) => request(`/admin/wods/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
  update: (id, session, token) => request(`/admin/wods/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(session) }).then((data) => data.wod),
}
