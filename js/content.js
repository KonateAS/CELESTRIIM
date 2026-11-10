/* Données du site. Pour raccorder une API/CMS : remplacer cet objet par un fetch() dans main.js. */
const SITE = {
  name: "CELESTRIIUM",
  logo: "assets/logo-wordmark.jpeg",
  contact: { email: "", phone: "", address: "" }, // Renseigner uniquement avec des informations validées.
  nav: [
    ["index.html","Accueil"],["a-propos.html","À propos"],["expertises.html","Expertises"],
    ["realisations.html","Réalisations"],["partenariats.html","Partenariats"],
    ["perspectives.html","Perspectives"],["contact.html","Contact"]
  ],
  hero: { title: "Donner du sens à la performance. <em>Construire un impact durable.</em>",
    slides: ["Donner du sens à la performance.", "Construire un impact durable."],
    text: "" },
  purpose: "Faire de chaque engagement une action utile aux territoires, et mesurable avec honnêteté.",
  conviction: "La performance durable ne se décrète pas : elle se construit avec les territoires, les parties prenantes et des preuves concrètes.",
  method: [
    ["Comprendre","Écouter les enjeux, les usages et les réalités de votre écosystème."],
    ["Concevoir","Transformer les constats en stratégie et en projets activables."],
    ["Agir","Coordonner les acteurs et faire vivre les engagements sur le terrain."],
    ["Mesurer","Suivre les résultats avec des indicateurs utiles et lisibles."],
    ["Valoriser","Rendre compte avec justesse, sans surpromesse ni greenwashing."]
  ],
  approach: [
    ["Écouter","Comprendre les territoires et les acteurs avant d’agir."],
    ["Concevoir","Traduire les engagements en projets réalistes et coordonnés."],
    ["Activer","Mobiliser les parties prenantes sur le terrain."],
    ["Documenter","Rendre compte des résultats avec rigueur, sans les surévaluer."]
  ],
  about: {
    mission: "Aider les organisations à passer de l’intention à l’action, au service des communautés et de l’environnement.",
    values: [["Écoute des territoires","Chaque projet part du contexte local."],["Coopération","Les résultats se construisent à plusieurs."],["Responsabilité","Des engagements tenus et assumés."],["Résultats documentés","Nous ne présentons que ce que nous pouvons étayer."]],
    way: "Diagnostic partagé, conception, coordination de terrain, communication responsable et restitution des résultats."
  },
  expertises: [
    {t:"Stratégie et conseil RSE",d:"Structurer une démarche RSE cohérente, alignée sur la réalité de l’organisation.",n:["Formaliser vos engagements","Prioriser vos actions","Rendre votre démarche lisible"]},
    {t:"Projets à impact",d:"Concevoir et piloter des projets sociaux ou environnementaux sur le terrain.",n:["Passer d’une idée à un projet","Coordonner les acteurs","Suivre et documenter les résultats"]},
    {t:"Communication responsable",d:"Raconter vos actions avec exactitude, sans exagération.",n:["Valoriser vos actions réelles","Produire des contenus fidèles","Éviter l’affichage trompeur"]},
    {t:"Partenariats et activation",d:"Créer des collaborations durables et activer les communautés autour d’un projet.",n:["Mettre en relation les acteurs","Organiser des événements","Mobiliser les communautés locales"]}
  ],
  partners: "CELESTRIIUM conçoit des collaborations entre entreprises, institutions, associations, acteurs locaux et communautés : cadrage des rôles, mise en relation, coordination et activation sur le terrain.",
  projects: [
    {href:"rivotra-freedom-cup-2026.html", title:"RIVOTRA Freedom Cup 2026 — Le sport comme terrain d’activation et d’apprentissage", summary:"À Adzopé, une activation territoriale autour du football de proximité, associant RIVOTRA, une compétition Seniors et U17 et une immersion aux métiers de l’audiovisuel avec CDC IMMERSION.", image:"assets/img/rivotra-cover.jpg", alt:"Affiche de la RIVOTRA Freedom Cup 2026"},
    {href:"cdc-immersion.html", title:"CDC IMMERSION — Découvrir les métiers de l’audiovisuel sportif", summary:"Une immersion pratique pour permettre à de jeunes participants de découvrir la couverture audiovisuelle d’un événement sportif, en situation réelle et avec encadrement.", image:"assets/img/cdc-immersion/cdc-immersion-01.jpg", alt:"Immersion CDC dans les métiers de l’audiovisuel sportif"},
    {title:"Communication événementielle et production audiovisuelle", summary:"Présentation de cette catégorie de réalisation. Les références, prestations et éléments de contexte seront ajoutés après validation.", image:"assets/img/rivotra/rivotra-04.jpg", alt:"Communication événementielle et production audiovisuelle", note:"Présentation à compléter"}
  ],
  rivotra: {
    intro:"À Adzopé, CELESTRIIUM a conçu et coordonné une activation territoriale autour du football de proximité, associant RIVOTRA, une compétition Seniors et U17 et une immersion pratique aux métiers de l’audiovisuel avec CDC IMMERSION.",
    context:"Le projet utilise le football de proximité comme terrain de rencontre, d’animation locale et d’apprentissage.",
    roleC:"Ingénierie, organisation, coordination, communication, production de contenus et activation territoriale.",
    roleCDC:"CDC IMMERSION a permis à 13 jeunes de découvrir et pratiquer des métiers liés à la couverture audiovisuelle sportive, en situation réelle et avec encadrement. Il s’agissait d’une immersion et non d’une formation diplômante.",
    tournament:[["16","équipes Seniors"],["7","équipes U17"]],
    champions:[["Seniors","Champion : La Voix d’Adzopé FC"],["U17","Champion : FC Commi — finaliste : BMC Jr"]],
    results:[["≈ 172 300","vues"],["≈ 6 100","interactions"],["≈ 200","personnes par jour sur site (estimation)"]],
    resultsNote:"Les vues ne représentent pas des personnes uniques. Ces indicateurs concernent la page sur la période observée et ne prouvent pas, à eux seuls, un effet commercial.",
    radio:["Selon le bilan fourni, les rencontres ont été retransmises sur Kanien FM 99,9 à partir des quarts de finale.","Le comité d’organisation a présenté le bilan et les prochaines étapes sur Radio Cayat 96,5 FM le 29 juillet 2026."],
    gallery:Array.from({length:29},(_,i)=>({
      src:`assets/img/rivotra/rivotra-${String(i+1).padStart(2,"0")}.jpg`,
      alt:`Visuel ${i+1} fourni pour la RIVOTRA Freedom Cup 2026`,
      cap:`RIVOTRA Freedom Cup 2026 — visuel ${i+1}`
    })),
    video:{src:"assets/video/rivotra.mp4",poster:"assets/img/rivotra-cover.jpg"},
    partners:["RIVOTRA","CDC IMMERSION"]
  },
  cdcImmersion: {
    intro:"CDC IMMERSION accompagne les jeunes dans la découverte concrète des métiers de l’audiovisuel sportif, au plus près du terrain.",
    context:"Dans le cadre de la RIVOTRA Freedom Cup 2026, l’immersion a permis à 13 jeunes de pratiquer la prise de vue, l’interview et la couverture d’un événement en conditions réelles.",
    gallery:Array.from({length:7},(_,i)=>({
      src:`assets/img/cdc-immersion/cdc-immersion-${String(i+1).padStart(2,"0")}.jpg`,
      alt:`Immersion CDC — visuel ${i+1}`,
      cap:`CDC IMMERSION — visuel ${i+1}`
    }))
  },
  articles:[{title:"Article d’exemple à compléter",summary:"Emplacement réservé à un article fourni par CELESTRIIUM.",date:"2026-01-01",image:"assets/img/article-1.jpg",alt:"Illustration à fournir",href:"#",example:true}],
  footerText:"Agence de conseil et d’activation à impact basée en Côte d’Ivoire."
};
