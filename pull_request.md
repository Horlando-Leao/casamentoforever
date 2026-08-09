## Summary
- randomize the public gift list order whenever the invite is opened
- add a reusable shuffle helper for array ordering
- keep the public gift flow and reservation logic unchanged

## Why
The public invitation should present the gift options in a different order each time so the list feels more dynamic and less predictable for guests.

## Changes
- added `shuffleArray` utility in `src/lib/shuffleArray.js`
- applied the randomization in `src/pages/PublicEventDetail.jsx` before rendering public gifts
- validated the production build still succeeds with Vite/PWA

## Verification
- `npm run build`
- result: completed successfully with `vite build` and PWA precache generation
