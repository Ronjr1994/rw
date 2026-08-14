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
    const firstCard = crispRail.querySelector(".gallery-card");
    if (!track || !firstCard) return;

    if (!track.dataset.loopReady) {
      const originals = Array.from(track.children);
      originals.forEach(card => {
        const clone = card.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.querySelectorAll("a,button,input,textarea,select").forEach(el => el.setAttribute("tabindex", "-1"));
        clone.querySelectorAll("img").forEach(img => img.setAttribute("alt", ""));
        track.appendChild(clone);
      });
      track.dataset.loopReady = "true";
    }

    const originalCount = Math.floor(track.children.length / 2);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let index = Number(track.dataset.index || 0);

    const step = () => firstCard.getBoundingClientRect().width;

    const move = (instant = false) => {
      track.style.transition = instant ? "none" : "transform 260ms cubic-bezier(.25,.8,.25,1)";
      track.style.transform = `translate3d(${-step() * index}px,0,0)`;
      track.dataset.index = String(index);
    };

    const stop = () => {
      if (crispRailTimer) clearInterval(crispRailTimer);
      crispRailTimer = null;
    };

    const play = () => {
      stop();
      if (reduced || originalCount < 2) return;
      crispRailTimer = setInterval(() => {
        index += 1;
        move(false);
      }, 1800);
    };

    track.addEventListener("transitionend", () => {
      if (index >= originalCount) {
        index = 0;
        move(true);
      }
    });

    crispRail.addEventListener("mouseenter", stop);
    crispRail.addEventListener("mouseleave", play);
    crispRail.addEventListener("focusin", stop);
    crispRail.addEventListener("focusout", play);

    move(true);
    play();

    let railResizeTimer;
    addEventListener("resize", () => {
      clearTimeout(railResizeTimer);
      railResizeTimer = setTimeout(() => {
        move(true);
        play();
      }, 120);
    }, {passive:true});
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


  // V20 — visible black liquid + material object layers ------------------
  const heroV20 = document.querySelector("#top.hero");
  const inkCanvasV20 = document.querySelector("[data-hero-liquid-ink-v20]");
  const materialCanvasV20 = document.querySelector("[data-hero-liquid-material-v20]");

  if (heroV20 && inkCanvasV20 && materialCanvasV20) {
    const reducedV20 = matchMedia("(prefers-reduced-motion: reduce)");
    const coarseV20 = matchMedia("(hover:none), (pointer:coarse)");
    const inkCtxV20 = inkCanvasV20.getContext("2d");
    const materialCtxV20 = materialCanvasV20.getContext("2d");

    let dprV20=1, widthV20=1, heightV20=1;
    let pointsV20=[];
    let rafV20=0;
    let activeV20=false;
    let touchingV20=false;
    let visibleV20=true;
    let lastFrameV20=0;
    let lastXv20=0, lastYv20=0, lastTv20=0;
    let targetXv20=0, targetYv20=0;
    let objectXv20=0, objectYv20=0;
    let targetAngleV20=0, objectAngleV20=0;
    let targetStretchV20=1, objectStretchV20=1;
    let materialIndexV20=0, materialChangedV20=0;
    let travelV20=0, moveCountV20=0;

    const logoV20 = new Image();
    logoV20.decoding="async";
    logoV20.src="./assets/brand/ronswork-motion-symbol.png";

    const materialNamesV20=[
      "organic-red",
      "chrome",
      "purple-gel",
      "acid"
    ];

    const tierV20=(()=>{
      const memory=navigator.deviceMemory||4;
      const cores=navigator.hardwareConcurrency||4;

      if(innerWidth<680 || memory<=3 || cores<=4){
        return {dpr:1,fps:30,maxPoints:38,life:3300};
      }

      if(innerWidth<1280 || memory<=6 || cores<=8){
        return {dpr:1.25,fps:45,maxPoints:52,life:3500};
      }

      return {dpr:1.5,fps:60,maxPoints:64,life:3700};
    })();

    const resizeV20=()=>{
      const rect=heroV20.getBoundingClientRect();
      widthV20=Math.max(1,rect.width);
      heightV20=Math.max(1,rect.height);
      dprV20=Math.min(devicePixelRatio||1,tierV20.dpr);

      const w=Math.max(2,Math.round(widthV20*dprV20));
      const h=Math.max(2,Math.round(heightV20*dprV20));

      [inkCanvasV20,materialCanvasV20].forEach(canvas=>{
        canvas.width=w;
        canvas.height=h;
        canvas.style.width=`${widthV20}px`;
        canvas.style.height=`${heightV20}px`;
      });

      inkCtxV20.setTransform(dprV20,0,0,dprV20,0,0);
      materialCtxV20.setTransform(dprV20,0,0,dprV20,0,0);
      tileCacheV20=[];
    };

    const pointerV20=(event)=>{
      const rect=heroV20.getBoundingClientRect();

      return {
        x:Math.max(0,Math.min(rect.width,event.clientX-rect.left)),
        y:Math.max(0,Math.min(rect.height,event.clientY-rect.top))
      };
    };

    const objectSizeV20=()=>{
      const base=Math.min(widthV20,heightV20);

      if(widthV20<520){
        return Math.max(86,Math.min(120,base*.20));
      }

      if(widthV20<960){
        return Math.max(120,Math.min(168,base*.24));
      }

      return Math.max(150,Math.min(230,base*.27));
    };

    const radiusFromSpeedV20=(speed)=>{
      const minR=Math.max(22,Math.min(widthV20,heightV20)*.030);
      const maxR=Math.max(58,Math.min(widthV20,heightV20)*.083);
      const t=Math.min(1,speed/1.18);

      return maxR-(maxR-minR)*t;
    };

    const addPointV20=(x,y,time,speed,radiusScale=1,alphaScale=1)=>{
      pointsV20.push({
        x,y,born:time,
        radius:radiusFromSpeedV20(speed)*radiusScale,
        alphaScale,
        driftX:(Math.random()-.5)*8,
        driftY:(Math.random()-.5)*6
      });

      if(pointsV20.length>tierV20.maxPoints){
        pointsV20.splice(0,pointsV20.length-tierV20.maxPoints);
      }
    };

    const injectV20=(event,first=false)=>{
      if(reducedV20.matches) return;

      const now=performance.now();
      const {x,y}=pointerV20(event);

      targetXv20=x;
      targetYv20=y;

      if(first || !lastTv20){
        objectXv20=x;
        objectYv20=y;
        lastXv20=x;
        lastYv20=y;
        lastTv20=now;
        addPointV20(x,y,now,0,1.18,1);
        startV20();
        return;
      }

      const dt=Math.max(8,now-lastTv20);
      const dx=x-lastXv20;
      const dy=y-lastYv20;
      const distance=Math.hypot(dx,dy);
      const speed=distance/dt;

      if(distance>1.25){
        const steps=Math.max(1,Math.min(6,Math.ceil(distance/24)));

        for(let i=1;i<=steps;i++){
          const f=i/steps;

          addPointV20(
            lastXv20+dx*f,
            lastYv20+dy*f,
            now-(steps-i)*10,
            speed
          );
        }

        moveCountV20+=1;

        /* side tendrils */
        if(speed>.16 && moveCountV20%3===0){
          const len=Math.max(1,distance);
          const nx=-dy/len;
          const ny=dx/len;
          const side=moveCountV20%2 ? 1 : -1;

          addPointV20(
            x+nx*side*(24+Math.random()*26),
            y+ny*side*(24+Math.random()*26),
            now+35,
            speed*1.25,
            .32+Math.random()*.18,
            .74
          );
        }

        /* detached droplet */
        if(speed>.52 && moveCountV20%7===0){
          addPointV20(
            x-dx*.55+(Math.random()-.5)*40,
            y-dy*.55+(Math.random()-.5)*40,
            now+80,
            speed*1.45,
            .20+Math.random()*.12,
            .62
          );
        }

        targetAngleV20=Math.atan2(dy,dx);
        targetStretchV20=Math.min(1.55,1+speed*.42);

        travelV20+=distance;

        if(travelV20>330 && now-materialChangedV20>650){
          materialIndexV20=(materialIndexV20+1)%materialNamesV20.length;
          materialChangedV20=now;
          travelV20=0;
        }
      }

      lastXv20=x;
      lastYv20=y;
      lastTv20=now;
      startV20();
    };

    const drawInkV20=(time)=>{
      inkCtxV20.clearRect(0,0,widthV20,heightV20);

      pointsV20=pointsV20.filter(
        point=>time-point.born<=tierV20.life
      );

      for(let i=1;i<pointsV20.length;i++){
        const a=pointsV20[i-1];
        const b=pointsV20[i];
        const ageA=time-a.born;
        const ageB=time-b.born;

        if(ageA<0 || ageB<0) continue;

        const life=Math.max(
          0,
          1-Math.max(ageA,ageB)/tierV20.life
        );

        if(life<=0) continue;

        inkCtxV20.save();
        inkCtxV20.globalAlpha=
          Math.pow(life,.58)*
          Math.min(a.alphaScale,b.alphaScale);

        inkCtxV20.strokeStyle="#020302";
        inkCtxV20.lineCap="round";
        inkCtxV20.lineJoin="round";
        inkCtxV20.lineWidth=Math.max(
          18,
          (a.radius+b.radius)*.88
        );

        const mx=(a.x+b.x)*.5;
        const my=(a.y+b.y)*.5;

        inkCtxV20.beginPath();
        inkCtxV20.moveTo(a.x,a.y);
        inkCtxV20.quadraticCurveTo(
          mx+a.driftX,
          my+a.driftY,
          b.x,b.y
        );
        inkCtxV20.stroke();
        inkCtxV20.restore();
      }

      for(const point of pointsV20){
        const age=time-point.born;
        if(age<0) continue;

        const life=Math.max(0,1-age/tierV20.life);
        const radius=point.radius*(.74+life*.36);

        inkCtxV20.save();
        inkCtxV20.globalAlpha=
          Math.pow(life,.55)*
          point.alphaScale;

        inkCtxV20.fillStyle="#010201";
        inkCtxV20.beginPath();

        inkCtxV20.ellipse(
          point.x+point.driftX*(1-life),
          point.y+point.driftY*(1-life),
          radius*(1+.16*Math.sin(age*.004)),
          radius*(1-.09*Math.cos(age*.0045)),
          age*.00022,
          0,
          Math.PI*2
        );

        inkCtxV20.fill();
        inkCtxV20.restore();
      }
    };

    const paletteV20=(index)=>{
      switch(index){
        case 0:
          return {
            stops:[
              [0,"#ffd3c7"],
              [.30,"#f47b72"],
              [.66,"#a92026"],
              [1,"#4d090d"]
            ],
            highlight:"#fff2e9"
          };

        case 1:
          return {
            stops:[
              [0,"#fbfbf8"],
              [.23,"#787c82"],
              [.48,"#e7e8e5"],
              [.72,"#52565d"],
              [1,"#f7f7f2"]
            ],
            highlight:"#ffffff"
          };

        case 2:
          return {
            stops:[
              [0,"#f3c5ff"],
              [.28,"#ba70ff"],
              [.62,"#6a25bd"],
              [1,"#24103f"]
            ],
            highlight:"#ffe7ff"
          };

        default:
          return {
            stops:[
              [0,"#f7f5e9"],
              [.28,"#dfff4d"],
              [.66,"#748512"],
              [1,"#11140b"]
            ],
            highlight:"#faffcf"
          };
      }
    };

    const buildTileV20=(image,palette,size)=>{
      const tile=document.createElement("canvas");
      tile.width=Math.max(2,Math.round(size*dprV20));
      tile.height=Math.max(2,Math.round(size*dprV20));

      const ctx=tile.getContext("2d");
      ctx.scale(dprV20,dprV20);
      ctx.clearRect(0,0,size,size);

      ctx.drawImage(image,0,0,size,size);
      ctx.globalCompositeOperation="source-in";

      const gradient=ctx.createLinearGradient(
        size*.10,size*.04,
        size*.90,size*.94
      );

      palette.stops.forEach(([stop,color])=>{
        gradient.addColorStop(stop,color);
      });

      ctx.fillStyle=gradient;
      ctx.fillRect(0,0,size,size);

      const gloss=ctx.createRadialGradient(
        size*.31,size*.24,size*.02,
        size*.42,size*.40,size*.62
      );

      gloss.addColorStop(0,"rgba(255,255,255,.58)");
      gloss.addColorStop(.24,"rgba(255,255,255,.20)");
      gloss.addColorStop(1,"rgba(255,255,255,0)");

      ctx.fillStyle=gloss;
      ctx.fillRect(0,0,size,size);

      const shade=ctx.createLinearGradient(0,0,0,size);
      shade.addColorStop(0,"rgba(0,0,0,0)");
      shade.addColorStop(.62,"rgba(0,0,0,.06)");
      shade.addColorStop(1,"rgba(0,0,0,.38)");

      ctx.fillStyle=shade;
      ctx.fillRect(0,0,size,size);

      ctx.globalCompositeOperation="source-over";
      return tile;
    };

    let tileCacheV20=[];

    const rebuildTilesV20=()=>{
      if(!logoV20.complete || !logoV20.naturalWidth) return;

      const size=objectSizeV20();

      tileCacheV20=materialNamesV20.map(
        (_name,index)=>buildTileV20(
          logoV20,
          paletteV20(index),
          size
        )
      );
    };

    const drawMaterialV20=(time)=>{
      materialCtxV20.clearRect(
        0,0,widthV20,heightV20
      );

      if(!tileCacheV20.length){
        rebuildTilesV20();
      }

      const tile=tileCacheV20[materialIndexV20];
      if(!tile) return;

      objectXv20+=(targetXv20-objectXv20)*.15;
      objectYv20+=(targetYv20-objectYv20)*.15;

      let angleDelta=targetAngleV20-objectAngleV20;

      while(angleDelta>Math.PI) angleDelta-=Math.PI*2;
      while(angleDelta<-Math.PI) angleDelta+=Math.PI*2;

      objectAngleV20+=angleDelta*.11;
      objectStretchV20+=(targetStretchV20-objectStretchV20)*.12;
      targetStretchV20+=(1-targetStretchV20)*.055;

      const size=objectSizeV20();

      const alpha=Math.min(
        1,
        Math.max(
          0,
          1-Math.max(
            0,
            performance.now()-lastTv20-1150
          )/1200
        )
      );

      if(alpha<=0) return;

      materialCtxV20.save();
      materialCtxV20.translate(objectXv20,objectYv20);
      materialCtxV20.rotate(objectAngleV20*.16);

      materialCtxV20.scale(
        objectStretchV20,
        1/Math.sqrt(objectStretchV20)
      );

      materialCtxV20.shadowColor="rgba(0,0,0,.55)";
      materialCtxV20.shadowBlur=size*.14;
      materialCtxV20.shadowOffsetY=size*.055;
      materialCtxV20.globalAlpha=alpha;

      /* slice-warp: the visible object itself deforms */
      const slices=18;
      const sliceH=size/slices;

      for(let i=0;i<slices;i++){
        const normalized=i/Math.max(1,slices-1);
        const wobble=
          Math.sin(
            normalized*Math.PI*2.4+
            time*.0041
          )*
          size*
          .030*
          (objectStretchV20-.72);

        const srcY=i*tile.height/slices;
        const srcH=Math.ceil(tile.height/slices)+1;

        materialCtxV20.drawImage(
          tile,
          0,srcY,tile.width,srcH,
          -size*.5+wobble,
          -size*.5+i*sliceH,
          size,
          sliceH+1
        );
      }

      materialCtxV20.restore();

      /* visible detached flecks */
      const palette=paletteV20(materialIndexV20);

      materialCtxV20.save();
      materialCtxV20.globalAlpha=alpha*.64;

      for(let i=0;i<3;i++){
        const phase=time*(.0012+i*.0003)+i*2.3;
        const distance=size*(.54+i*.12);

        const x=
          objectXv20+
          Math.cos(phase)*distance;

        const y=
          objectYv20+
          Math.sin(phase*.83)*distance*.56;

        materialCtxV20.fillStyle=
          i===1
            ? palette.highlight
            : palette.stops[1][1];

        materialCtxV20.beginPath();

        materialCtxV20.ellipse(
          x,y,
          size*(.025+i*.006),
          size*(.012+i*.004),
          phase,
          0,
          Math.PI*2
        );

        materialCtxV20.fill();
      }

      materialCtxV20.restore();
    };

    const renderV20=(time)=>{
      const interval=1000/tierV20.fps;

      if(lastFrameV20 && time-lastFrameV20<interval){
        rafV20=requestAnimationFrame(renderV20);
        return;
      }

      lastFrameV20=time;

      drawInkV20(time);
      drawMaterialV20(time);

      const hasWake=pointsV20.length>0;

      if(
        visibleV20 &&
        !document.hidden &&
        !reducedV20.matches &&
        (
          activeV20 ||
          touchingV20 ||
          hasWake ||
          time-lastTv20<tierV20.life
        )
      ){
        rafV20=requestAnimationFrame(renderV20);
      }else{
        rafV20=0;
      }
    };

    const startV20=()=>{
      if(
        rafV20 ||
        !visibleV20 ||
        document.hidden ||
        reducedV20.matches
      ){
        return;
      }

      rafV20=requestAnimationFrame(renderV20);
    };

    const stopV20=()=>{
      if(rafV20) cancelAnimationFrame(rafV20);
      rafV20=0;
    };

    heroV20.addEventListener(
      "pointerenter",
      event=>{
        if(coarseV20.matches) return;

        activeV20=true;
        lastTv20=0;
        injectV20(event,true);
      },
      {passive:true}
    );

    heroV20.addEventListener(
      "pointermove",
      event=>{
        if(coarseV20.matches){
          if(touchingV20) injectV20(event,false);
          return;
        }

        if(!activeV20) return;
        injectV20(event,false);
      },
      {passive:true}
    );

    heroV20.addEventListener(
      "pointerleave",
      ()=>{
        if(coarseV20.matches) return;

        activeV20=false;
        lastTv20=performance.now();
        startV20();
      },
      {passive:true}
    );

    heroV20.addEventListener(
      "pointerdown",
      event=>{
        if(!coarseV20.matches) return;

        touchingV20=true;
        lastTv20=0;
        injectV20(event,true);
      },
      {passive:true}
    );

    heroV20.addEventListener(
      "pointerup",
      ()=>{
        touchingV20=false;
        lastTv20=performance.now();
        startV20();
      },
      {passive:true}
    );

    heroV20.addEventListener(
      "pointercancel",
      ()=>{
        touchingV20=false;
        lastTv20=performance.now();
      },
      {passive:true}
    );

    const observerV20=new IntersectionObserver(
      ([entry])=>{
        visibleV20=entry.isIntersecting;

        if(!visibleV20){
          stopV20();
        }else if(
          activeV20 ||
          touchingV20 ||
          pointsV20.length
        ){
          startV20();
        }
      },
      {rootMargin:"30% 0px",threshold:0}
    );

    observerV20.observe(heroV20);

    const resizeObserverV20=new ResizeObserver(()=>{
      resizeV20();
      rebuildTilesV20();
    });

    resizeObserverV20.observe(heroV20);

    document.addEventListener(
      "visibilitychange",
      ()=>{
        if(document.hidden){
          stopV20();
        }else if(
          activeV20 ||
          touchingV20 ||
          pointsV20.length
        ){
          startV20();
        }
      }
    );

    reducedV20.addEventListener?.(
      "change",
      ()=>{
        if(reducedV20.matches){
          stopV20();
          pointsV20=[];
          inkCtxV20.clearRect(0,0,widthV20,heightV20);
          materialCtxV20.clearRect(0,0,widthV20,heightV20);
        }
      }
    );

    logoV20.addEventListener(
      "load",
      rebuildTilesV20,
      {once:true}
    );

    resizeV20();
    heroV20.classList.add("is-liquid-v20-ready");
  }

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
