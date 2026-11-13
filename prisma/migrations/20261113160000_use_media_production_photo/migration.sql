INSERT INTO "MediaAsset" ("id", "filename", "storageKey", "mimeType", "sizeBytes", "altText")
VALUES (
  'visual-reference-audiovisuelle-photo',
  'media-production.jpg',
  '/illustrations/photos/media-production.jpg',
  'image/jpeg',
  169740,
  'Illustrative photo of a camera operator filming a live event.'
)
ON CONFLICT ("storageKey") DO UPDATE SET
  "filename" = EXCLUDED."filename",
  "mimeType" = EXCLUDED."mimeType",
  "sizeBytes" = EXCLUDED."sizeBytes",
  "altText" = EXCLUDED."altText";

UPDATE "Project"
SET "coverImage" = '/illustrations/photos/media-production.jpg', "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'communication-evenementielle-audiovisuelle';
