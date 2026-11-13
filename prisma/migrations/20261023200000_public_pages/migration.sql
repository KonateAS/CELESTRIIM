INSERT INTO "Page" ("id", "title", "slug", "summary", "body", "status", "seoTitle", "seoDescription", "publishedAt", "createdAt", "updatedAt")
VALUES
  (
    'celestrium-a-propos',
    'À propos',
    'a-propos',
    'CELESTRIIUM relie stratégie, action et mesure pour accompagner les organisations qui veulent transformer leurs engagements en projets à impact.',
    E'Notre mission\nAccompagner les organisations dans la conception et le déploiement de démarches qui relient leurs ambitions à des actions concrètes et à des résultats documentés.\n\nNotre vision\nContribuer à un avenir où la performance des organisations s’accorde avec une contribution positive aux territoires et aux personnes.\n\nNos valeurs\nResponsabilité, impact, humanité, coopération et innovation guident notre manière de travailler.\n\nNotre méthode\nComprendre. Concevoir. Agir. Mesurer. Valoriser. Nous avançons de la compréhension des enjeux jusqu’au suivi et à la valorisation des résultats.',
    'PUBLISHED',
    'À propos de CELESTRIIUM',
    'Notre mission, notre vision, nos valeurs et notre méthode de conseil en stratégie et impact.',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'celestrium-partenariats',
    'Partenariats',
    'partenariats',
    'Nous concevons des coopérations adaptées aux objectifs des projets et aux compétences des organisations impliquées.',
    'Des coopérations construites autour des projets\nLes enjeux sociaux et environnementaux demandent souvent des compétences complémentaires. CELESTRIIUM accompagne la réflexion sur les partenariats, la répartition des rôles et l’activation des contributions autour d’un objectif partagé.\n\nUne démarche claire\nChaque coopération commence par la compréhension des besoins et des capacités des parties prenantes. Les contributions, responsabilités, objectifs et modalités de suivi sont précisés avant la mise en œuvre et la communication des résultats.\n\nParlons de votre projet\nVous souhaitez structurer une démarche commune ou identifier des partenaires adaptés à un projet ? Présentez-nous votre besoin pour ouvrir la conversation.',
    'PUBLISHED',
    'Partenariats et coopération',
    'Une démarche de coopération, d’activation de partenariats et de suivi des projets à impact.',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("slug") DO NOTHING;
