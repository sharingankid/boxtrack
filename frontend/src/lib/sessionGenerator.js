import { minutes } from './schedule.js'

export const GENERATOR_EQUIPMENT = [
  ['dumbbells', 'Haltères'],
  ['kettlebell', 'Kettlebell'],
  ['barbell', 'Barre et disques'],
  ['rower', 'Rameur'],
  ['bike', 'Vélo'],
]
const MOVEMENTS = [
  ['Air Squat', 'squat', '', 0, 12],
  ['Fente arrière alternée', 'squat', '', 0, 10],
  ['Glute Bridge', 'hinge', '', 0, 12],
  ['Pompe inclinée', 'push', '', 0, 8],
  ['Push-Up', 'push', '', 1, 10],
  ['Dead Bug', 'core', '', 0, 10],
  ['Mountain Climber', 'cardio', '', 0, 20],
  ['Marche dynamique sur place', 'cardio', '', 0, 30],
  ['Burpee', 'cardio', '', 1, 8],
  ['Goblet Squat', 'squat', 'kettlebell', 0, 10],
  ['Kettlebell Deadlift', 'hinge', 'kettlebell', 0, 12],
  ['Kettlebell Swing', 'hinge', 'kettlebell', 1, 12],
  ['Dumbbell Front Squat', 'squat', 'dumbbells', 0, 10],
  ['Dumbbell Row', 'pull', 'dumbbells', 0, 10],
  ['Dumbbell Push Press', 'push', 'dumbbells', 1, 8],
  ['Dumbbell Deadlift', 'hinge', 'dumbbells', 0, 12],
  ['Front Squat', 'squat', 'barbell', 1, 8],
  ['Deadlift', 'hinge', 'barbell', 1, 8],
  ['Push Press', 'push', 'barbell', 1, 8],
  ['Row', 'cardio', 'rower', 0, 10],
  ['Bike', 'cardio', 'bike', 0, 10],
].map(([name, category, equipment, level, reps]) => ({
  name,
  category,
  equipment,
  level,
  reps,
}))
const normalize = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
const movement = (item, level, overrides = {}) => ({
  movement_name: item.name,
  sets: '',
  reps: String(Math.max(4, Math.round(item.reps * [0.7, 1, 1.2][level]))),
  load:
    item.equipment && !['rower', 'bike'].includes(item.equipment)
      ? 'Charge adaptée par le coach'
      : '',
  instructions: ['rower', 'bike'].includes(item.equipment)
    ? 'Calories'
    : item.name === 'Marche dynamique sur place'
      ? 'Pas alternés'
      : '',
  detail: '',
  ...overrides,
})

export function generateSession(options, random = Math.random) {
  const {
    goal = 'mixed',
    level = 'beginner',
    duration = 60,
    format = 'AMRAP',
    equipment = [],
    exclude = '',
    startTime = '18:00',
  } = options
  const rank = { beginner: 0, intermediate: 1, advanced: 2 }[level]
  const start = minutes(startTime)
  if (
    rank === undefined ||
    !['mixed', 'strength', 'cardio'].includes(goal) ||
    !['AMRAP', 'EMOM', 'FOR_TIME'].includes(format) ||
    ![30, 45, 60, 75].includes(Number(duration))
  )
    throw new Error('Choisissez les critères proposés pour générer la séance.')
  if (start === null || start + Number(duration) >= 1440)
    throw new Error(
      'Choisissez une heure de début permettant de terminer avant minuit.',
    )
  const excluded = exclude
    .split(/[,;\n]/)
    .map(normalize)
    .filter(Boolean)
  const pool = MOVEMENTS.filter(
    (item) =>
      item.level <= rank &&
      (!item.equipment || equipment.includes(item.equipment)) &&
      !excluded.some((term) => normalize(item.name).includes(term)),
  )
  const pick = (items) =>
    items[Math.min(items.length - 1, Math.floor(random() * items.length))]
  const categories =
    goal === 'strength'
      ? ['hinge', 'push', 'squat', 'pull', 'core', 'cardio']
      : goal === 'cardio'
        ? ['cardio', 'core', 'squat', 'push', 'hinge', 'pull']
        : ['squat', 'push', 'cardio', 'pull', 'hinge', 'core']
  const chosen = []
  for (const category of categories) {
    const candidates = pool.filter((item) => item.category === category)
    if (candidates.length) chosen.push(pick(candidates))
    if (chosen.length === 3) break
  }
  if (chosen.length < 3)
    throw new Error(
      'Pas assez de familles de mouvements disponibles. Réduisez les exclusions ou ajoutez du matériel.',
    )
  const total = Number(duration)
  const warmup = total === 30 ? 6 : 8
  const skill = total === 30 ? 8 : total === 45 ? 10 : 16
  const budget = total - warmup - skill - 8 // Four minutes of transitions and at least four of cooldown.
  const wod = format === 'EMOM' ? Math.floor(budget / 4) * 4 : budget
  const cooldown = total - warmup - skill - wod - 4
  const focus =
    goal === 'strength'
      ? chosen[0]
      : chosen.find((item) => item.category !== 'cardio')
  const end = start + total
  const title = {
    mixed: 'Force & conditionnement',
    strength: 'Force & contrôle',
    cardio: 'Endurance & régularité',
  }[goal]
  const pacing =
    rank === 0
      ? 'Privilégier une exécution contrôlée. Réduire les répétitions si la technique se dégrade.'
      : 'Garder une allure régulière et une exécution propre sur tous les tours.'
  return {
    title,
    end_time: `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`,
    warmup: {
      general: `${warmup} min au total : moitié mobilité douce des chevilles, hanches et épaules ; moitié préparation spécifique ci-dessous.`,
      specific: `2 tours à faible intensité : ${chosen.map((item) => `5 ${item.name}${['rower', 'bike'].includes(item.equipment) ? ' (calories faciles)' : ''}`).join(' · ')}. Sans charge ou avec une charge légère pour les mouvements lestés.`,
    },
    skill_strength: {
      kind: goal === 'strength' ? 'strength' : 'skill',
      instructions: `${skill} min, repos inclus. ${goal === 'strength' ? 'Descente contrôlée sur 3 secondes ; charge fixée par le coach.' : 'Répéter le geste à faible intensité et travailler les positions.'} Repos de 60 à 90 s entre les séries.`,
      movements: [
        movement(focus, rank, {
          sets: '3',
          reps: goal === 'strength' ? '6' : '5',
        }),
      ],
    },
    wod: {
      format,
      duration_or_target:
        format === 'FOR_TIME' ? `3 tours · time cap ${wod} min` : `${wod} min`,
      movements: chosen.map((item, index) =>
        movement(item, rank, {
          instructions: [
            format === 'EMOM'
              ? `Minute ${index + 1} de chaque cycle de 4 min`
              : '',
            ['rower', 'bike'].includes(item.equipment) ? 'Calories' : '',
            item.name === 'Marche dynamique sur place' ? 'Pas alternés' : '',
          ]
            .filter(Boolean)
            .join(' · '),
        }),
      ),
      notes: `${pacing} ${format === 'EMOM' ? 'Minute 4 : repos. Terminer le travail en 40 s maximum et récupérer le reste de la minute.' : format === 'FOR_TIME' ? 'Arrêter au time cap même si les 3 tours ne sont pas terminés.' : 'Enchaîner les 3 mouvements pour un maximum de tours dans le temps imparti.'}\nOrganisation des ${total} min : ${warmup} min échauffement · ${skill} min ${goal === 'strength' ? 'force' : 'technique'} · 4 min transitions · ${wod} min WOD · ${cooldown} min retour au calme.`,
    },
  }
}
