# BoxTrack — Coach / Staff et TV

Le front-end unique est dans ce répertoire. La branche `panaki-ui-coach-tv` part de `origin/V.0` à `666d977`. Le backend et son contrat restent inchangés.

## Démarrer

Node.js 22 ou supérieur.

```sh
cd frontend
npm ci
cp .env.example .env
npm run dev
```

Le mode par défaut utilise l’API `http://localhost:3000/api`. Démarrer le backend séparément avec ses instructions habituelles. L’ancien lanceur racine `dev.sh` cible encore l’ancien emplacement : utiliser les commandes ci-dessus. Aucun fichier backend ou lanceur n’a été modifié.

En développement, `VITE_API_BASE_URL=/api npm run dev` utilise le proxy Vite vers l’API locale sur le port 3000. Le navigateur n’a alors besoin d’accéder qu’au port du front-end, pratique avec un environnement distant.

Pour un aperçu local sans serveur, mettre `VITE_DATA_MODE=demo` dans `.env`, puis redémarrer Vite. Ce mode est explicitement signalé et conserve ses données séparément ; il ne constitue pas une authentification réelle.

## Parcours

- `/` : redirection vers la connexion ou le planning selon la session.
- `/login` : connexion des comptes owner, coach et staff.
- `/coach` : planning, séance en cours, prochaine séance, sélection sur sept jours et accès rapide aux séances futures.
- `/coach/sessions` : gestion et recherche des séances passées, protégées.
- `/coach/sessions/new` : création ; `?date=AAAA-MM-JJ` reprend le jour choisi au planning et `?duplicate=ID` prépare une copie pour le lendemain, modifiable avant publication.
- `/coach/sessions/:id/edit` : modification.
- `/screen` : TV publique sans navigation ni scroll, avec les titres simples « WOD du jour », « Échauffement » et « Force » ou « Technique », le format du WOD, son objectif et la progression du créneau. Actualisation toutes les 30 secondes et à chaque changement de minute.

Les sessions persistent 7 jours en localStorage. Le serveur autorise chaque écriture ; un 401 invalide la session locale et un 403 affiche le refus sans déconnexion. Les brouillons restent dans sessionStorage après une erreur ou une expiration, pour le même compte et la même séance. Une confirmation protège les sorties avec modifications non enregistrées.

Le planning résume en trois cartes l'échauffement, la technique/force et le WOD de la séance à l'affiche, avec un accès direct à la vue TV. L'éditeur explique les formats CrossFit (AMRAP, EMOM, For Time, etc.), propose des noms de mouvements et affiche un aperçu TV qui suit la saisie ; sur mobile, cet aperçu se trouve à l'étape de vérification. Depuis cet aperçu, « Vérifier en plein écran » affiche le brouillon avec la même composition 1920 × 1080 que la TV publique, sans enregistrer. « Agrandir pour lire » permet de parcourir le programme à une échelle plus lisible sur un petit écran. Ces aides sont purement visuelles : le coach reste libre de saisir tout mouvement et les données envoyées respectent le contrat existant. Les animations de navigation et de confirmation sont désactivées lorsque le système demande une réduction des mouvements.

## Contrat et limites

Les horaires, le titre, les deux Warm-Up et les phases sont couverts par `backend/API_CONTRACT.md`. La copie utilise la lecture de la source puis la création documentée, pour permettre d’éditer tous ses éléments avant publication.

Les mouvements disposent côté serveur de `movement_name` et `detail` uniquement. Séries, répétitions, charge et consignes sont réunies dans `detail` sans ajouter de champs au contrat. En modification, le détail existant reste éditable ; les valeurs ne sont pas déduites arbitrairement. Des champs structurés séparés côté serveur seraient nécessaires pour pouvoir les recharger séparément.

Il n’existe pas d’état brouillon/publié pour une séance dans ce contrat : enregistrer publie. Aucun sélecteur d’état fictif n’est affiché.

`/wods/tv-now` sélectionne la séance en cours ou la prochaine du jour en Europe/Paris. Après la dernière séance, il ne fournit pas la prochaine d’un autre jour : la TV affiche un état vide. Les dernières données reçues restent affichées pendant une interruption réseau avec un message explicite. Le contenu est ajusté à chaque colonne ; un programme exceptionnellement volumineux peut réduire la taille de police et mérite une vérification TV avant utilisation.

## Vérifications

```sh
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Les tests navigateur interceptent l’API et contrôlent les payloads ; ils ne remplacent pas un test d’intégration avec PostgreSQL et de vrais comptes. Les captures de contrôle sont dans `verification/`. Les tests couvrent la connexion, le planning et ses trois étapes, la recherche, l'aperçu TV de l'éditeur sur ordinateur et mobile, y compris le plein écran, l'éditeur sur cinq tailles, la réduction des mouvements et la TV en 1920 × 1080, avec contrôle des dimensions et du contenu ajusté.

### Test manuel avec l’API réelle

1. Ouvrir `/` sans session puis les trois routes coach : vérifier la redirection vers `/login`. Se connecter avec un compte autorisé, recharger puis rouvrir `/` : le planning doit rester accessible. Déconnecter et vérifier la fermeture de l’espace coach.
2. Créer une séance à un créneau libre, remplir les deux Warm-Up, choisir Skill ou Strength, saisir séries/répétitions/charges/consignes, ajouter et dupliquer des mouvements, choisir un format WOD et son objectif, vérifier le résumé puis enregistrer.
3. Modifier et vider un Warm-Up, enregistrer et recharger pour contrôler le résultat. Dupliquer sur un nouveau créneau. Annuler une suppression, puis confirmer une autre suppression.
4. Mettre la fin avant le début, supprimer la date et renseigner un mouvement sans nom : vérifier les messages et la conservation des valeurs. Quitter une séance modifiée : vérifier la confirmation.
5. Couper le réseau pendant l’enregistrement, reconnecter et réessayer. Révoquer ou expirer la session côté serveur puis tenter une écriture : vérifier le retour à la connexion et la restauration du brouillon avec le même compte. Un refus 403 doit conserver la session et afficher l’action refusée.
6. Programmer plusieurs séances dans la journée. Ouvrir `/screen` : contrôler avant le début, pendant la séance, à la fin, entre deux séances et après la dernière. Vérifier une journée vide et une coupure réseau avec et sans données déjà reçues.
7. Examiner le coach et l’éditeur en 360 × 800, 390 × 844, 430 × 932, 768 × 1024 et 1440 × 900. Ouvrir l’aperçu plein écran depuis l’éditeur, comparer les trois phases avec `/screen`, agrandir et faire défiler sur mobile, puis fermer avec Échap. Examiner `/screen` en 1920 × 1080 : trois phases visibles, horloge permanente, zéro scroll.

Aucun commit, push ou PR n’est nécessaire pour examiner le résultat dans le worktree.
