/* ============================================================
   script.js — Andrian Sl Portfolio
   JavaScript відповідає тільки за поведінку:
   1. Мобільне меню (бургер) + доступність
   2. Тінь хедера при скролі
   3. Плавна поява елементів при скролі (Intersection Observer)

   Стилі .fade-in і .fade-in.visible — у styles.css
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  // ---- 1. ПЕРЕВІРКА REDUCED MOTION ----
  // Якщо користувач вимкнув анімації в системі — не запускаємо fade-in
  var prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;


  // ---- 2. МОБІЛЬНЕ МЕНЮ ----
  var burger = document.getElementById('burger');
  var nav    = document.getElementById('nav');

  // Функція відкриття меню
  function openMenu() {
    burger.classList.add('open');
    nav.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');  // для screen readers
  }

  // Функція закриття меню
  function closeMenu() {
    burger.classList.remove('open');
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false'); // для screen readers
  }

  if (burger && nav) {

    // Відкриваємо/закриваємо меню при кліку на бургер
    burger.addEventListener('click', function () {
      var isOpen = burger.classList.contains('open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Закриваємо меню при кліку на навігаційне посилання
    nav.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    // Закриваємо меню по клавіші Escape
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && burger.classList.contains('open')) {
        closeMenu();
        burger.focus(); // повертаємо фокус на бургер після закриття
      }
    });

  }


  // ---- 3. ТІНЬ ХЕДЕРА ПРИ СКРОЛІ ----
  var header = document.getElementById('header');

  if (header) {
    window.addEventListener('scroll', function () {
      // Якщо прокрутили більше 20px — додаємо клас .scrolled
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // ---- 4. HERO — FIGMA SVG ANIMATION ----
  var figmaHero = document.querySelector(".hero--figma .hero-svg");

  if (figmaHero && !prefersReducedMotion) {
    var heroFrame = document.querySelector(".hero--figma .hero__figma-frame");
    var targetConfig = [
      { id: "top left bar", strength: 16 },
      { id: "top right bar", strength: 16 },
      { id: "coment", strength: 24 },
      { id: "Toggle", strength: 18 },
      { id: "eye icon", strength: 20 },
      { id: "eye icon 2", strength: 20 },
      { id: "plashka", strength: 22 },
      { id: "plashka 2", strength: 22 },
      { id: "plashka3", strength: 22 },
      { id: "plaska 4", strength: 22 }
    ];

    if (heroFrame) {
      heroFrame.classList.add("is-ready");
    }

    targetConfig.forEach(function (item) {
      var el = document.getElementById(item.id);

      if (!el) return;

      el.classList.add("anim-target");

      el.addEventListener("pointermove", function (event) {
        var rect = el.getBoundingClientRect();
        var nx = rect.width
          ? (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
          : 0;
        var ny = rect.height
          ? (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
          : 0;
        var moveX = -nx * item.strength;
        var moveY = -ny * item.strength;

        el.style.transform =
          "translate(" + moveX.toFixed(2) + "px, " + moveY.toFixed(2) + "px) scale(1.035)";
      });

      el.addEventListener("pointerleave", function () {
        el.style.transform = "";
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key.toLowerCase() === "f") {
        document.documentElement.requestFullscreen?.();
      }
    });
  }

  // ---- 4. ПЛАВНА ПОЯВА ЕЛЕМЕНТІВ ПРИ СКРОЛІ ----
  // Примітка: стилі .fade-in і .fade-in.visible визначені у styles.css

  // Вибираємо всі елементи, які хочемо анімувати
  var targets = document.querySelectorAll(
    '.service-item, .process__step, .about__body, .about__heading'
  );

  // Якщо користувач вимкнув анімації — одразу показуємо всі елементи
  if (prefersReducedMotion) {
    targets.forEach(function (el) {
      el.classList.add('visible'); // без fade-in, просто видимі
    });
    return; // зупиняємо виконання решти коду
  }

  // Додаємо клас .fade-in (початковий прихований стан)
  targets.forEach(function (el) {
    el.classList.add('fade-in');
  });

  // ---- 5. CASCADE ЗАТРИМКА ДЛЯ КАРТОК ----
  // Картки з'являються по черзі з невеликою затримкою
  document.querySelectorAll('.services__list .service-item').forEach(function (item, index) {
    item.style.transitionDelay = (index * 0.06) + 's';
  });

  // ---- 6. INTERSECTION OBSERVER ----
  // Стежимо, коли елемент потрапляє у зону видимості

  // Fallback: якщо браузер не підтримує IntersectionObserver
  // (дуже старі браузери) — одразу показуємо всі елементи
  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  // Створюємо спостерігач
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // Елемент потрапив у видиму зону — показуємо його
          entry.target.classList.add('visible');
          // Зупиняємо спостереження — анімація потрібна тільки раз
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1, // спрацьовує, коли 10% елемента видно
    }
  );

  // Запускаємо спостереження для кожного елемента
  targets.forEach(function (el) {
    observer.observe(el);
  });


});

// ---- SELECTED PROJECTS CAROUSEL ----
document.addEventListener('DOMContentLoaded', function () {
  const carousel = document.querySelector("[data-carousel]");
      if (!carousel) return;
      const track = carousel.querySelector("[data-track]");
      const pages = [...carousel.querySelectorAll("[data-page]")];
      const dots = [...carousel.querySelectorAll("[data-dot]")];
      const pageCount = pages.length;
      let activePage = 0;
      let animationTimer = null;
  
      function pageOffset(page) {
        const targetPage = pages[page];
  
        if (!targetPage) {
          return 0;
        }
  
        return targetPage.offsetLeft;
      }
  
      function setPage(page, animate = true) {
        const previousPage = activePage;
        activePage = Math.max(0, Math.min(page, pageCount - 1));
  
        dots.forEach((dot, dotIndex) => {
          dot.setAttribute("aria-selected", dotIndex === activePage ? "true" : "false");
        });
  
        if (animationTimer) {
          window.clearTimeout(animationTimer);
        }
  
        if (animate) {
          track.classList.add("is-switching");
          pages.forEach((pageElement, pageIndex) => {
            pageElement.classList.toggle("is-visible", pageIndex === previousPage || pageIndex === activePage);
          });
          animationTimer = window.setTimeout(() => {
            track.classList.remove("is-switching");
            pages.forEach((pageElement, pageIndex) => {
              pageElement.classList.toggle("is-visible", pageIndex === activePage);
            });
            animationTimer = null;
          }, 720);
        } else {
          pages.forEach((pageElement, pageIndex) => {
            pageElement.classList.toggle("is-visible", pageIndex === activePage);
          });
        }
  
        track.style.transform = `translateX(${-pageOffset(activePage)}px)`;
      }
  
      dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
          setPage(index);
        });
      });
  
      window.addEventListener("resize", () => {
        setPage(activePage, false);
      });
  
      setPage(0, false);
});
