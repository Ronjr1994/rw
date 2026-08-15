# RON'S WORK

Static portfolio site for **RON'S WORK — Systems for Real Work**.

## Stack

- Semantic HTML
- CSS
- Vanilla JavaScript
- Canvas/SVG motion effects
- Responsive video hero
- No build step or framework

## Local preview

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## GitHub Pages

1. Push this repository to GitHub.
2. Open **Settings → Pages**.
3. Choose **Deploy from a branch**.
4. Select the publishing branch (normally `main`) and `/ (root)`.
5. Save and wait for the deployment.

`.nojekyll` is included because this is a plain static site.

## Production notes

- Hero uses a refined WebGL water reveal: the pointer exposes a same-size dark-mode duplicate of the hero, and the visible water collapses by shrinking its thresholded geometry rather than fading.
- Hero video includes WebM, MP4, and poster fallbacks.
- Large project screenshots are WebP-optimized.
- Existing local visual-work assets are served locally instead of relying on the older portfolio host.
- About/logo motion preserves reduced-motion and coarse-pointer fallbacks.
- The project form opens the visitor's email client; it does not send data to a server.
- No API keys, environment variables, credentials, or backend are required.

## Before publishing

Update social metadata in `index.html` if the final public URL or preview image changes.

No open-source license is included. Add one only if you want to grant explicit reuse or redistribution rights.


## Refined hero water

The updated hero water behavior is based on the supplied reference recording:

- solid, smooth water body while active;
- slow cursor movement creates larger pools;
- faster movement creates thinner connected ribbons;
- occasional detached droplets;
- the fluid reveals a same-size dark-mode copy of the live hero;
- the real responsive headline geometry is reused for the second layer;
- after the cursor slows/stops, the field's decay increases and its visible
  threshold rises, causing the water to shrink, neck, separate, and disappear;
- CTA controls remain above the visual water layer;
- touch drag, reduced-motion, viewport pausing, and WebGL fallback are included.

No Nothin visual assets or proprietary shader source are included.


## V24 responsive/media-fit pass

- System/project screenshots use a stable 16:9 frame with `object-fit: contain`;
  screenshots are never cropped.
- Visual-work thumbnails use one consistent 4:5 presentation canvas with
  equal internal padding and `object-fit: contain`.
- Gallery sizing is 3-up on desktop, 2-up on tablets/small laptops, and
  1-up on phones.
- Desktop gallery motion accounts for the real CSS gap and pauses off desktop;
  tablets and phones use native touch scrolling with scroll snap.
- Page-level horizontal overflow is clipped defensively.
- iOS safe-area insets are respected for header, sections, menu, modal, and
  mobile gallery sizing.
- Extra-small phones and short landscape viewports have dedicated safeguards.
- CTA, menu, system grids, About, Contact, and the project modal all constrain
  content to the viewport.
- The refined V23 water hero behavior is unchanged.


## V25 compact layout + transparent divisions

- Project sections use transparent backgrounds and restrained 1px hairline borders.
- Project media frames are transparent and retain full screenshot visibility.
- Visual cards use the same transparent/hairline treatment.
- Section padding, case spacing, caption spacing, and mobile text were tightened.
- Heavy fills and shadows were removed from project and visual cards.
- The visual gallery now transitions on desktop, tablet, Android, and iOS.
- Autoplay uses a 480ms transform and ~3.2–3.5s hold.
- Touch immediately pauses autoplay; horizontal swipe moves one item.
- Autoplay resumes 900ms after touch ends.
- Seamless clone looping remains enabled on mobile/tablet.
- Reduced-motion disables auto motion.
- Refined V23 hero water and project links are unchanged.


## V26 thumbnail + timing + hero CTA visibility pass

- Added two new visual thumbnails from the provided images:
  - Digna 70th
  - Bagets Jersey
- Shortened gallery autoplay hold timing:
  - mobile: ~2.1s
  - tablet: ~2.25s
  - desktop: ~2.4s
- Kept the transition motion, but made the gallery feel faster.
- Reinforced hero button visibility and clickability above the liquid/water layer.
- Disabled pointer events on likely hero liquid overlay layers/canvases.
- Preserved full-image contain fit for visual thumbnails.


## V27 focused correction

- Project and visual strokes are now nearly transparent.
- Hero liquid is constrained to the exact responsive headline bounds.
- Only the headline is liquified/revealed; the hero background is not part of
  the liquid canvas.
- CTA buttons remain above the liquid layer.
- Digna 70th and Bagets Jersey now use the supplied thumbnails.
- Visual rail runs continuously on desktop, laptop, tablet, Android, and iOS.
- Hovering over a visual no longer pauses the transition.
- Touch pauses only while the finger is down and resumes after 250ms.
- Current hold timing: 1.7s phone, 1.85s tablet, 2.0s desktop/laptop.
- Transition duration: 420ms.


## V44 — single lime hero CTA + responsive hardening

- Uses this uploaded continuous build as the source.
- Removed the hero `VIEW WORK` button.
- `START A PROJECT` is the only hero button and uses a hero-specific acid lime.
- Existing hero availability microcopy is retained.
- Added responsive rules for:
  - large desktops
  - laptops / standard desktops
  - landscape and portrait tablets
  - iOS and Android phones
  - very narrow phones
  - short landscape phone orientations
- Added safe-area support for notched iPhones/iPads.
- Uses `100svh` + `100dvh` so mobile browser chrome does not clip the hero.
- Touch target remains at least 48px on coarse-pointer devices.
- Existing downstream page structure, project links, hero liquid effect,
  and continuous visual rail behavior are preserved.


## V45 hero status copy

Changed the hero microcopy from:
- `AVAILABLE FOR SELECTED PROJECTS`

to:
- `OPEN FOR SELECT PROJECTS`

No layout, CTA, motion, project, or responsive behavior was changed.


## V47 — fixed mobile Visual Projects + responsive phones + loader

Visual Projects
- exact 0.49 second / 490ms slide transition
- fixes the old mobile/tablet `transform:none!important` conflict by using
  authoritative inline `!important` transform + transition values
- finger-follow drag before release
- snap/settle animation after release
- Pointer Events for modern iOS/iPadOS/Android browsers
- Touch Events fallback for older Safari/WebView engines
- horizontal swipe does not hijack vertical page scrolling
- swipe on the live Digna card does not accidentally activate the link
- autoplay restarts after touch and after orientation/resize changes
- Safari transition-end timeout fallback

Smartphone responsiveness
- safe-area-aware existing layout preserved
- final min-width/max-width guards across major content sections
- long contact/footer text can wrap instead of creating horizontal overflow
- extra-small phone and short-landscape safeguards

Opening loader
- dark RON’S WORK branded loading screen
- acid-lime progress line and percentage
- minimum short display, maximum 1.25s wait for load
- wipe-up handoff into the existing hero motion
- 4-second CSS fail-safe if JavaScript ever fails
- reduced-motion fallback


## V48 — loader symbol + slow 0–100% count

- Added the user-provided RON’S WORK symbol to the opening loader.
- Symbol sits beside the RON’S WORK wordmark.
- Live percentage sits on the opposite side for a cleaner composition.
- Counter now visibly runs from 0% to 100% over approximately 2.4 seconds.
- Acid-lime progress bar tracks the same linear progress.
- Loader wipes into the existing hero after reaching 100%.
- Reduced-motion users skip the prolonged count.
- 3.6-second hard fail-safe prevents the loader from blocking the page.
- Updated stylesheet/script cache-busting to v48.
- V47 Android/iOS/tablet Visual Projects transition fixes remain intact.


## V49 — logo replaces the O in WORK

Loader wordmark now reads visually as:

RON’S W[LOGO]RK

- the uploaded RON’S WORK symbol replaces the letter O
- symbol rotates continuously at a restrained 4.8-second linear cycle
- rotation stops under `prefers-reduced-motion`
- 0% -> 100% loader count from V48 is preserved
- progress bar remains synchronized
- Android/iOS/tablet Visual Projects transition fixes are preserved
- mobile responsiveness from V47/V48 is preserved
- stylesheet/script cache-busting updated to v49


## V50 — visible rotating logo O

The uploaded symbol is mostly near-black, so it blended into the dark loader.
This pass keeps the original symbol unchanged and improves contrast by:
- adding a warm-paper circular backing behind the logo
- increasing the O/logo footprint
- slightly raising artwork brightness/contrast
- keeping the 4.8s linear rotation
- preserving the 0–100% loader count and the mobile Visual Projects fixes


## V51 — minimalist loader logo

- Rebuilt the user-supplied logo as a transparent loader asset.
- Removed the warm-paper circular backing.
- Main emblem is now flat smoked silver (#C7CBC4).
- Original center accent is retained in acid lime (#DFFF43).
- Tiny edge gaps/pinholes are cleaned while the intended geometric divisions remain.
- Logo continues to replace the O in WORK.
- Rotation slowed from 4.8s to 6.4s for a calmer, more premium feel.
- 0–100% loader count and mobile Visual Projects fixes are unchanged.
- Cache-busting updated to v51.


## V52 — user logo favicon

The user-provided logo is now used for:
- browser favicon PNG
- favicon ICO
- 32px favicon
- Apple touch icon
- 192px PWA icon
- 512px PWA icon

The older SVG favicon reference was removed so browsers do not prefer the old mark.
Favicon URLs include `?v=52` cache busting.

## V53 — transparent favicon + transparent loader logo O

Updated to use the user's logo in two ways:

- favicon / app icons now use the user's logo with **no added background**
- the same transparent logo is used as the **“O” in WORK** inside the opening loader wordmark

Refinements:
- removed the previous filled favicon background treatment
- kept the loader logo aligned within `W [logo] RK`
- preserved the slow rotation on the logo
- cache-busted favicon / CSS / JS references with `v=53`


## V54 — replaced loader / favicon logo

Updated to use the newly provided logo:

- replaced the favicon set with the new logo
- replaced the rotating logo used as the “O” in `WORK`
- kept transparent background treatment
- added cache-busting version `v=54`


## V55 — compact pricing refinement

Public pricing now uses project-based starting prices only:

- Operations Systems — from $450
- Web & Interfaces — from $600
- Automation & Workflow — from $450
- Visual Communication — from $150

The pricing section no longer includes a duplicate “Get a Project Estimate” CTA.
It now ends with one quiet note:

CUSTOM SCOPES ARE QUOTED AFTER A SHORT PROJECT REVIEW.

Hourly pricing is intentionally not published on the landing page; it can be
quoted privately when a client requests ongoing or flexible-scope work.
