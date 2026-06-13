const toolbar = document.querySelector("[data-toolbar]");
const navLinks = [...document.querySelectorAll(".toolbar-nav a")];
const experienceSection = document.querySelector(".experience");
const experienceItems = [...document.querySelectorAll("[data-experience-item]")];
const serviceRows = [...document.querySelectorAll("[data-service]")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const contactLinks = [...document.querySelectorAll('a[href="#contact"]')];

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

serviceRows.forEach((row) => {
  row.addEventListener("toggle", () => {
    if (!row.open) return;

    serviceRows.forEach((otherRow) => {
      if (otherRow !== row) {
        otherRow.open = false;
      }
    });
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
