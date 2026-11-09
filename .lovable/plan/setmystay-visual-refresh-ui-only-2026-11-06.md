# SetMyStay visual refresh (UI-only)

Strictly visual changes. No changes to API calls, sign-in, Razorpay payments, saved browser data, props, form payloads or page logic.

## 1. Smoother rounded corners
- Raise the global corner radius from 0.75rem to 1rem.
- Hero, category cards, property and roommate cards, and dialogs use `rounded-2xl`/`rounded-3xl`; inputs use `rounded-xl`; buttons and badges use `rounded-xl` or `rounded-full`. Layout and sizes stay the same.

## 2. Moving city skyline in the hero
- Replace the current living-room photo and blue overlay with:
  - A muted, looping, autoplaying aerial skyline video that covers the whole hero (free stock clip, e.g. Pexels/Mixkit).
  - A high-res skyline photo behind it with a slow, continuous pan/zoom animation, so the hero keeps moving while the video loads or if it fails.
  - A dark slate/blue gradient on top so the white text and buttons stay readable.
- Heading, subtitle, 3 buttons, height and padding stay unchanged. Motion turns off for users who have reduced motion enabled.

## 3. "Back to Home" button on Add a Listing
- Top-left button with an arrow icon that goes to the home page. Form untouched.

## 4. Smoother interactions
- Buttons: `transition-all duration-200 ease-out` plus a slight press effect (`active:scale-[0.97]`).
- Property, roommate and home category cards: hover lift and shadow (`hover:-translate-y-1 hover:shadow-xl duration-300`).
- Dialogs and tabs: short, lightweight open/close animations; remove the expensive `backdrop-brightness` filter from the hero.

## Technical details
Files: `src/styles.css` (radius, pan/zoom keyframes), `src/components/ui/button.tsx`, `dialog.tsx`, `input.tsx`, `badge.tsx`, `tabs.tsx`, `src/components/sections/home-section.tsx`, `src/components/shared/property-card.tsx`, `roommate-card.tsx`, `src/routes/list-property.tsx` (Back link via TanStack `Link`). The guardrail file's Next.js paths map to these TanStack equivalents; `src/lib/*` is not touched.
