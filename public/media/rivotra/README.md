# RIVOTRA Freedom Cup 2026 — médias

Les fichiers WebP de ce dossier sont des visuels de la compétition fournis pour le site. Les images de la galerie et la couverture sont enregistrées dans la médiathèque par `npm run db:seed` et peuvent être remplacées dans **Administration → Contenus → Réalisations → RIVOTRA Freedom Cup 2026**, après import dans la médiathèque.

La vidéo `rivotra-interview-comite.mp4` est reliée à la fiche de réalisation par son chemin local. Pour la remplacer, mettre à jour le champ « Vidéo » dans cette même fiche et déposer le nouveau fichier dans `public/media/rivotra/`.

Les 30 visuels issus de l’archive complémentaire sont dans `archive/`. Ils sont optimisés en WebP et reliés à la galerie RIVOTRA par le seed PostgreSQL.

Le dossier de conception fourni demande que les autorisations d’image, en particulier pour les mineurs, soient conservées et vérifiées avant toute republication sur d’autres supports.
