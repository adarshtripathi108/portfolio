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

  // MORE-SECTIONS
})();
