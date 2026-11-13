ALTER TABLE "Project" ADD COLUMN "videoUrl" TEXT;

CREATE TABLE "ProjectGalleryImage" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProjectGalleryImage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProjectGalleryImage_projectId_mediaAssetId_key"
ON "ProjectGalleryImage"("projectId", "mediaAssetId");

CREATE INDEX "ProjectGalleryImage_projectId_sortOrder_idx"
ON "ProjectGalleryImage"("projectId", "sortOrder");

ALTER TABLE "ProjectGalleryImage"
ADD CONSTRAINT "ProjectGalleryImage_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectGalleryImage"
ADD CONSTRAINT "ProjectGalleryImage_mediaAssetId_fkey"
FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
