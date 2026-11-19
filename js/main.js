// Adarsh Tripathi — Portfolio (Daiki style + Adrien fluid motion)
// Navigation, smooth scroll, footer year. (Dream toggle, scroll
// reveal, cursor cube, card tilt and dream-wake land in later commits.)

(function () {
  "use strict";

  // Footer year — always current.
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Mobile nav toggle.
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Close the menu after tapping a link.
    nav.querySelectorAll(".nav-links a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Smooth scroll for in-page anchors (CSS scroll-behavior is the
  // primary route; this keeps the sticky header offset behaving the
  // same way in older browsers).
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (event) {
      var targetId = anchor.getAttribute("href");
      if (targetId.length < 2) return;
      var target = document.querySelector(targetId);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", targetId);
    });
  });

  // WAKE/DREAM toggle — switches the whole site mood via body.dream.
  // The fluid shader and hero rock read the same class in their loops.
  var dreamToggle = document.getElementById("dream-toggle");
  var dreamLabel = dreamToggle ? dreamToggle.querySelector(".dream-label") : null;
  var dreamInline = document.querySelector(".dream-toggle-inline");

  function setDream(on) {
    document.body.classList.toggle("dream", on);
    if (dreamToggle) {
      dreamToggle.setAttribute("aria-pressed", on ? "true" : "false");
    }
    if (dreamLabel) {
      dreamLabel.textContent = on ? "Wake" : "Dream";
    }
    if (dreamInline) {
      dreamInline.textContent = on ? "Back to Wake mode" : "Enter Dream mode";
    }
    if (!on) {
      // Leaving dream mode: cards forget they were woken, so they
      // sleep again next time.
      document.querySelectorAll(".work-card.awake").forEach(function (card) {
        card.classList.remove("awake");
      });
    }
  }

  if (dreamToggle) {
    dreamToggle.addEventListener("click", function () {
      setDream(!document.body.classList.contains("dream"));
    });
  }
  if (dreamInline) {
    dreamInline.addEventListener("click", function () {
      setDream(!document.body.classList.contains("dream"));
      if (document.body.classList.contains("dream")) {
        document.getElementById("work").scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // Scroll reveal — fade sections in as they enter the viewport.
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // No observer support: show everything.
    revealEls.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  // Pixel-cube cursor follower — a small CSS 3D cube trailing the
  // cursor with slight lag. Desktop fine pointers only, and skipped
  // under prefers-reduced-motion (CSS hides it there too).
  var cube = document.querySelector(".cursor-cube");
  var finePointer = false;
  var reduceMotion = false;
  try {
    finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) { /* matchMedia unavailable */ }
  if (cube && finePointer && !reduceMotion) {
    var cubeX = -100, cubeY = -100, targetX = -100, targetY = -100;
    var cubeShown = false;
    var cubeRaf = null;
    document.addEventListener("mousemove", function (e) {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!cubeShown) {
        cubeShown = true;
        cubeX = targetX;
        cubeY = targetY;
        cube.classList.add("on");
      }
      if (!cubeRaf) {
        cubeRaf = requestAnimationFrame(function step() {
          cubeRaf = null;
          cubeX += (targetX - cubeX) * 0.18;
          cubeY += (targetY - cubeY) * 0.18;
          cube.style.transform =
            "translate3d(" + (cubeX - 7) + "px," + (cubeY - 7) + "px, 0)" +
            " rotateX(-24deg) rotateY(32deg)";
          if (Math.abs(targetX - cubeX) > 0.5 || Math.abs(targetY - cubeY) > 0.5) {
            cubeRaf = requestAnimationFrame(step);
          }
        });
      }
    }, { passive: true });
    document.addEventListener("mouseleave", function () {
      cube.classList.remove("on");
      cubeShown = false;
    });
  }

  // 3D tilt — subtle mouse-follow tilt on work and milestone cards.
  // Same approach as the previous version: perspective transform,
  // rAF-throttled, disabled on touch and reduced motion.
  if (finePointer && !reduceMotion) {
    var MAX_TILT = 7; // degrees, each way
    var tiltTargets = document.querySelectorAll(".work-card, .milestone-card");
    tiltTargets.forEach(function (card) {
      var raf = null;
      card.addEventListener("mousemove", function (event) {
        var rect = card.getBoundingClientRect();
        var px = (event.clientX - rect.left) / rect.width - 0.5;
        var py = (event.clientY - rect.top) / rect.height - 0.5;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          card.style.transition = "transform 0.1s ease-out";
          card.style.transform =
            "perspective(900px) rotateX(" + (-py * MAX_TILT).toFixed(2) +
            "deg) rotateY(" + (px * MAX_TILT).toFixed(2) + "deg) translateZ(0)";
          card.classList.add("is-tilting");
        });
      });
      card.addEventListener("mouseleave", function () {
        if (raf) cancelAnimationFrame(raf);
        card.style.transition = "";
        card.style.transform = "";
        card.classList.remove("is-tilting");
      });
    });
  }

  // MORE-SECTIONS
})();
