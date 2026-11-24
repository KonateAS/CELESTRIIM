# CELESTRIIUM

Site CELESTRIIUM : les pages publiques sont rendues par le serveur avec le design de `lib/site.mjs` et `css/site.css`. Node.js, PostgreSQL et Prisma gèrent les contenus, le formulaire de contact et le tableau de bord. Si PostgreSQL est injoignable, le serveur reprend les pages HTML de secours à la racine.

## Développement

Prérequis : Node.js 20.9 ou ultérieur et PostgreSQL 17.

1. Copier `.env.example` vers `.env`, puis renseigner les deux URL PostgreSQL, un `AUTH_SECRET` d’au moins 32 caractères, l’adresse administrateur et un mot de passe d’au moins 14 caractères.
2. Installer les dépendances : `npm.cmd ci`.
3. Générer Prisma : `npm.cmd run db:generate`.
4. Créer ou mettre à jour le schéma : `npm.cmd run db:migrate`.
5. Créer l’administrateur et les contenus de départ : `npm.cmd run db:seed`.
6. Démarrer le site : `npm.cmd run dev`.

Le site est servi sur `http://localhost:3000`. L’administration est accessible sur `http://localhost:3000/admin/login`. Les messages du formulaire apparaissent dans l’administration, rubrique **Messages**.

## Mise en production

Le serveur écoute sur `0.0.0.0` et utilise la variable `PORT` fournie par l’hébergeur. La route `GET /healthz` renvoie `200` si PostgreSQL est joignable et `503` sinon ; elle peut servir de contrôle de santé à la plateforme.

Configurer dans l’environnement de production :

- `NODE_ENV=production` et `PORT` (généralement fourni automatiquement).
- `DATABASE_URL` vers le PostgreSQL de production et `SHADOW_DATABASE_URL` vers une base de travail distincte pour Prisma.
- `AUTH_SECRET` aléatoire d’au moins 32 caractères, `ADMIN_EMAIL` et un `ADMIN_PASSWORD` unique d’au moins 14 caractères.
- `SITE_URL` avec l’origine HTTPS finale, par exemple `https://www.example.com`.
- `MEDIA_STORAGE_DIR` vers un volume persistant. Sans ce volume, les images importées peuvent disparaître lors d’un redémarrage ou d’un remplacement de l’instance.

Commandes de déploiement : installer avec `npm ci`, générer le client avec `npm run db:generate`, appliquer les migrations avec `npm run db:deploy`, puis démarrer avec `npm start`. Pour une base neuve, exécuter une fois `npm run db:seed` avec les variables d’administration définies ; cette commande ajoute également les contenus de départ. Ne pas lancer `db:migrate` en production : cette commande est réservée au développement.

Avant l’ouverture publique, vérifier `/healthz`, la connexion à `/admin/login`, les sauvegardes PostgreSQL et la persistance des médias. Aucun hébergeur n’est configuré dans ce dépôt ; les variables et commandes ci-dessus sont indépendantes de la plateforme.

## Contenus et médias

- Pages publiques : rendu serveur dans `lib/site.mjs`, gabarit `public/site-template.html`, styles `css/site.css`, interactions `js/app.js`.
- Secours si la base est indisponible : fichiers HTML à la racine, `js/main.js`, `css/style.css` et données `js/content.js`.
- Tableau de bord : mêmes gabarit, composants et styles, routes sous `/admin`.
- Données et migrations : `prisma/`.
- Photos de réalisation : `assets/img/`, `assets/video/` et les médias validés dans `public/media/`.
- Les URL propres et les anciennes adresses `.html` ouvrent les mêmes pages publiques quand le serveur est lancé.

Ne jamais publier `.env`. Pour la production, utiliser un PostgreSQL hébergé, HTTPS, des sauvegardes et un stockage persistant pour les médias importés.
