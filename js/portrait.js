/* Adarsh Tripathi — Portfolio (Daiki style + Adrien fluid motion)
   Particle portrait for the About section.
   Adarsh's own photo (assets/avatar.jpg) draws itself: thousands of
   dots start scattered at random positions, then fly in and assemble
   into the portrait — in the photo's OWN colours. Each dot settles
   into the true pixel colour of the photo at its target point, so
   the finished portrait IS his photo, rendered as dots (red t-shirt
   and all). Dots fly in near-white and take their photo colour as
   they arrive.
   Plain script, Canvas 2D, no dependencies. If the image fails to
   load or canvas is unavailable, the fallback <img> stays visible. */
(function () {
  "use strict";

  var canvas = document.getElementById("portrait-canvas");
  var panel = document.querySelector(".portrait-panel");
  if (!canvas || !panel) return;

  var ctx = null;
  try {
    ctx = canvas.getContext("2d");
  } catch (e) { ctx = null; }
  if (!ctx) return; // Fallback <img> stays visible.

  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) { /* matchMedia unavailable — keep motion on */ }

  /* ---- Part 1: image loader + grid sampling ----------------------- */
  /* The photo is drawn to a small offscreen canvas and sampled on a
     regular grid. Each sample keeps its true photo colour (averaged
     over its grid cell), stored in normalised 0..1 coordinates so
     the portrait rescales cleanly to any display size. */
  var SAMPLE_W = 150;         // offscreen sample width in px
  var TARGET_POINTS = 2800;   // aim ~2,500-3,500 sample points
  var samples = [];           // { nx, ny, r, g, b }
  var gridCols = 0;           // grid columns (sets the dot spacing)
  var photoReady = false;

  function samplePhoto(img) {
    var w = SAMPLE_W;
    var h = Math.max(1, Math.round(SAMPLE_W * img.naturalHeight / img.naturalWidth));
    var off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    var octx = off.getContext("2d");
    if (!octx) return false;
    octx.drawImage(img, 0, 0, w, h);
    var data;
    try {
      data = octx.getImageData(0, 0, w, h).data;
    } catch (e) {
      return false; // Pixel read blocked — keep the <img> fallback.
    }
    // Grid step chosen so the point count lands near TARGET_POINTS.
    var step = Math.max(2, Math.round(Math.sqrt((w * h) / TARGET_POINTS)));
    gridCols = Math.floor(w / step);
    samples = [];
    for (var gy = 0; gy < h; gy += step) {
      for (var gx = 0; gx < w; gx += step) {
        // Average the colour over the grid cell for truer colours.
        var r = 0, g = 0, b = 0, n = 0;
        var yEnd = Math.min(gy + step, h);
        var xEnd = Math.min(gx + step, w);
        for (var y = gy; y < yEnd; y++) {
          for (var x = gx; x < xEnd; x++) {
            var idx = (y * w + x) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            n++;
          }
        }
        if (n === 0) continue;
        samples.push({
          nx: (gx + step / 2) / w,
          ny: (gy + step / 2) / h,
          r: Math.round(r / n),
          g: Math.round(g / n),
          b: Math.round(b / n)
        });
      }
    }
    return samples.length > 0;
  }

  var photo = new Image();
  photo.onload = function () {
    if (samplePhoto(photo)) {
      photoReady = true;
      onPhotoReady();
    }
    // If sampling failed, the fallback <img> simply stays visible.
  };
  photo.onerror = function () {
    // Image failed to load — keep the fallback <img> visible.
  };
  photo.src = "assets/avatar.jpg";

  /* ---- Part 2: particles, fly-in, animation loop ------------------ */
  /* Each sample becomes one particle: a random scattered start, its
     sample point as target, and its true photo colour. Particles fly
     in near-white and settle into their photo colour as they land,
     so the portrait assembles in full original colour. */
  var particles = [];   // { nx, ny, sx, sy, tx, ty, delay, colour }
  var size = 0;         // canvas CSS size (square)
  var dotRadius = 2;
  var animating = false;
  var rafId = 0;
  var animStart = 0;
  var hiddenAt = 0;

  var STAGGER_MS = 1200;  // delay spread across particles (top-down wave)
  var JITTER_MS = 600;    // extra random delay per particle
  var FLY_MS = 1000;      // each particle's flight time (total ~2.8s)

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function measure() {
    var w = canvas.clientWidth || 360;
    size = w;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var px = Math.floor(w * dpr);
    if (canvas.width !== px || canvas.height !== px) {
      canvas.width = px;
      canvas.height = px;
    }
    // Setting canvas.width resets the transform — re-apply it.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Dot radius from grid spacing so the dots nearly tile the portrait.
    var spacing = gridCols > 0 ? w / gridCols : 7;
    dotRadius = Math.max(1.4, spacing * 0.42);
    layoutParticles();
  }

  function layoutParticles() {
    // (Re)compute pixel targets from normalised samples.
    for (var i = 0; i < particles.length; i++) {
      particles[i].tx = particles[i].nx * size;
      particles[i].ty = particles[i].ny * size;
    }
  }

  function buildParticles() {
    particles = [];
    for (var i = 0; i < samples.length; i++) {
      var s = samples[i];
      particles.push({
        nx: s.nx,
        ny: s.ny,
        tx: s.nx * size,
        ty: s.ny * size,
        sx: Math.random() * size,
        sy: Math.random() * size,
        delay: (i / samples.length) * STAGGER_MS + Math.random() * JITTER_MS,
        colour: s.r + "," + s.g + "," + s.b,
        r: s.r,
        g: s.g,
        b: s.b
      });
    }
  }

  /* Draw one frame of the assembly at timestamp `now`. Returns true
     when every particle has landed. */
  function drawAt(now) {
    var elapsed = now - animStart;
    ctx.clearRect(0, 0, size, size);
    var done = true;
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var t = (elapsed - p.delay) / FLY_MS;
      var x, y;
      if (t <= 0) {
        // Not flying yet: still scattered, near-white.
        x = p.sx;
        y = p.sy;
        ctx.fillStyle = "rgb(238,238,244)";
        done = false;
      } else if (t >= 1) {
        // Landed: true photo colour.
        x = p.tx;
        y = p.ty;
        ctx.fillStyle = "rgb(" + p.colour + ")";
      } else {
        var e = easeOutCubic(t);
        x = p.sx + (p.tx - p.sx) * e;
        y = p.sy + (p.ty - p.sy) * e;
        // Colour blends near-white -> true photo colour as it lands.
        var r = Math.round(238 + (p.r - 238) * e);
        var g = Math.round(238 + (p.g - 238) * e);
        var b = Math.round(244 + (p.b - 244) * e);
        ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        done = false;
      }
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    return done;
  }

  function frame(now) {
    if (!animating) return;
    if (drawAt(now)) {
      animating = false;
      rafId = 0;
      return;
    }
    rafId = requestAnimationFrame(frame);
  }

  /* (Re)run the assembly from scattered dots. */
  function startAssembly() {
    if (!photoReady || samples.length === 0) return;
    measure();
    buildParticles();
    // Hide the <img> fallback only now the canvas is drawing.
    panel.classList.add("portrait-live");
    animStart = performance.now();
    animating = true;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(frame);
  }

  /* Draw the finished portrait instantly (reduced motion / resize). */
  function drawFinal() {
    if (!photoReady || samples.length === 0) return;
    measure();
    if (particles.length === 0) buildParticles();
    else layoutParticles();
    panel.classList.add("portrait-live");
    ctx.clearRect(0, 0, size, size);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      ctx.fillStyle = "rgb(" + p.colour + ")";
      ctx.beginPath();
      ctx.arc(p.tx, p.ty, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* Pause the loop while the tab is hidden; resume on show, shifting
     the start time so the animation continues where it left off. */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (animating) {
        hiddenAt = performance.now();
        animating = false;
        if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      }
    } else if (hiddenAt) {
      animStart += performance.now() - hiddenAt;
      hiddenAt = 0;
      if (photoReady && particles.length > 0 && !animating) {
        animating = true;
        rafId = requestAnimationFrame(frame);
      }
    }
  });

  /* Part 3 (trigger + replay) is added below in the next commit. */
  function onPhotoReady() { /* replaced in Part 3 */ }
})();
