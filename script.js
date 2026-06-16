const toolbar = document.querySelector("[data-toolbar]");
const navLinks = [...document.querySelectorAll(".toolbar-nav a")];
const experienceSection = document.querySelector(".experience");
const experienceItems = [...document.querySelectorAll("[data-experience-item]")];
const howWorkItems = [...document.querySelectorAll("[data-work-item]")];
const sections = navLinks
  .map((link) => {
    const href = link.getAttribute("href");
    return href && href.startsWith("#") ? document.querySelector(href) : null;
  })
  .filter(Boolean);
const contactLinks = [...document.querySelectorAll('a[href="#contact"]')];

const initAboutReveal = () => {
  const aboutSection = document.querySelector(".about-reveal");
  if (!aboutSection) return;

  const aboutVisual = aboutSection.querySelector("[data-about-animated-src]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const showAbout = () => {
    const animatedSrc = aboutVisual?.getAttribute("data-about-animated-src");

    if (!prefersReducedMotion && animatedSrc && aboutVisual.getAttribute("src") !== animatedSrc) {
      aboutVisual.setAttribute("src", animatedSrc);
    }

    aboutSection.classList.add("is-visible");
  };

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    showAbout();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        showAbout();
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -10% 0px",
    },
  );

  observer.observe(aboutSection);
};

const initHeroLogoStrip = () => {
  const strip = document.querySelector(".hero-logo-strip");
  const viewport = strip?.closest(".hanzo-media--mark");
  const slots = strip ? [...strip.querySelectorAll(".hanzo-logo-slot")] : [];

  if (!strip || !viewport || !slots.length) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeLogo = "";
  let rafId = 0;

  const setActiveLogo = (nextLogo) => {
    if (!nextLogo || nextLogo === activeLogo) return;

    activeLogo = nextLogo;
    slots.forEach((slot) => {
      slot.classList.toggle("is-active", slot.dataset.logo === activeLogo);
    });
  };

  const updateActiveLogo = () => {
    const viewportRect = viewport.getBoundingClientRect();
    const activeX = viewportRect.left + viewportRect.width * 0.5;
    let nextLogo = "";
    let closestDistance = Number.POSITIVE_INFINITY;

    slots.forEach((slot) => {
      const rect = slot.getBoundingClientRect();
      const visibleWidth = Math.min(rect.right, viewportRect.right) - Math.max(rect.left, viewportRect.left);
      const visibleRatio = Math.max(0, Math.min(1, visibleWidth / rect.width));

      if (visibleRatio < 0.48) return;

      const center = rect.left + rect.width / 2;
      const distance = Math.abs(center - activeX);

      if (distance < closestDistance) {
        closestDistance = distance;
        nextLogo = slot.dataset.logo || "";
      }
    });

    setActiveLogo(nextLogo);
    rafId = requestAnimationFrame(updateActiveLogo);
  };

  if (prefersReducedMotion) {
    setActiveLogo(slots[0]?.dataset.logo || "");
    return;
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
      rafId = 0;
      return;
    }

    if (!rafId) {
      rafId = requestAnimationFrame(updateActiveLogo);
    }
  });

  rafId = requestAnimationFrame(updateActiveLogo);
};

const isAtPageBottom = () =>
  window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;

const splitHeroText = () => {
  const textGroups = [...document.querySelectorAll("[data-split-text]")];
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let timelineOffset = 430;

  textGroups.forEach((group, groupIndex) => {
    const text = group.textContent || "";
    group.textContent = "";

    [...text].forEach((character, charIndex) => {
      const span = document.createElement("span");

      if (character === " ") {
        span.className = "hanzo-space";
        span.textContent = " ";
      } else {
        span.className = "hanzo-char";
        span.textContent = character;
        span.style.setProperty(
          "--char-delay",
          prefersReducedMotion ? "0ms" : `${timelineOffset + charIndex * 22}ms`,
        );
      }

      group.append(span);
    });

    timelineOffset += text.replace(/\s/g, "").length * 22 + (groupIndex % 2 === 0 ? 170 : 200);
  });
};

splitHeroText();
initAboutReveal();
initHeroLogoStrip();

requestAnimationFrame(() => {
  document.body.classList.add("is-loaded");
});

const updateToolbar = () => {
  if (!toolbar) return;

  toolbar.classList.toggle("is-compact", window.scrollY > 36);

  const active = isAtPageBottom()
    ? document.querySelector("#contact")
    : sections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= 150 && rect.bottom > 150;
      });

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${active?.id}`);
  });
};

contactLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();

    window.scrollTo({
      top: document.documentElement.scrollHeight - window.innerHeight,
      behavior: "smooth",
    });
  });
});

const setHowWorkItemOpen = (activeItem) => {
  howWorkItems.forEach((item) => {
    const isOpen = Boolean(activeItem) && item === activeItem;
    const trigger = item.querySelector(".how-i-work__trigger");
    const icon = item.querySelector(".how-i-work__icon");

    item.classList.toggle("is-open", isOpen);
    trigger?.setAttribute("aria-expanded", String(isOpen));

    if (icon) {
      icon.textContent = isOpen ? "−" : "+";
    }
  });
};

howWorkItems.forEach((item) => {
  item.querySelector(".how-i-work__trigger")?.addEventListener("click", () => {
    setHowWorkItemOpen(item.classList.contains("is-open") ? null : item);
  });
});

const setActiveExperience = (activeItem) => {
  const activeIndex = experienceItems.indexOf(activeItem);

  experienceItems.forEach((item) => {
    item.classList.toggle("is-active", Boolean(activeItem) && item === activeItem);
  });

  experienceSection?.style.setProperty("--experience-active", String(Math.max(activeIndex, 0)));
};

const updateExperience = () => {
  if (!experienceItems.length || !experienceSection) return;

  const readingLine = window.innerHeight * 0.48;
  const sectionRect = experienceSection.getBoundingClientRect();

  if (sectionRect.top > readingLine || sectionRect.bottom < readingLine) {
    setActiveExperience(null);
    return;
  }

  const closestItem = experienceItems.reduce((closest, item) => {
    const rect = item.getBoundingClientRect();
    const itemCenter = rect.top + rect.height / 2;
    const distance = Math.abs(itemCenter - readingLine);

    return distance < closest.distance ? { item, distance } : closest;
  }, { item: experienceItems[0], distance: Number.POSITIVE_INFINITY }).item;

  setActiveExperience(closestItem);
};

window.addEventListener("scroll", updateToolbar, { passive: true });
window.addEventListener("scroll", updateExperience, { passive: true });
window.addEventListener("resize", () => {
  updateToolbar();
  updateExperience();
});
updateToolbar();
updateExperience();
