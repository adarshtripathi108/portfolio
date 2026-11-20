# Adarsh Tripathi — Portfolio

Personal portfolio website for Adarsh Tripathi, B.E. CSE student at Chitkara University. Daiki Fujita–style structure (numbered sections, exactly three selected works, WAKE/DREAM toggle) merged with Adrien Quéchon–style cursor-reactive fluid colour — built as original plain HTML/CSS/JS plus Three.js, no build step.

**Live:** https://adarshtripathi108.github.io/portfolio/

## Design

- Palette: cream `#F2F0E9` background, ink `#111111` text, muted `#9A9A9A`, pale glass-blue `#DCE8EC`, purple dream accent `#7A6CFF`.
- Fonts: Space Grotesk for display, Inter for body (Google Fonts + system fallback).
- Hero: Three.js scene — a floating glass/ice rock, a rotating ring of 3D text, and a particle cloud. Graceful fallback: if WebGL or the CDN fails, the headline stays with a CSS gradient blob.
- Fluid background: a fixed fullscreen Canvas 2D layer (glass-blue, purple, warm grey on cream). Moving the cursor reveals trailing colour that fades, with a bright glow at the cursor itself. Intensifies in Dream mode.
- WAKE/DREAM toggle: re-tints the whole site purple, deepens the fluid, shifts the hero rock. In Dream mode the three work cards sleep ("held by the dream — click to wake"); clicking one wakes it.
- Pixel-cube cursor follower (desktop fine pointers only), mouse-follow 3D tilt on work and milestone cards, scroll reveal throughout.
- Performance and access: pixel ratio capped at 2, rendering pauses when the tab is hidden or the hero is off-screen, `prefers-reduced-motion` disables the animation (content stays fully visible), touch devices get no tilt.
- Contact email is visible as text in the Contact section (alongside GitHub and LinkedIn links). No phone number is published on the site. No fake testimonials or awards — milestones are real.

## Structure

- `index.html` — the site: sticky header, 3D hero, (01) About, (02) Disciplines, (03) Selected Works (exactly 3), (04) Dream Mode, (05) Milestones, (06) Contact, footer
- `work/javaquest.html`, `work/ai-calling-agent.html`, `work/koffa.html` — one project detail page per selected work ("Open the memory")
- `css/style.css` — all styles (responsive with mobile nav below 820px)
- `js/fluid.js` — cursor-reactive fluid background (Canvas 2D, no WebGL)
- `js/hero3d.js` — Three.js hero scene (ES module, pinned CDN importmap)
- `js/main.js` — mobile nav, dream toggle, scroll reveal, cursor cube, card tilt, dream-wake
- `assets/avatar.jpg` — Adarsh's GitHub avatar photo
- `favicon.svg` — "AT" monogram favicon (ink + purple)
- `404.html` — self-contained not-found page in the new palette
- `robots.txt`, `sitemap.xml` — search indexing
- `.nojekyll` — tells GitHub Pages to serve files as-is

## Run locally

No build step — serve the folder (ES modules need http, not `file://`):

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000/

## Contact

- Email: adarshtripathi249@email.com
- GitHub: https://github.com/adarshtripathi108
- LinkedIn: https://www.linkedin.com/in/adarsh-tripathi-63b79041b/
