const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const request = async (path, options = {}) => {
  const headers = { ...options.headers }
  if (options.body) headers['Content-Type'] = 'application/json'
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })
  if (response.status === 204) return null
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const serverMessage = typeof payload.error === 'string' ? payload.error : payload.error?.message
    const error = new Error(serverMessage || 'Le serveur ne répond pas correctement.')
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

  listRecipes: () => request('/recipes').then((data) => data.recipes),
  recipeDetail: (id) => request(`/recipes/${id}`).then((data) => data.recipe),
  searchRecipes: (query, token) => request(`/admin/recipes/search?query=${encodeURIComponent(query)}`, { headers: { Authorization: `Bearer ${token}` } }).then((data) => data.results),
  createRecipe: (recipe, token) => request('/admin/recipes', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(recipe) }).then((data) => data.recipe),
  importRecipe: (result, token) => request('/admin/recipes/import', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(result) }).then((data) => data.recipe),
  removeRecipe: (id, token) => request(`/admin/recipes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),

  listAthletes: (token, { active } = {}) => request(`/admin/athletes${active === undefined ? '' : `?active=${active}`}`, { headers: { Authorization: `Bearer ${token}` } }).then((data) => data.athletes),
  createAthlete: (athlete, token) => request('/admin/athletes', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(athlete) }).then((data) => data.athlete),
  updateAthlete: (id, athlete, token) => request(`/admin/athletes/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(athlete) }).then((data) => data.athlete),

  leaderboard: (wodId) => request(`/wods/${wodId}/leaderboard`),
  recordScore: (wodId, score, token) => request(`/admin/wods/${wodId}/scores`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(score) }).then((data) => data.score),
  removeScore: (id, token) => request(`/admin/scores/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),

  listAnnouncements: () => request('/announcements').then((data) => data.announcements),
  listAllAnnouncements: (token) => request('/admin/announcements', { headers: { Authorization: `Bearer ${token}` } }).then((data) => data.announcements),
  createAnnouncement: (announcement, token) => request('/admin/announcements', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(announcement) }).then((data) => data.announcement),
  updateAnnouncement: (id, announcement, token) => request(`/admin/announcements/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(announcement) }).then((data) => data.announcement),
  removeAnnouncement: (id, token) => request(`/admin/announcements/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),

  listQrCodes: () => request('/qrcodes').then((data) => data.qr_codes),
  createQrCode: (qrCode, token) => request('/admin/qrcodes', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(qrCode) }).then((data) => data.qr_code),
  removeQrCode: (id, token) => request(`/admin/qrcodes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
}
