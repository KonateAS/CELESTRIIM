ALTER TABLE "ContactMessage"
ADD COLUMN "jobTitle" TEXT,
ADD COLUMN "privacyConsent" BOOLEAN NOT NULL DEFAULT false;
