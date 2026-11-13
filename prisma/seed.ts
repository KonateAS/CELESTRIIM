import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { PublicationStatus } from "@prisma/client";
import { stat } from "node:fs/promises";
import path from "node:path";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password || password.length < 14) {
    throw new Error("Set ADMIN_EMAIL and a unique ADMIN_PASSWORD of at least 14 characters in .env before seeding.");
  }

  const passwordHash = await hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, name: "Administrateur CELESTRIIUM", passwordHash, role: "ADMIN" },
  });

  const initialExpertises = [
    { title: "Stratégie & conseil RSE", slug: "strategie-conseil-rse", summary: "Faire de vos engagements un cap clair, partagé et mesurable.", sortOrder: 1 },
    { title: "Projets à impact", slug: "projets-a-impact", summary: "Concevoir et piloter des initiatives utiles, ancrées dans les territoires.", sortOrder: 2 },
    { title: "Communication responsable", slug: "communication-responsable", summary: "Rendre vos actions lisibles avec justesse, cohérence et impact.", sortOrder: 3 },
    { title: "Partenariats & activation", slug: "partenariats-activation", summary: "Rassembler les bons acteurs autour d’ambitions communes.", sortOrder: 4 },
  ];

  for (const expertise of initialExpertises) {
    await prisma.expertise.upsert({
      where: { slug: expertise.slug },
      update: {},
      create: { ...expertise, body: expertise.summary, status: PublicationStatus.PUBLISHED },
    });
  }

  const rivotraMedia = [
    { filename: "rivotra-fc-commi-champions.webp", altText: "Les joueurs du FC Commi célèbrent leur titre de champions U17 de la RIVOTRA Freedom Cup 2026." },
    { filename: "radio-cayat-96-5-recap.webp", altText: "Affiche récapitulative du passage du comité de la RIVOTRA Freedom Cup sur Radio Cayat 96,5 FM." },
    { filename: "kanien-fm-99-9-couverture.webp", altText: "Affiche de la couverture de la RIVOTRA Freedom Cup par Kanien FM 99,9." },
    { filename: "rivotra-demi-finale.webp", altText: "Affiche des demi-finales de l’édition Petit poteau de la RIVOTRA Freedom Cup 2026." },
    { filename: "rivotra-equipes-et-public.webp", altText: "Des équipes et des supporters réunis autour du terrain pendant la RIVOTRA Freedom Cup à Adzopé." },
    { filename: "rivotra-interview-terrain.webp", altText: "Un entretien réalisé en bord de terrain pendant la RIVOTRA Freedom Cup." },
    { filename: "rivotra-immersion-audiovisuelle.webp", altText: "Un jeune membre de l’équipe de couverture audiovisuelle filme le tournoi." },
    { filename: "rivotra-couverture-media.webp", altText: "Une interview de participant menée pendant la couverture média du tournoi." },
    { filename: "rivotra-production-au-terrain.webp", altText: "Un opérateur image prépare une captation au bord du terrain." },
  ];

  const mediaAssets = [];
  for (const asset of rivotraMedia) {
    const storageKey = `/media/rivotra/${asset.filename}`;
    const file = await stat(path.join(process.cwd(), "public", "media", "rivotra", asset.filename));
    mediaAssets.push(await prisma.mediaAsset.upsert({
      where: { storageKey },
      update: { filename: asset.filename, mimeType: "image/webp", sizeBytes: file.size, altText: asset.altText },
      create: { ...asset, storageKey, mimeType: "image/webp", sizeBytes: file.size },
    }));
  }

  const archiveMedia = async (sourceKey: string, filename: string, altText: string) => {
    const storageKey = sourceKey;
    const file = await stat(path.join(process.cwd(), "public", storageKey.slice(1)));
    return prisma.mediaAsset.upsert({
      where: { storageKey },
      update: { filename, mimeType: "image/webp", sizeBytes: file.size, altText },
      create: { filename, storageKey, mimeType: "image/webp", sizeBytes: file.size, altText },
    });
  };
  const archiveRivotraAssets = await Promise.all([
    archiveMedia("/media/rivotra/archive/rivotra-cover.webp", "rivotra-cover.webp", "Photographie des équipes réunies avant un match de la RIVOTRA Freedom Cup 2026."),
    ...Array.from({ length: 29 }, (_, index) => {
      const number = String(index + 1).padStart(2, "0");
      return archiveMedia(`/media/rivotra/archive/rivotra-${number}.webp`, `rivotra-${number}.webp`, `Image fournie pour la RIVOTRA Freedom Cup 2026 — visuel ${index + 1}.`);
    }),
  ]);
  const archiveCdcAssets = await Promise.all(Array.from({ length: 7 }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    return archiveMedia(`/media/cdc-immersion/cdc-immersion-${number}.webp`, `cdc-immersion-${number}.webp`, `Visuel fourni pour CDC Immersion — support ${index + 1}.`);
  }));

  const coverImage = "/media/rivotra/rivotra-equipes-et-public.webp";
  const projectData = {
    title: "RIVOTRA Freedom Cup 2026",
    client: "RIVOTRA / KESHO · CDC IMMERSION",
    summary: "À Adzopé, CELESTRIIUM a conçu et coordonné une activation territoriale autour du football de proximité, reliant RIVOTRA, la compétition Seniors et U17 et une immersion pratique aux métiers de l’audiovisuel avec CDC IMMERSION.",
    challenge: "Le football de proximité est un espace de rencontre important pour les communautés. La Freedom Cup 2026 a donné à cette pratique un cadre fédérateur, associant compétition, contenus accessibles et messages de civisme, de fair-play et de vivre-ensemble à Adzopé.",
    contribution: "CELESTRIIUM a assuré l’ingénierie, l’organisation, la coordination, la communication, la production de contenus et l’activation territoriale. Le tournoi a réuni des équipes Seniors et U17 au Parc des Tigres, sur le terrain Marco Amakpe Tabois.\n\nAvec CDC IMMERSION, 13 jeunes ont découvert et pratiqué, en situation réelle et avec un encadrement, plusieurs métiers de la couverture audiovisuelle sportive : photographie, vidéo, interviews, régie, animation, community management et rédaction. Cette immersion n’était pas une formation diplômante.\n\nLes matches ont été couverts sur la page Facebook RIVOTRA Freedom Cup. Selon le bilan fourni, Kanien FM (99,9 MHz) a retransmis les rencontres à partir des quarts de finale. Le comité d’organisation a également présenté le bilan et les suites de la compétition sur Radio Cayat (96,5 FM) le 29 juillet 2026.",
    results: "23 équipes ont participé : 16 équipes Seniors et 7 équipes U17. Les champions documentés sont La Voix d’Adzopé FC (Seniors) et FC Commi (U17) ; BMC Jr est indiqué comme finaliste U17.\n\nLes statistiques Meta fournies font état d’environ 172 300 vues, 28 100 utilisateurs ayant vu une publication et 6 100 interactions sur les périodes observées. Les vues ne représentent pas des personnes uniques et ces indicateurs décrivent la page sur la période retenue, pas un effet commercial démontré. La fréquentation sur site est estimée à environ 200 personnes par jour.\n\nLe nombre d’auditeurs radio et la zone de réception effective ne sont pas établis ; aucun chiffre d’audience radiophonique n’est avancé.",
    coverImage,
    videoUrl: "/media/rivotra/rivotra-interview-comite.mp4",
    status: PublicationStatus.PUBLISHED,
    publishedAt: new Date("2026-07-29T12:00:00.000Z"),
  };
  const previousSummary = "La RIVOTRA Freedom Cup, une initiative sportive au croisement de la jeunesse et de la cohésion sociale.";
  const existingProject = await prisma.project.findUnique({ where: { slug: "rivotra-freedom-cup" }, select: { id: true, summary: true } });
  const project = await prisma.project.upsert({
    where: { slug: "rivotra-freedom-cup" },
    update: existingProject?.summary === previousSummary ? projectData : {},
    create: {
      slug: "rivotra-freedom-cup",
      ...projectData,
    },
  });

  const galleryAssets = mediaAssets.filter((asset) => asset.storageKey !== coverImage);
  const galleryCount = await prisma.projectGalleryImage.count({ where: { projectId: project.id } });
  if (galleryCount === 0) {
    await prisma.projectGalleryImage.createMany({
      data: galleryAssets.map((asset, sortOrder) => ({ projectId: project.id, mediaAssetId: asset.id, sortOrder })),
    });
  }

  async function appendGallery(projectId: string, assets: { id: string }[]) {
    const current = await prisma.projectGalleryImage.findMany({ where: { projectId }, select: { mediaAssetId: true, sortOrder: true } });
    const known = new Set(current.map((item) => item.mediaAssetId));
    let sortOrder = Math.max(-1, ...current.map((item) => item.sortOrder)) + 1;
    const missing = assets.filter((asset) => !known.has(asset.id)).map((asset) => ({ projectId, mediaAssetId: asset.id, sortOrder: sortOrder++ }));
    if (missing.length) await prisma.projectGalleryImage.createMany({ data: missing });
  }
  await appendGallery(project.id, archiveRivotraAssets);

  const cdcCover = archiveCdcAssets[0]?.storageKey;
  const cdcProject = await prisma.project.upsert({
    where: { slug: "cdc-immersion" },
    update: {},
    create: {
      title: "CDC Immersion",
      slug: "cdc-immersion",
      summary: "CDC Immersion, un parcours de formation et de développement des compétences.",
      challenge: "Le projet relève de la formation et du développement de compétences, à travers un parcours d’immersion.",
      contribution: "CELESTRIIUM a contribué à CDC Immersion. Les modules, les productions et le nombre de participants restent à documenter avec des données vérifiées.",
      results: "Aucun nombre de participants ni résultat chiffré n’est avancé sans source vérifiable.",
      coverImage: cdcCover,
      status: PublicationStatus.PUBLISHED,
      publishedAt: new Date("2026-10-23T18:06:39.185Z"),
    },
  });
  if (cdcCover && cdcProject.coverImage?.startsWith("/illustrations/")) await prisma.project.update({ where: { id: cdcProject.id }, data: { coverImage: cdcCover } });
  await appendGallery(cdcProject.id, archiveCdcAssets);

  console.log(`Administrator, ${initialExpertises.length} expertise entries, ${archiveRivotraAssets.length + archiveCdcAssets.length} archive images, and the case studies are ready.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
