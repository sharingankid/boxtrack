export const demoAthletes = [
  { id: 1, first_name: 'Léa', last_name: 'Bernard', photo_url: null, active: true },
  { id: 2, first_name: 'Thomas', last_name: 'Nguyen', photo_url: null, active: true },
  { id: 3, first_name: 'Camille', last_name: 'Petit', photo_url: null, active: true },
  { id: 4, first_name: 'Hugo', last_name: 'Moreau', photo_url: null, active: true },
  { id: 5, first_name: 'Inès', last_name: 'Roux', photo_url: null, active: false },
]

export const cloneDemoAthletes = () => structuredClone(demoAthletes)
