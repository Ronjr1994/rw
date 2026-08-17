# RON'S WORK

Static portfolio site for **RON'S WORK — Systems for Real Work**.

## Stack

* Semantic HTML
* CSS
* Vanilla JavaScript
* Canvas/SVG motion effects
* Responsive video hero
* No build step or framework

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

* Hero uses a refined WebGL water reveal: the pointer exposes a same-size dark-mode duplicate of the hero, and the visible water collapses by shrinking its thresholded geometry rather than fading.
* Hero video includes WebM, MP4, and poster fallbacks.
* Large project screenshots are WebP-optimized.
* Existing local visual-work assets are served locally instead of relying on the older portfolio host.
* About/logo motion preserves reduced-motion and coarse-pointer fallbacks.
* The project form opens the visitor's email client; it does not send data to a server.
* No API keys, environment variables, credentials, or backend are required.

## 

