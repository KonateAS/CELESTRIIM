/* Rendu des pages à partir de SITE (content.js). Aucune dépendance. */
(function(){
const S=SITE, page=document.body.dataset.page, root=document.documentElement;
const FALLBACK="data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><rect width="640" height="360" fill="#d9d2bd"/><circle cx="320" cy="180" r="60" fill="none" stroke="#0f3d2e" stroke-width="6"/><text x="320" y="300" text-anchor="middle" font-family="sans-serif" fill="#0f3d2e">Image à fournir</text></svg>');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const img=(s,a)=>`<img src="${esc(s)}" alt="${esc(a)}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK}'">`;

/* Thème : localStorage, sinon préférence système */
let theme=localStorage.getItem("theme")||(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light");
root.dataset.theme=theme;

const cur=h=>(location.pathname.endsWith(h)||(h==="index.html"&&page==="home")||(h==="realisations.html"&&page==="rivotra"))?' aria-current="page"':"";
const headerNav=S.nav.filter(([h])=>h!=="contact.html");
const header=()=>`<header class="site${page==="home"?" site--home":""}"><div class="wrap bar">
<a class="logo" href="index.html" aria-label="CELESTRIIUM, accueil"><img src="${S.logo}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'CELESTRIIUM'}))"></a>
<span class="spacer"></span>
<nav id="nav" aria-label="Navigation principale"><ul>${headerNav.map(([h,l])=>`<li><a href="${h}"${cur(h)}>${l}</a></li>`).join("")}</ul></nav>
<a class="btn btn--cta" href="contact.html">Contact</a>
<button class="icon-btn" id="theme" aria-label="Basculer entre thème clair et sombre">◐</button>
<button class="icon-btn menu-btn" id="menu" aria-expanded="false" aria-controls="nav" aria-label="Menu">☰</button>
</div></header>`;
const footer=()=>`<footer class="site"><div class="wrap foot">
<div><strong>CELESTRIIUM</strong><p>${S.footerText}</p></div>
<div><strong>Liens</strong><ul>${S.nav.map(([h,l])=>`<li><a href="${h}">${l}</a></li>`).join("")}</ul></div>
<div><strong>Contact</strong><p>${S.contact.email?esc(S.contact.email):"Coordonnées à renseigner."}</p></div>
</div><p class="wrap" style="opacity:.8;font-size:.9rem">© ${new Date().getFullYear()} CELESTRIIUM. Tous droits réservés.</p></footer>`;

const cta=()=>`<section class="section section--alt"><div class="wrap"><h2>Un projet à impact ?</h2><p>Parlons de la façon de le concrétiser.</p><a class="btn" href="contact.html">Parlons de votre projet</a></div></section>`;
const sec=(t,b,alt)=>`<section class="section${alt?" section--alt":""}"><div class="wrap reveal"><h2>${t}</h2>${b}</div></section>`;
const cards=a=>`<div class="grid">${a.map(([t,d])=>`<div class="card"><h3>${t}</h3><p>${d}</p></div>`).join("")}</div>`;
const methodCards=()=>`<div class="method-grid">${S.method.map(([t,d],i)=>`<article class="method-step"><span class="method-step__number">0${i+1}</span><h3>${t}</h3><p>${d}</p></article>`).join("")}</div>`;
const approachCards=()=>`<div class="approach-grid">${S.approach.map(([t,d],i)=>`<article class="approach-card"><span class="approach-card__number">0${i+1}</span><h3>${t}</h3><p>${d}</p></article>`).join("")}</div>`;
const projectCards=()=>`<div class="grid">${S.projects.map(p=>`<article class="card">${img(p.image,p.alt)}<h3>${p.title}</h3><p>${p.summary}</p>${p.href?`<a href="${p.href}">Lire l\u00e9tude de cas \u2192</a>`:`<p class="note">${p.note||"Pr\u00e9sentation \u00e0 compl\u00e9ter"}</p>`}</article>`).join("")}</div>`;
const expertiseIcons=[
  '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="13"></circle><path d="M24 7v7M24 34v7M7 24h7M34 24h7"></path></svg>',
  '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 34 24 10l14 24"></path><path d="M15 27h18M19 20h10"></path></svg>',
  '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 12h32v24H8z"></path><path d="m8 16 16 12 16-12"></path></svg>',
  '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="15"></circle><path d="M24 9v15l10 7"></path></svg>'
];
const expertises=()=>`<div class="expertise-grid">${S.expertises.map((e,i)=>`<article class="card expertise-card${i===1?" expertise-card--focus":""}"><div class="expertise-card__icon">${expertiseIcons[i]}</div><h3>${e.t}</h3><p>${e.d}</p><p class="expertise-card__label"><strong>Besoins couverts</strong></p><ul>${e.n.map(x=>`<li>${x}</li>`).join("")}</ul><a class="expertise-card__link" href="contact.html?sujet=${encodeURIComponent(e.t)}"><span>Nous contacter</span><span aria-hidden="true">→</span></a></article>`).join("")}</div>`;
const stats=a=>`<div class="grid">${a.map(([n,l])=>`<div class="card"><div class="stat">${n}</div>${l}</div>`).join("")}</div>`;

const R=S.rivotra, C=S.cdcImmersion;
const views={
home:()=>`<section class="hero"><div class="hero__glow hero__glow--one" aria-hidden="true"></div><div class="hero__glow hero__glow--two" aria-hidden="true"></div><div class="hero__visual tilt" aria-hidden="true"><div class="hero__stack"><div class="hero__image-card hero__image-card--back">${img("assets/img/rivotra/rivotra-04.jpg","")}</div><div class="hero__image-card hero__image-card--middle">${img("assets/img/rivotra/rivotra-05.jpg","")}</div><div class="hero__image-card hero__image-card--front">${img("assets/img/rivotra/rivotra-06.jpg","")}</div></div></div><div class="wrap hero__content"><div class="hero__copy"><h1 class="hero__headline" aria-live="polite">${S.hero.slides.map((slide,i)=>`<span class="hero__headline-slide${i===0?" is-active":""}"${i===0?'':' aria-hidden="true"'}>${slide}</span>`).join("")}</h1><p class="hero__intro">${S.hero.text||"Conseil RSE, stratégie d’impact et projets responsables au service d’une performance qui dure."}</p><div class="hero__actions"><a class="btn hero__primary-cta" href="contact.html">Parlons de votre projet</a><a class="hero__secondary-cta" href="realisations.html">Découvrir nos réalisations</a></div></div></div><div class="hero__bottom"><p class="eyebrow">Conseil · activation · impact</p></div></section>`
 +`<section class="section conviction-section"><div class="wrap conviction-container"><div class="conviction-content"><span class="section-tag">Notre vision</span><h2>La conviction</h2><p class="lead">${S.conviction}</p><a class="conviction-link" href="a-propos.html"><span>Découvrir notre approche</span><span class="conviction-link__arrow" aria-hidden="true">→</span></a></div><div class="conviction-visual"><div class="quote-card"><span class="quote-mark" aria-hidden="true">“</span><p>Relier l’ambition économique aux responsabilités sociales et environnementales.</p><span class="quote-author">CELESTRIIUM</span></div></div></div></section>`
 +sec("Les 4 expertises clés",expertises(),1)
 +sec("Notre approche",approachCards()+`<p class="section__action"><a class="btn btn--ghost" href="realisations.html">Découvrir nos réalisations</a></p>`)
 +sec("Réalisations récentes",projectCards(),1)+cta(),
about:()=>sec("À propos",`<p>${S.about.mission}</p><h3>Nos valeurs</h3>${cards(S.about.values)}<h3>Notre manière de travailler</h3><p>${S.about.way}</p>`)+cta(),
expertises:()=>sec("Expertises",expertises()),
projects:()=>sec("Réalisations",projectCards()),
partners:()=>sec("Partenariats",`<p>${S.partners}</p>`)+cta(),
articles:()=>sec("Perspectives",`<div class="grid">${S.articles.map(a=>`<article class="card">${img(a.image,a.alt)}<h3>${a.title}</h3><p>${a.summary}</p><p class="note"><time datetime="${a.date}">${new Date(a.date).toLocaleDateString("fr-FR")}</time>${a.example?" · exemple à compléter":""}</p><a href="${a.href}">Lire →</a></article>`).join("")}</div>`),
rivotra:()=>sec(S.projects[0].title,`<p>${R.intro}</p>`)
 +sec("Contexte et objectifs",`<p>${R.context}</p>`,1)
 +sec("Le rôle de CELESTRIIUM",`<p>${R.roleC}</p>`)+sec("Le rôle de CDC IMMERSION",`<p>${R.roleCDC}</p>`,1)
 +sec("Le tournoi",stats(R.tournament)+`<div style="height:1rem"></div>`+cards(R.champions))
 +sec("Résultats",stats(R.results)+`<p class="note">${R.resultsNote}</p>`,1)
 +sec("Relais radio",R.radio.map(t=>`<p>${t}</p>`).join(""))
 +sec("Galerie",`<div class="gallery">${R.gallery.map(g=>`<figure style="margin:0">${img(g.src,g.alt)}<figcaption>${g.cap}</figcaption></figure>`).join("")}</div>`,1)
 +sec("Vidéo",`<video controls playsinline preload="metadata" poster="${R.video.poster}"><source src="${R.video.src}" type="video/mp4">Votre navigateur ne lit pas cette vidéo.</video>`)
 +sec("Partenaires",`<p>${R.partners.join(" · ")}</p>`,1)+cta(),
cdc:()=>sec(S.projects[1].title,`<p>${C.intro}</p>`)
 +sec("Le principe de l’immersion",`<p>${C.context}</p>`,1)
 +sec("Galerie",`<div class="gallery">${C.gallery.map(g=>`<figure style="margin:0">${img(g.src,g.alt)}<figcaption>${g.cap}</figcaption></figure>`).join("")}</div>`)
 +cta(),
contact:()=>sec("Contact",`<p class="note"><strong>Formulaire de démonstration :</strong> aucun serveur n’est connecté, les messages ne sont pas envoyés.</p>
<form id="form" novalidate>
<div><label for="nom">Nom</label><input id="nom" required autocomplete="name"><div class="err" id="e-nom"></div></div>
<div><label for="org">Organisation (facultatif)</label><input id="org" autocomplete="organization"></div>
<div><label for="email">Adresse e-mail</label><input id="email" type="email" required autocomplete="email"><div class="err" id="e-email"></div></div>
<div><label for="sujet">Sujet</label><input id="sujet" required><div class="err" id="e-sujet"></div></div>
<div><label for="msg">Message</label><textarea id="msg" rows="6" required></textarea><div class="err" id="e-msg"></div></div>
<button class="btn" type="submit">Envoyer (démonstration)</button><div id="status" role="status" aria-live="polite"></div></form>
${S.contact.email?`<p>E-mail : ${esc(S.contact.email)}</p>`:""}`)
};
document.getElementById("app").innerHTML=header()+`<main id="main">${views[page]()}</main>`+footer();

/* Menu mobile (clic + clavier, Échap ferme) et thème */
const nav=document.getElementById("nav"),menu=document.getElementById("menu");
const setMenu=o=>{nav.classList.toggle("open",o);menu.setAttribute("aria-expanded",o)};
menu.onclick=()=>setMenu(!nav.classList.contains("open"));
document.addEventListener("keydown",e=>{if(e.key==="Escape"){setMenu(false);menu.focus()}});
document.getElementById("theme").onclick=()=>{theme=theme==="dark"?"light":"dark";root.dataset.theme=theme;localStorage.setItem("theme",theme)};

/* Apparition douce, désactivée si prefers-reduced-motion */
const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
/* Scroll depth: the home hero recedes as the story begins, while content
   sections gain a subtle layered entrance. Keep the work on one rAF frame. */
if(!reduce){
  const hero=document.querySelector(".hero");
  const sections=[...document.querySelectorAll("main .section")];
  const textureStart=document.querySelector(".conviction-section")||sections[1]||sections[0];
  let scrollFrame=0;
  const updateScrollDepth=()=>{
    scrollFrame=0;
    const y=window.scrollY||0;
    const pageProgress=Math.max(0,Math.min(1,y/Math.max(1,document.documentElement.scrollHeight-window.innerHeight)));
    root.style.setProperty("--scroll-progress",`${pageProgress}`);
    const textureStartY=textureStart?Math.max(0,y+textureStart.getBoundingClientRect().top-window.innerHeight*.78):0;
    const textureRange=Math.max(1,document.documentElement.scrollHeight-window.innerHeight-textureStartY);
    const textureProgress=Math.max(0,Math.min(1,(y-textureStartY)/textureRange));
    root.style.setProperty("--texture-y",`${(textureProgress-.5)*72}px`);
    root.style.setProperty("--texture-scale",`${1.42-textureProgress*.42}`);
    root.style.setProperty("--texture-opacity",y>=textureStartY?"1":"0");
    if(hero){
      const progress=Math.min(1,Math.max(0,y/Math.max(1,hero.offsetHeight)));
      hero.style.setProperty("--hero-scroll",progress.toFixed(3));
      hero.style.setProperty("--hero-y",`${progress*8}vh`);
      hero.style.setProperty("--hero-scale",`${1+progress*.12}`);
      hero.style.setProperty("--hero-image-scale",`${1.1+progress*.12}`);
      hero.style.setProperty("--copy-y",`${progress*-12}vh`);
      hero.style.setProperty("--copy-scale",`${1-progress*.08}`);
      hero.style.setProperty("--copy-opacity",`${Math.max(0,1-progress*1.4)}`);
      hero.style.setProperty("--bottom-opacity",`${Math.max(0,1-progress*3)}`);
    }
    const depthTargets=[...document.querySelectorAll(".section, .card, .method-step, .approach-card, .quote-card, .gallery figure")];
    const depths=depthTargets.map(el=>{
      const rect=el.getBoundingClientRect();
      const distance=(rect.top+rect.height*.5-window.innerHeight*.5)/window.innerHeight;
      const depth=Math.max(-1,Math.min(1,distance));
      const proximity=1-Math.min(1,Math.abs(distance));
      return {el,depth,proximity};
    });
    depths.forEach(({el,depth,proximity})=>{
      el.style.setProperty("--scroll-depth-y",`${depth*18}px`);
      el.style.setProperty("--scroll-depth-rotate",`${depth*-1.15}deg`);
      el.style.setProperty("--scroll-depth-z",`${proximity*24}px`);
      const maxZoom=el.classList.contains("section") ? .06 : .14;
      el.style.setProperty("--scroll-depth-scale",`${1+proximity*maxZoom}`);
    });
  };
  const requestScrollDepth=()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScrollDepth)};
  window.addEventListener("scroll",requestScrollDepth,{passive:true});
  window.addEventListener("resize",requestScrollDepth,{passive:true});
  updateScrollDepth();
}
const headlineSlides=[...document.querySelectorAll(".hero__headline-slide")];
if(headlineSlides.length>1&&!reduce){
  let activeSlide=0;
  const rotateHeadline=()=>{
    headlineSlides[activeSlide].classList.remove("is-active");
    headlineSlides[activeSlide].setAttribute("aria-hidden","true");
    activeSlide=(activeSlide+1)%headlineSlides.length;
    headlineSlides[activeSlide].classList.add("is-active");
    headlineSlides[activeSlide].removeAttribute("aria-hidden");
  };
  window.setInterval(rotateHeadline,3500);
}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.1});
document.querySelectorAll(".reveal").forEach(el=>reduce?el.classList.add("in"):io.observe(el));

if(!reduce){
document.querySelectorAll(".tilt, .card:not(.expertise-card), .gallery figure").forEach(el=>{
el.addEventListener("pointermove",e=>{
const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
el.style.setProperty("--tilt-x",`${y*-5}deg`);el.style.setProperty("--tilt-y",`${x*5}deg`);
});
el.addEventListener("pointerleave",()=>{el.style.setProperty("--tilt-x","0deg");el.style.setProperty("--tilt-y","0deg")});
});
}

/* Formulaire : validation navigateur uniquement, aucun envoi */
const f=document.getElementById("form");
if(f){const q=new URLSearchParams(location.search).get("sujet");if(q)f.querySelector("#sujet").value=q;
f.onsubmit=e=>{e.preventDefault();let ok=true;
[["nom","Indiquez votre nom."],["email","Indiquez une adresse e-mail valide."],["sujet","Indiquez un sujet."],["msg","Écrivez votre message."]].forEach(([id,m])=>{
const el=f.querySelector("#"+id),bad=!el.value.trim()||(id==="email"&&!el.checkValidity());
document.getElementById("e-"+id).textContent=bad?m:"";el.setAttribute("aria-invalid",bad);if(bad)ok=false});
document.getElementById("status").innerHTML=ok?'<div class="status">Formulaire valide. Il s’agit d’une démonstration : aucun message n’a été envoyé.</div>':"";};}
})();
