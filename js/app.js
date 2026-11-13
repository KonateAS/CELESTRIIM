(() => {
  const root = document.documentElement;
  const themeButtons = [...document.querySelectorAll("[data-theme-choice]")];

  function applyTheme(theme) {
    const value = theme === "dark" ? "dark" : "light";
    root.dataset.theme = value;
    try {
      localStorage.setItem("celestrium-theme", value);
    } catch {}
    for (const button of themeButtons) {
      const active = button.dataset.themeChoice === value;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    }
  }

  let storedTheme = null;
  try {
    storedTheme = localStorage.getItem("celestrium-theme");
  } catch {}
  const preferredTheme = storedTheme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  applyTheme(preferredTheme);
  themeButtons.forEach((button) => button.addEventListener("click", () => applyTheme(button.dataset.themeChoice)));

  const menuButton = document.querySelector(".public-menu-toggle");
  const mobileMenu = document.querySelector(".public-mobile-menu");
  const backdrop = document.querySelector(".public-menu-backdrop");

  function closeMenu() {
    if (!menuButton || !mobileMenu) return;
    mobileMenu.hidden = true;
    if (backdrop) backdrop.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Ouvrir le menu");
  }

  menuButton?.addEventListener("click", () => {
    const opening = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(opening));
    menuButton.setAttribute("aria-label", opening ? "Fermer le menu" : "Ouvrir le menu");
    mobileMenu.hidden = !opening;
    if (backdrop) backdrop.hidden = !opening;
    if (opening) mobileMenu.querySelector("a")?.focus();
  });
  backdrop?.addEventListener("click", closeMenu);
  mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  for (const gallery of document.querySelectorAll("[data-case-gallery]")) {
    const viewport = gallery.querySelector("[data-gallery-viewport]");
    const track = gallery.querySelector(".immersive-gallery-track");
    const slides = [...gallery.querySelectorAll("[data-gallery-slide]")];
    const backdrop = gallery.querySelector("[data-gallery-backdrop]");
    const count = gallery.querySelector("[data-gallery-count]");
    const caption = gallery.querySelector("[data-gallery-caption]");
    let activeIndex = 0;
    let touchStart = null;

    const showImage = (index) => {
      if (!slides.length) return;
      activeIndex = (index + slides.length) % slides.length;
      const slide = slides[activeIndex];
      const image = slide.querySelector("img");
      const center = viewport.clientWidth / 2 - (slide.offsetLeft + slide.offsetWidth / 2);
      track.style.transform = `translate3d(${center}px, -50%, 0)`;
      slides.forEach((item, i) => item.setAttribute("aria-current", String(i === activeIndex)));
      if (count) count.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
      if (caption) caption.textContent = slide.querySelector("figcaption")?.textContent || "";
      if (backdrop && image) backdrop.style.setProperty("--gallery-image", `url(${JSON.stringify(image.currentSrc || image.src)})`);
    };

    gallery.querySelector("[data-gallery-prev]")?.addEventListener("click", () => showImage(activeIndex - 1));
    gallery.querySelector("[data-gallery-next]")?.addEventListener("click", () => showImage(activeIndex + 1));
    viewport.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") { event.preventDefault(); showImage(activeIndex - 1); }
      if (event.key === "ArrowRight") { event.preventDefault(); showImage(activeIndex + 1); }
    });
    viewport.addEventListener("touchstart", (event) => { touchStart = event.changedTouches[0]?.clientX ?? null; }, { passive: true });
    viewport.addEventListener("touchend", (event) => {
      const end = event.changedTouches[0]?.clientX;
      if (touchStart === null || end === undefined || Math.abs(end - touchStart) < 45) return;
      showImage(activeIndex + (end < touchStart ? 1 : -1));
      touchStart = null;
    }, { passive: true });
    window.addEventListener("resize", () => showImage(activeIndex), { passive: true });
    showImage(0);
  }

  const carousel = document.querySelector("[data-project-carousel]");
  if (carousel) {
    const viewport = carousel.querySelector("[data-project-viewport]");
    const slides = [...carousel.querySelectorAll("[data-project-slide]")];
    const dots = [...carousel.querySelectorAll("[data-project-dot]")];
    const count = carousel.querySelector("[data-project-count]");
    let activeIndex = 0;
    let frame = 0;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const setActive = (index) => {
      activeIndex = Math.max(0, Math.min(index, slides.length - 1));
      slides.forEach((slide, i) => slide.setAttribute("aria-current", String(i === activeIndex)));
      dots.forEach((dot, i) => dot.setAttribute("aria-pressed", String(i === activeIndex)));
      if (count) count.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    };

    const goTo = (index) => {
      if (!slides.length) return;
      const nextIndex = (index + slides.length) % slides.length;
      const viewportBox = viewport.getBoundingClientRect();
      const slideBox = slides[nextIndex].getBoundingClientRect();
      const left = viewport.scrollLeft + slideBox.left - viewportBox.left - (viewport.clientWidth - slideBox.width) / 2;
      viewport.scrollTo({ left, behavior: reducedMotion ? "auto" : "smooth" });
      setActive(nextIndex);
    };

    carousel.querySelector("[data-project-prev]")?.addEventListener("click", () => goTo(activeIndex - 1));
    carousel.querySelector("[data-project-next]")?.addEventListener("click", () => goTo(activeIndex + 1));
    dots.forEach((dot, index) => dot.addEventListener("click", () => goTo(index)));
    viewport.addEventListener("scroll", () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = 0;
        const center = viewport.getBoundingClientRect().left + viewport.clientWidth / 2;
        let nearest = 0;
        slides.forEach((slide, index) => {
          if (Math.abs(slide.getBoundingClientRect().left + slide.offsetWidth / 2 - center) < Math.abs(slides[nearest].getBoundingClientRect().left + slides[nearest].offsetWidth / 2 - center)) nearest = index;
        });
        setActive(nearest);
      });
    }, { passive: true });
    viewport.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") { event.preventDefault(); goTo(activeIndex - 1); }
      if (event.key === "ArrowRight") { event.preventDefault(); goTo(activeIndex + 1); }
    });
    setActive(0);
  }

  for (const form of document.querySelectorAll("form[data-async-contact]")) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = form.querySelector("button[type=submit]");
      const message = form.querySelector("[data-form-feedback]");
      if (button) button.disabled = true;
      if (message) {
        message.textContent = "Envoi en cours…";
        message.hidden = false;
      }
      try {
        const response = await fetch(form.action, { method: "POST", body: new URLSearchParams(new FormData(form)), headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" } });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Envoi impossible.");
        form.reset();
        if (message) message.textContent = result.message;
      } catch (error) {
        if (message) message.textContent = error instanceof Error ? error.message : "Une erreur est survenue. Réessaie.";
      } finally {
        if (button) button.disabled = false;
      }
    });
  }
})();
