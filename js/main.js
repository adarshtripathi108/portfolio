// Adarsh Tripathi — Portfolio (Nova-exact rebuild)
// Mobile nav, smooth scroll, footer year, FAQ accordion, scroll reveal.

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
  // primary route; this keeps older browsers and the sticky header
  // offset behaving the same way).
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

  // FAQ accordion — one open at a time. The first item starts open
  // (class "open" in the markup); clicking another moves it.
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    var question = item.querySelector(".faq-question");
    if (!question) return;
    question.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      faqItems.forEach(function (other) {
        other.classList.remove("open");
        var q = other.querySelector(".faq-question");
        if (q) q.setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        question.setAttribute("aria-expanded", "true");
      }
    });
  });

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

  // 3D tilt — subtle mouse-follow tilt on the cards and the hero photo.
  // Disabled on touch devices and when reduced motion is preferred.
  // Uses requestAnimationFrame so the transform updates once per frame.
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (finePointer && !reduceMotion) {
    var MAX_TILT = 7; // degrees, each way
    var tiltTargets = document.querySelectorAll(
      ".work-card, .service-card, .milestone-card, .hero-photo"
    );
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
        // Restore the stylesheet transition so the card eases back flat.
        card.style.transition = "";
        card.style.transform = "";
        card.classList.remove("is-tilting");
      });
    });
  }
})();
