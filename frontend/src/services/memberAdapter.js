import { apiClient } from './apiClient.js'
import { createSessionAdapter } from './sessionAdapter.js'
import { parisNow } from '../lib/schedule.js'
import { CATEGORIES, formatResult, isTimeBased, parseResult, rankScores } from '../lib/scoring.js'

export const AVATARS = ['manA', 'manB', 'womanA', 'womanB']
const DAY_MS = 86400000
const fail = (message, status) => Object.assign(new Error(message), { status })

// French messages for what the API can refuse (it answers in English).
const friendly = (messages) => (err) => {
  throw fail(messages[err.status] || err.message, err.status)
}

function apiAdapter() {
  const member = apiClient.member
  return {
    register: (data) =>
      member.register(data).catch(
        friendly({
          409: 'Un compte existe déjà avec cet email. Connecte-toi plutôt.',
          400: 'Vérifie tes infos : prénom, nom, email valide et mot de passe de 8 caractères minimum.',
          429: 'Trop de tentatives. Réessaie dans quelques minutes.',
        }),
      ),
    login: (credentials) =>
      member.login(credentials).catch(
        friendly({
          401: 'Email ou mot de passe incorrect.',
          400: 'Indique ton email et ton mot de passe.',
          429: 'Trop de tentatives. Réessaie dans quelques minutes.',
        }),
      ),
    logout: (token) => member.logout(token),
    me: (token) => member.me(token),
    scores: (token) => member.scores(token),
    submitScore: (score, token) =>
      member.submitScore(score, token).catch(
        friendly({
          400: 'Score refusé : vérifie ton résultat (et que la séance a bien eu lieu).',
          404: 'Cette séance n’existe plus.',
        }),
      ),
    leaderboard: (wodId) => apiClient.leaderboard(wodId),
  }
}

// ---- Demo mode: everything in this browser -------------------------------
const ACCOUNTS = 'boxtrack.demo.members.v1'
const SCORES = 'boxtrack.demo.memberScores.v1'
// Classmates of the demo box, so the leaderboard always has someone to beat.
const CLASSMATES = [
  ['Léa', 'Martin', 'RX'],
  ['Tom', 'Bernard', 'RX'],
  ['Inès', 'Petit', 'Scaled'],
  ['Max', 'Durand', 'RX'],
  ['Chloé', 'Moreau', 'Scaled'],
  ['Hugo', 'Laurent', 'Modified'],
  ['Sarah', 'Simon', 'RX'],
  ['Yanis', 'Michel', 'Scaled'],
]
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const readList = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key))
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}
const writeList = (key, value) => localStorage.setItem(key, JSON.stringify(value))
// Demo only, yet a typed password is never stored as such, even locally.
const demoHash = (text) => {
  let hash = 2166136261
  for (const char of text) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
  return (hash >>> 0).toString(16)
}
const publicMember = ({ id, first_name, last_name, email, avatar }) => ({
  id,
  first_name,
  last_name,
  email,
  avatar,
})

// A plausible, stable classmate result for a WOD.
function classmateResult(format, wodId, index) {
  const seed = (((Number(wodId) % 9973) * 7919 + index * 104729) % 1000) / 1000
  if (isTimeBased(format)) return { result_value: Math.round(540 + seed * 600), extra_reps: null }
  if (format === 'AMRAP')
    return { result_value: 4 + Math.floor(seed * 6), extra_reps: Math.floor(seed * 997) % 20 }
  if (format === 'STRENGTH')
    return { result_value: 40 + Math.round((seed * 80) / 2.5) * 2.5, extra_reps: null }
  return { result_value: 40 + Math.round(seed * 80), extra_reps: null }
}

function demoAdapter() {
  const sessions = createSessionAdapter('demo')
  const today = () => parisNow().date
  const accountOf = (token) => {
    const account = readList(ACCOUNTS).find((item) => `demo-${item.id}` === token)
    if (!account) throw fail('Session expirée. Reconnecte-toi.', 401)
    return account
  }
  const open = (account) => ({
    token: `demo-${account.id}`,
    member: publicMember(account),
    expires_at: new Date(Date.now() + 7 * DAY_MS).toISOString(),
  })
  const findWod = async (wodId) => {
    const session = await sessions.detail(wodId)
    if (!session) throw fail('Cette séance n’existe plus.', 404)
    if (!session.wod) throw fail('Cette séance n’a pas de WOD à scorer.', 400)
    return session
  }

  async function leaderboard(wodId) {
    const session = await findWod(wodId)
    const { format } = session.wod
    const classmates =
      session.session_date <= today()
        ? CLASSMATES.map(([first_name, last_name, category], index) => ({
            athlete: { id: -(index + 1), first_name, last_name },
            avatar: AVATARS[index % AVATARS.length],
            category,
            ...classmateResult(format, wodId, index),
          }))
        : []
    const accounts = readList(ACCOUNTS)
    const own = readList(SCORES)
      .filter((score) => String(score.wod_id) === String(wodId))
      .map((score) => {
        const account = accounts.find((item) => item.id === score.athlete_id)
        return account && {
          athlete: { id: account.id, first_name: account.first_name, last_name: account.last_name },
          avatar: account.avatar,
          category: score.category,
          result_value: score.result_value,
          extra_reps: score.extra_reps,
        }
      })
      .filter(Boolean)
    const all = [...classmates, ...own]
    return {
      wod_id: Number(wodId),
      format,
      rankings: Object.fromEntries(
        CATEGORIES.map((category) => [
          category,
          rankScores(all.filter((score) => score.category === category), format),
        ]),
      ),
    }
  }

  return {
    async register(data) {
      const first = data.first_name?.trim()
      const last = data.last_name?.trim()
      const email = data.email?.trim().toLowerCase() || ''
      if (!first || !last || !EMAIL_RE.test(email) || (data.password || '').length < 8)
        throw fail(
          'Vérifie tes infos : prénom, nom, email valide et mot de passe de 8 caractères minimum.',
          400,
        )
      const accounts = readList(ACCOUNTS)
      if (accounts.some((item) => item.email === email))
        throw fail('Un compte existe déjà avec cet email. Connecte-toi plutôt.', 409)
      const account = {
        id: Date.now(),
        first_name: first,
        last_name: last,
        email,
        avatar: AVATARS.includes(data.avatar) ? data.avatar : 'manA',
        password: demoHash(data.password),
      }
      writeList(ACCOUNTS, [...accounts, account])
      return open(account)
    },
    async login({ email = '', password = '' }) {
      const account = readList(ACCOUNTS).find(
        (item) => item.email === email.trim().toLowerCase(),
      )
      if (!account || account.password !== demoHash(password))
        throw fail('Email ou mot de passe incorrect.', 401)
      return open(account)
    },
    async logout() {},
    async me(token) {
      return { member: publicMember(accountOf(token)) }
    },
    async scores(token) {
      const account = accountOf(token)
      const mine = readList(SCORES).filter((score) => score.athlete_id === account.id)
      const rows = []
      for (const score of mine) {
        const session = await sessions.detail(score.wod_id)
        if (!session?.wod) continue
        const ranking = (await leaderboard(score.wod_id)).rankings[score.category]
        rows.push({
          id: `${score.wod_id}-${account.id}`,
          wod_id: score.wod_id,
          session_date: session.session_date,
          start_time: session.start_time,
          title: session.title || null,
          format: session.wod.format,
          category: score.category,
          result_value: score.result_value,
          extra_reps: score.extra_reps,
          result_display: formatResult(session.wod.format, score.result_value, score.extra_reps),
          rank: ranking.find((entry) => entry.athlete.id === account.id)?.rank ?? null,
          participants: ranking.length,
        })
      }
      return rows.sort((a, b) =>
        `${b.session_date} ${b.start_time}`.localeCompare(`${a.session_date} ${a.start_time}`),
      )
    },
    async submitScore(data, token) {
      const account = accountOf(token)
      const session = await findWod(data.wod_id)
      if (session.session_date > today())
        throw fail('Cette séance n’a pas encore eu lieu.', 400)
      if (!CATEGORIES.includes(data.category)) throw fail('Choisis RX, Scaled ou Modified.', 400)
      const result = parseResult(session.wod.format, data)
      writeList(SCORES, [
        ...readList(SCORES).filter(
          (score) =>
            !(String(score.wod_id) === String(data.wod_id) && score.athlete_id === account.id),
        ),
        { wod_id: data.wod_id, athlete_id: account.id, category: data.category, ...result },
      ])
      const board = await leaderboard(data.wod_id)
      return {
        score: board.rankings[data.category].find((entry) => entry.athlete.id === account.id),
        leaderboard: board,
      }
    },
    leaderboard,
  }
}

export function createMemberAdapter(mode) {
  return mode === 'api' ? apiAdapter() : demoAdapter()
}
