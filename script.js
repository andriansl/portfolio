/* ============================================================
   script.js — Andrian Sl Portfolio
   JavaScript відповідає за:
   1. Мобільне меню (бургер) + доступність
   2. Тінь хедера при скролі
   3. Плавна поява секцій при скролі
   4. Physics-анімація hero через Matter.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  // ---- 1. REDUCED MOTION ----
  var prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;


  // ---- 2. МОБІЛЬНЕ МЕНЮ ----
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function openMenu() {
    if (!burger || !nav) return;

    burger.classList.add('open');
    nav.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    if (!burger || !nav) return;

    burger.classList.remove('open');
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var isOpen = burger.classList.contains('open');

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    nav.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && burger.classList.contains('open')) {
        closeMenu();
        burger.focus();
      }
    });
  }


  // ---- 3. ТІНЬ ХЕДЕРА ПРИ СКРОЛІ ----
  var header = document.getElementById('header');

  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }


  // ---- 4. ПЛАВНА ПОЯВА ЕЛЕМЕНТІВ ПРИ СКРОЛІ ----
  var targets = document.querySelectorAll(
    '.work-card, .service-item, .process__step, .about__body, .about__heading'
  );

  if (prefersReducedMotion) {
    targets.forEach(function (el) {
      el.classList.add('visible');
    });
  } else {
    targets.forEach(function (el) {
      el.classList.add('fade-in');
    });

    document.querySelectorAll('.works__grid .work-card').forEach(function (card, index) {
      card.style.transitionDelay = (index * 0.08) + 's';
    });

    document.querySelectorAll('.services__list .service-item').forEach(function (item, index) {
      item.style.transitionDelay = (index * 0.06) + 's';
    });

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1
        }
      );

      targets.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      targets.forEach(function (el) {
        el.classList.add('visible');
      });
    }
  }


  // ============================================================
  // 5. HERO PHYSICS DROP — Matter.js
  // ============================================================

  function initHeroPhysics() {
    var hero = document.querySelector('.hero--tools');
    var workspace = document.querySelector('.ht-workspace');
    var elements = document.querySelectorAll('.ht-physics');

    if (!hero || !workspace || !elements.length || typeof Matter === 'undefined') {
      return;
    }

    if (prefersReducedMotion) {
      return;
    }

    var Engine = Matter.Engine;
    var Runner = Matter.Runner;
    var Bodies = Matter.Bodies;
    var Body = Matter.Body;
    var Composite = Matter.Composite;
    var Sleeping = Matter.Sleeping;
    var Events = Matter.Events;

    var engine = Engine.create();
    var world = engine.world;

    engine.gravity.y = 0;

    var runner = Runner.create();

    var workspaceRect = workspace.getBoundingClientRect();
    var width = workspaceRect.width;
    var height = workspaceRect.height;
    var wallThickness = 160;

    var floor = Bodies.rectangle(
      width / 2,
      height + wallThickness / 2 - 20,
      width + wallThickness * 2,
      wallThickness,
      {
        isStatic: true
      }
    );

    var leftWall = Bodies.rectangle(
      -wallThickness / 2,
      height / 2,
      wallThickness,
      height * 2,
      {
        isStatic: true
      }
    );

    var rightWall = Bodies.rectangle(
      width + wallThickness / 2,
      height / 2,
      wallThickness,
      height * 2,
      {
        isStatic: true
      }
    );

    Composite.add(world, [floor, leftWall, rightWall]);

    var bodies = [];

    elements.forEach(function (el) {
      var rect = el.getBoundingClientRect();

      var x = rect.left - workspaceRect.left + rect.width / 2;
      var y = rect.top - workspaceRect.top + rect.height / 2;

      var angleDeg = Number(el.dataset.angle || 0);
      var angleRad = angleDeg * Math.PI / 180;

      var body = Bodies.rectangle(x, y, rect.width, rect.height, {
        restitution: 0.55,
        friction: 0.75,
        frictionAir: 0.04,
        density: 0.001,
        angle: angleRad,
        isStatic: true
      });

      body.renderElement = el;
      body.initialWidth = rect.width;
      body.initialHeight = rect.height;

      bodies.push(body);
    });

    Composite.add(world, bodies);

    bodies.forEach(function (body) {
      var el = body.renderElement;

      el.style.position = 'absolute';
      el.style.left = (body.position.x - body.initialWidth / 2) + 'px';
      el.style.top = (body.position.y - body.initialHeight / 2) + 'px';
      el.style.right = 'auto';
      el.style.bottom = 'auto';
      el.style.transform = 'rotate(' + body.angle + 'rad)';
    });

    Runner.run(runner, engine);

    var physicsActive = false;
    var dropDelay = 2400;

    window.setTimeout(function () {
      physicsActive = true;
      hero.classList.add('hero--physics-active');

      engine.gravity.y = 0.82;

      bodies.forEach(function (body, index) {
        Body.setStatic(body, false);
        Sleeping.set(body, false);

        Body.setVelocity(body, {
          x: (index % 2 === 0 ? 1 : -1) * (0.6 + index * 0.07),
          y: -1.1 - index * 0.04
        });

        Body.setAngularVelocity(
          body,
          (index % 2 === 0 ? 1 : -1) * 0.03
        );
      });
    }, dropDelay);

    Events.on(engine, 'afterUpdate', function () {
      if (!physicsActive) {
        return;
      }

      bodies.forEach(function (body) {
        var el = body.renderElement;

        el.style.left = (body.position.x - body.initialWidth / 2) + 'px';
        el.style.top = (body.position.y - body.initialHeight / 2) + 'px';
        el.style.transform = 'rotate(' + body.angle + 'rad)';
      });
    });

    window.setTimeout(function () {
      if (!physicsActive) {
        return;
      }

      engine.gravity.y = 0.42;
      hero.classList.add('hero--physics-settled');
    }, dropDelay + 4200);
  }

  initHeroPhysics();

});