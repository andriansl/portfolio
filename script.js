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
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const splitGroups = (textGroups) => {
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

  splitGroups([...document.querySelectorAll(".hanzo-title [data-split-text]")]);
  splitGroups([...document.querySelectorAll(".hanzo-mobile-title [data-split-text]")]);
};

const splitProximityText = () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const targets = [...document.querySelectorAll("[data-proximity-text]")];
  let timelineOffset = 160;

  const createCharacterSpan = (character, state) => {
    const span = document.createElement("span");
    span.className = "hanzo-char";
    span.textContent = character;
    span.style.setProperty(
      "--char-delay",
      prefersReducedMotion ? "0ms" : `${timelineOffset + state.charIndex * 14}ms`,
    );
    state.charIndex += 1;
    return span;
  };

  const splitTextNode = (node, state) => {
    const fragment = document.createDocumentFragment();
    const parts = (node.textContent || "").match(/\S+|\s+/g) || [];

    parts.forEach((part) => {
      if (/^\s+$/.test(part)) {
        const space = document.createElement("span");
        space.className = "hanzo-space";
        space.textContent = part;
        fragment.append(space);
        return;
      }

      const word = document.createElement("span");
      word.className = "hanzo-word-unit";

      [...part].forEach((character) => {
        word.append(createCharacterSpan(character, state));
      });

      fragment.append(word);
    });

    node.replaceWith(fragment);
  };

  const splitNode = (node, state) => {
    if (node.nodeType === Node.TEXT_NODE) {
      splitTextNode(node, state);
      return;
    }

    if (
      node.nodeType !== Node.ELEMENT_NODE ||
      node.classList.contains("hanzo-char") ||
      node.classList.contains("hanzo-word-unit")
    ) {
      return;
    }

    [...node.childNodes].forEach((child) => splitNode(child, state));
  };

  targets.forEach((target) => {
    if (target.dataset.proximitySplit === "true") return;

    const state = { charIndex: 0 };
    [...target.childNodes].forEach((node) => splitNode(node, state));
    target.dataset.proximitySplit = "true";
    timelineOffset += Math.min(280, state.charIndex * 8 + 80);
  });
};

const initHeroVariableProximity = () => {
  const letters = [...document.querySelectorAll(".hanzo-char")];

  if (!letters.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const pointer = { x: null, y: null };
  const mobileQuery = window.matchMedia("(max-width: 767px)");
  let frameId = 0;

  const ease = (value) => value * value * (3 - 2 * value);

  const setLetters = () => {
    frameId = 0;

    if (pointer.x === null || pointer.y === null) {
      letters.forEach((letter) => {
        letter.style.removeProperty("--proximity-wght");
        letter.style.removeProperty("--proximity-opsz");
      });
      return;
    }

    const radius = mobileQuery.matches ? 92 : 150;

    letters.forEach((letter) => {
      const rect = letter.getBoundingClientRect();
      const letterX = rect.left + rect.width / 2;
      const letterY = rect.top + rect.height / 2;
      const distance = Math.hypot(pointer.x - letterX, pointer.y - letterY);
      const proximity = ease(Math.max(0, Math.min(1, 1 - distance / radius)));
      const weight = 500 + proximity * 260;
      const opticalSize = 96 + proximity * 48;

      letter.style.setProperty("--proximity-wght", weight.toFixed(1));
      letter.style.setProperty("--proximity-opsz", opticalSize.toFixed(1));
    });
  };

  const schedule = () => {
    if (frameId) return;
    frameId = requestAnimationFrame(setLetters);
  };

  const updatePointer = (x, y) => {
    pointer.x = x;
    pointer.y = y;
    schedule();
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      updatePointer(event.clientX, event.clientY);
    },
    { passive: true },
  );

  document.addEventListener("mouseleave", () => {
    pointer.x = null;
    pointer.y = null;
    schedule();
  });

  window.addEventListener(
    "touchmove",
    (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      updatePointer(touch.clientX, touch.clientY);
    },
    { passive: true },
  );
};

const splitExperienceTypingText = (element, baseDelay = 0) => {
  if (!element || element.dataset.experienceSplit === "true") return;

  let wordIndex = 0;
  const fragment = document.createDocumentFragment();

  const appendText = (text, target) => {
    text.split(/(\s+)/).forEach((part) => {
      if (!part) return;

      if (/^\s+$/.test(part)) {
        target.append(document.createTextNode(part));
        return;
      }

      const word = document.createElement("span");
      word.className = "experience-type-word";
      word.textContent = part;
      word.style.setProperty("--experience-word-delay", `${baseDelay + wordIndex * 54}ms`);
      wordIndex += 1;

      target.append(word);
    });
  };

  [...element.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      appendText(node.textContent || "", fragment);
      return;
    }

    if (node.nodeName === "BR") {
      fragment.append(document.createElement("br"));
    }
  });

  element.textContent = "";
  element.append(fragment);
  element.dataset.experienceSplit = "true";
};

const initExperienceReveal = () => {
  if (!experienceSection || !experienceItems.length) return;

  const mobileQuery = window.matchMedia("(max-width: 767px)");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!mobileQuery.matches) return;

  experienceSection.classList.add("is-mobile-animated");

  const showExperience = () => {
    experienceItems.forEach((item) => {
      item.classList.add("is-experience-visible");
    });
  };

  if (prefersReducedMotion) {
    showExperience();
    return;
  }

  experienceItems.forEach((item, itemIndex) => {
    item.style.setProperty("--experience-item-delay", `${itemIndex * 120}ms`);
    splitExperienceTypingText(item.querySelector(".experience-description-mobile"), 180);
  });

  if (!("IntersectionObserver" in window)) {
    showExperience();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        showExperience();
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -12% 0px",
    },
  );

  observer.observe(experienceSection);
};

splitHeroText();
splitProximityText();
initHeroVariableProximity();
initExperienceReveal();
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

let scrollUpdatePending = false;

const updateScrollState = () => {
  scrollUpdatePending = false;
  updateToolbar();
  updateExperience();
};

const scheduleScrollUpdate = () => {
  if (scrollUpdatePending) return;

  scrollUpdatePending = true;
  requestAnimationFrame(updateScrollState);
};

window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
window.addEventListener("resize", () => {
  scheduleScrollUpdate();
});
updateScrollState();


const initDesignStack = () => {
  const section = document.querySelector("[data-design-stack]");
  if (!section) return;
  const cardsWrap = section.querySelector(".design-stack__cards");
  const cards = [...section.querySelectorAll(".design-stack-card")];
  if (!cards.length || !cardsWrap) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || window.matchMedia("(max-width: 767px)").matches) return;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const smoothstep = value => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };

  const targetDepths = [1.12, 0.72, 0];
  const overlapDistance = 180;
  const releaseHysteresis = 12;
  let ticking = false;
  let released = false;
  let releaseScrollY = null;

  const applyState = (card, depth) => {
    const scale = Math.max(0.91, 1 - depth * 0.038);
    const y = -depth * 5;
    const blur = depth * 0.12;
    card.style.setProperty("--stack-scale", scale.toFixed(4));
    card.style.setProperty("--stack-y", `${y.toFixed(2)}px`);
    card.style.setProperty("--stack-blur", `${blur.toFixed(2)}px`);
  };

  const getOverlapProgress = baseIndex => {
    const currentCard = cards[baseIndex];
    const nextCard = cards[baseIndex + 1];
    if (!currentCard || !nextCard) return 0;

    const currentContent = currentCard.querySelector(".design-stack-card__content");
    const contentRect = currentContent?.getBoundingClientRect();
    const nextRect = nextCard.getBoundingClientRect();
    if (!contentRect) return 0;

    const freezeLine = contentRect.top - 18;
    const startLine = freezeLine + overlapDistance;
    return smoothstep((startLine - nextRect.top) / overlapDistance);
  };

  const clearRelease = () => {
    released = false;
    releaseScrollY = null;
    section.classList.remove("is-stack-released");
    cardsWrap.style.height = "";
    cards.forEach(card => card.style.removeProperty("--frozen-top"));
  };

  const releaseStack = () => {
    if (released) return;
    released = true;
    releaseScrollY = window.scrollY;

    const wrapRect = cardsWrap.getBoundingClientRect();
    let maxBottom = 0;

    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const top = rect.top - wrapRect.top;
      const bottom = rect.bottom - wrapRect.top;
      maxBottom = Math.max(maxBottom, bottom);
      card.style.setProperty("--frozen-top", `${top.toFixed(2)}px`);
    });

    cardsWrap.style.height = `${Math.ceil(maxBottom + 24)}px`;
    section.classList.add("is-stack-released");
  };

  const update = () => {
    ticking = false;

    if (released) {
      if (window.scrollY < (releaseScrollY - releaseHysteresis)) {
        clearRelease();
      } else {
        return;
      }
    }

    const progress01 = getOverlapProgress(0);
    const progress12 = getOverlapProgress(1);

    const depths = [
      targetDepths[0] * progress01,
      targetDepths[1] * progress12,
      targetDepths[2]
    ];

    cards.forEach((card, index) => {
      applyState(card, depths[index] || 0);
    });

    if (progress12 >= 0.999) {
      releaseStack();
    }
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  update();
};

initDesignStack();



const initDesignStackSpotlight = () => {
  const cards = document.querySelectorAll(".design-stack-card");
  if (!cards.length) return;

  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
      card.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
      card.style.setProperty("--spotlight-opacity", "1");
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--spotlight-opacity", "0");
    });
  });
};

initDesignStackSpotlight();
