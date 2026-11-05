const pad = (value) => String(value).padStart(2, '0')

// 754300 ms -> "12:34.3"; hours appear only past 60 minutes.
export function formatElapsed(ms) {
  const tenths = Math.max(0, Math.floor(ms / 100))
  const seconds = Math.floor(tenths / 10)
  const hours = Math.floor(seconds / 3600)
  const clock = `${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}`
  return `${hours ? `${hours}:` : ''}${clock}.${tenths % 10}`
}

// Fastest first; equal times share a rank, like the API leaderboard.
export function rankFinishers(finishers) {
  const sorted = [...finishers].sort((a, b) => a.time - b.time)
  return sorted.map((finisher) => ({
    ...finisher,
    rank: sorted.findIndex((other) => other.time === finisher.time) + 1,
    gap: finisher.time - sorted[0].time,
  }))
}

export function addFinisher(finishers, name, time) {
  const clean = name.trim().replace(/\s+/g, ' ')
  if (!clean) return { error: 'Indiquez un prénom.' }
  if (
    finishers.some(
      (item) => item.name.toLocaleLowerCase('fr') === clean.toLocaleLowerCase('fr'),
    )
  )
    return { error: `${clean} est déjà dans le classement.` }
  return { finishers: [...finishers, { id: Date.now(), name: clean, time }] }
}
