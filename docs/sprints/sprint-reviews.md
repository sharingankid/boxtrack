# BoxTrack : Sprint Reviews

> Document reconstitué à partir de l'historique Git du dépôt (commits datés), puisque les revues n'ont pas été rédigées au fil de l'eau. Les périodes correspondent à l'activité réelle ; elles ne coïncident pas exactement avec les semaines du plan initial (voir `docs/02-project-charter.md`).

## Sprint 1 : Cadrage et documentation (du 10 au 29 septembre)

**Objectif** : cadrer le MVP, choisir le périmètre et poser l'architecture.

**Livré**
- Idea development : équipe, rôles, parties prenantes, brainstorming, décision MVP (`docs/01-idea-development.md`, 10/09).
- Project charter : plan haut niveau, jalons, 6 sprints (`docs/02-project-charter.md`, 14/09).
- Documentation technique : architecture, modèle de données, API, SCM/QA (`docs/03-technical-documentation.md`, 15/09).
- Alignement des documents sur le cahier des charges officiel v1.0 (28/09) ; rapport Stage 1 complété (29/09).

**Démo / preuve** : documents dans `docs/`.
**Non terminé / reporté** : implémentation (démarre au sprint suivant).

## Sprint 2 : Core V1 : API et front-end (du 5 au 8 octobre)

**Objectif** : une première boucle de bout en bout : un coach se connecte, crée une séance, elle est lisible publiquement.

**Livré**
- Back-end : authentification et CRUD des séances (`feat(backend): scaffold Core V1 API`, 05/10).
- Tests d'intégration (login, routes protégées, validation, persistance) : ils ont fait apparaître un vrai bug sur `session_date`, corrigé (05/10).
- Front-end : expérience séance de base, vue publique du WOD, thèmes clair/sombre, configuration Vite (05 et 06/10).
- Collection Postman (05/10).
- Ajout d'une section « Recettes » validée par le commanditaire (back 05/10, front 08/10) : retirée plus tard (voir sprint 3).

**Démo / preuve** : branches `kevin` et `panaki`, tests d'intégration.
**Non terminé** : intégration front ↔ API (faite au sprint suivant).

## Sprint 3 : Revue enseignant, optionnel et vue TV (du 12 au 15 octobre)

**Objectif** : corriger les retours de la revue, brancher le front sur l'API, ouvrir l'optionnel.

**Livré**
- Corrections issues de la revue enseignant (12/10) : « aujourd'hui » calculé en heure de Paris (et non UTC), validation des entrées (400 au lieu de 500), CORS restreint, limitation de débit sur le login.
- Séances en rendu optionnel pour échauffement/skill ; session admin persistante (12/10).
- Les 4 fonctionnalités optionnelles du cahier des charges côté API : athlètes, scores/leaderboard, annonces, QR codes (13/10).
- Horaires réels, endpoint pour la vue TV, rôles ; suppression de la section Recettes (13/10).
- Intégration du front avec l'API Core (13/10) ; espace coach et tableau TV (15/10).
- Durcissement : validation, authentification, classement du leaderboard ; scripts de gestion de comptes et préparation production (15/10).
- Synchronisation de la doc technique avec le schéma et les routes réels (15/10).

**Démo / preuve** : vue `/screen`, API documentée dans `backend/API_CONTRACT.md`.
**Non terminé** : tests de l'optionnel, CI (sprint suivant).

## Sprint 4 : Qualité, CI et finitions (du 18 au 27 octobre)

**Objectif** : fiabiliser, prouver la qualité, soigner la démo.

**Livré**
- CI GitHub Actions : lint, format, tests unitaires et d'intégration (18/10).
- Suite Postman avec assertions, preuves de tests (`docs/testing/`), contrat d'API à jour (18/10) : 56/56 tests unitaires, 58/58 d'intégration, 60/60 assertions Postman.
- Tests de l'optionnel et des nouvelles règles de validation, Prettier sur tout le back-end (15/10).
- Diagrammes d'architecture et de base de données dans le README (18/10).
- Vue TV : horloge, animations, coureur pixel (22/10) ; générateur de séances, semaine de démo, aperçu TV en direct, onglet « séances à venir » sur mobile (27/10).

**Démo / preuve** : `docs/testing/`, Actions GitHub, vue `/screen`.
**Non terminé / à faire** : déploiement en production (Supabase + Vercel), revue technique avec le SWE.
