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

  requestAnimationFrame(() => {
    document.body.classList.remove("motion-loading");
    document.body.classList.add("motion-ready");
  });

  // Subtle hero-to-story continuity. Uses a single CSS variable on the wrapper
  // so the video's ambient transform animation stays independent.
  let heroTicking = false;
  const updateHeroShift = () => {
    heroTicking = false;
    if (!hero || !heroFilm || reduced) return;
    const rect = hero.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
    heroFilm.style.setProperty("--hero-shift", `${progress * 58}px`);
  };
  addEventListener("scroll", () => {
    if (heroTicking) return;
    heroTicking = true;
    requestAnimationFrame(updateHeroShift);
  }, {passive:true});
  updateHeroShift();

  // Section handoff state, used for the contact color wipe.
  const motionSections = document.querySelectorAll(".motion-section");
  if (reduced || !("IntersectionObserver" in window)) {
    motionSections.forEach(section => section.classList.add("section-in"));
  } else {
    const sectionIO = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("section-in");
      });
    }, {threshold:.12});
    motionSections.forEach(section => sectionIO.observe(section));
  }


  // V14 guided project intake ----------------------------------------------
  const projectModal = document.querySelector("[data-project-modal]");
  const projectOpeners = document.querySelectorAll("[data-open-project]");
  const projectClosers = document.querySelectorAll("[data-close-project]");
  const projectForm = document.querySelector("[data-project-form]");
  let lastProjectTrigger = null;

  const setProjectModal = (open, trigger = null) => {
    if (!projectModal) return;
    if (open) lastProjectTrigger = trigger || document.activeElement;
    projectModal.classList.toggle("open", open);
    projectModal.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      setTimeout(() => projectModal.querySelector("textarea")?.focus(), 80);
    } else if (lastProjectTrigger && typeof lastProjectTrigger.focus === "function") {
      lastProjectTrigger.focus();
    }
  };

  projectOpeners.forEach(btn => btn.addEventListener("click", () => setProjectModal(true, btn)));
  projectClosers.forEach(btn => btn.addEventListener("click", () => setProjectModal(false)));

  addEventListener("keydown", e => {
    if (!projectModal?.classList.contains("open")) return;

    if (e.key === "Escape") {
      setProjectModal(false);
    } else {
      trapFocusWithin(projectModal, e);
    }
  });

  projectForm?.addEventListener("submit", e => {
    e.preventDefault();
    const data = new FormData(projectForm);
    const service = data.get("service") || "Project";
    const brief = String(data.get("brief") || "").trim();
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const timeline = data.get("timeline") || "Not sure yet";

    const subject = `Project inquiry — ${service}`;
    const body = [
      "Hi Ron,",
      "",
      `I’m interested in: ${service}`,
      `Preferred timeline: ${timeline}`,
      "",
      "Current gap / desired result:",
      brief,
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      "Sent from the RON’S WORK project intake."
    ].join("\n");

    window.location.href =
      `mailto:ronjr.dialino@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });


  // CRISP-reference visual rail ----------------------------------------
  const crispRail = document.querySelector("[data-crisp-rail]");
  let crispRailTimer = null;

  function setupCrispRail(){
    if (!crispRail) return;

    const track = crispRail.querySelector(".gallery-track");
    if (!track) return;

    if (!track.dataset.loopReady) {
      const originals = Array.from(track.children);

      originals.forEach(card => {
        const clone = card.cloneNode(true);

        clone.setAttribute(
          "aria-hidden",
          "true"
        );

        clone.setAttribute(
          "data-crisp-clone",
          "true"
        );

        clone
          .querySelectorAll(
            "a,button,input,textarea,select"
          )
          .forEach(el =>
            el.setAttribute(
              "tabindex",
              "-1"
            )
          );

        clone
          .querySelectorAll("img")
          .forEach(img =>
            img.setAttribute(
              "alt",
              ""
            )
          );

        track.appendChild(clone);
      });

      track.dataset.loopReady = "true";
    }

    const reducedRail =
      matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    let offset = 0;
    let raf = 0;
    let last = 0;

    const originalWidth = () => {
      const children = Array.from(
        track.children
      );

      const originalCount =
        Math.floor(
          children.length / 2
        );

      if (!originalCount) return 0;

      const first =
        children[0]
          .getBoundingClientRect();

      const lastOriginal =
        children[originalCount - 1]
          .getBoundingClientRect();

      const styles =
        getComputedStyle(track);

      const gap =
        parseFloat(
          styles.columnGap ||
          styles.gap ||
          "0"
        ) || 0;

      return (
        lastOriginal.right -
        first.left +
        gap
      );
    };

    const speed = () => {
      if (innerWidth <= 680) return 44;
      if (innerWidth <= 980) return 48;
      return 54;
    };

    const apply = value => {
      /* Important is deliberate: older responsive rules used
         transform:none!important below 981px. */
      track.style.setProperty(
        "transform",
        `translate3d(${-value}px,0,0)`,
        "important"
      );

      track.style.setProperty(
        "transition",
        "none",
        "important"
      );
    };

    const frame = time => {
      if (
        document.hidden ||
        reducedRail.matches
      ) {
        last = time;
        raf =
          requestAnimationFrame(
            frame
          );
        return;
      }

      if (!last) last = time;

      const dt = Math.min(
        40,
        time - last
      ) / 1000;

      last = time;

      const loopWidth =
        originalWidth();

      if (loopWidth > 0) {
        offset +=
          speed() *
          dt;

        while (
          offset >= loopWidth
        ) {
          offset -= loopWidth;
        }

        apply(offset);
      }

      raf =
        requestAnimationFrame(
          frame
        );
    };

    const resync = () => {
      const loopWidth =
        originalWidth();

      if (
        loopWidth > 0 &&
        offset >= loopWidth
      ) {
        offset %= loopWidth;
      }

      apply(offset);
    };

    let resizeTimer;

    addEventListener(
      "resize",
      () => {
        clearTimeout(
          resizeTimer
        );

        resizeTimer =
          setTimeout(
            resync,
            120
          );
      },
      {passive:true}
    );

    addEventListener(
      "orientationchange",
      () => {
        clearTimeout(
          resizeTimer
        );

        resizeTimer =
          setTimeout(
            resync,
            180
          );
      },
      {passive:true}
    );

    reducedRail
      .addEventListener?.(
        "change",
        () => {
          if (
            reducedRail.matches
          ) {
            track.style.removeProperty(
              "transform"
            );
          } else {
            apply(offset);
          }
        }
      );

    /* No hover/focus pause: the visual rail is intentionally continuous. */
    apply(0);

    raf =
      requestAnimationFrame(
        frame
      );
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


  // V30 — organic water/glass reveal for the full dark hero ----------
  const heroRevealV30 = document.querySelector("[data-hero-reveal-v29]");
  const heroSectionV30 = document.querySelector("#top.hero");
  const heroRevealPathV30 = document.getElementById("heroRevealPathV30");
  const footerBrandV30 = document.querySelector(".footer-brand");
  const footerWaveFilterV30 = document.getElementById("footerWaveFilterV30");
  const footerWaveTurbulenceV30 = footerWaveFilterV30?.querySelector("feTurbulence");
  const footerWaveDisplaceV30 = footerWaveFilterV30?.querySelector("feDisplacementMap");

  if (heroRevealV30 && heroSectionV30 && heroRevealPathV30) {
    const reducedMotionV30 = matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointerV30 = matchMedia("(hover:none), (pointer:coarse)");

    let trailV30 = [];
    let rafV30 = 0;
    let runningV30 = false;
    let pointerActiveV30 = false;
    let lastXv30 = 0;
    let lastYv30 = 0;
    let lastTimeV30 = 0;
    let serialV30 = 0;
    let heroRectV30 = heroSectionV30.getBoundingClientRect();

    const settingsV30 = () => ({
      life: innerWidth < 640 ? 1350 : innerWidth < 1100 ? 1500 : 1625,
      minWidth: innerWidth < 640 ? 40 : 50,
      maxWidth: innerWidth < 640 ? 78 : 96,
      sampleGap: innerWidth < 640 ? 11 : 14
    });

    const clampV30 = (v, min, max) => Math.max(min, Math.min(max, v));

    const refreshHeroRectV30 = () => {
      heroRectV30 = heroSectionV30.getBoundingClientRect();
    };

    const localPointV30 = event => {
      const rect = heroRectV30;
      return {
        x: clampV30(event.clientX - rect.left, 0, rect.width),
        y: clampV30(event.clientY - rect.top, 0, rect.height),
        w: rect.width,
        h: rect.height
      };
    };

    const pushTrailPointV30 = (x, y, born, width, vx = 0, vy = 0, branch = 0) => {
      trailV30.push({
        x, y, born, width, vx, vy, branch,
        sway: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * 0.8
      });

      if (trailV30.length > 90) {
        trailV30.splice(0, trailV30.length - 90);
      }
    };

    const feedTrailV30 = (event, first = false) => {
      if (reducedMotionV30.matches) return;

      const now = performance.now();
      const p = localPointV30(event);
      const { minWidth, maxWidth, sampleGap } = settingsV30();

      if (first || !lastTimeV30) {
        lastXv30 = p.x;
        lastYv30 = p.y;
        lastTimeV30 = now;
        startRenderV30();
        return;
      }

      const dt = Math.max(8, now - lastTimeV30);
      const dx = p.x - lastXv30;
      const dy = p.y - lastYv30;
      const dist = Math.hypot(dx, dy);

      if (dist < 1.6) {
        lastXv30 = p.x;
        lastYv30 = p.y;
        lastTimeV30 = now;
        return;
      }

      const speed = dist / dt;
      const steps = Math.max(1, Math.min(10, Math.ceil(dist / sampleGap)));
      const baseWidth = clampV30(maxWidth - speed * 28, minWidth, maxWidth);

      for (let i = 1; i <= steps; i++) {
        const f = i / steps;
        const x = lastXv30 + dx * f;
        const y = lastYv30 + dy * f;
        const stampTime = now - (steps - i) * 9;
        const vx = dx / Math.max(1, dist);
        const vy = dy / Math.max(1, dist);

        pushTrailPointV30(x, y, stampTime, baseWidth, vx, vy, 0);

        if (serialV30 % 3 === 0) {
          const nx = -dy / Math.max(1, dist);
          const ny = dx / Math.max(1, dist);
          const offset = (10 + Math.random() * 16) * (serialV30 % 2 ? 1 : -1);

          pushTrailPointV30(
            x + nx * offset,
            y + ny * offset,
            stampTime + 18,
            baseWidth * (0.34 + Math.random() * 0.10),
            vx,
            vy,
            1
          );
        }

        serialV30 += 1;
      }

      lastXv30 = p.x;
      lastYv30 = p.y;
      lastTimeV30 = now;
      startRenderV30();
    };

    const buildPathV30 = points => {
      if (points.length < 2) {
        heroRevealPathV30.setAttribute("d", "M0 0");
        return;
      }

      const left = [];
      const right = [];

      for (let i = 0; i < points.length; i++) {
        const prev = points[Math.max(0, i - 1)];
        const next = points[Math.min(points.length - 1, i + 1)];
        const dx = next.x - prev.x;
        const dy = next.y - prev.y;
        const len = Math.max(1, Math.hypot(dx, dy));
        const nx = -dy / len;
        const ny = dx / len;
        const life = points[i].life;
        const wobble = Math.sin(points[i].sway + performance.now() * 0.006 + i * 0.28) * (3.5 * life);
        const spread = points[i].width * (0.52 + (points[i].branch ? 0.08 : 0));

        left.push({
          x: points[i].x + nx * (spread + wobble),
          y: points[i].y + ny * (spread + wobble * 0.68)
        });
        right.push({
          x: points[i].x - nx * (spread - wobble * 0.3),
          y: points[i].y - ny * (spread - wobble * 0.22)
        });
      }

      const qChain = chain => {
        if (!chain.length) return "";
        let d = `L ${chain[0].x.toFixed(1)} ${chain[0].y.toFixed(1)} `;
        for (let i = 1; i < chain.length; i++) {
          const prev = chain[i - 1];
          const curr = chain[i];
          const mx = (prev.x + curr.x) / 2;
          const my = (prev.y + curr.y) / 2;
          d += `Q ${prev.x.toFixed(1)} ${prev.y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)} `;
          if (i === chain.length - 1) {
            d += `Q ${curr.x.toFixed(1)} ${curr.y.toFixed(1)} ${curr.x.toFixed(1)} ${curr.y.toFixed(1)} `;
          }
        }
        return d;
      };

      const start = points[0];
      const end = points[points.length - 1];

      let d = `M ${left[0].x.toFixed(1)} ${left[0].y.toFixed(1)} `;
      d += qChain(left.slice(1));
      d += `Q ${((end.x + right[right.length - 1].x) / 2).toFixed(1)} ${((end.y + right[right.length - 1].y) / 2).toFixed(1)} ${right[right.length - 1].x.toFixed(1)} ${right[right.length - 1].y.toFixed(1)} `;
      d += qChain(right.slice().reverse().slice(1));
      d += `Q ${((start.x + left[0].x) / 2).toFixed(1)} ${((start.y + left[0].y) / 2).toFixed(1)} ${left[0].x.toFixed(1)} ${left[0].y.toFixed(1)} Z`;

      heroRevealPathV30.setAttribute("d", d);
    };

    const renderHeroRevealV30 = time => {
      const { life } = settingsV30();

      trailV30 = trailV30
        .map(point => {
          const age = time - point.born;
          const remain = 1 - age / life;
          return { ...point, age, life: clampV30(remain, 0, 1) };
        })
        .filter(point => point.life > 0.02);

      if (!trailV30.length) {
        heroRevealPathV30.setAttribute("d", "M0 0");
        return;
      }

      const shapePoints = trailV30.map(point => {
        const collapse = Math.pow(point.life, 0.62);
        const pull = Math.sin(point.age * 0.010 + point.sway) * 2.6 * point.life;

        return {
          x: point.x + point.vx * pull + point.drift * point.age * 0.01,
          y: point.y + point.vy * pull,
          width: Math.max(4, point.width * collapse),
          life: point.life,
          sway: point.sway,
          branch: point.branch
        };
      });

      buildPathV30(shapePoints);
    };

    const tickHeroV30 = time => {
      renderHeroRevealV30(time);

      if (trailV30.length || pointerActiveV30) {
        rafV30 = requestAnimationFrame(tickHeroV30);
      } else {
        runningV30 = false;
        rafV30 = 0;
      }
    };

    function startRenderV30() {
      if (runningV30 || reducedMotionV30.matches) return;
      runningV30 = true;
      rafV30 = requestAnimationFrame(tickHeroV30);
    }

    heroSectionV30.addEventListener("pointerenter", event => {
      if (coarsePointerV30.matches) return;
      refreshHeroRectV30();
      pointerActiveV30 = true;
      lastTimeV30 = 0;
      feedTrailV30(event, true);
    }, { passive: true });

    heroSectionV30.addEventListener("pointermove", event => {
      if (coarsePointerV30.matches && !pointerActiveV30) return;
      feedTrailV30(event, false);
    }, { passive: true });

    heroSectionV30.addEventListener("pointerleave", () => {
      pointerActiveV30 = false;
      lastTimeV30 = 0;
    }, { passive: true });

    heroSectionV30.addEventListener("pointerdown", event => {
      refreshHeroRectV30();
      pointerActiveV30 = true;
      lastTimeV30 = 0;
      feedTrailV30(event, true);
    }, { passive: true });

    heroSectionV30.addEventListener("pointerup", () => {
      pointerActiveV30 = false;
      lastTimeV30 = 0;
    }, { passive: true });

    heroSectionV30.addEventListener("pointercancel", () => {
      pointerActiveV30 = false;
      lastTimeV30 = 0;
    }, { passive: true });

    addEventListener("resize", refreshHeroRectV30, { passive: true });
    addEventListener("orientationchange", refreshHeroRectV30, { passive: true });

    reducedMotionV30.addEventListener?.("change", () => {
      if (reducedMotionV30.matches) {
        trailV30 = [];
        if (rafV30) cancelAnimationFrame(rafV30);
        heroRevealPathV30.setAttribute("d", "M0 0");
        runningV30 = false;
        rafV30 = 0;
      }
    });

    refreshHeroRectV30();
  }

  if (footerBrandV30 && footerWaveTurbulenceV30 && footerWaveDisplaceV30) {
    let footerRafV30 = 0;
    let footerStartV30 = 0;

    const animateFooterHoverV30 = now => {
      if (!footerStartV30) footerStartV30 = now;
      const elapsed = now - footerStartV30;
      const wave = 0.0105 + Math.sin(elapsed * 0.0022) * 0.0018;
      const scale = 8 + Math.sin(elapsed * 0.005) * 3.4;

      footerWaveTurbulenceV30.setAttribute("baseFrequency", `${wave.toFixed(4)} 0.165`);
      footerWaveDisplaceV30.setAttribute("scale", scale.toFixed(2));
      footerRafV30 = requestAnimationFrame(animateFooterHoverV30);
    };

    const stopFooterHoverV30 = () => {
      cancelAnimationFrame(footerRafV30);
      footerRafV30 = 0;
      footerStartV30 = 0;
      footerWaveTurbulenceV30.setAttribute("baseFrequency", "0.012 0.16");
      footerWaveDisplaceV30.setAttribute("scale", "0");
    };

    footerBrandV30.addEventListener("mouseenter", () => {
      stopFooterHoverV30();
      footerRafV30 = requestAnimationFrame(animateFooterHoverV30);
    });

    footerBrandV30.addEventListener("mouseleave", stopFooterHoverV30);
    footerBrandV30.addEventListener("focus", () => {
      stopFooterHoverV30();
      footerRafV30 = requestAnimationFrame(animateFooterHoverV30);
    }, true);
    footerBrandV30.addEventListener("blur", stopFooterHoverV30, true);
  }


  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
