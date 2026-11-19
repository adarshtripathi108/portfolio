/* Adarsh Tripathi — Portfolio (Daiki style)
   Three.js hero scene, part 3: + particles.
   (Part 4 adds the animation loop, resize handling, pause behaviour
   and graceful fallback.) Module script — the importmap
   lives in index.html. Everything is wrapped so a failure leaves
   the hero text fully usable. */
import * as THREE from "three";

let renderer = null;
let scene = null;
let camera = null;
let rock = null;
let ring = null;

function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
  } catch (e) {
    return false;
  }
}

function failSoft() {
  const hero = document.querySelector(".hero");
  if (hero) hero.classList.add("no-webgl");
}

function makeTextSprite(text) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext("2d");
  ctx.font = "700 62px 'Space Grotesk', Arial, sans-serif";
  ctx.fillStyle = "#111111";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(1.6, 0.4, 1);
  return sprite;
}

try {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas || !webglOK()) throw new Error("no webgl");

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(42, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0.2, 6.2);

  // Lights: soft ambient + key directional + purple rim point light.
  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 4, 4);
  scene.add(key);
  const rim = new THREE.PointLight(0x7a6cff, 14, 20, 1.8);
  rim.position.set(-3.5, -1.5, 2.5);
  scene.add(rim);
  const fill = new THREE.PointLight(0xdce8ec, 8, 20, 1.8);
  fill.position.set(2.5, -2.5, 3);
  scene.add(fill);

  // The glass/ice rock: a faceted icosahedron in a physical material.
  const rockGeo = new THREE.IcosahedronGeometry(1.35, 1);
  const rockMat = new THREE.MeshPhysicalMaterial({
    color: 0xdce8ec,
    metalness: 0,
    roughness: 0.12,
    transmission: 0.92,
    thickness: 1.4,
    ior: 1.45,
    clearcoat: 0.6,
    clearcoatRoughness: 0.25,
    transparent: true,
    opacity: 1,
    flatShading: true
  });
  rock = new THREE.Mesh(rockGeo, rockMat);
  rock.position.set(0, 0.1, 0);
  scene.add(rock);

  // Rotating ring of 3D text around the rock: one canvas sprite per
  // word, arranged in a circle. The group slowly rotates (part 4).
  ring = new THREE.Group();
  const words = ["ADARSH", "TRIPATHI", "•", "PORTFOLIO", "•", "2026", "•"];
  words.forEach((word, i) => {
    const angle = (i / words.length) * Math.PI * 2;
    const sprite = makeTextSprite(word);
    sprite.position.set(Math.cos(angle) * 2.7, Math.sin(angle) * 2.7, 0);
    ring.add(sprite);
  });
  ring.rotation.x = -0.35;
  scene.add(ring);

  // Particles: a sparse shell of tiny pale points drifting around the
  // rock, in glass-blue and purple. Slow rotation in part 4.
  const particleCount = 260;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const blue = new THREE.Color(0x9fc4d4);
  const purple = new THREE.Color(0x7a6cff);
  const tmpColor = new THREE.Color();
  for (let i = 0; i < particleCount; i++) {
    // Random point in a spherical shell, radius 2.2–4.6.
    const r = 2.2 + Math.random() * 2.4;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
    positions[i * 3 + 2] = r * Math.cos(phi);
    tmpColor.copy(Math.random() < 0.6 ? blue : purple);
    colors[i * 3] = tmpColor.r;
    colors[i * 3 + 1] = tmpColor.g;
    colors[i * 3 + 2] = tmpColor.b;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({
    size: 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true,
    depthWrite: false
  }));
  scene.add(particles);

  // Expose the pieces later parts need.
  window.__hero3d = { renderer, scene, camera, rock, ring, particles, THREE };

  // Still a static frame for now; part 4 takes over the loop.
  renderer.render(scene, camera);
} catch (err) {
  failSoft();
}
