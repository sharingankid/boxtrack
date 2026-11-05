// Which pixel animation (lib/athletePoses.js) fits a movement name.
// Order matters: the first group with a matching word wins.
const GROUPS = [
  ['burpee', ['burpee']],
  ['pullup', ['pull-up', 'pull up', 'pullup', 'traction', 'chin', 'muscle', 'toes-to-bar', 'toes to bar', 'knees to elbow']],
  ['pushup', ['push-up', 'push up', 'pushup', 'pompe']],
  ['climber', ['mountain', 'climber']],
  ['wallball', ['wall ball', 'wallball']],
  ['thruster', ['thruster']],
  ['squat', ['squat', 'pistol', 'chaise', 'wall sit']],
  ['lunge', ['fente', 'lunge', 'step']],
  ['jack', ['jumping jack', 'jack']],
  ['jump', ['jump', 'box', 'double under', 'single under', 'saut', 'corde']],
  ['situp', ['sit-up', 'sit up', 'situp', 'crunch', 'abmat', 'v-up', 'abdo', 'glute', 'bridge']],
  ['deadbug', ['dead bug', 'hollow']],
  ['plank', ['plank', 'gainage', 'planche']],
  ['swing', ['swing', 'kettlebell']],
  ['hinge', ['deadlift', 'souleve', 'good morning']],
  ['press', ['press', 'developpe', 'hspu', 'handstand', 'jerk', 'snatch', 'clean', 'overhead', 'dumbbell', 'haltere', 'barre', 'curl', 'dip', 'arrache', 'epaule']],
  ['run', ['run', 'course', 'sprint', 'marche', 'high knee', 'rameur', 'row', 'bike', 'velo', 'ski']],
]

export function movementAnimation(name = '') {
  const clean = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
  return GROUPS.find(([, words]) => words.some((word) => clean.includes(word)))?.[0] || 'run'
}

// Same name, same athlete: a simple stable pick for the class ranking.
export function athleteIndexFor(name, count) {
  let hash = 0
  for (const char of name.toLowerCase()) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return hash % count
}
