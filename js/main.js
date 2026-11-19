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

  // MORE-SECTIONS
})();
