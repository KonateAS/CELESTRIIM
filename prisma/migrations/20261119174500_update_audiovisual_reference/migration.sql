UPDATE "Project"
SET
  "client" = 'CELESTRIIUM · CATÉGORIE',
  "summary" = 'Présentation de cette catégorie de réalisation. Les références, prestations et éléments de contexte seront ajoutés après validation.',
  "challenge" = 'Présentation à compléter',
  "contribution" = '',
  "results" = '',
  "coverImage" = '/illustrations/photos/media-production.jpg',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'communication-evenementielle-audiovisuelle';
