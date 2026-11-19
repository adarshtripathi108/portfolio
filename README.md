# Adarsh Tripathi — Portfolio

Personal portfolio website for Adarsh Tripathi, B.E. CSE student at Chitkara University. A clean single-page site rebuilt to match the Themewagon Nova template exactly — same layout, palette and structure — built as original plain HTML/CSS/JS, no build step.

**Live:** https://adarshtripathi108.github.io/portfolio/

## Design (Nova-exact)

- Palette: warm cream `#FFFBF5` background, near-black `#111111` headings, warm grey `#6E6E6E` body, tan accent `#C08A64`, beige borders `#EAE3D8`, dark charcoal `#1B1917` stats bar, near-black `#0F0E0D` footer.
- Font: Inter throughout (Google Fonts + system fallback).
- Pill buttons (56px), 24px card radii, organic blob hero image.
- No blue anywhere. The only photo is Adarsh's own GitHub avatar (`assets/avatar.jpg`), used in the hero and About sections; all other visuals are CSS-only.

## Structure

- `index.html` — the whole site: sticky header, hero, stats bar, Selected work, What I do, About, FAQ, Milestones, dark footer panel
- `css/style.css` — all styles (cream/tan/ink, responsive with mobile nav below 820px)
- `js/main.js` — mobile nav, smooth scroll, footer year, FAQ accordion (first item open by default), scroll reveal
- `assets/avatar.jpg` — Adarsh's GitHub avatar photo
- `favicon.svg` — "AT" monogram favicon (tan)
- `404.html` — simple not-found page
- `.nojekyll` — tells GitHub Pages to serve files as-is

## Run locally

No build step — open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000/

## Contact

- Email: adarshtripathi249@email.com
- GitHub: https://github.com/adarshtripathi108
- LinkedIn: https://www.linkedin.com/in/adarsh-tripathi-63b79041b/
