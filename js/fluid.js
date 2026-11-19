/* Adarsh Tripathi — Portfolio (Daiki style + Adrien fluid motion)
   Cursor-reactive fluid shader background.
   A fixed fullscreen canvas behind everything: soft blobs in pale
   glass-blue, purple and warm grey on a cream base. Moving the cursor
   leaves a trail of colour that fades. Subtle by design so text stays
   readable. In Dream mode (body.dream) the purple intensifies.
   Plain script, raw WebGL, no dependencies. Fails silently: if WebGL
   or the canvas is unavailable the page simply has no fluid layer. */
(function () {
  "use strict";

  var canvas = document.getElementById("fluid-canvas");
  if (!canvas) return;

  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) { /* matchMedia unavailable — keep motion on */ }

  var gl = null;
  try {
    gl = canvas.getContext("webgl", { alpha: true, antialias: false }) ||
         canvas.getContext("experimental-webgl", { alpha: true, antialias: false });
  } catch (e) { gl = null; }
  if (!gl) { canvas.style.display = "none"; return; }

  var VERT =
    "attribute vec2 aPos;\n" +
    "void main() { gl_Position = vec4(aPos, 0.0, 1.0); }\n";

  var FRAG =
    "precision mediump float;\n" +
    "uniform vec2 uRes;\n" +
    "uniform float uTime;\n" +
    "uniform float uDream;\n" +
    "uniform vec3 uTrail[8];\n" +
    "void main() {\n" +
    "  vec2 uv = gl_FragCoord.xy / uRes;\n" +
    "  vec2 p = uv - 0.5;\n" +
    "  p.x *= uRes.x / uRes.y;\n" +
    "  float t = uTime * 0.08;\n" +
    // Cream base.
    "  vec3 col = vec3(0.949, 0.941, 0.914);\n" +
    // Slow ambient blobs: pale glass-blue, warm grey, faint purple.
    "  vec2 b1 = vec2(sin(t * 1.1) * 0.28, cos(t * 0.9) * 0.20);\n" +
    "  vec2 b2 = vec2(cos(t * 0.7 + 2.0) * 0.30, sin(t * 1.3 + 1.0) * 0.22);\n" +
    "  vec2 b3 = vec2(sin(t * 0.5 + 4.0) * 0.25, cos(t * 0.8 + 3.0) * 0.25);\n" +
    "  float d1 = length(p - b1);\n" +
    "  float d2 = length(p - b2);\n" +
    "  float d3 = length(p - b3);\n" +
    "  col = mix(col, vec3(0.863, 0.910, 0.925), smoothstep(0.55, 0.0, d1) * 0.55);\n" +
    "  col = mix(col, vec3(0.878, 0.859, 0.812), smoothstep(0.60, 0.0, d2) * 0.45);\n" +
    "  col = mix(col, vec3(0.478, 0.424, 1.000), smoothstep(0.55, 0.0, d3) * (0.10 + uDream * 0.22));\n" +
    // Cursor trail: 8 fading points, alternating purple / glass-blue.
    "  for (int i = 0; i < 8; i++) {\n" +
    "    vec3 tp = uTrail[i];\n" +
    "    if (tp.z < 0.01) continue;\n" +
    "    vec2 tpPos = tp.xy - 0.5;\n" +
    "    tpPos.x *= uRes.x / uRes.y;\n" +
    "    float d = length(p - tpPos);\n" +
    "    float glow = exp(-d * d * 26.0) * tp.z;\n" +
    "    vec3 trailCol = (i % 2 == 0) ? vec3(0.478, 0.424, 1.000) : vec3(0.620, 0.780, 0.870);\n" +
    "    col = mix(col, trailCol, glow * (0.45 + uDream * 0.30));\n" +
    "  }\n" +
    "  gl_FragColor = vec4(col, 1.0);\n" +
    "}\n";

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error("shader: " + gl.getShaderInfoLog(s));
    }
    return s;
  }

  var program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error("link: " + gl.getProgramInfoLog(program));
    }
  } catch (e) {
    canvas.style.display = "none";
    return;
  }
  gl.useProgram(program);

  // Fullscreen triangle.
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  var uRes = gl.getUniformLocation(program, "uRes");
  var uTime = gl.getUniformLocation(program, "uTime");
  var uDream = gl.getUniformLocation(program, "uDream");
  var uTrail = gl.getUniformLocation(program, "uTrail[0]");

  // Trail: 8 points (x, y, strength). Newest first.
  var trail = new Float32Array(24);
  var mouseX = 0.5, mouseY = 0.5, hasMouse = false;
  var lastPush = 0;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = Math.floor(window.innerWidth * dpr);
    var h = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener("resize", resize);

  document.addEventListener("mousemove", function (e) {
    mouseX = e.clientX / window.innerWidth;
    mouseY = 1 - e.clientY / window.innerHeight;
    hasMouse = true;
    var now = performance.now();
    if (now - lastPush > 40) {
      lastPush = now;
      // Shift the trail back, newest at index 0.
      for (var i = 7; i > 0; i--) {
        trail[i * 3] = trail[(i - 1) * 3];
        trail[i * 3 + 1] = trail[(i - 1) * 3 + 1];
        trail[i * 3 + 2] = trail[(i - 1) * 3 + 2] * 0.85;
      }
      trail[0] = mouseX;
      trail[1] = mouseY;
      trail[2] = 1.0;
    }
  }, { passive: true });

  var start = performance.now();
  var dream = 0;
  var running = true;

  function draw(now) {
    // Ease the dream uniform toward the body class.
    var target = document.body.classList.contains("dream") ? 1 : 0;
    dream += (target - dream) * 0.05;
    // Fade the trail.
    for (var i = 0; i < 8; i++) {
      trail[i * 3 + 2] *= 0.96;
    }
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, (now - start) / 1000);
    gl.uniform1f(uDream, dream);
    gl.uniform3fv(uTrail, trail);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function frame(now) {
    if (!running) return;
    draw(now);
    requestAnimationFrame(frame);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      running = false;
    } else if (!reduceMotion) {
      running = true;
      requestAnimationFrame(frame);
    }
  });

  if (reduceMotion) {
    // Static single frame: ambient blobs only, no animation.
    draw(start);
  } else {
    requestAnimationFrame(frame);
  }
})();
