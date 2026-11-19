/* Adarsh Tripathi — Portfolio (Daiki style + Adrien fluid motion)
   Cursor-reactive fluid background, Canvas 2D.
   A fixed fullscreen canvas behind the page content. Every frame it
   is cleared and redrawn from scratch: three large, slow-drifting
   ambient blobs (glass-blue, warm grey, faint purple) plus a trail
   of colour that follows the cursor — alternating purple and
   glass-blue glows that fade with age, with a brighter glow at the
   cursor itself so the effect is obvious the moment the mouse moves.
   The cream page background shows through the transparent canvas;
   this layer only adds colour.
   Plain script, Canvas 2D, no dependencies. If the 2D context is
   unavailable the page simply has no fluid layer. */
(function () {
  "use strict";

  var canvas = document.getElementById("fluid-canvas");
  if (!canvas) return;

  var ctx = null;
  try {
    ctx = canvas.getContext("2d");
  } catch (e) { ctx = null; }
  if (!ctx) return;

  // Trail: last mouse positions, newest first. {x, y} in CSS px, t is
  // a performance.now() timestamp. Points older than TRAIL_LIFE ms
  // are dropped, so the trail fades away once the mouse stops.
  var TRAIL_LEN = 14;
  var TRAIL_LIFE = 900;
  var trail = [];
  var mouseX = 0, mouseY = 0, hasMouse = false;
  var lastPush = 0;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = Math.floor(window.innerWidth * dpr);
    var h = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    // Setting canvas.width resets the transform, so re-apply it on
    // every resize. All drawing below uses CSS-pixel coordinates.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  document.addEventListener("mousemove", function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    hasMouse = true;
    var now = performance.now();
    if (now - lastPush > 30) {
      lastPush = now;
      trail.unshift({ x: mouseX, y: mouseY, t: now });
      if (trail.length > TRAIL_LEN) trail.length = TRAIL_LEN;
    }
  }, { passive: true });

  // The cursor glow must not linger at the last position once the
  // pointer has left the window.
  document.addEventListener("mouseleave", function () {
    hasMouse = false;
  });

  // Draw one soft radial glow. rgb is "r, g, b", alpha the peak alpha
  // at the centre; it falls to transparent at the edge.
  function glow(x, y, radius, rgb, alpha) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, "rgba(" + rgb + ", " + alpha + ")");
    g.addColorStop(0.55, "rgba(" + rgb + ", " + (alpha * 0.45) + ")");
    g.addColorStop(1, "rgba(" + rgb + ", 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  var start = performance.now();

  function draw(now) {
    var w = window.innerWidth, h = window.innerHeight;
    var t = (now - start) / 1000;
    ctx.clearRect(0, 0, w, h);

    // Ambient blobs: slow sine drift, always visible.
    var b1x = w * (0.5 + 0.28 * Math.sin(t * 0.11));
    var b1y = h * (0.5 + 0.20 * Math.cos(t * 0.09));
    var b2x = w * (0.5 + 0.30 * Math.cos(t * 0.07 + 2.0));
    var b2y = h * (0.5 + 0.22 * Math.sin(t * 0.13 + 1.0));
    var b3x = w * (0.5 + 0.25 * Math.sin(t * 0.05 + 4.0));
    var b3y = h * (0.5 + 0.25 * Math.cos(t * 0.08 + 3.0));
    var R = Math.max(w, h) * 0.42;
    glow(b1x, b1y, R, "220, 232, 236", 0.55); // glass-blue
    glow(b2x, b2y, R, "224, 219, 207", 0.50); // warm grey
    glow(b3x, b3y, R, "122, 108, 255", 0.16); // faint purple

    // Cursor trail: newest first, alpha fading with age (0.55 at the
    // cursor down to ~0.05 before the point drops out).
    for (var i = trail.length - 1; i >= 0; i--) {
      var age = now - trail[i].t;
      if (age > TRAIL_LIFE) {
        trail.splice(i, 1);
        continue;
      }
      var life = 1 - age / TRAIL_LIFE;
      var rgb = (i % 2 === 0) ? "122, 108, 255" : "127, 184, 208";
      glow(trail[i].x, trail[i].y, 140, rgb, 0.55 * life);
    }

    // Bright glow at the cursor itself — unmissable.
    if (hasMouse) {
      glow(mouseX, mouseY, 90, "122, 108, 255", 0.65);
    }
  }

  function frame(now) {
    draw(now);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
