-- Publish the references confirmed by the site owner. Keep unprovided metrics,
-- partner names, periods, and detailed deliverables out of the public copy.
UPDATE "Project"
SET "title" = 'RIVOTRA Freedom Cup',
    "slug" = 'rivotra-freedom-cup',
    "client" = NULL,
    "summary" = 'La RIVOTRA Freedom Cup, une initiative sportive au croisement de la jeunesse et de la cohésion sociale.',
    "challenge" = 'Le sport forme le fil conducteur d’un projet tourné vers la jeunesse et la cohésion sociale.',
    "contribution" = 'CELESTRIIUM a contribué à cette initiative. Cette présentation s’en tient à son périmètre général : elle ne nomme aucun partenaire et n’attribue aucun livrable qui ne soit pas précisé ici.',
    "results" = 'Aucun chiffre d’audience ni indicateur d’impact n’est publié ici. Tout résultat quantifié devra être rattaché à une période, à une source et à une méthode de calcul.',
    "coverImage" = '/illustrations/reference-rivotra.svg',
    "status" = 'PUBLISHED',
    "publishedAt" = CURRENT_TIMESTAMP,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'demo-projet-territoire';

UPDATE "Project"
SET "title" = 'CDC Immersion',
    "slug" = 'cdc-immersion',
    "client" = NULL,
    "summary" = 'CDC Immersion, un parcours de formation et de développement des compétences.',
    "challenge" = 'Le projet relève de la formation et du développement de compétences, à travers un parcours d’immersion.',
    "contribution" = 'CELESTRIIUM a contribué à CDC Immersion. Les modules, les productions et le nombre de participants ne sont pas détaillés sans données vérifiées dans le dossier actuel.',
    "results" = 'Aucun nombre de participants ni résultat chiffré n’est avancé. Les périodes, indicateurs et suites du parcours restent à documenter.',
    "coverImage" = '/illustrations/reference-cdc-immersion.svg',
    "status" = 'PUBLISHED',
    "publishedAt" = CURRENT_TIMESTAMP,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'demo-projet-mesure';

INSERT INTO "Project" (
  "id", "title", "slug", "client", "summary", "challenge", "contribution",
  "results", "coverImage", "status", "publishedAt", "createdAt", "updatedAt"
) VALUES (
  'reference-production-audiovisuelle',
  'Communication événementielle et production audiovisuelle',
  'communication-evenementielle-audiovisuelle',
  NULL,
  'Une prestation de communication événementielle et de production audiovisuelle.',
  'La référence associe communication autour d’un événement et création de contenus audiovisuels.',
  'CELESTRIIUM a réalisé cette prestation. Le client et les livrables précis ne sont pas nommés dans les éléments disponibles ici.',
  'Aucun retour client ni indicateur de portée n’est publié. Les résultats éventuels devront s’appuyer sur une source communicable.',
  '/illustrations/reference-audiovisuelle.svg',
  'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO UPDATE SET
  "title" = EXCLUDED."title",
  "client" = EXCLUDED."client",
  "summary" = EXCLUDED."summary",
  "challenge" = EXCLUDED."challenge",
  "contribution" = EXCLUDED."contribution",
  "results" = EXCLUDED."results",
  "coverImage" = EXCLUDED."coverImage",
  "status" = EXCLUDED."status",
  "publishedAt" = COALESCE("Project"."publishedAt", CURRENT_TIMESTAMP),
  "updatedAt" = CURRENT_TIMESTAMP;

-- Symbolic local illustrations are intentional placeholders, not official photos.
INSERT INTO "MediaAsset" ("id", "filename", "storageKey", "mimeType", "sizeBytes", "altText") VALUES
  ('visual-reference-rivotra', 'reference-rivotra.svg', '/illustrations/reference-rivotra.svg', 'image/svg+xml', 2159, 'Illustration symbolique provisoire du sport, de la jeunesse et de la cohésion sociale ; ce n’est pas une photographie officielle.'),
  ('visual-reference-cdc-immersion', 'reference-cdc-immersion.svg', '/illustrations/reference-cdc-immersion.svg', 'image/svg+xml', 2017, 'Illustration symbolique provisoire de formation et d’immersion ; ce n’est pas une photographie officielle.'),
  ('visual-reference-audiovisuelle', 'reference-audiovisuelle.svg', '/illustrations/reference-audiovisuelle.svg', 'image/svg+xml', 1889, 'Illustration symbolique provisoire de communication événementielle et audiovisuelle ; ce n’est pas une photographie officielle.')
ON CONFLICT ("storageKey") DO UPDATE SET
  "filename" = EXCLUDED."filename",
  "mimeType" = EXCLUDED."mimeType",
  "sizeBytes" = EXCLUDED."sizeBytes",
  "altText" = EXCLUDED."altText";
