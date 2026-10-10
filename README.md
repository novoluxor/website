# NovoLuxor website

The NovoLuxor studio website, featuring LibraVia and VelaCanto. Includes the home page, app catalog, app detail pages, approach, and about pages.

## Structure

The ready-to-serve static site is at the repository root. `assets/` contains native app screenshots, icons, and device models. `src/device-scene.mjs` is the editable Three.js renderer source; its generated bundle is `device-scene.js`.

## Local preview

Run `python3 -m http.server 8000` from the repository root, then open http://localhost:8000/.

## Renderer development

Install the development dependencies with `npm install`. After changing `src/device-scene.mjs`, run `npm run build:devices` and commit the regenerated `device-scene.js`. HTML and CSS changes require no build step.

## GitHub Pages

The repository contains the complete static output and `.nojekyll`. GitHub Pages can serve the default branch from **/(root)** once Pages is configured in repository Settings.

Links and asset URLs are root-relative. This version is suitable for hosting at `novoluxor.com` or an organization-root Pages site. Publishing at the default project URL `https://novoluxor.github.io/website/` requires adapting the base paths first. Domain and Pages configuration are separate from this initial source commit.

## Assets and credits

See `SCREENSHOT-SELECTION.md` for screenshot selection and provenance, and `DEVICE-ASSETS.md` for the device renderer. Third-party model attribution and dependency license notices are included in `assets/MODEL-CREDITS.txt` and `vendor/`.

No license is granted for reuse of NovoLuxor's original code or assets. Third-party components retain their own licenses.
