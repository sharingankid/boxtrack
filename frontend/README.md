# BoxTrack — interfaces coach et TV

Une seule application React/Vite dans `frontend/`. Les pages publiques et `/screen`
sont accessibles sans connexion. `/admin/**` utilise une garde de session commune,
indépendante de la taille de l’écran.

## Démarrer

Node.js 22 recommandé (minimum Vite : 20.19 ou 22.12).

```bash
cd frontend
npm ci
npm run dev
```

Le mode par défaut est `demo`. Connexion : saisir un email, choisir Coach ou Staff
et ouvrir la démonstration. **Ce mode ne fournit pas une authentification réelle.**
Le planning est stocké dans le navigateur sous `boxtrack.planning.demo.v2` ; la
session de démonstration expire après sept jours et est restaurée dans le même onglet.
Pour réinitialiser uniquement le planning de démonstration, supprimer cette clé
via les outils de développement du navigateur, puis recharger.

Pour utiliser l’API existante : configurer `VITE_DATA_MODE=api` et
`VITE_API_BASE_URL=http://localhost:3000/api`, puis redémarrer Vite.

## Contrat et capacités indisponibles

Le backend local contient encore l’ancien contrat. Le dernier `git fetch` a révélé
le contrat actualisé sur `origin/V.0` au commit `666d977` ; l’adaptateur est aligné
sur ce nouveau contrat, lu avec `git show origin/V.0:backend/API_CONTRACT.md`.
Le backend local n’a pas été modifié. Le mode API exige ce backend mis à jour et sa migration.

| Capacité | Intégration API |
|---|---|
| Connexion / déconnexion | `POST /auth/login`, `POST /auth/logout` ; owner, coach et staff autorisés par le serveur |
| Restauration de session | Démonstration : oui. API : reconnexion après rechargement complet, aucun endpoint dédié de validation de session n’est documenté |
| Planning et détails | `GET /wods`, puis `GET /wods/:id` pour les blocs complets |
| Création / modification / suppression | `/admin/wods`, `/admin/wods/:id` ; date, début, fin et titre selon le contrat actualisé |
| Duplication | Copie éditable puis `POST /admin/wods` pour publier tous les champs modifiés ; l’endpoint dédié existe mais n’est pas nécessaire à ce parcours |
| TV | `GET /wods/tv-now` : choix courant/suivant fourni par le serveur, relu toutes les 30 secondes et aux changements de minute |
| Mouvements | Séries, répétitions, charge et instructions assemblées dans `detail`, le champ documenté ; détail existant conservé |

Seule la validation dédiée d’une session stockée reste indisponible dans le contrat.
Les jetons API ne sont pas considérés comme valides simplement parce qu’ils existent
dans sessionStorage. Les `401` et `403` retirent l’accès administrateur.
Une reconnexion restaure le brouillon dans le même onglet pour le même email.
Le mode demo reste explicitement simulé, avec stockage séparé et sans appel API.

## Comportement du planning

Fuseau `Europe/Paris`, intervalles début inclus / fin exclue. En démonstration, en cas de chevauchement,
la séance commencée le plus récemment est affichée. En mode API, le serveur choisit
la séance TV. Avant le début, la TV affiche la
prochaine séance du jour. Après la dernière : état vide. Aucun horaire de fin n’est
inventé pour les données anciennes. Les séances franchissant minuit ne sont pas
prises en charge : créer deux séances si nécessaire.

La TV relit les données toutes les 30 secondes et l’heure toutes les secondes.
En cas de coupure après un chargement réussi, elle conserve les dernières données
avec un message de connexion. Les programmes longs adaptent la taille du texte.
La distance réelle de lecture doit être vérifiée sur le téléviseur de la box.

## Vérifications

```bash
npm run lint
npm test
npm run build
```

Il n’y avait pas de suite front-end dans la version initiale. Les tests Node ajoutés
couvrent les frontières horaires, le fuseau, les chevauchements, les données
incomplètes et le respect du contrat API par l’adaptateur.

## Parcours manuel

1. Ouvrir `/admin` sans connexion sur téléphone et desktop : redirection vers `/login`.
2. En mode demo, se connecter, recharger : retrouver le planning et sa session.
3. Créer une séance : date, début/fin, Warm-Up, Skill/Strength, WOD. Vérifier le planning.
4. Modifier les textes, vider le Warm-Up, enregistrer et rouvrir la séance.
5. Dupliquer vers un autre horaire ou jour ; vérifier que l’original reste intact.
6. Modifier un champ puis Annuler : refuser de quitter garde les valeurs ; confirmer abandonne.
   Le navigateur avertit également lors d’un rechargement avec une saisie non enregistrée.
7. Supprimer une séance : annuler la confirmation, puis confirmer. Vérifier sa disparition.
8. Programmer deux séances consécutives près de l’heure actuelle ; ouvrir `/screen`
   en 1920×1080, vérifier la séance courante et le passage automatique à la suivante.
9. Vérifier une journée vide et la fin de la dernière séance.
10. Couper le réseau en mode API : vérifier les erreurs lisibles et la conservation de la saisie.
11. Révoquer/faire expirer un jeton de test puis enregistrer : redirection sur `401`/`403`.
    Se reconnecter avec le même email : retrouver le brouillon.
12. Se déconnecter, puis revenir sur `/admin` : accès refusé.
13. Vérifier les écrans à 360, 390, 430, 768, 1440 et 1920×1080 px.
