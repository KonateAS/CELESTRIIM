# CELESTRIIUM

Site public serverisé avec Node.js, PostgreSQL et Prisma. Il comprend un formulaire de contact enregistré en base, une administration des pages et réalisations, une médiathèque et les modes clair et sombre.

## Développement

Prérequis : Node.js 20.9 ou ultérieur et PostgreSQL 17.

1. Copier `.env.example` vers `.env`, puis renseigner les deux URL PostgreSQL, un `AUTH_SECRET` d’au moins 32 caractères, l’adresse administrateur et un mot de passe d’au moins 14 caractères.
2. Installer les dépendances : `npm.cmd ci`.
3. Générer Prisma : `npm.cmd run db:generate`.
4. Créer ou mettre à jour le schéma : `npm.cmd run db:migrate`.
5. Créer l’administrateur et les contenus de départ : `npm.cmd run db:seed`.
6. Démarrer le site : `npm.cmd run dev`.

Le site est servi sur `http://localhost:3000`. L’administration est accessible sur `http://localhost:3000/admin/login`. Les messages du formulaire apparaissent dans l’administration, rubrique **Messages**.

## Contenus et médias

- Gabarit du serveur : `public/site-template.html`.
- Pages et composants HTML : `lib/site.mjs`.
- Styles du site serverisé : `css/site.css`.
- Scripts du site : `js/app.js`.
- Données et migrations : `prisma/`.
- Photos illustratives et crédits : `public/illustrations/photos/credits.md`.
- Les fichiers `.html` historiques redirigent vers les routes serverisées quand le serveur est lancé.

Ne jamais publier `.env`. Pour la production, utiliser un PostgreSQL hébergé, HTTPS, des sauvegardes et un stockage persistant pour les médias importés.
