/* Données du site. Pour raccorder une API/CMS : remplacer cet objet par un fetch() dans main.js. */
const SITE = {
  name: "CELESTRIIUM",
  logoLight: "assets/logo-black.png",
  logoDark: "assets/logo-white.png",
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
    {slug:"strategie-conseil-rse",t:"Stratégie et conseil RSE",d:"Structurer une démarche RSE cohérente, alignée sur la réalité de l’organisation.",n:["Formaliser vos engagements","Prioriser vos actions","Rendre votre démarche lisible"]},
    {slug:"projets-a-impact",t:"Projets à impact",d:"Concevoir et piloter des projets sociaux ou environnementaux sur le terrain.",n:["Passer d’une idée à un projet","Coordonner les acteurs","Suivre et documenter les résultats"]},
    {slug:"communication-responsable",t:"Communication responsable",d:"Raconter vos actions avec exactitude, sans exagération.",n:["Valoriser vos actions réelles","Produire des contenus fidèles","Éviter l’affichage trompeur"]},
    {slug:"partenariats-activation",t:"Partenariats et activation",d:"Créer des collaborations durables et activer les communautés autour d’un projet.",n:["Mettre en relation les acteurs","Organiser des événements","Mobiliser les communautés locales"]}
  ],
  partners: "CELESTRIIUM conçoit des collaborations entre entreprises, institutions, associations, acteurs locaux et communautés : cadrage des rôles, mise en relation, coordination et activation sur le terrain.",
  projects: [
    {slug:"rivotra-freedom-cup", href:"/realisations/rivotra-freedom-cup", title:"RIVOTRA Freedom Cup 2026 — Le sport comme terrain d’activation et d’apprentissage", summary:"À Adzopé, une activation territoriale autour du football de proximité, associant RIVOTRA, une compétition Seniors et U17 et une immersion aux métiers de l’audiovisuel avec CDC IMMERSION.", image:"assets/img/rivotra-cover.jpg", alt:"Affiche de la RIVOTRA Freedom Cup 2026"},
    {slug:"cdc-immersion", href:"/realisations/cdc-immersion", title:"CDC IMMERSION — Découvrir les métiers de l’audiovisuel sportif", summary:"Une immersion pratique pour permettre à de jeunes participants de découvrir la couverture audiovisuelle d’un événement sportif, en situation réelle et avec encadrement.", image:"assets/img/cdc-immersion/cdc-immersion-01.jpg", alt:"Immersion CDC dans les métiers de l’audiovisuel sportif"},
    {slug:"communication-evenementielle-audiovisuelle", href:"/realisations/communication-evenementielle-audiovisuelle", title:"Communication événementielle et production audiovisuelle", summary:"Présentation de cette catégorie de réalisation. Les références, prestations et éléments de contexte seront ajoutés après validation.", image:"/illustrations/reference-audiovisuelle.svg", alt:"Communication événementielle et production audiovisuelle", note:"Présentation à compléter"}
  ],
  partnerBrands: ["RIVOTRA","CDC IMMERSION"],
  rivotra: {
    intro:"À Adzopé, CELESTRIIUM a conçu et coordonné une activation territoriale autour du football de proximité, associant RIVOTRA, une compétition Seniors et U17 et une immersion pratique aux métiers de l’audiovisuel avec CDC IMMERSION.",
    context:"Le projet utilise le football de proximité comme terrain de rencontre, d’animation locale et d’apprentissage.",
    roleC:"Ingénierie, organisation, coordination, communication, production de contenus et activation territoriale.",
    roleCDC:"CDC IMMERSION a permis à 13 jeunes de découvrir et pratiquer des métiers liés à la couverture audiovisuelle sportive, en situation réelle et avec encadrement. Il s’agissait d’une immersion et non d’une formation diplômante.",
    tournament:[["16","équipes Seniors"],["7","équipes U17"]],
    champions:[["Seniors","Champion : La Voix d’Adzopé FC"],["U17","Champion : FC Commi"]],
    results:[["≈ 172 300","vues"],["≈ 6 100","interactions"],["≈ 200","personnes par jour sur site (estimation)"]],
    resultsNote:"Indicateurs issus du bilan opérationnel 2026. Les vues ne sont pas des personnes uniques et la fréquentation est estimative. Les captures Facebook couvrent des périodes différentes et ne doivent pas être additionnées.",
    facebook:{
      followersByCity:[["Abidjan",42],["Adzopé",35.2],["Bouaké",3.1],["San-Pédro",1.1],["Yamoussoukro",0.8]],
      interactionsByFormat:[["Directs",1820],["Autres",1510],["Reels",1180],["Albums photos",662],["Photos",598]],
      sourceNote:"Source : captures d’écran des statistiques Meta/Facebook de la page RIVOTRA Freedom Cup, de fin juin à début août 2026. Les fenêtres observées varient selon l’indicateur.",
      followersNote:"Part des abonnés globaux de la page par ville ; cette répartition ne décrit pas l’origine géographique des vues.",
      formatsNote:"Valeurs arrondies et catégories Meta. Elles n’indiquent pas que ces contenus ont tous été produits par les jeunes de CDC IMMERSION.",
      validationNote:"Données et autorisations de publication validées par CELESTRIIUM."
    },
    radio:["Selon le bilan opérationnel communiqué par l’organisation, les rencontres à partir des quarts de finale ont été retransmises sur Radio Kanien FM, 99,9 MHz."],
    radioNote:"La couverture effective, l’audience et l’autorisation de citer le diffuseur restent à confirmer. Aucun chiffre d’audience radio n’est ajouté aux statistiques Facebook.",
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
  articles:[],
  footerText:"Agence de conseil et d’activation à impact basée en Côte d’Ivoire."
};
