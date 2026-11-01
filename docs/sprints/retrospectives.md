# BoxTrack : Rétrospectives

> Rédigées à partir de l'historique Git et des documents du dépôt. Les points marqués sont des analyses à valider ensemble : ajuste-les avant de les présenter, elles doivent refléter ce que vous avez réellement vécu.

## Rétrospective : Sprints 1 et 2 (septembre : début octobre)

**Ce qui a bien marché**
- Une documentation complète dès le départ (idée, charte, doc technique) a servi de référence pour le code.
- Écrire des tests d'intégration tôt a révélé un vrai bug de date (`session_date`) avant qu'il n'atteigne le front.

**Ce qui n'a pas bien marché**
- Un projet iOS sans rapport avec BoxTrack s'est retrouvé sur la branche et a dû être retiré (05/10).
- Le front-end a démarré avec des configurations manquantes (`vite.config.js`) qui ont bloqué l'intégration (06/10).

**Actions**
- Garder une branche par sujet et ne pas mélanger les projets dans un même dépôt.
- Vérifier le démarrage du projet à froid (clone, installation, lancement) avant de se répartir le travail. [à confirmer avec Panaki]

## Rétrospective : Sprint 3 (mi-octobre)

**Ce qui a bien marché**
- La revue enseignant a produit des corrections concrètes et vérifiables (heure de Paris, validation, CORS, rate limit).
- Le travail en parallèle back/front a permis d'intégrer le front sur l'API Core en deux jours (13/10).

**Ce qui n'a pas bien marché**
- La section « Recettes » a été ajoutée (back puis front) puis supprimée une semaine plus tard : du travail perdu et un périmètre qui a bougé.
- Les 4 fonctionnalités optionnelles ont été ouvertes tôt, alors que le plan prévoyait de les faire après la démo du Core. [à confirmer avec Panaki]

**Actions**
- Valider le périmètre avec le commanditaire avant de coder une nouvelle fonctionnalité, et respecter l'ordre MoSCoW (Core avant optionnel).

## Rétrospective : Sprint 4 (fin octobre)

**Ce qui a bien marché**
- CI sur chaque push : lint, format, tests unitaires et d'intégration.
- Des preuves de tests versionnées et rejouables (Jest, Supertest, Newman).
- Le soin apporté à la vue TV (horloge, animations) apporte de la valeur visible pour le client.

**Ce qui n'a pas bien marché**
- Pas de plan de déploiement précis tant que le commanditaire n'avait pas fourni de serveur ; les risques « déploiement découvert trop tard » du plan initial se sont réalisés partiellement.
- Les revues de sprint et rétrospectives n'ont pas été écrites pendant le projet. [à confirmer avec Panaki]

**Actions**
- Déployer un squelette minimal dès le début, puis améliorer.
- Rédiger la revue et la rétrospective à la fin de chaque sprint, pas à la fin du projet.
