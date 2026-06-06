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
    var targetConfig = [
      { id: "top left bar", strength: 8 },
      { id: "top right bar", strength: 8 },
      { id: "coment", strength: 12 },
      { id: "Toggle", strength: 9 },
      { id: "eye icon", strength: 9 },
      { id: "eye icon 2", strength: 9 },
      { id: "plashka", strength: 10 },
      { id: "plashka 2", strength: 10 },
      { id: "plashka3", strength: 10 },
      { id: "plaska 4", strength: 10 }
    ];

    function attachFigmaAnimation(target, strength) {
      target.classList.add("anim-target");

      var baseTransform = target.getAttribute("transform") || "";

      target.addEventListener("mousemove", function (event) {
        var rect = target.getBoundingClientRect();

        var dx = event.clientX - (rect.left + rect.width / 2);
        var dy = event.clientY - (rect.top + rect.height / 2);

        var nx = rect.width ? dx / (rect.width / 2) : 0;
        var ny = rect.height ? dy / (rect.height / 2) : 0;

        var moveX = -nx * strength;
        var moveY = -ny * strength;

        target.style.transform = "translate(" + moveX + "px, " + moveY + "px)";
      });

      target.addEventListener("mouseleave", function () {
        target.style.transform = "";
        if (baseTransform) {
          target.setAttribute("transform", baseTransform);
        }
      });
    }

    targetConfig.forEach(function (item) {
      var el = document.getElementById(item.id);

      if (el) {
        attachFigmaAnimation(el, item.strength);
      } else {
        console.warn("SVG group not found: " + item.id);
      }
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
    '.work-card, .service-item, .process__step, .about__body, .about__heading'
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
  document.querySelectorAll('.works__grid .work-card').forEach(function (card, index) {
    card.style.transitionDelay = (index * 0.08) + 's';
  });

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
document.addEventListener("DOMContentLoaded", function () {
  var about = document.querySelector(".about-section--svg-elements");
  if (!about) return;

  // Make the SVG View CV group behave like a link.
  var cvButton = about.querySelector('[id="Button"]');
  if (cvButton) {
    cvButton.setAttribute("tabindex", "0");
    cvButton.setAttribute("role", "link");
    cvButton.setAttribute("aria-label", "View CV");

    function openCv() {
      // Replace this with the real CV file path, for example:
      // window.location.href = "assets/Andrian-Sl-CV.pdf";
      window.location.href = "#";
    }

    cvButton.addEventListener("click", openCv);

    cvButton.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openCv();
      }
    });
  }
});


});