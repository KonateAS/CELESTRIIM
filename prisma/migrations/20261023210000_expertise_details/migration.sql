UPDATE "Expertise"
SET "body" = E'Comprendre les enjeux sociaux et environnementaux de votre organisation et les priorités de vos parties prenantes.\n\nDéfinir un cap RSE relié à votre stratégie, puis le traduire en objectifs, responsabilités, indicateurs et plan d’action.\n\nSuivre les avancées et ajuster la démarche à partir d’éléments documentés.'
WHERE "slug" = 'strategie-conseil-rse' AND "body" = "summary";

UPDATE "Expertise"
SET "body" = E'Clarifier le besoin, les bénéficiaires visés et les changements attendus.\n\nConcevoir des projets cohérents avec le contexte local, leurs ressources et les compétences mobilisées.\n\nOrganiser le déploiement, le suivi des activités et la mesure des effets pour éclairer les prochaines étapes.'
WHERE "slug" = 'projets-a-impact' AND "body" = "summary";

UPDATE "Expertise"
SET "body" = E'Faire le point sur les engagements, les actions réellement menées et les preuves disponibles.\n\nConstruire des messages accessibles, précis et adaptés aux publics concernés.\n\nValoriser les résultats avec justesse, en distinguant les réalisations, les effets observés et les objectifs à poursuivre.'
WHERE "slug" = 'communication-responsable' AND "body" = "summary";

UPDATE "Expertise"
SET "body" = E'Identifier les compétences et contributions nécessaires à un objectif commun.\n\nPréciser les rôles, responsabilités, objectifs et modalités de coopération entre les parties prenantes.\n\nAccompagner l’activation et le suivi des partenariats afin que les contributions s’inscrivent dans la durée.'
WHERE "slug" = 'partenariats-activation' AND "body" = "summary";
