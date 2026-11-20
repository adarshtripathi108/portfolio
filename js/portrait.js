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

  /* Part 2 (particles + animation) and Part 3 (trigger + replay)
     are added below in later commits. */
  function onPhotoReady() { /* replaced in Part 3 */ }
})();
