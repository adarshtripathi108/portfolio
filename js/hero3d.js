/* Adarsh Tripathi — Portfolio (Daiki style)
   Three.js hero scene, part 1: renderer, camera, lights, glass rock.
   (Part 2 adds the rotating text ring, particles, animation loop and
   graceful fallback.) Module script — the importmap lives in index.html.
   Everything is wrapped so a failure leaves the hero text fully usable. */
import * as THREE from "three";

let renderer = null;
let scene = null;
let camera = null;
let rock = null;

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
  // Transmission gives real glass; if it ever looks wrong on a weak GPU
  // the material still reads as pale glass because of its colour/opacity.
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

  // Expose the pieces part 2 needs, on the module's own scope via window.
  window.__hero3d = { renderer, scene, camera, rock, THREE };

  // Part 1 renders one static frame; part 2 takes over the loop.
  renderer.render(scene, camera);
} catch (err) {
  failSoft();
}
