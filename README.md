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


## V29 dual-theme hero + uniform visuals

### Hero
- The front/base hero is now a light presentation of the existing hero.
- Pointer movement reveals a separate dark/real hero composition.
- The revealed layer includes the headline, availability label, Start a Project
  button, and View Work button.
- The duplicate hero copy uses the same responsive `.hero-copy-v10`,
  `.hero-title-v10`, and CTA classes, so its geometry follows the base layout.
- Only the reveal layer is masked; the real buttons remain underneath and
  clickable.
- The reveal mask uses overlapping solid radial/elliptical water bodies and
  collapses by shrinking geometry instead of fading the whole layer.
- One video element is retained; CSS backdrop treatment creates the two theme
  states to avoid decoding the hero video twice.

### Visual work
- Every gallery thumbnail is now a real 960×1200 (4:5) WebP canvas.
- Source artwork is contained inside those canvases without cropping.
- Digna 70th and Bagets Jersey use the supplied thumbnail images.
- The visual rail now moves continuously with requestAnimationFrame on every
  device instead of waiting between slides.
- It never pauses on mouse hover.
- Mobile/tablet movement uses an inline `!important` transform so older
  responsive `transform:none!important` rules cannot disable the transition.
- Continuous speed is approximately 44 px/s on phones, 48 px/s on tablets,
  and 54 px/s on laptops/desktops.
