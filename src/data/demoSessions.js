const isoDate = (offset = 0) => {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return date.toISOString().slice(0, 10)
}

export const demoSessions = [
  {
    id: 101,
    session_date: isoDate(),
    time_slot: '18:00',
    warmup: {
      general: '3 tours · 250 m rameur · 10 air squats · 8 scap pull-ups',
      specific: '2 tours progressifs · 8 front squats barre à vide · 6 burpees over bar',
    },
    skill_strength: {
      kind: 'strength',
      instructions: 'Monter en charge avec une exécution propre. Repos 2 min entre les séries.',
      movements: [{ movement_name: 'Front Squat', detail: '5 × 3 @ 80 %' }],
    },
    wod: {
      format: 'AMRAP',
      duration_or_target: '16 min',
      notes: 'Rester régulier dès le premier tour. Adapter la charge pour des séries non cassées.',
      movements: [
        { movement_name: 'Wall Ball', detail: '12 reps' },
        { movement_name: 'Toes-to-Bar', detail: '9 reps' },
        { movement_name: 'Burpee Box Jump', detail: '6 reps' },
      ],
    },
  },
  {
    id: 102,
    session_date: isoDate(),
    time_slot: '12:30',
    warmup: { general: '5 min bike easy · mobilité épaules et chevilles', specific: '3 tours · 5 deadlifts légers · 5 box step-ups' },
    skill_strength: null,
    wod: {
      format: 'FOR_TIME',
      duration_or_target: 'Cap 14 min',
      notes: 'Choisir une charge permettant des séries de cinq minimum.',
      movements: [
        { movement_name: 'Deadlift', detail: '21-15-9 · 70/50 kg' },
        { movement_name: 'Box Jump', detail: '21-15-9' },
      ],
    },
  },
  {
    id: 91,
    session_date: isoDate(-1),
    time_slot: '18:00',
    warmup: { general: '6 min cardio progressif', specific: 'Mobilité overhead · complexe barre à vide' },
    skill_strength: { kind: 'skill', instructions: 'Qualité avant quantité.', movements: [{ movement_name: 'Handstand', detail: '4 × 30 s' }] },
    wod: { format: 'EMOM', duration_or_target: '18 min', notes: 'Six tours.', movements: [
      { movement_name: 'Cal Row', detail: 'Min 1 · 12/10 cal' },
      { movement_name: 'Push Press', detail: 'Min 2 · 10 reps' },
      { movement_name: 'Rest', detail: 'Min 3' },
    ] },
  },
  {
    id: 82,
    session_date: isoDate(-3),
    time_slot: '07:00',
    warmup: { general: '400 m run · dynamic mobility', specific: 'Practice double-unders' },
    skill_strength: null,
    wod: { format: 'CHIPPER', duration_or_target: 'Cap 24 min', notes: 'Une seule traversée, gérer le volume.', movements: [
      { movement_name: 'Double-Under', detail: '100 reps' },
      { movement_name: 'Kettlebell Swing', detail: '50 reps' },
      { movement_name: 'Walking Lunge', detail: '40 reps' },
      { movement_name: 'Pull-Up', detail: '30 reps' },
    ] },
  },
]

export const cloneDemoSessions = () => structuredClone(demoSessions)
