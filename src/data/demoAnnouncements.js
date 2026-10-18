export const demoAnnouncements = [
  { id: 1, title: 'Open Day samedi 14 novembre', body: 'Portes ouvertes toute la journée, amenez un ami pour une séance découverte gratuite.', active: true },
  { id: 2, title: 'Fermeture exceptionnelle le 1er novembre', body: 'La box sera fermée pour le jour férié. Reprise normale le lendemain.', active: true },
  { id: 3, title: 'Nouveau coach : Marine', body: 'Marine rejoint l’équipe de coachs à partir du mois prochain, spécialisée en haltérophilie.', active: true },
]

export const cloneDemoAnnouncements = () => structuredClone(demoAnnouncements)
