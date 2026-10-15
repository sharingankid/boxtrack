// Percentages written by the coach ("5 × 3 à 80 % du 1RM") turned into kilos from a personal 1RM.
export const percentages = (text) => [...new Set([...(text || '').matchAll(/(\d{2,3})\s*%/g)].map((m) => Number(m[1])).filter((p) => p > 0 && p <= 120))]

export const loadFor = (oneRepMax, percent, step = 0.5) => Math.round((oneRepMax * percent) / 100 / step) * step

export const formatKg = (value) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(value)
