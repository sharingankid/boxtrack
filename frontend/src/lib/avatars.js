import { ATHLETES } from '../data/athletes.js'
import { athleteIndexFor } from './movementAnimation.js'

export const athleteById = (id) => ATHLETES.find((athlete) => athlete.id === id) || ATHLETES[0]

// The pixel athlete of a leaderboard entry: the member's own pick, the one
// stored with the entry (demo), otherwise a stable one from the name.
export function athleteForEntry(entry, member) {
  if (member && entry.athlete.id === member.id) return athleteById(member.avatar)
  if (entry.avatar) return athleteById(entry.avatar)
  const name = `${entry.athlete.first_name} ${entry.athlete.last_name}`
  return ATHLETES[athleteIndexFor(name, ATHLETES.length)]
}
