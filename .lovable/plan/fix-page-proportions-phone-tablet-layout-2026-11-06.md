# Fix page proportions + phone/tablet layout

## What's wrong
- Page content stretches edge-to-edge on wide screens, and the top section bleeds past the sides (causing the sideways scrollbar). The original app capped content at a centered max width with side padding, but that rule didn't carry over in the migration.
- The SetMyStay logo next to the name is invisible: its colours point at an old colour format.

## Fixes (match your 1st screenshot)
1. **Centered page width** everywhere: content stays centered, max ~1400px, with comfortable side padding (smaller on phones). That covers the header, home, listings, list property, admin and staff pages.
2. **Top section** sits inside that width with rounded corners on every side, with no bleed and no sideways scroll. Restore the look from screenshot 1:
   - small glass pill above the heading: "Zero Brokerage Options • Verified Stays" with a sparkle icon
   - "Living Space" with the word "Space" in a light blue gradient
   - white, fully rounded buttons with blue icons and text
   - keep the moving skyline video, panning photo and dark overlay
3. **Logo** shows again in the header and mobile menu.

## Phones and tablets
- Phones: smaller heading, buttons stack full-width, hero height fits the screen, side padding 16px, feature cards in one column, no sideways scroll anywhere.
- Tablets: buttons wrap in two rows nicely, feature cards in 2–3 columns, header switches to the menu button below laptop size so links don't crowd.
- Check the floating + and gift buttons don't cover content on phones; make them slightly smaller there.
- Verify Home, Listings, List Property, Admin and Staff at 390px, 768px and 1440px.

## Technical details
- Add `@utility container { margin-inline:auto; padding-inline:1rem (sm 1.5rem, lg 2rem); max-width:1400px }` in `src/styles.css` (Tailwind v4 replacement for the old v3 container config).
- `home-section.tsx`: drop `-mx-*` from the hero, use `rounded-3xl`, add badge + gradient span, responsive `text-4xl sm:text-5xl lg:text-6xl`, buttons `w-full sm:w-auto rounded-full bg-background text-primary`.
- `icons.tsx`: change `hsl(var(--x))` to `var(--x)` in the Logo SVG.
- Header breakpoint check (`md` → `lg` for the desktop nav if crowding); `overflow-x-clip` on the page root as a safety net.
- Visual-only; no API, auth, payment or form logic touched.
