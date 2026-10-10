# Device presentation

The homepage and app pages render local iPhone and MacBook GLB models with Three.js. Static native screenshots provide a fallback when WebGL or asset loading fails.

Edit `assets/device-screens.json` to point each screen at a real app screenshot (PNG, JPEG, or WebP). LibraVia has four view pairs and VelaCanto has three; the homepage uses pair zero. Portrait phone and landscape Mac screenshots are separate. Selected native captures are now used for both apps. Their original aspect ratio is preserved on the model screens; mobile features use inline previews. See SCREENSHOT-SELECTION.md for the choices and provenance.

Run `npm install` followed by `npm run build:devices` when changing `src/device-scene.mjs`. Static content edits do not require a build. The production bundle is already generated.

Models use CC BY 4.0. Attribution, source links, and modifications are recorded in `assets/MODEL-CREDITS.txt` and linked from the pages. Runtime assets, texture mapping, decoder, and renderer are served locally; no third-party asset CDN is used.

Currently supported devices: iPhone, iPad, Mac. VelaCanto's Apple TV and CarPlay are planned. Watch is an illustrative exploration, not confirmed support.
