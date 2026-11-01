# BoxTrack : Suivi des bugs

| ID | Date | Composant | Problème | Gravité | Statut | Correctif |
|---|---|---|---|---|---|---|
| BUG-01 | 05/10 | Back-end | Une date ne pouvait contenir qu'une séance, alors que la salle en programme plusieurs par jour | Haute | Corrigé | `8a140f8` : unicité sur (date, créneau) |
| BUG-02 | 05/10 | Back-end | Bug sur `session_date` découvert par les tests d'intégration | Haute | Corrigé | `98307b5` |
| BUG-03 | 06/10 | Front-end | Parcours de création/édition de séance instables | Moyenne | Corrigé | `59f4dd7` |
| BUG-04 | 06/10 | Front-end | `vite.config.js` absent : le plugin React n'était pas branché, build impossible | Haute | Corrigé | `30eb78a` |
| BUG-05 | 12/10 | Back-end | « Aujourd'hui » calculé en UTC : la séance de la veille pouvait s'afficher une partie de la nuit | Moyenne | Corrigé | `7117a47` : fuseau Europe/Paris |
| BUG-06 | 12/10 | Back-end | Erreurs Postgres prévisibles (NOT NULL, date invalide) renvoyaient une 500 | Moyenne | Corrigé | `7117a47` : validation, 400 propre |
| BUG-07 | 12/10 | Sécurité | CORS ouvert ; login sans limitation de tentatives | Haute | Corrigé | `7117a47` : CORS restreint, rate limit 10/15 min |
| BUG-08 | 13/10 | Front-end | Parcours échauffement (warm-up) défaillant après intégration API | Moyenne | Corrigé | `088fe0b` |
| BUG-09 | 15/10 | Back-end | Validation, authentification et classement du leaderboard à renforcer | Haute | Corrigé | `04c6366` |
| BUG-10 | 18/10 | Back-end | Message d'erreur de date d'historique nommait un mauvais paramètre | Faible | Corrigé | `63f1bb0` |

## Ouvert / à surveiller
- Environnement de production non déployé (dépend de l'hébergement fourni par le commanditaire).
- Limitation de débit en mémoire : peu fiable si l'API tourne en fonctions serverless (acceptable pour la démo).
- Ajoute ici tout bug que vous trouvez pendant la préparation du Demoday : ID, date, description, statut.

## Comment suivre les bugs ensuite
Ouvre les problèmes dans l'onglet *Issues* de GitHub avec les étiquettes `bug`, `front`, `back`, puis référence-les dans les commits (`fix: ... (#12)`).
