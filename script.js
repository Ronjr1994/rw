(() => {
  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector("[data-menu-button]");
  const menuPanel = document.querySelector("[data-menu-panel]");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const updateHeader = () => header?.classList.toggle("scrolled", scrollY > innerHeight * .72);
  updateHeader();
  addEventListener("scroll", updateHeader, { passive: true });

  const focusableSelector =
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const trapFocusWithin = (container, event) => {
    if (event.key !== "Tab" || !container) return;
    const items = [...container.querySelectorAll(focusableSelector)]
      .filter(el => !el.hidden && el.getClientRects().length);
    if (!items.length) return;

    const first = items[0];
    const last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const setMenu = (open) => {
    if (!menuButton || !menuPanel) return;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menuPanel.classList.toggle("open", open);
    menuPanel.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
    if (open) setTimeout(() => menuPanel.querySelector("a")?.focus(), 60);
  };

  menuButton?.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
  menuPanel?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", e => {
    if (!menuPanel?.classList.contains("open")) return;

    if (e.key === "Escape") {
      setMenu(false);
      menuButton?.focus();
    } else {
      trapFocusWithin(menuPanel, e);
    }
  });

  const reveals = document.querySelectorAll(".reveal");
  if (reduced || !("IntersectionObserver" in window)) {
    reveals.forEach(el => el.classList.add("visible"));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        io.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: "0px 0px -7% 0px" });
    reveals.forEach(el => io.observe(el));
  }


  // V12 motion system --------------------------------------------------------
  const hero = document.querySelector(".hero-v10");
  const heroFilm = document.querySelector(".hero-film-v11");

  // V48 opening loader — visible 0% -> 100% count ----------------------
  const pageLoaderV47 = document.querySelector("[data-site-loader-v47]");
  const loaderBarV47 = document.querySelector("[data-loader-bar-v47]");
  const loaderPercentV47 = document.querySelector("[data-loader-percent-v47]");

  const LOADER_COUNT_MS_V48 = 2400;
  const loaderStartV48 = performance.now();

  let loaderRafV48 = 0;
  let loaderCompleteV48 = false;

  const paintLoaderV48 = progress => {
    const clamped =
      Math.max(0,Math.min(1,progress));

    const percent =
      Math.min(
        100,
        Math.round(clamped * 100)
      );

    if (loaderBarV47) {
      loaderBarV47.style.transform =
        `scaleX(${clamped.toFixed(4)})`;
    }

    if (loaderPercentV47) {
      loaderPercentV47.textContent =
        `${percent}%`;
    }
  };

  const exitLoaderV48 = () => {
    if (loaderCompleteV48) return;
    loaderCompleteV48 = true;

    paintLoaderV48(1);

    setTimeout(() => {
      document.body.classList.remove("motion-loading");
      document.body.classList.add("motion-ready");
      document.body.classList.remove("site-loading-v47");
      pageLoaderV47?.classList.add("is-exiting");

      setTimeout(() => {
        pageLoaderV47?.remove();
      }, reduced ? 0 : 560);
    }, reduced ? 0 : 150);
  };

  const tickLoaderV48 = now => {
    if (loaderCompleteV48) return;

    const elapsed =
      now - loaderStartV48;

    const linear =
      Math.min(
        1,
        elapsed / LOADER_COUNT_MS_V48
      );

    /*
      The percentage advances continuously from 0 to 100.
      The bar uses the same real linear progress so the number never
      races ahead of the visual indicator.
    */
    paintLoaderV48(linear);

    if (linear < 1) {
      loaderRafV48 =
        requestAnimationFrame(
          tickLoaderV48
        );
    } else {
      exitLoaderV48();
    }
  };

  if (pageLoaderV47) {
    paintLoaderV48(0);

    if (reduced) {
      paintLoaderV48(1);
      exitLoaderV48();
    } else {
      loaderRafV48 =
        requestAnimationFrame(
          tickLoaderV48
        );
    }

    /* Hard safety: loader can never block the page indefinitely. */
    setTimeout(() => {
      if (!loaderCompleteV48) {
        if (loaderRafV48) {
          cancelAnimationFrame(
            loaderRafV48
          );
          loaderRafV48=0;
        }

        exitLoaderV48();
      }
    }, 3600);
  } else {
    document.body.classList.remove("motion-loading");
    document.body.classList.add("motion-ready");
    document.body.classList.remove("site-loading-v47");
  }


  // CRISP-reference visual rail ----------------------------------------
  const crispRail = document.querySelector("[data-crisp-rail]");
  let crispRailTimer = null;

  function setupCrispRail(){
    if (!crispRail) return;

    const viewport = crispRail.querySelector(".gallery-viewport");
    const track = crispRail.querySelector(".gallery-track");
    const firstCard = crispRail.querySelector(".gallery-card");

    if (!viewport || !track || !firstCard) return;

    if (!track.dataset.loopReady) {
      const originals = Array.from(track.children);

      originals.forEach(card => {
        const clone = card.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.setAttribute("data-crisp-clone", "true");

        clone.querySelectorAll("a,button,input,textarea,select")
          .forEach(el => el.setAttribute("tabindex", "-1"));

        clone.querySelectorAll("img")
          .forEach(img => img.setAttribute("alt", ""));

        track.appendChild(clone);
      });

      track.dataset.loopReady = "true";
    }

    const originalCount = Math.floor(track.children.length / 2);
    const reducedRail = matchMedia("(prefers-reduced-motion: reduce)");

    const TRANSITION_MS = 490;
    const TRANSITION_EASE = "cubic-bezier(.22,.78,.28,1)";

    let index = 0;
    let autoplayTimer = 0;
    let settleTimer = 0;
    let resizeTimer = 0;
    let settling = false;

    let gestureActive = false;
    let gestureHorizontal = false;
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let startTime = 0;
    let baseOffset = 0;
    let suppressClickUntil = 0;

    const step = () => {
      const cardWidth = firstCard.getBoundingClientRect().width;
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
      return cardWidth + gap;
    };

    const setTransition = enabled => {
      const value =
        enabled && !reducedRail.matches
          ? `transform ${TRANSITION_MS}ms ${TRANSITION_EASE}`
          : "none";

      /* Inline !important beats older mobile rules that forced transition:none. */
      track.style.setProperty("transition", value, "important");
      track.style.setProperty("-webkit-transition", value, "important");
    };

    const setTransform = pixels => {
      const value = reducedRail.matches
        ? "none"
        : `translate3d(${pixels.toFixed(3)}px,0,0)`;

      /* Inline !important beats older mobile rules that forced transform:none. */
      track.style.setProperty("transform", value, "important");
      track.style.setProperty("-webkit-transform", value, "important");
    };

    const offsetForIndex = value => -step() * value;

    const stopAutoplay = () => {
      if (autoplayTimer) {
        clearTimeout(autoplayTimer);
        autoplayTimer = 0;
      }
    };

    const holdTime = () => {
      if (innerWidth <= 680) return 1750;
      if (innerWidth <= 1180) return 1900;
      return 2050;
    };

    const scheduleAutoplay = () => {
      stopAutoplay();

      if (
        reducedRail.matches ||
        originalCount < 2 ||
        document.hidden ||
        gestureActive ||
        settling
      ) {
        return;
      }

      autoplayTimer = setTimeout(() => {
        goNext();
      }, holdTime());
    };

    const normalizeLoop = () => {
      clearTimeout(settleTimer);
      settleTimer = 0;

      if (index >= originalCount) {
        index = 0;
        setTransition(false);
        setTransform(offsetForIndex(index));
      }

      settling = false;
      scheduleAutoplay();
    };

    const animateTo = value => {
      if (reducedRail.matches) return;

      index = value;
      settling = true;
      stopAutoplay();

      setTransition(true);
      setTransform(offsetForIndex(index));

      clearTimeout(settleTimer);
      settleTimer = setTimeout(
        normalizeLoop,
        TRANSITION_MS + 90
      );
    };

    const goNext = () => {
      if (reducedRail.matches || settling) return;
      animateTo(index + 1);
    };

    const goPrevious = () => {
      if (reducedRail.matches || settling) return;

      if (index > 0) {
        animateTo(index - 1);
        return;
      }

      /*
        At the first original card, jump to its duplicate copy without motion,
        then animate backward exactly one card. This prevents a reverse flash
        on iOS/Android.
      */
      index = originalCount;
      setTransition(false);
      setTransform(offsetForIndex(index));

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          animateTo(originalCount - 1);
        });
      });
    };

    const transitionFinished = event => {
      if (event.target !== track) return;

      const property = String(event.propertyName || "");
      if (
        property &&
        !property.includes("transform")
      ) {
        return;
      }

      normalizeLoop();
    };

    track.addEventListener("transitionend", transitionFinished);
    track.addEventListener("webkitTransitionEnd", transitionFinished);

    const horizontalThreshold = () =>
      Math.max(28, Math.min(48, innerWidth * .07));

    const beginGesture = (x,y,id=null) => {
      if (reducedRail.matches) return;

      stopAutoplay();
      settling = false;
      clearTimeout(settleTimer);

      gestureActive = true;
      gestureHorizontal = false;
      pointerId = id;
      startX = currentX = x;
      startY = y;
      startTime = performance.now();
      baseOffset = offsetForIndex(index);

      setTransition(false);
    };

    const moveGesture = (x,y,preventDefault=null) => {
      if (!gestureActive) return;

      currentX = x;
      const dx = x - startX;
      const dy = y - startY;

      if (!gestureHorizontal) {
        if (
          Math.abs(dx) < 8 &&
          Math.abs(dy) < 8
        ) {
          return;
        }

        if (Math.abs(dy) > Math.abs(dx) * 1.08) {
          /* Native vertical scroll wins. */
          return;
        }

        gestureHorizontal = true;
      }

      if (gestureHorizontal) {
        preventDefault?.();
        setTransform(baseOffset + dx * .86);
      }
    };

    const finishGesture = (x,y,cancelled=false) => {
      if (!gestureActive) return;

      const dx = x - startX;
      const dy = y - startY;
      const elapsed = Math.max(1, performance.now() - startTime);
      const velocity = Math.abs(dx) / elapsed;
      const horizontal =
        gestureHorizontal &&
        Math.abs(dx) > Math.abs(dy) * 1.02;

      gestureActive = false;
      gestureHorizontal = false;
      pointerId = null;

      if (
        !cancelled &&
        horizontal &&
        (
          Math.abs(dx) >= horizontalThreshold() ||
          (Math.abs(dx) >= 20 && velocity >= .34)
        )
      ) {
        suppressClickUntil = performance.now() + 420;

        if (dx < 0) {
          animateTo(index + 1);
        } else {
          goPrevious();
        }
      } else {
        /* Snap back to the current project in the same 490ms motion language. */
        animateTo(index);
      }
    };

    /*
      Pointer Events cover current iOS/iPadOS Safari, Android Chrome,
      Samsung Internet, and modern tablet browsers.
    */
    if ("PointerEvent" in window) {
      viewport.addEventListener("pointerdown", event => {
        if (
          !event.isPrimary ||
          (event.pointerType !== "touch" && event.pointerType !== "pen")
        ) {
          return;
        }

        beginGesture(
          event.clientX,
          event.clientY,
          event.pointerId
        );
      }, {passive:true});

      viewport.addEventListener("pointermove", event => {
        if (
          !gestureActive ||
          event.pointerId !== pointerId
        ) {
          return;
        }

        moveGesture(
          event.clientX,
          event.clientY
        );

        if (gestureHorizontal) {
          try {
            viewport.setPointerCapture(event.pointerId);
          } catch {}
        }
      }, {passive:true});

      viewport.addEventListener("pointerup", event => {
        if (
          !gestureActive ||
          event.pointerId !== pointerId
        ) {
          return;
        }

        finishGesture(
          event.clientX,
          event.clientY,
          false
        );

        try {
          viewport.releasePointerCapture(event.pointerId);
        } catch {}
      }, {passive:true});

      viewport.addEventListener("pointercancel", event => {
        if (
          !gestureActive ||
          event.pointerId !== pointerId
        ) {
          return;
        }

        finishGesture(
          currentX || event.clientX,
          event.clientY,
          true
        );
      }, {passive:true});
    }

    /*
      Explicit Touch Events fallback for older Safari/WebView engines.
      touchmove is non-passive only so horizontal drags can own the rail;
      vertical page scrolling remains untouched.
    */
    let fallbackTouch = false;

    viewport.addEventListener("touchstart", event => {
      if ("PointerEvent" in window) return;

      const touch = event.touches[0];
      if (!touch) return;

      fallbackTouch = true;
      beginGesture(touch.clientX, touch.clientY);
    }, {passive:true});

    viewport.addEventListener("touchmove", event => {
      if (!fallbackTouch || !gestureActive) return;

      const touch = event.touches[0];
      if (!touch) return;

      moveGesture(
        touch.clientX,
        touch.clientY,
        () => event.preventDefault()
      );
    }, {passive:false});

    viewport.addEventListener("touchend", event => {
      if (!fallbackTouch || !gestureActive) return;

      const touch = event.changedTouches[0];

      fallbackTouch = false;

      if (!touch) {
        finishGesture(currentX,startY,true);
        return;
      }

      finishGesture(
        touch.clientX,
        touch.clientY,
        false
      );
    }, {passive:true});

    viewport.addEventListener("touchcancel", () => {
      if (!fallbackTouch) return;
      fallbackTouch = false;
      finishGesture(currentX,startY,true);
    }, {passive:true});

    /*
      A swipe beginning on the live Digna link must not open the link after
      a horizontal drag. Normal taps remain fully clickable.
    */
    crispRail.addEventListener("click", event => {
      if (performance.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);

    const resync = () => {
      stopAutoplay();
      clearTimeout(settleTimer);
      settling = false;
      gestureActive = false;
      gestureHorizontal = false;
      index = 0;

      setTransition(false);
      setTransform(offsetForIndex(index));

      requestAnimationFrame(() => {
        requestAnimationFrame(scheduleAutoplay);
      });
    };

    addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resync, 140);
    }, {passive:true});

    addEventListener("orientationchange", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resync, 240);
    }, {passive:true});

    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resync, 120);
      });

      observer.observe(viewport);
      observer.observe(firstCard);
    }

    reducedRail.addEventListener?.("change", resync);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAutoplay();
      } else {
        scheduleAutoplay();
      }
    });

    setTransition(false);
    setTransform(offsetForIndex(index));
    scheduleAutoplay();
  }

  setupCrispRail();


  // AETHER FORGE ---------------------------------------------------------
  // Original raw-WebGL scene built from the project's uploaded 3D/motion
  // references. One GPU draw call; no GetLayers premium source is embedded.
  const aetherStage = document.querySelector("[data-aether-scene]");

  if (aetherStage) {
    const canvas = aetherStage.querySelector("[data-aether-canvas]");
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = matchMedia("(hover: none) and (pointer: coarse)");

    const DEVICE = (() => {
      const width = window.innerWidth;
      if (width < 760 || coarsePointer.matches) {
        return { tier:"mobile", rods:280, dpr:0.9, frameMs:1000/30, accent:0.045 };
      }
      if (width < 1180) {
        return { tier:"tablet", rods:460, dpr:1.15, frameMs:1000/45, accent:0.05 };
      }
      return { tier:"desktop", rods:760, dpr:1.5, frameMs:0, accent:0.055 };
    })();

    const saveData = navigator.connection?.saveData === true;
    const lowMemory = typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 2;
    const energySaver = saveData || lowMemory;
    const shouldFreeze = () => reduceMotion.matches || (DEVICE.tier === "mobile" && energySaver);

    let gl = null;
    let program = null;
    let vao = null;
    let buffer = null;
    let visible = false;
    let running = false;
    let raf = 0;
    let lastFrame = 0;
    let startTime = performance.now();
    let resizeObserver = null;
    let intersectionObserver = null;
    let contextLost = false;

    const VERT = `#version 300 es
      precision highp float;

      in vec3 aCenter;
      in vec4 aData;
      in vec2 aCorner;

      uniform float uTime;
      uniform vec2 uResolution;
      uniform float uAspect;

      out float vDepth;
      out float vAcross;
      out float vAccent;
      out float vGlint;
      out float vFog;

      mat2 rot(float a) {
        float c = cos(a), s = sin(a);
        return mat2(c,-s,s,c);
      }

      vec3 rotateScene(vec3 p, float t) {
        p.xz = rot(t * 0.075 + 0.16) * p.xz;
        p.yz = rot(-0.16 + sin(t * 0.055) * 0.045) * p.yz;
        p.xy = rot(sin(t * 0.043) * 0.032) * p.xy;
        return p;
      }

      void main() {
        float phase = aData.x;
        float lengthSeed = aData.y;
        float accentSeed = aData.z;
        float layerSeed = aData.w;

        vec3 c = aCenter;

        // The field begins as a softened cube, then curls around its Y axis.
        float radius = max(length(c.xz), 0.001);
        float curl = uTime * (0.045 + layerSeed * 0.022)
                   + sin(c.y * 2.8 + phase) * 0.19
                   + radius * 0.23;
        c.xz = rot(curl) * c.xz;

        // Small multi-axis breathing: enough life without "liquid" wobble.
        c.y += sin(uTime * 0.16 + phase * 2.2 + c.x * 1.7) * 0.035;
        c.x += sin(uTime * 0.11 + phase + c.z * 2.0) * 0.018;

        vec3 tangent = normalize(vec3(
          -c.z + 0.22 * sin(c.y * 3.0 + phase),
          0.18 * sin(phase * 1.7 + uTime * 0.12),
          c.x + 0.18 * cos(c.y * 2.4 + phase)
        ));

        // Camera-facing ribbon around the tangent gives each rod real thickness.
        vec3 viewDir = normalize(vec3(0.12, 0.04, 1.0));
        vec3 side = cross(tangent, viewDir);
        if (length(side) < 0.02) side = vec3(1.0, 0.0, 0.0);
        side = normalize(side);

        float rodLength = mix(0.055, 0.20, lengthSeed);
        float rodWidth = mix(0.0042, 0.0092, lengthSeed);

        vec3 p = c
          + tangent * (aCorner.x * rodLength)
          + side * (aCorner.y * rodWidth);

        p = rotateScene(p, uTime);

        // Perspective tuned for a large object that still leaves black negative space.
        float cameraZ = 4.15;
        float z = p.z + cameraZ;
        float focal = 2.22;
        vec2 projected = p.xy * focal / max(z, 0.75);
        projected.x /= max(uAspect, 0.01);

        gl_Position = vec4(projected, (p.z + 1.7) / 5.9, 1.0);

        vDepth = clamp((p.z + 1.75) / 3.5, 0.0, 1.0);
        vAcross = aCorner.y;
        vAccent = step(1.0 - ${DEVICE.accent.toFixed(3)}, accentSeed);

        float pulse = 0.5 + 0.5 * sin(uTime * 0.58 + phase * 7.0);
        float central = pow(max(0.0, 1.0 - abs(projected.x) * 1.05), 2.0);
        vGlint = smoothstep(0.82, 0.99, lengthSeed) * pulse * central;

        float radialFog = 1.0 - smoothstep(0.35, 1.55, length(projected));
        vFog = mix(0.28, 1.0, radialFog);
      }
    `;

    const FRAG = `#version 300 es
      precision highp float;

      in float vDepth;
      in float vAcross;
      in float vAccent;
      in float vGlint;
      in float vFog;

      out vec4 outColor;

      void main() {
        // Brushed platinum: darker at the rod edges, brighter through the spine.
        float spine = 1.0 - smoothstep(0.18, 1.0, abs(vAcross));
        float metallic = mix(0.42, 0.97, vDepth) * mix(0.72, 1.0, spine);

        vec3 platinum = vec3(
          metallic * 0.97,
          metallic * 0.985,
          metallic
        );

        // Sparse brand signal; intentionally rare so it reads as authorship.
        vec3 acid = vec3(0.867, 1.0, 0.302);
        vec3 color = mix(platinum, acid, vAccent * 0.88);

        float glint = vGlint * (0.22 + 0.78 * spine);
        color += vec3(glint);

        float alpha = mix(0.18, 0.78, vDepth) * vFog;
        alpha += glint * 0.22;
        alpha = clamp(alpha, 0.05, 0.96);

        outColor = vec4(color, alpha);
      }
    `;

    const compileShader = (type, source) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Unable to create WebGL shader.");
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader) || "Unknown shader compile error";
        gl.deleteShader(shader);
        throw new Error(info);
      }
      return shader;
    };

    const createProgram = () => {
      const vertex = compileShader(gl.VERTEX_SHADER, VERT);
      const fragment = compileShader(gl.FRAGMENT_SHADER, FRAG);
      const next = gl.createProgram();
      if (!next) throw new Error("Unable to create WebGL program.");
      gl.attachShader(next, vertex);
      gl.attachShader(next, fragment);
      gl.linkProgram(next);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      if (!gl.getProgramParameter(next, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(next) || "Unknown WebGL link error";
        gl.deleteProgram(next);
        throw new Error(info);
      }
      return next;
    };

    let seed = 0x524f4e; // "RON"
    const rand = () => {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return (seed >>> 0) / 4294967296;
    };

    const buildGeometry = () => {
      seed = 0x524f4e;
      const stride = 9; // center3 + data4 + corner2
      const verticesPerRod = 6;
      const values = new Float32Array(DEVICE.rods * verticesPerRod * stride);
      let o = 0;

      const corners = [
        [-1,-1], [1,-1], [1,1],
        [-1,-1], [1,1], [-1,1]
      ];

      for (let i=0; i<DEVICE.rods; i++) {
        // Cube distribution with shell bias gives an architectural silhouette.
        let x = rand()*2-1;
        let y = rand()*2-1;
        let z = rand()*2-1;

        if (rand() < 0.58) {
          const axis = Math.floor(rand()*3);
          const edge = (rand()<0.5 ? -1 : 1) * (0.62 + rand()*0.38);
          if (axis===0) x=edge;
          if (axis===1) y=edge;
          if (axis===2) z=edge;
        }

        x *= 1.32;
        y *= 1.08;
        z *= 1.30;

        // Hollow the exact centre so the object has a designed negative-space core.
        const core = Math.max(0.001, Math.hypot(x,y,z));
        if (core < 0.34) {
          const s = 0.34/core;
          x*=s; y*=s; z*=s;
        }

        const phase = rand()*Math.PI*2;
        const lengthSeed = rand();
        const accentSeed = rand();
        const layerSeed = rand();

        for (const [cx,cy] of corners) {
          values[o++]=x; values[o++]=y; values[o++]=z;
          values[o++]=phase;
          values[o++]=lengthSeed;
          values[o++]=accentSeed;
          values[o++]=layerSeed;
          values[o++]=cx;
          values[o++]=cy;
        }
      }
      return values;
    };

    const configureGeometry = () => {
      const values = buildGeometry();
      vao = gl.createVertexArray();
      buffer = gl.createBuffer();
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, values, gl.STATIC_DRAW);

      const stride = 9 * Float32Array.BYTES_PER_ELEMENT;
      const locCenter = gl.getAttribLocation(program, "aCenter");
      const locData = gl.getAttribLocation(program, "aData");
      const locCorner = gl.getAttribLocation(program, "aCorner");

      gl.enableVertexAttribArray(locCenter);
      gl.vertexAttribPointer(locCenter,3,gl.FLOAT,false,stride,0);

      gl.enableVertexAttribArray(locData);
      gl.vertexAttribPointer(locData,4,gl.FLOAT,false,stride,3*4);

      gl.enableVertexAttribArray(locCorner);
      gl.vertexAttribPointer(locCorner,2,gl.FLOAT,false,stride,7*4);

      gl.bindVertexArray(null);
    };

    const uniforms = {};
    const cacheUniforms = () => {
      uniforms.time = gl.getUniformLocation(program, "uTime");
      uniforms.resolution = gl.getUniformLocation(program, "uResolution");
      uniforms.aspect = gl.getUniformLocation(program, "uAspect");
    };

    const sizeCanvas = () => {
      if (!gl || contextLost) return;
      const rect = aetherStage.getBoundingClientRect();
      const cssW = Math.max(1, Math.round(rect.width));
      const cssH = Math.max(1, Math.round(rect.height));
      const rawDpr = window.devicePixelRatio || 1;
      const dpr = Math.min(rawDpr, DEVICE.dpr);

      const nextW = Math.max(1, Math.round(cssW*dpr));
      const nextH = Math.max(1, Math.round(cssH*dpr));
      if (canvas.width !== nextW || canvas.height !== nextH) {
        canvas.width = nextW;
        canvas.height = nextH;
      }
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      gl.viewport(0,0,nextW,nextH);
    };

    const draw = (timeMs, staticFrame=false) => {
      if (!gl || !program || !vao || contextLost) return;
      const t = staticFrame ? 3.8 : (timeMs-startTime)/1000;

      gl.clearColor(0.018,0.022,0.019,1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.uniform1f(uniforms.time, t);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.aspect, canvas.width/Math.max(1,canvas.height));

      gl.drawArrays(gl.TRIANGLES,0,DEVICE.rods*6);
      gl.bindVertexArray(null);

      if (location.search.includes("aetherDebug=1")) {
        window.__ronsAetherStats = {
          tier:DEVICE.tier,
          rodCount:DEVICE.rods,
          triangles:DEVICE.rods*2,
          drawCalls:1,
          dpr:Math.min(window.devicePixelRatio||1,DEVICE.dpr),
          frameBudgetMs:DEVICE.frameMs,
          frozen:shouldFreeze()
        };
      }
    };

    const frame = (time) => {
      if (!running || !visible || document.hidden || contextLost) {
        raf=0;
        return;
      }
      if (!DEVICE.frameMs || !lastFrame || time-lastFrame >= DEVICE.frameMs) {
        lastFrame=time;
        draw(time,false);
      }
      raf=requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || !visible || document.hidden || contextLost) return;
      if (shouldFreeze()) {
        draw(performance.now(),true);
        return;
      }
      running=true;
      lastFrame=0;
      raf=requestAnimationFrame(frame);
    };

    const stop = () => {
      running=false;
      if (raf) cancelAnimationFrame(raf);
      raf=0;
    };

    const dispose = () => {
      stop();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      if (!gl) return;
      if (buffer) gl.deleteBuffer(buffer);
      if (vao) gl.deleteVertexArray(vao);
      if (program) gl.deleteProgram(program);
      buffer=null; vao=null; program=null;
    };

    const fallback = () => {
      stop();
      canvas.hidden=true;
      aetherStage.classList.add("aether-fallback-only");
    };

    const init = () => {
      if (!canvas) return;
      gl = canvas.getContext("webgl2", {
        alpha:false,
        antialias:false,
        depth:false,
        stencil:false,
        powerPreference:DEVICE.tier==="mobile" ? "low-power" : "high-performance",
        preserveDrawingBuffer:false
      });

      if (!gl) {
        fallback();
        return;
      }

      try {
        program=createProgram();
        cacheUniforms();
        configureGeometry();

        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

        sizeCanvas();

        // Prewarm: compile/link/upload happened above; touch the final program once.
        draw(performance.now(),true);

        intersectionObserver = new IntersectionObserver(([entry]) => {
          visible=entry.isIntersecting;
          if (visible) start();
          else stop();
        }, { rootMargin:"100% 0px", threshold:0 });

        intersectionObserver.observe(aetherStage);

        // iOS/mobile: avoid framebuffer reallocations while the URL bar moves.
        if (DEVICE.tier !== "mobile") {
          resizeObserver = new ResizeObserver(() => {
            sizeCanvas();
            draw(performance.now(),shouldFreeze());
          });
          resizeObserver.observe(aetherStage);
        }

        document.addEventListener("visibilitychange", () => {
          if (document.hidden) stop();
          else start();
        });

        reduceMotion.addEventListener?.("change", () => {
          if (reduceMotion.matches) {
            stop();
            draw(performance.now(),true);
          } else {
            start();
          }
        });

        canvas.addEventListener("webglcontextlost",(event) => {
          event.preventDefault();
          contextLost=true;
          fallback();
        },{passive:false});

        window.addEventListener("pagehide",dispose,{once:true});
      } catch (error) {
        console.error("[Aether Forge] WebGL initialisation failed:",error);
        fallback();
      }
    };

    init();
  }


  // Identity-preserving portrait relief ---------------------------------
  // Uses the user's actual portrait texture + shallow generated depth map.
  // It is a 3D bas-relief, not photogrammetry or a reconstructed full head.
  const portraitStage = document.querySelector("[data-portrait-scene]");

  if (portraitStage) {
    const canvas = portraitStage.querySelector("[data-portrait-canvas]");
    const fallback = portraitStage.querySelector(".about-portrait-fallback");
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = matchMedia("(pointer: coarse)");

    const DEVICE = (() => {
      const mem = navigator.deviceMemory || 4;
      const cores = navigator.hardwareConcurrency || 4;
      if (coarse.matches || innerWidth < 720 || mem <= 3 || cores <= 4) {
        return { tier:"mobile", dpr:.9, fps:30, grid:46 };
      }
      if (innerWidth < 1180 || mem <= 6 || cores <= 8) {
        return { tier:"tablet", dpr:1.15, fps:45, grid:58 };
      }
      return { tier:"desktop", dpr:1.45, fps:60, grid:72 };
    })();

    let gl, program, vao, vertexBuffer;
    let width=1, height=1, visible=false, running=false, raf=0, last=0;
    let positionLoc=-1, uvLoc=-1, normalLoc=-1;
    let uRes, uTime, uTex, uNormal, uYaw, uAspect;
    let colorTex=null, normalTex=null;
    let intersectionObserver=null, resizeObserver=null;
    let contextLost=false;

    const vertexSource = `#version 300 es
      precision highp float;
      layout(location=0) in vec3 aPosition;
      layout(location=1) in vec2 aUv;
      layout(location=2) in vec3 aNormal;

      uniform float uYaw;
      uniform float uAspect;

      out vec2 vUv;
      out vec3 vNormal;
      out vec3 vWorld;

      mat3 rotY(float a){
        float c=cos(a), s=sin(a);
        return mat3(c,0.0,-s, 0.0,1.0,0.0, s,0.0,c);
      }

      mat3 rotX(float a){
        float c=cos(a), s=sin(a);
        return mat3(1.0,0.0,0.0, 0.0,c,s, 0.0,-s,c);
      }

      void main(){
        vec3 p=aPosition;
        mat3 r=rotY(uYaw)*rotX(-0.025);
        p=r*p;
        vec3 n=normalize(r*aNormal);

        // Gentle perspective without camera controls.
        float camera=3.5;
        float z=camera-p.z;
        float persp=1.0/max(1.6,z);

        float fit = uAspect > 1.0 ? 1.08 : 1.18;
        vec2 clip = vec2(
          p.x*fit*persp*2.25/uAspect,
          p.y*fit*persp*2.25
        );

        gl_Position=vec4(clip,0.0,1.0);
        vUv=aUv;
        vNormal=n;
        vWorld=p;
      }
    `;

    const fragmentSource = `#version 300 es
      precision highp float;

      in vec2 vUv;
      in vec3 vNormal;
      in vec3 vWorld;

      uniform sampler2D uTex;
      uniform sampler2D uNormalMap;
      uniform float uTime;

      out vec4 outColor;

      void main(){
        vec4 tex=texture(uTex,vUv);
        if(tex.a < 0.035) discard;

        vec3 mapN=texture(uNormalMap,vUv).rgb*2.0-1.0;
        vec3 n=normalize(mix(vNormal,mapN,0.42));

        vec3 lightDir=normalize(vec3(
          -0.28 + 0.16*sin(uTime*0.17),
           0.42,
           0.88
        ));

        float diffuse=clamp(dot(n,lightDir)*0.5+0.5,0.0,1.0);
        float rim=pow(1.0-clamp(n.z,0.0,1.0),2.6);
        float key=0.78 + diffuse*0.24 + rim*0.10;

        vec3 color=tex.rgb*key;

        // Very restrained brand reflection; not a neon effect.
        float acid = pow(max(0.0,dot(n,normalize(vec3(0.65,-0.10,0.76)))),5.0);
        color += vec3(0.11,0.14,0.025)*acid*0.20;

        outColor=vec4(color,tex.a);
      }
    `;

    const compile = (type,source) => {
      const shader=gl.createShader(type);
      gl.shaderSource(shader,source);
      gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
        throw new Error(gl.getShaderInfoLog(shader)||"shader compile failed");
      }
      return shader;
    };

    const makeProgram = () => {
      const vs=compile(gl.VERTEX_SHADER,vertexSource);
      const fs=compile(gl.FRAGMENT_SHADER,fragmentSource);
      const p=gl.createProgram();
      gl.attachShader(p,vs); gl.attachShader(p,fs); gl.linkProgram(p);
      gl.deleteShader(vs); gl.deleteShader(fs);
      if(!gl.getProgramParameter(p,gl.LINK_STATUS)){
        throw new Error(gl.getProgramInfoLog(p)||"program link failed");
      }
      return p;
    };

    const loadImage = (src) => new Promise((resolve,reject) => {
      const img=new Image();
      img.onload=()=>resolve(img);
      img.onerror=reject;
      img.src=src;
    });

    const uploadTexture = (img, unit) => {
      const tex=gl.createTexture();
      gl.activeTexture(gl.TEXTURE0+unit);
      gl.bindTexture(gl.TEXTURE_2D,tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
      gl.generateMipmap(gl.TEXTURE_2D);
      return tex;
    };

    const buildGeometry = async () => {
      const grid=DEVICE.grid;
      const depthImg=await loadImage("./assets/about/ron-portrait-depth.png");
      const c=document.createElement("canvas");
      c.width=depthImg.width; c.height=depthImg.height;
      const cx=c.getContext("2d",{willReadFrequently:true});
      cx.drawImage(depthImg,0,0);
      const px=cx.getImageData(0,0,c.width,c.height).data;

      const sampleDepth=(u,v)=>{
        const x=Math.max(0,Math.min(c.width-1,Math.round(u*(c.width-1))));
        const y=Math.max(0,Math.min(c.height-1,Math.round((1-v)*(c.height-1))));
        return px[(y*c.width+x)*4]/255;
      };

      const verts=[];
      const zAt=(u,v)=>sampleDepth(u,v)*0.34;

      for(let j=0;j<grid;j++){
        for(let i=0;i<grid;i++){
          const u0=i/grid, u1=(i+1)/grid;
          const v0=j/grid, v1=(j+1)/grid;

          const emit=(u,v)=>{
            const z=zAt(u,v);
            const eps=1/grid;
            const dx=(zAt(Math.min(1,u+eps),v)-zAt(Math.max(0,u-eps),v))/(2*eps);
            const dy=(zAt(u,Math.min(1,v+eps))-zAt(u,Math.max(0,v-eps)))/(2*eps);
            let nx=-dx*0.55, ny=-dy*0.55, nz=1;
            const l=Math.hypot(nx,ny,nz)||1;
            nx/=l; ny/=l; nz/=l;
            verts.push((u-.5)*2.0,(v-.5)*2.0,z-.08,u,v,nx,ny,nz);
          };

          emit(u0,v0); emit(u1,v0); emit(u1,v1);
          emit(u0,v0); emit(u1,v1); emit(u0,v1);
        }
      }

      const data=new Float32Array(verts);
      vao=gl.createVertexArray();
      gl.bindVertexArray(vao);
      vertexBuffer=gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);

      const stride=8*4;
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0,3,gl.FLOAT,false,stride,0);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1,2,gl.FLOAT,false,stride,3*4);
      gl.enableVertexAttribArray(2);
      gl.vertexAttribPointer(2,3,gl.FLOAT,false,stride,5*4);

      return grid*grid*6;
    };

    let vertexCount=0;

    const resize = () => {
      const r=portraitStage.getBoundingClientRect();
      width=Math.max(1,r.width); height=Math.max(1,r.height);
      const dpr=Math.min(devicePixelRatio||1,DEVICE.dpr);
      const pw=Math.max(1,Math.round(width*dpr));
      const ph=Math.max(1,Math.round(height*dpr));
      if(canvas.width!==pw || canvas.height!==ph){
        canvas.width=pw; canvas.height=ph;
      }
      gl.viewport(0,0,pw,ph);
      gl.useProgram(program);
      gl.uniform1f(uAspect,width/height);
    };

    const draw=(t,freeze=false)=>{
      if(!gl || !program || !vao) return;
      const time=freeze ? 3.2 : t*.001;
      const yaw=freeze ? 0.0 : Math.sin(time*.22)*0.055; // ~3.1 degrees

      gl.clearColor(0.02,0.022,0.02,1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.uniform1f(uTime,time);
      gl.uniform1f(uYaw,yaw);
      gl.uniform1f(uAspect,width/height);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D,colorTex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D,normalTex);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES,0,vertexCount);
    };

    const frame=(t)=>{
      if(!running || !visible || document.hidden || contextLost){
        running=false; raf=0; return;
      }
      const interval=1000/DEVICE.fps;
      if(!last || t-last>=interval){
        draw(t,false); last=t;
      }
      raf=requestAnimationFrame(frame);
    };

    const start=()=>{
      if(running || !visible || document.hidden || contextLost) return;
      if(reduceMotion.matches){
        draw(performance.now(),true); return;
      }
      running=true; last=0; raf=requestAnimationFrame(frame);
    };

    const stop=()=>{
      running=false;
      if(raf) cancelAnimationFrame(raf);
      raf=0;
    };

    const fail=()=>{
      stop();
      canvas.hidden=true;
      fallback.hidden=false;
    };

    const init=async()=>{
      if(!canvas) return;
      gl=canvas.getContext("webgl2",{
        alpha:true,
        antialias:false,
        depth:false,
        stencil:false,
        powerPreference:DEVICE.tier==="mobile"?"low-power":"high-performance"
      });
      if(!gl){ fail(); return; }

      try{
        program=makeProgram();
        gl.useProgram(program);
        uTime=gl.getUniformLocation(program,"uTime");
        uTex=gl.getUniformLocation(program,"uTex");
        uNormal=gl.getUniformLocation(program,"uNormalMap");
        uYaw=gl.getUniformLocation(program,"uYaw");
        uAspect=gl.getUniformLocation(program,"uAspect");

        gl.uniform1i(uTex,0);
        gl.uniform1i(uNormal,1);

        const [portraitImg, normalImg] = await Promise.all([
          loadImage("./assets/about/ron-portrait-rgba.png"),
          loadImage("./assets/about/ron-portrait-normal.png")
        ]);

        colorTex=uploadTexture(portraitImg,0);
        normalTex=uploadTexture(normalImg,1);
        vertexCount=await buildGeometry();

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
        gl.disable(gl.DEPTH_TEST);

        resize();
        draw(performance.now(),true);
        fallback.hidden=true;

        intersectionObserver=new IntersectionObserver(([entry])=>{
          visible=entry.isIntersecting;
          if(visible) start(); else stop();
        },{rootMargin:"75% 0px",threshold:0});
        intersectionObserver.observe(portraitStage);

        if(DEVICE.tier!=="mobile"){
          resizeObserver=new ResizeObserver(()=>{
            resize();
            draw(performance.now(),reduceMotion.matches);
          });
          resizeObserver.observe(portraitStage);
        }

        document.addEventListener("visibilitychange",()=>{
          if(document.hidden) stop(); else start();
        });

        reduceMotion.addEventListener?.("change",()=>{
          if(reduceMotion.matches){ stop(); draw(performance.now(),true); }
          else start();
        });

        canvas.addEventListener("webglcontextlost",(e)=>{
          e.preventDefault(); contextLost=true; fail();
        },{passive:false});
      }catch(err){
        console.error("[Portrait Relief] WebGL init failed:",err);
        fail();
      }
    };

    init();
  }


  // Organic fluid trail --------------------------------------------------
  // Builds a short-lived chain of metaball-like points along pointer motion.
  // The same point field is used to reveal a distorted copy of the content.
  const createFluidTrail = ({
    target,
    canvas,
    distorted,
    activeClass,
    color,
    lifetime,
    minRadius,
    maxRadius,
    spacing,
    displacementId,
    noiseId,
    noiseBase,
    materials = null
  }) => {
    if (!target || !canvas || !distorted) return;

    const ctx = canvas.getContext("2d");
    const displacement = document.getElementById(displacementId);
    const noise = document.getElementById(noiseId);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = matchMedia("(hover:hover) and (pointer:fine)");

    let points = [];
    let raf = 0;
    let active = false;
    let lastX = 0;
    let lastY = 0;
    let lastAdd = 0;
    let lastMoveT = 0;
    let dpr = 1;
    let width = 1;
    let height = 1;
    let currentScale = 0;
    let targetScale = 0;

    let materialIndex = 0;
    let materialDistance = 0;
    let lastMaterialSwitch = 0;

    const applyMaterial = (index) => {
      if (!materials?.length) return;
      materialIndex = (index + materials.length) % materials.length;
      const material = materials[materialIndex];
      target.dataset.fluidMaterial = material.name;
      lastMaterialSwitch = performance.now();
    };

    const currentMaterial = () => {
      if (!materials?.length) {
        return {
          name:"plain",
          colors:[color,color,color],
          angle:0
        };
      }
      return materials[materialIndex];
    };

    const resize = () => {
      const rect = target.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(devicePixelRatio || 1, 1.5);

      const pw = Math.round(width * dpr);
      const ph = Math.round(height * dpr);

      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
      }

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr,0,0,dpr,0,0);
    };

    const addPoint = (x,y,time,speed = 0) => {
      /* Faster motion creates thinner tendrils; slower motion makes larger pools. */
      const speedNorm = Math.min(1, speed / 1.1);
      const radius = maxRadius - (maxRadius - minRadius) * speedNorm;

      points.push({
        x,
        y,
        born:time,
        radius,
        driftX:(Math.random()-.5)*4,
        driftY:(Math.random()-.5)*3
      });

      /* Occasional side droplet gives the irregular branching seen in the reference. */
      if (Math.random() < .16) {
        const side = Math.random() < .5 ? -1 : 1;
        points.push({
          x:x + side*(radius*.55 + Math.random()*18),
          y:y + (Math.random()-.5)*radius*.8,
          born:time + 45,
          radius:radius*(.24 + Math.random()*.20),
          driftX:side*(2 + Math.random()*3),
          driftY:(Math.random()-.5)*4
        });
      }

      if (points.length > 24) {
        points.splice(0, points.length - 24);
      }
    };

    const updateMask = (now) => {
      const gradients = [];

      for (const p of points) {
        const age = now - p.born;
        if (age < 0 || age > lifetime) continue;

        const life = 1 - age/lifetime;
        const radius = p.radius * (.70 + life*.35);
        const alpha = Math.max(.08, life);

        gradients.push(
          `radial-gradient(circle ${radius.toFixed(1)}px at ${p.x.toFixed(1)}px ${p.y.toFixed(1)}px, ` +
          `rgba(0,0,0,${alpha.toFixed(3)}) 0%, ` +
          `rgba(0,0,0,${(alpha*.96).toFixed(3)}) 56%, ` +
          `rgba(0,0,0,${(alpha*.48).toFixed(3)}) 76%, transparent 100%)`
        );
      }

      if (gradients.length) {
        const mask = gradients.join(",");
        distorted.style.webkitMaskImage = mask;
        distorted.style.maskImage = mask;
        target.classList.add(activeClass);
      } else {
        distorted.style.webkitMaskImage = "none";
        distorted.style.maskImage = "none";
        target.classList.remove(activeClass);
      }
    };

    const draw = (now) => {
      ctx.clearRect(0,0,width,height);

      points = points.filter(p => now - p.born <= lifetime);

      /* Connect neighbouring points so the trail stretches instead of looking
         like separate circles. */
      for (let i=1;i<points.length;i++) {
        const a = points[i-1];
        const b = points[i];
        const ageA = now-a.born;
        const ageB = now-b.born;
        if (ageA < 0 || ageB < 0) continue;

        const life = Math.max(0, Math.min(1, 1-Math.max(ageA,ageB)/lifetime));
        if (!life) continue;

        ctx.save();
        ctx.globalAlpha = life*.82;

        const material = currentMaterial();
        const grad = ctx.createLinearGradient(
          Math.min(a.x,b.x)-a.radius,
          Math.min(a.y,b.y)-a.radius,
          Math.max(a.x,b.x)+b.radius,
          Math.max(a.y,b.y)+b.radius
        );
        grad.addColorStop(0,material.colors[0]);
        grad.addColorStop(.48,material.colors[1]);
        grad.addColorStop(1,material.colors[2]);

        ctx.strokeStyle = grad;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = Math.max(10,(a.radius+b.radius)*.74);
        ctx.beginPath();
        ctx.moveTo(a.x,a.y);
        const mx=(a.x+b.x)*.5;
        const my=(a.y+b.y)*.5;
        ctx.quadraticCurveTo(mx,my,b.x,b.y);
        ctx.stroke();

        /* Small specular inner pass makes the trail read as material,
           not a flat painted line. */
        ctx.globalAlpha = life*.24;
        ctx.strokeStyle = material.colors[1];
        ctx.lineWidth = Math.max(2,(a.radius+b.radius)*.13);
        ctx.stroke();

        ctx.restore();
      }

      /* Pools / droplets. */
      for (const p of points) {
        const age = now-p.born;
        if (age < 0) continue;

        const life = Math.max(0,1-age/lifetime);
        const r = p.radius*(.72+life*.34);

        ctx.save();
        ctx.globalAlpha = life*.88;

        const material = currentMaterial();
        const px = p.x + p.driftX*(1-life);
        const py = p.y + p.driftY*(1-life);

        const rg = ctx.createRadialGradient(
          px-r*.22,py-r*.24,r*.06,
          px,py,r
        );
        rg.addColorStop(0,material.colors[1]);
        rg.addColorStop(.48,material.colors[0]);
        rg.addColorStop(1,material.colors[2]);

        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(px,py,r,0,Math.PI*2);
        ctx.fill();

        ctx.restore();
      }

      updateMask(now);

      currentScale += (targetScale-currentScale)*.16;
      targetScale += (11-targetScale)*.035;

      if (displacement) {
        displacement.setAttribute("scale", currentScale.toFixed(2));
      }

      if (noise) {
        const t = now*.001;
        const fx = noiseBase[0] + Math.sin(t*1.3)*.0015;
        const fy = noiseBase[1] + Math.cos(t*1.1)*.0024;
        noise.setAttribute("baseFrequency", `${fx.toFixed(4)} ${fy.toFixed(4)}`);
      }

      if (points.length || active) {
        raf = requestAnimationFrame(draw);
      } else {
        raf = 0;
        ctx.clearRect(0,0,width,height);
        target.classList.remove(activeClass);
      }
    };

    const pointerPosition = (event) => {
      const rect = target.getBoundingClientRect();
      return {
        x:Math.max(0,Math.min(rect.width,event.clientX-rect.left)),
        y:Math.max(0,Math.min(rect.height,event.clientY-rect.top))
      };
    };

    const enter = (event) => {
      if (reduced.matches || !finePointer.matches) return;

      resize();
      active = true;

      const now = performance.now();
      const {x,y} = pointerPosition(event);

      lastX=x;
      lastY=y;
      lastAdd=now;
      lastMoveT=now;
      currentScale=6;
      targetScale=21;

      if (materials?.length) {
        materialDistance = 0;
        applyMaterial(materialIndex);
      }

      addPoint(x,y,now,0);

      if (!raf) raf=requestAnimationFrame(draw);
    };

    const move = (event) => {
      if (!active) return;

      const now = performance.now();
      const {x,y} = pointerPosition(event);
      const dt = Math.max(8,now-lastMoveT);
      const distance = Math.hypot(x-lastX,y-lastY);
      const speed = distance/dt;

      if (distance >= spacing || now-lastAdd > 46) {
        /* Add interpolated points if mouse jumps, preserving a continuous ribbon. */
        const steps = Math.max(1,Math.min(3,Math.ceil(distance/(spacing*1.35))));
        for (let s=1;s<=steps;s++) {
          const f=s/steps;
          addPoint(
            lastX+(x-lastX)*f,
            lastY+(y-lastY)*f,
            now-(steps-s)*12,
            speed
          );
        }
        lastAdd=now;
      }

      targetScale=Math.min(32,13+speed*23);

      if (materials?.length) {
        materialDistance += distance;

        /* Reference behavior feels event-driven: a new visual layer appears
           after enough cursor movement rather than cycling constantly. */
        if (
          materialDistance > 250 &&
          now-lastMaterialSwitch > 620
        ) {
          applyMaterial(materialIndex+1);
          materialDistance = 0;
        }
      }

      lastX=x;
      lastY=y;
      lastMoveT=now;

      if (!raf) raf=requestAnimationFrame(draw);
    };

    const leave = () => {
      active=false;
      /* Do not clear immediately—the supplied reference leaves a short liquid wake. */
      if (!raf && points.length) raf=requestAnimationFrame(draw);
    };

    target.addEventListener("pointerenter",enter,{passive:true});
    target.addEventListener("pointermove",move,{passive:true});
    target.addEventListener("pointerleave",leave,{passive:true});

    const ro = new ResizeObserver(resize);
    ro.observe(target);
    resize();

    reduced.addEventListener?.("change",()=>{
      if (!reduced.matches) return;
      active=false;
      points=[];
      if (raf) cancelAnimationFrame(raf);
      raf=0;
      ctx.clearRect(0,0,width,height);
      target.classList.remove(activeClass);
      distorted.style.webkitMaskImage="none";
      distorted.style.maskImage="none";
    });
  };
createFluidTrail({
    target:document.querySelector(".about-logo-fluid-shell"),
    canvas:document.querySelector("[data-logo-fluid-canvas]"),
    distorted:document.querySelector(".about-logo-distorted"),
    activeClass:"has-fluid",
    color:"rgba(221,255,77,.90)",
    lifetime:1120,
    minRadius:18,
    maxRadius:48,
    spacing:9,
    displacementId:"logo-fluid-displacement",
    noiseId:"logo-fluid-noise",
    noiseBase:[.014,.028]
  });


  // V27 — liquid effect only inside the real responsive hero title -------
  const liquidStack = document.querySelector("[data-hero-text-liquid-stack]");
  const liquidCanvas = document.querySelector("[data-hero-text-liquid-v27]");
  const liquidTitle = liquidStack?.querySelector("[data-liquid-source-title]");

  if (liquidStack && liquidCanvas && liquidTitle) {
    const reducedLiquid = matchMedia("(prefers-reduced-motion: reduce)");
    const coarseLiquid = matchMedia("(hover:none), (pointer:coarse)");

    let gl=null, updateProgram=null, splatProgram=null, renderProgram=null;
    let stateA=null,stateB=null,fboA=null,fboB=null,titleTexture=null;
    let simW=0,simH=0,width=1,height=1,dpr=1;
    let running=false,raf=0,hovering=false,touching=false,visible=true;
    let lastX=0,lastY=0,lastT=0,lastMove=0,lastFrame=0;

    const titleCanvas=document.createElement("canvas");
    const titleCtx=titleCanvas.getContext("2d");

    const perf=(()=>{
      if(innerWidth<680) return {sim:210,dpr:1,fps:30,radius:.074};
      if(innerWidth<1280) return {sim:300,dpr:1.15,fps:45,radius:.063};
      return {sim:420,dpr:1.35,fps:60,radius:.055};
    })();

    const vs=`#version 300 es
      precision highp float;
      out vec2 vUv;
      void main(){
        vec2 p=gl_VertexID==0?vec2(-1,-1):gl_VertexID==1?vec2(3,-1):vec2(-1,3);
        vUv=p*.5+.5;
        gl_Position=vec4(p,0,1);
      }`;

    const updateFs=`#version 300 es
      precision highp float;
      in vec2 vUv;
      uniform sampler2D uState;
      uniform vec2 uTexel;
      uniform float uIdle;
      uniform float uTime;
      out vec4 outColor;

      vec2 dv(vec2 gb){return (gb*2.-1.)*.045;}
      vec2 ev(vec2 v){return clamp(v/.045*.5+.5,0.,1.);}

      void main(){
        vec4 cur=texture(uState,vUv);
        vec2 vel=dv(cur.gb);
        vec4 prev=texture(uState,clamp(vUv-vel,vec2(.002),vec2(.998)));
        float d=prev.r;
        vel=dv(prev.gb);

        float n=
          texture(uState,vUv+vec2(uTexel.x,0)).r+
          texture(uState,vUv-vec2(uTexel.x,0)).r+
          texture(uState,vUv+vec2(0,uTexel.y)).r+
          texture(uState,vUv-vec2(0,uTexel.y)).r;

        d=mix(d,n*.25,mix(.055,.11,uIdle));

        float wave=sin(vUv.y*29.+uTime*.55)*cos(vUv.x*23.-uTime*.47);
        vel+=vec2(-cos(vUv.y*17.),sin(vUv.x*19.))*wave*.00008;

        d*=mix(.997,.985,uIdle);
        vel*=mix(.965,.925,uIdle);

        outColor=vec4(clamp(d,0.,1.),ev(vel),1.);
      }`;

    const splatFs=`#version 300 es
      precision highp float;
      in vec2 vUv;
      uniform sampler2D uState;
      uniform vec2 uPoint;
      uniform vec2 uForce;
      uniform float uRadius;
      uniform float uAspect;
      out vec4 outColor;

      vec2 dv(vec2 gb){return (gb*2.-1.)*.045;}
      vec2 ev(vec2 v){return clamp(v/.045*.5+.5,0.,1.);}

      void main(){
        vec4 s=texture(uState,vUv);
        float d=s.r;
        vec2 vel=dv(s.gb);

        vec2 q=vUv-uPoint;
        q.x*=uAspect;
        float w=exp(-dot(q,q)/max(.00001,uRadius*uRadius));

        d=max(d,w*.98);
        vel+=uForce*w;
        outColor=vec4(clamp(d,0.,1.),ev(vel),1.);
      }`;

    const renderFs=`#version 300 es
      precision highp float;
      in vec2 vUv;
      uniform sampler2D uState;
      uniform sampler2D uTitle;
      uniform vec2 uTexel;
      uniform float uIdle;
      out vec4 outColor;

      vec2 dv(vec2 gb){return (gb*2.-1.)*.045;}

      void main(){
        vec4 s=texture(uState,vUv);
        float d=s.r;
        vec2 vel=dv(s.gb);

        float threshold=mix(.16,.33,uIdle);
        float mask=smoothstep(threshold-.025,threshold+.025,d);
        if(mask<.005) discard;

        float dx=
          texture(uState,vUv+vec2(uTexel.x,0)).r-
          texture(uState,vUv-vec2(uTexel.x,0)).r;
        float dy=
          texture(uState,vUv+vec2(0,uTexel.y)).r-
          texture(uState,vUv-vec2(0,uTexel.y)).r;

        vec2 grad=vec2(dx,dy);
        vec2 uv=clamp(vUv+vel*1.9+grad*.11,vec2(.002),vec2(.998));
        float letters=texture(uTitle,uv).r;

        float edge=
          exp(-abs(d-threshold)*24.)*
          clamp(length(grad)*8.,0.,1.);

        vec3 dark=vec3(.012,.013,.011)+vec3(.08)*edge;

        /* Nothing outside the letters is drawn. */
        outColor=vec4(dark,mask*letters);
      }`;

    const compile=(type,source)=>{
      const shader=gl.createShader(type);
      gl.shaderSource(shader,source);
      gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
        throw new Error(gl.getShaderInfoLog(shader)||"Shader compile failed");
      }
      return shader;
    };

    const program=fragment=>{
      const a=compile(gl.VERTEX_SHADER,vs);
      const b=compile(gl.FRAGMENT_SHADER,fragment);
      const p=gl.createProgram();
      gl.attachShader(p,a);
      gl.attachShader(p,b);
      gl.linkProgram(p);
      gl.deleteShader(a);
      gl.deleteShader(b);
      if(!gl.getProgramParameter(p,gl.LINK_STATUS)){
        throw new Error(gl.getProgramInfoLog(p)||"Program link failed");
      }
      return p;
    };

    const u=(p,n)=>gl.getUniformLocation(p,n);

    const makeTexture=(w,h)=>{
      const t=gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D,t);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
      return t;
    };

    const makeFbo=t=>{
      const f=gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER,f);
      gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);
      return f;
    };

    const clear=f=>{
      gl.bindFramebuffer(gl.FRAMEBUFFER,f);
      gl.viewport(0,0,simW,simH);
      gl.clearColor(0,.5,.5,1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    };

    const drawTracked=(ctx,text,cx,top,size,family,weight,style,spacing)=>{
      const chars=Array.from(text);
      const track=Number.isFinite(spacing)?spacing:0;
      ctx.save();
      ctx.fillStyle="#fff";
      ctx.textBaseline="top";
      ctx.font=[style,weight,`${size}px`,family].join(" ");
      const widths=chars.map(ch=>ctx.measureText(ch).width);
      const total=widths.reduce((a,b)=>a+b,0)+Math.max(0,chars.length-1)*track;
      let x=cx-total*.5;
      chars.forEach((ch,i)=>{
        ctx.fillText(ch,x,top);
        x+=widths[i]+track;
      });
      ctx.restore();
    };

    const rebuild=()=>{
      const r=liquidStack.getBoundingClientRect();
      width=Math.max(1,r.width);
      height=Math.max(1,r.height);
      dpr=Math.min(devicePixelRatio||1,perf.dpr);

      const pw=Math.max(2,Math.round(width*dpr));
      const ph=Math.max(2,Math.round(height*dpr));
      liquidCanvas.width=pw;
      liquidCanvas.height=ph;
      titleCanvas.width=pw;
      titleCanvas.height=ph;

      titleCtx.clearRect(0,0,pw,ph);

      liquidTitle.querySelectorAll(":scope > span").forEach(span=>{
        const sr=span.getBoundingClientRect();
        const st=getComputedStyle(span);
        const size=(parseFloat(st.fontSize)||100)*dpr;
        const spacing=(parseFloat(st.letterSpacing)||0)*dpr;

        drawTracked(
          titleCtx,
          span.textContent.trim(),
          (sr.left-r.left+sr.width*.5)*dpr,
          (sr.top-r.top)*dpr+size*.012,
          size,
          st.fontFamily,
          st.fontWeight,
          st.fontStyle,
          spacing
        );
      });

      if(!titleTexture) titleTexture=gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D,titleTexture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,titleCanvas);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);

      const aspect=width/Math.max(1,height);
      const nw=perf.sim;
      const nh=Math.max(90,Math.round(nw/Math.max(.55,aspect)));

      if(nw!==simW || nh!==simH){
        simW=nw;
        simH=nh;
        stateA=makeTexture(simW,simH);
        stateB=makeTexture(simW,simH);
        fboA=makeFbo(stateA);
        fboB=makeFbo(stateB);
        clear(fboA);
        clear(fboB);
      }
    };

    const swap=()=>{
      [stateA,stateB]=[stateB,stateA];
      [fboA,fboB]=[fboB,fboA];
    };

    const updateStep=(time,idle)=>{
      gl.useProgram(updateProgram);
      gl.bindFramebuffer(gl.FRAMEBUFFER,fboB);
      gl.viewport(0,0,simW,simH);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D,stateA);
      gl.uniform1i(u(updateProgram,"uState"),0);
      gl.uniform2f(u(updateProgram,"uTexel"),1/simW,1/simH);
      gl.uniform1f(u(updateProgram,"uIdle"),idle);
      gl.uniform1f(u(updateProgram,"uTime"),time*.001);
      gl.drawArrays(gl.TRIANGLES,0,3);
      swap();
    };

    const splatAt=(x,y,fx,fy,radius)=>{
      gl.useProgram(splatProgram);
      gl.bindFramebuffer(gl.FRAMEBUFFER,fboB);
      gl.viewport(0,0,simW,simH);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D,stateA);
      gl.uniform1i(u(splatProgram,"uState"),0);
      gl.uniform2f(u(splatProgram,"uPoint"),x,y);
      gl.uniform2f(u(splatProgram,"uForce"),fx,fy);
      gl.uniform1f(u(splatProgram,"uRadius"),radius);
      gl.uniform1f(u(splatProgram,"uAspect"),width/height);
      gl.drawArrays(gl.TRIANGLES,0,3);
      swap();
    };

    const renderStep=idle=>{
      gl.bindFramebuffer(gl.FRAMEBUFFER,null);
      gl.viewport(0,0,liquidCanvas.width,liquidCanvas.height);
      gl.clearColor(0,0,0,0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(renderProgram);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D,stateA);
      gl.uniform1i(u(renderProgram,"uState"),0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D,titleTexture);
      gl.uniform1i(u(renderProgram,"uTitle"),1);

      gl.uniform2f(u(renderProgram,"uTexel"),1/simW,1/simH);
      gl.uniform1f(u(renderProgram,"uIdle"),idle);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.TRIANGLES,0,3);
      gl.disable(gl.BLEND);
    };

    const frame=time=>{
      if(!visible || document.hidden || reducedLiquid.matches){
        running=false;
        raf=0;
        return;
      }

      const interval=1000/perf.fps;

      if(!lastFrame || time-lastFrame>=interval){
        const idle=Math.max(0,Math.min(1,(time-lastMove-70)/1150));
        updateStep(time,idle);
        renderStep(idle);
        lastFrame=time;
      }

      if(hovering || touching || time-lastMove<2400){
        raf=requestAnimationFrame(frame);
      }else{
        running=false;
        raf=0;
        clear(fboA);
        clear(fboB);
      }
    };

    const start=()=>{
      if(running || !visible || document.hidden || reducedLiquid.matches) return;
      running=true;
      lastFrame=0;
      raf=requestAnimationFrame(frame);
    };

    const point=event=>{
      const r=liquidStack.getBoundingClientRect();
      return {
        x:Math.max(0,Math.min(1,(event.clientX-r.left)/Math.max(1,r.width))),
        y:Math.max(0,Math.min(1,1-(event.clientY-r.top)/Math.max(1,r.height)))
      };
    };

    const inject=(event,first=false)=>{
      const now=performance.now();
      const p=point(event);

      if(first || !lastT){
        lastX=p.x;
        lastY=p.y;
        lastT=now;
        lastMove=now;
        splatAt(p.x,p.y,0,0,perf.radius*1.08);
        start();
        return;
      }

      const dt=Math.max(8,now-lastT);
      const dx=p.x-lastX;
      const dy=p.y-lastY;
      const distance=Math.hypot(dx*width,dy*height);

      if(distance>1.2){
        const speed=Math.min(2.2,distance/dt);
        const radius=perf.radius*(1.20-Math.min(1,speed/1.2)*.43);
        const steps=Math.max(1,Math.min(6,Math.ceil(distance/17)));

        for(let i=1;i<=steps;i++){
          const f=i/steps;
          splatAt(
            lastX+dx*f,
            lastY+dy*f,
            dx*(.5+speed*.32),
            dy*(.5+speed*.32),
            radius
          );
        }
      }

      lastX=p.x;
      lastY=p.y;
      lastT=now;
      lastMove=now;
      start();
    };

    const init=()=>{
      if(reducedLiquid.matches){
        liquidCanvas.hidden=true;
        return;
      }

      gl=liquidCanvas.getContext("webgl2",{
        alpha:true,
        antialias:false,
        depth:false,
        stencil:false,
        premultipliedAlpha:false
      });

      if(!gl){
        liquidCanvas.hidden=true;
        return;
      }

      try{
        updateProgram=program(updateFs);
        splatProgram=program(splatFs);
        renderProgram=program(renderFs);

        const vao=gl.createVertexArray();
        gl.bindVertexArray(vao);

        rebuild();
        liquidStack.classList.add("is-liquid-ready");

        liquidStack.addEventListener("pointerenter",event=>{
          if(coarseLiquid.matches) return;
          hovering=true;
          lastT=0;
          inject(event,true);
        },{passive:true});

        liquidStack.addEventListener("pointermove",event=>{
          if(coarseLiquid.matches){
            if(touching) inject(event,false);
            return;
          }
          if(hovering) inject(event,false);
        },{passive:true});

        liquidStack.addEventListener("pointerleave",()=>{
          if(coarseLiquid.matches) return;
          hovering=false;
          lastT=0;
          lastMove=performance.now();
          start();
        },{passive:true});

        liquidStack.addEventListener("pointerdown",event=>{
          if(!coarseLiquid.matches) return;
          touching=true;
          lastT=0;
          inject(event,true);
        },{passive:true});

        liquidStack.addEventListener("pointerup",()=>{
          touching=false;
          lastT=0;
          lastMove=performance.now();
          start();
        },{passive:true});

        const ro=new ResizeObserver(rebuild);
        ro.observe(liquidStack);
        document.fonts?.ready?.then(rebuild);

        const io=new IntersectionObserver(([entry])=>{
          visible=entry.isIntersecting;
        },{rootMargin:"25% 0px",threshold:0});
        io.observe(liquidStack);
      }catch(error){
        console.error("[V27 text liquid]",error);
        liquidCanvas.hidden=true;
      }
    };

    init();
  }

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
