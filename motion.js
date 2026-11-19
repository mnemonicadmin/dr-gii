(() => {
  "use strict";

  const SCENE_W = 1024;
  const SCENE_H = 764;
  const SAND_CYCLE_SEC = 26;

  // =========================================================
  // Procedural Web Audio Synthesizer (zero external assets)
  // =========================================================
  class StudyAudio {
    constructor() {
      this.enabled = false;
      this.ctx = null;
    }

    ensure() {
      if (!this.enabled) return null;
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return null;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    }

    toggle() {
      this.enabled = !this.enabled;
      if (this.enabled) {
        this.ensure();
        this.playLampClick(true);
      }
      return this.enabled;
    }

    playBookSlide(out = true) {
      const ctx = this.ensure();
      if (!ctx) return;
      const t = ctx.currentTime;
      const dur = 0.22;
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const env = Math.sin((i / data.length) * Math.PI);
        data[i] = (Math.random() * 2 - 1) * env * 0.28;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(out ? 380 : 520, t);
      filter.frequency.exponentialRampToValueAtTime(out ? 680 : 280, t + dur);
      filter.Q.value = 2.2;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      src.connect(filter).connect(gain).connect(ctx.destination);
      src.start(t);
    }

    playSecretClick() {
      const ctx = this.ensure();
      if (!ctx) return;
      const t = ctx.currentTime;
      [293.66, 440, 554.37, 659.25].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, t + idx * 0.055);
        gain.gain.setValueAtTime(0.001, t + idx * 0.055);
        gain.gain.exponentialRampToValueAtTime(0.09, t + idx * 0.055 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.055 + 0.45);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t + idx * 0.055);
        osc.stop(t + idx * 0.055 + 0.48);
      });
    }

    playPlanetChime(planetIndex) {
      const ctx = this.ensure();
      if (!ctx) return;
      const freqs = [196.0, 246.94, 293.66, 329.63];
      const f = freqs[planetIndex % freqs.length];
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc2.type = "sine";
      osc.frequency.setValueAtTime(f, t);
      osc2.frequency.setValueAtTime(f * 1.5, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.08, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);
      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc2.start(t);
      osc.stop(t + 0.9);
      osc2.stop(t + 0.9);
    }

    playHourglassFlip() {
      const ctx = this.ensure();
      if (!ctx) return;
      const t = ctx.currentTime;
      // Glass clink + warm rushing sand
      const osc = ctx.createOscillator();
      const g1 = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(980, t);
      osc.frequency.exponentialRampToValueAtTime(740, t + 0.14);
      g1.gain.setValueAtTime(0.06, t);
      g1.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.connect(g1).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);

      const dur = 0.65;
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const u = i / data.length;
        const env = Math.sin(u * Math.PI);
        data[i] = (Math.random() * 2 - 1) * env * 0.22;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filt = ctx.createBiquadFilter();
      filt.type = "highpass";
      filt.frequency.value = 1800;
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.14, t + 0.08);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.08 + dur);
      src.connect(filt).connect(g2).connect(ctx.destination);
      src.start(t + 0.08);
    }

    playLampClick(on) {
      const ctx = this.ensure();
      if (!ctx) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(on ? 720 : 520, t);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.045);
      g.gain.setValueAtTime(0.06, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc.connect(g).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.06);
    }
  }

  // =========================================================
  // Utility Helpers
  // =========================================================
  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (e0, e1, x) => {
    const t = clamp((x - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  };

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  function sampleDominantColor(img) {
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let r = 0, gr = 0, b = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] > 200) {
        r += d[i];
        gr += d[i + 1];
        b += d[i + 2];
        n++;
      }
    }
    if (!n) return [60, 42, 30];
    return [Math.round(r / n), Math.round(gr / n), Math.round(b / n)];
  }

  // =========================================================
  // 3D Sphere Renderer for the 4 Planet Globes
  // =========================================================
  class PlanetGlobe {
    constructor(meta, texImg, lightImg) {
      this.meta = meta;
      this.cx = meta.cx;
      this.cy = meta.cy;
      this.r = meta.r;
      this.tiltRad = (meta.tilt * Math.PI) / 180;
      this.baseSpeed = meta.speed;
      this.angle = 0;
      this.spinVel = meta.speed;
      this.hover = 0;
      this.pulse = 0;
      this.isDragging = false;
      this.moonAngle = meta.id * 1.4;

      // Read albedo texture pixels (256 x 128)
      this.texW = texImg.width;
      this.texH = texImg.height;
      const tc = document.createElement("canvas");
      tc.width = this.texW;
      tc.height = this.texH;
      const tctx = tc.getContext("2d");
      tctx.drawImage(texImg, 0, 0);
      this.texPixels = tctx.getImageData(0, 0, this.texW, this.texH).data;

      // Read lighting map (128 x 128)
      const lw = lightImg.width;
      const lh = lightImg.height;
      const lc = document.createElement("canvas");
      lc.width = lw;
      lc.height = lh;
      const lctx = lc.getContext("2d");
      lctx.drawImage(lightImg, 0, 0);
      const lPixels = lctx.getImageData(0, 0, lw, lh).data;

      // Supersampled sphere buffer (2x radius -> super crisp rim & details)
      this.scale = 2;
      this.bufSize = Math.ceil(this.r * 2) * this.scale;
      this.canvas = document.createElement("canvas");
      this.canvas.width = this.bufSize;
      this.canvas.height = this.bufSize;
      this.ctx = this.canvas.getContext("2d");
      this.imgData = this.ctx.createImageData(this.bufSize, this.bufSize);

      // Build fast pixel LUT
      const half = this.bufSize * 0.5;
      const rScaled = this.r * this.scale;
      const cosT = Math.cos(this.tiltRad);
      const sinT = Math.sin(this.tiltRad);

      const indices = [];
      const rowLUT = [];
      const lon0LUT = [];
      const lightLUT = [];
      const alphaLUT = [];
      const rimDarkLUT = [];

      for (let py = 0; py < this.bufSize; py++) {
        for (let px = 0; px < this.bufSize; px++) {
          const sx = (px + 0.5 - half) / rScaled;
          const sy = -(py + 0.5 - half) / rScaled;
          const rad2 = sx * sx + sy * sy;
          if (rad2 > 1.008) continue;

          const rad = Math.sqrt(rad2);
          const edgeAlpha = 1.0 - smoothstep(0.972, 1.005, rad);
          if (edgeAlpha <= 0.01) continue;

          const sz = Math.sqrt(Math.max(0, 1 - Math.min(rad2, 1)));
          const lx = sx * cosT - sy * sinT;
          const ly = sx * sinT + sy * cosT;
          const lat = Math.asin(clamp(ly, -1, 1));
          const lon0 = Math.atan2(lx, sz);

          const texRow = clamp(Math.round((0.5 - lat / Math.PI) * (this.texH - 1)), 0, this.texH - 1);

          // Sample light map
          const lpx = clamp(Math.round((sx * 0.5 + 0.5) * (lw - 1)), 0, lw - 1);
          const lpy = clamp(Math.round((-sy * 0.5 + 0.5) * (lh - 1)), 0, lh - 1);
          const lRaw = lPixels[(lpy * lw + lpx) * 4] / 127.5;

          // Subtle comic ink rim darkening on outer 3%
          const rim = smoothstep(0.94, 0.985, rad);

          indices.push((py * this.bufSize + px) * 4);
          rowLUT.push(texRow * this.texW);
          lon0LUT.push(lon0);
          lightLUT.push(lRaw);
          alphaLUT.push(Math.round(edgeAlpha * 255));
          rimDarkLUT.push(1.0 - rim * 0.65);
        }
      }

      this.count = indices.length;
      this.lutIdx = new Int32Array(indices);
      this.lutRow = new Int32Array(rowLUT);
      this.lutLon0 = new Float32Array(lon0LUT);
      this.lutLight = new Float32Array(lightLUT);
      this.lutAlpha = new Uint8Array(alphaLUT);
      this.lutRim = new Float32Array(rimDarkLUT);
    }

    hitTest(sx, sy) {
      const dx = sx - this.cx;
      const dy = sy - this.cy;
      return dx * dx + dy * dy <= (this.r + 7) * (this.r + 7);
    }

    update(dt, timeScale, isHovered, syncBoost) {
      this.hover += ((isHovered ? 1 : 0) - this.hover) * Math.min(1, dt * 10);
      this.pulse = Math.max(0, this.pulse - dt * 0.85);
      this.moonAngle += dt * (0.9 + Math.abs(timeScale) * 0.4);

      if (!this.isDragging) {
        const targetVel =
          this.baseSpeed * timeScale * (1 + syncBoost * 1.45 + this.pulse * 2.2);
        this.spinVel += (targetVel - this.spinVel) * Math.min(1, dt * 2.6);
        this.angle += this.spinVel * dt;
      }
    }

    renderSphere(lampIntensity, nightMix) {
      const data = this.imgData.data;
      const tex = this.texPixels;
      const texW = this.texW;
      const inv2Pi = 1 / (Math.PI * 2);
      const count = this.count;
      const angle = this.angle;
      const glowBoost = 1 + this.pulse * 0.22 + nightMix * 0.08;
      const lightScale = lampIntensity * glowBoost;

      for (let i = 0; i < count; i++) {
        const dst = this.lutIdx[i];
        let uNorm = (this.lutLon0[i] - angle) * inv2Pi + 0.5;
        uNorm = uNorm - Math.floor(uNorm);
        const u = Math.min(texW - 1, (uNorm * texW) | 0);
        const src = (this.lutRow[i] + u) << 2;
        const mul = this.lutLight[i] * lightScale * this.lutRim[i];

        let r = tex[src] * mul;
        let g = tex[src + 1] * mul;
        let b = tex[src + 2] * mul;
        data[dst] = r > 255 ? 255 : r;
        data[dst + 1] = g > 255 ? 255 : g;
        data[dst + 2] = b > 255 ? 255 : b;
        data[dst + 3] = this.lutAlpha[i];
      }
      this.ctx.putImageData(this.imgData, 0, 0);
    }

    draw(ctx, lampIntensity, nightMix) {
      this.renderSphere(lampIntensity, nightMix);

      const { cx, cy, r } = this;
      const aura = Math.max(this.hover * 0.55, this.pulse * 0.9, nightMix * 0.42);

      // Soft planetary aura behind globe
      if (aura > 0.02) {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const grad = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 1.55);
        grad.addColorStop(0, `${this.meta.glow}${Math.round(aura * 88).toString(16).padStart(2, "0")}`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 1.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw projected spinning sphere cleanly inside cradle
      ctx.drawImage(this.canvas, cx - r, cy - r, r * 2, r * 2);

      // Astrolabe orbital ring + tiny satellite on hover / pulse / night mode
      const ringAlpha = clamp(this.hover * 0.85 + this.pulse * 0.9 + nightMix * 0.35, 0, 1);
      if (ringAlpha > 0.03) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.tiltRad - 0.12);
        ctx.strokeStyle = `rgba(255, 224, 152, ${ringAlpha * 0.72})`;
        ctx.lineWidth = 1.3;
        ctx.setLineDash([5, 4]);
        ctx.lineDashOffset = -this.angle * 18;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.24, r * 0.34, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Orbiting tiny golden moon dot
        ctx.setLineDash([]);
        const mx = Math.cos(this.moonAngle) * r * 1.24;
        const my = Math.sin(this.moonAngle) * r * 0.34;
        ctx.fillStyle = `rgba(255, 238, 186, ${ringAlpha})`;
        ctx.shadowColor = this.meta.glow;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(mx, my, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  // =========================================================
  // 2.5D Pull-Out Interactive Bookshelf Engine
  // =========================================================
  class InteractiveBook {
    constructor(meta, img) {
      this.meta = meta;
      this.img = img;
      this.x1 = meta.x1;
      this.y1 = meta.y1;
      this.x2 = meta.x2;
      this.y2 = meta.y2;
      this.w = meta.x2 - meta.x1;
      this.h = meta.y2 - meta.y1;
      this.cx = (meta.x1 + meta.x2) * 0.5;
      this.cy = (meta.y1 + meta.y2) * 0.5;
      this.pull = 0;
      this.vel = 0;
      this.isPulled = false;

      const [r, g, b] = sampleDominantColor(img);
      this.sideColor = `rgb(${Math.round(r * 0.68)}, ${Math.round(g * 0.68)}, ${Math.round(b * 0.68)})`;
      this.boardColor = `rgb(${Math.round(r * 0.85)}, ${Math.round(g * 0.85)}, ${Math.round(b * 0.85)})`;
    }

    getFrontRect() {
      const p = this.pull;
      const dx = (this.cx - 512) * 0.036 * p;
      const dy = (11 + (this.cy - 150) * 0.042) * p;
      const scale = 1 + 0.19 * p;
      const fw = this.w * scale;
      const fh = this.h * scale;
      const fx = this.cx + dx - fw * 0.5;
      const fy = this.cy + dy - fh * 0.5;
      return { fx, fy, fw, fh };
    }

    hitTest(sx, sy) {
      const { fx, fy, fw, fh } = this.getFrontRect();
      const pad = 2;
      return (
        (sx >= fx - pad && sx <= fx + fw + pad && sy >= fy - pad && sy <= fy + fh + pad) ||
        (sx >= this.x1 && sx <= this.x2 && sy >= this.y1 && sy <= this.y2)
      );
    }

    update(dt, isHovered) {
      const target = this.isPulled ? 1.0 : isHovered ? 0.38 : 0.0;
      const stiffness = 170;
      const damping = 18;
      const force = (target - this.pull) * stiffness - this.vel * damping;
      this.vel += force * dt;
      this.pull = clamp(this.pull + this.vel * dt, 0, 1.25);
    }

    draw(ctx, isHovered) {
      const p = this.pull;
      if (p < 0.004 && !isHovered) {
        ctx.drawImage(this.img, this.x1, this.y1, this.w, this.h);
        return;
      }

      const { fx, fy, fw, fh } = this.getFrontRect();
      const { x1, y1, x2, y2 } = this;

      ctx.save();

      // Cast drop shadow onto neighboring books & shelf plank
      if (p > 0.02) {
        ctx.fillStyle = `rgba(8, 4, 2, ${0.42 * Math.min(1, p)})`;
        ctx.beginPath();
        ctx.moveTo(fx + 3, fy + 4);
        ctx.lineTo(fx + fw + 6 * p, fy + 6 * p + 4);
        ctx.lineTo(fx + fw + 6 * p, fy + fh + 9 * p);
        ctx.lineTo(fx - 4 * p, fy + fh + 9 * p);
        ctx.closePath();
        ctx.fill();
      }

      // 3D Extruded Side Board (depends on which side faces room center x=512)
      if (p > 0.015) {
        const showRightSide = this.cx < 512;
        ctx.fillStyle = this.sideColor;
        ctx.strokeStyle = "#160d08";
        ctx.lineWidth = 1.25;

        ctx.beginPath();
        if (showRightSide) {
          ctx.moveTo(x2, y1);
          ctx.lineTo(fx + fw, fy);
          ctx.lineTo(fx + fw, fy + fh);
          ctx.lineTo(x2, y2);
        } else {
          ctx.moveTo(x1, y1);
          ctx.lineTo(fx, fy);
          ctx.lineTo(fx, fy + fh);
          ctx.lineTo(x1, y2);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Subtle inner cover line on side board
        ctx.strokeStyle = "rgba(255, 224, 170, 0.16)";
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        if (showRightSide) {
          ctx.moveTo(lerp(x2, fx + fw, 0.2), lerp(y1, fy, 0.2) + 4);
          ctx.lineTo(lerp(x2, fx + fw, 0.2), lerp(y2, fy + fh, 0.2) - 4);
        } else {
          ctx.moveTo(lerp(x1, fx, 0.2), lerp(y1, fy, 0.2) + 4);
          ctx.lineTo(lerp(x1, fx, 0.2), lerp(y2, fy + fh, 0.2) - 4);
        }
        ctx.stroke();

        // 3D Extruded Top Cream Page Block (books sit above eye level, or when tilted down!)
        // Draw page block connecting top edge of shelf slot to pulled top edge
        if (fy > y1 - 2) {
          ctx.fillStyle = "#dfd0ad";
          ctx.strokeStyle = "#160d08";
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(x1 + 1.5, y1);
          ctx.lineTo(x2 - 1.5, y1);
          ctx.lineTo(fx + fw - 1.5, fy);
          ctx.lineTo(fx + 1.5, fy);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Cream page leaf striations
          ctx.strokeStyle = "rgba(110, 78, 45, 0.45)";
          ctx.lineWidth = 0.7;
          for (let f = 0.25; f < 0.9; f += 0.25) {
            ctx.beginPath();
            ctx.moveTo(lerp(x1 + 2, fx + 2, f), lerp(y1, fy, f));
            ctx.lineTo(lerp(x2 - 2, fx + fw - 2, f), lerp(y1, fy, f));
            ctx.stroke();
          }
        }
      }

      // Front Spine Image
      ctx.drawImage(this.img, fx, fy, fw, fh);

      // Subtle warm highlight & comic ink rim when hovered or pulled
      if (isHovered || p > 0.05) {
        ctx.strokeStyle = isHovered
          ? "rgba(255, 224, 150, 0.85)"
          : `rgba(228, 181, 106, ${0.42 * Math.min(1, p)})`;
        ctx.lineWidth = isHovered ? 1.6 : 1.1;
        ctx.strokeRect(fx + 0.5, fy + 0.5, fw - 1, fh - 1);
      }

      ctx.restore();
    }
  }

  // =========================================================
  // Interactive Leather Atlas Lying on the Desk
  // =========================================================
  function pointInPoly(px, py, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0];
      const yi = poly[i][1];
      const xj = poly[j][0];
      const yj = poly[j][1];
      const intersect =
        yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi + 1e-9) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  const ATLAS_PLATES = [
    {
      roman: "I",
      name: "Рис. 698 · Органы грудной полости (Ангиология)",
      name_en: "Fig. 698 · Thoracic Cavity Organs (Angiology)",
    },
    {
      roman: "II",
      name: "Рис. 926 · Продолговатый мозг и мост (ЦНС)",
      name_en: "Fig. 926 · Medulla Oblongata & Pons (CNS)",
    },
    {
      roman: "III",
      name: "Рис. 49 · Череп, cranium; вид справа (Остеология)",
      name_en: "Fig. 49 · Skull, Cranium; Right View (Osteology)",
    },
  ];

  // =========================================================
  // Bilingual Localization Dictionary (RU / EN)
  // =========================================================
  const I18N_PAGE = {
    ru: {
      nav_intro: "ЗНАКОМСТВО",
      nav_lab: "ПРОЕКТНАЯ ЛАБОРАТОРИЯ",
      nav_inquiries: "ДИАЛОГ",
      scroll_cue: "DR. GII · МАСТЕРСТВО",
      craft_eyebrow: "МАСТЕРСТВО",
      craft_h1_1: "Между",
      craft_h1_2: "Тишиной",
      craft_h1_3: "и Звуком.",
      craft_quote: "«Каждое стихотворение — это вопрос, облачённый в одежды ответа.»",
      craft_quote_author: "DR. GII",
      craft_bio_1:
        "Dr. Gii пишет на пересечении философии и мелодии — там, где одна строка способна переставить местами всё внутри вашего разума. Прошедшее школу прожитого опыта, это творчество не столько утешает, сколько <strong>озаряет</strong>.",
      craft_bio_2:
        "Каждое стихотворение — это раскопки вглубь себя. Каждая песня — карта, начертанная в темноте. Читатель приходит незнакомцем, а уходит, унося с собой то, о потере чего даже не подозревал.",
      stat_poems: "НАПИСАНО СТИХОВ",
      stat_lyrics: "ТЕКСТОВ ПЕСЕН",
      stat_questions: "ЗАДАННЫХ ВОПРОСОВ",
      pillar_1_title: "ФИЛОСОФСКАЯ ГЛУБИНА",
      pillar_1_desc: "Каждая строка несёт в себе тяжесть вопроса, с которым стоит прожить.",
      pillar_2_title: "ГОЛОС ВНЕ ВРЕМЕНИ",
      pillar_2_desc: "Написано сейчас, звучит вечно — укоренено в извечном поиске человека.",
      wisdom_quote:
        "Время, которое убегает от нас — как песок. У кого-то он пройдет сквозь пальцы, а мудрец из песка создаст свою пирамиду на тысячелетия. Прикоснитесь к мудрости, ведь это самое ценное из чудес.",
      gal_eyebrow: "АРХИВ КАБИНЕТА · ИЛЛЮСТРАЦИИ",
      gal_h2_1: "Гравюры",
      gal_h2_2: "Вечности",
      gal_h2_3: "и Этюды Сфер.",
      gal_sub:
        "Листы из закрытого архива Dr. Gii: небесная механика сфер, анатомические штудии, хронометрия песка и геометрия стиха. Нажмите на любую гравюру, чтобы исследовать детали в архивном просмотрщике.",
      gal_filter_all: "ВСЕ ЛИСТЫ (6)",
      gal_filter_spheres: "ЭТЮДЫ СФЕР",
      gal_filter_anatomy: "АНАТОМИЯ И ВРЕМЯ",
      gal_filter_folios: "АРХИВ КАБИНЕТА",
      gal_open_hint: "✦ ОТКРЫТЬ ЛИСТ",
      plate_0_cat: "ЭТЮДЫ СФЕР · АСТРОЛЯБИЯ",
      plate_0_title: "Венера и Небесный Меридиан",
      plate_0_desc:
        "Орбитальный этюд Утренней Звезды и Марса в армиллярном кольце с эпициклами и фазами свечения.",
      plate_1_cat: "АНАТОМИЯ И ВРЕМЯ · ХРОНОМЕТРИЯ",
      plate_1_title: "Карданный Сосуд Времени",
      plate_1_desc:
        "Чертёж барочных песочных часов с золотым сечением колб, осью переворота 180° и воронкой потока.",
      plate_2_cat: "АНАТОМИЯ И ВРЕМЯ · ОСТЕОЛОГИЯ",
      plate_2_title: "Архитектура Мысли и Свода",
      plate_2_desc:
        "Лист из настольного атласа: пропорции черепного свода и грудной клетки, вписанные в золотую спираль.",
      plate_3_cat: "ЭТЮДЫ СФЕР · ГАРМОНИЯ МИРА",
      plate_3_title: "Вихревые Пояса Юпитера и Титана",
      plate_3_desc:
        "Сравнительная картография облачных поясов гиганта и янтарной дымки Титана с музыкальными интервалами Кеплера.",
      plate_4_cat: "АРХИВ КАБИНЕТА · АНГИОЛОГИЯ",
      plate_4_title: "Древо Ритма и Сердечный Пульс",
      plate_4_desc:
        "Анатомическая гравюра сосудистого древа и акустической волны пульса на пересечении поэзии и мелодии.",
      plate_5_cat: "АРХИВ КАБИНЕТА · КОСМОГРАФИЯ",
      plate_5_title: "Галереи Вавилонской Библиотеки",
      plate_5_desc:
        "Шестигранная перспектива бесконечного книгохранилища, созвездий Омара Хайяма и рукописных черновиков.",
      inq_eyebrow: "ВОПРОСЫ И ДИАЛОГ",
      inq_h2_1: "Если слово",
      inq_h2_2: "нашло вас —",
      inq_h2_3: "напишите в ответ.",
      inq_sub:
        "Если вы оказались на этой странице, что-то привело вас сюда.<br />Узнайте, что именно — в Telegram.",
      inq_btn: "@DRGII В TELEGRAM",
      closing_quote: "«Страница заканчивается. Диалог — никогда.»",
      closing_author: "— DR. GII",
    },
    en: {
      nav_intro: "INTRODUCTION",
      nav_lab: "PROJECT LAB",
      nav_inquiries: "DIALOGUE",
      scroll_cue: "DR. GII · THE CRAFT",
      craft_eyebrow: "THE CRAFT",
      craft_h1_1: "Between",
      craft_h1_2: "Silence",
      craft_h1_3: "& Sound.",
      craft_quote: '"Every poem is a question dressed in the clothes of an answer."',
      craft_quote_author: "DR. GII",
      craft_bio_1:
        "Dr. Gii writes at the intersection of philosophy and melody — where a single line can rearrange the furniture of your mind. Trained in the school of lived experience, their work doesn't comfort as much as it <strong>illuminates</strong>.",
      craft_bio_2:
        "Each poem is an excavation. Each song lyric a map drawn in the dark. The reader arrives as a stranger and leaves carrying something they didn't know they'd lost.",
      stat_poems: "POEMS WRITTEN",
      stat_lyrics: "SONG LYRICS",
      stat_questions: "QUESTIONS ASKED",
      pillar_1_title: "PHILOSOPHICAL DEPTH",
      pillar_1_desc: "Every line carries the weight of a question worth living with.",
      pillar_2_title: "TIMELESS VOICE",
      pillar_2_desc: "Written now, felt forever — rooted in the eternal human search.",
      wisdom_quote:
        "Time slipping away from us is like sand. For some, it runs through their fingers — yet a sage will build from that sand a pyramid to stand for millennia. Touch wisdom, for it is the most precious of all wonders.",
      gal_eyebrow: "STUDY ARCHIVE · ILLUSTRATIONS",
      gal_h2_1: "Engravings of",
      gal_h2_2: "Eternity",
      gal_h2_3: "& Sphere Studies.",
      gal_sub:
        "Folio plates from the private archive of Dr. Gii: celestial mechanics, anatomical studies, sand chronometry, and the geometry of verse. Click any plate to inspect it in the archival viewer.",
      gal_filter_all: "ALL PLATES (6)",
      gal_filter_spheres: "SPHERE STUDIES",
      gal_filter_anatomy: "ANATOMY & TIME",
      gal_filter_folios: "STUDY ARCHIVE",
      gal_open_hint: "✦ INSPECT PLATE",
      plate_0_cat: "SPHERE STUDIES · ASTROLABE",
      plate_0_title: "Venus & The Celestial Meridian",
      plate_0_desc:
        "Orbital study of the Morning Star and Mars inside an armillary ring with retrograde epicycles and phase crescents.",
      plate_1_cat: "ANATOMY & TIME · CHRONOMETRY",
      plate_1_title: "Gimbal Vessel of Time",
      plate_1_desc:
        "Architectural plate of the baroque hourglass showing golden-ratio bulbs, the 180° gimbal axis, and sand vortex trajectories.",
      plate_2_cat: "ANATOMY & TIME · OSTEOLOGY",
      plate_2_title: "Architecture of Thought & Vault",
      plate_2_desc:
        "Folio from the desk atlas: proportions of the cranial vault and ribcage inscribed within a golden Fibonacci spiral.",
      plate_3_cat: "SPHERE STUDIES · HARMONIA MUNDI",
      plate_3_title: "Vortex Belts of Jupiter & Titan",
      plate_3_desc:
        "Comparative cartography of Jupiter's cloud bands and Titan's amber haze paired with Kepler's musical intervals.",
      plate_4_cat: "STUDY ARCHIVE · ANGIOLOGY",
      plate_4_title: "Tree of Rhythm & Cardiac Pulse",
      plate_4_desc:
        "Anatomical engraving of the vascular tree and acoustic pulse wave at the intersection of poetry and melody.",
      plate_5_cat: "STUDY ARCHIVE · COSMOGRAPHY",
      plate_5_title: "Galleries of the Library of Babel",
      plate_5_desc:
        "Hexagonal perspective of the infinite book sanctuary, Omar Khayyam's constellations, and manuscript drafts.",
      inq_eyebrow: "INQUIRIES & CONVERSATION",
      inq_h2_1: "If a word",
      inq_h2_2: "found you —",
      inq_h2_3: "write back.",
      inq_sub:
        "If you visited this page, something brought you here. Come<br />find out what it was — on Telegram.",
      inq_btn: "@DRGII ON TELEGRAM",
      closing_quote: '"The page ends. The conversation doesn\'t."',
      closing_author: "— DR. GII",
    },
  };

  const PLANETS_EN = {
    mars: "Mars · Crimson Globe",
    jupiter: "Jupiter · Vortex Giant",
    venus: "Venus · Morning Star",
    titan: "Titan · Amber World",
  };

  const BOOKS_EN = {
    omar_khayyam: {
      title: "Rubaiyat",
      author: "Omar Khayyam (11th–12th c.)",
      category: "Poetry & Philosophy",
      note: "Immortal quatrains by the Persian poet, mathematician, and astronomer on the fleeting nature of time, the starry sky, and the wisdom of life.",
      effect_label: "Golden Vortex",
    },
    lucretius: {
      title: "On the Nature of Things",
      author: "Lucretius (1st c. BC)",
      category: "Ancient Philosophy",
      note: "A philosophical poem on atoms, the void, the motion of celestial bodies, and the laws of the material universe.",
      effect_label: "",
    },
    marcus_aurelius: {
      title: "Meditations",
      author: "Marcus Aurelius (2nd c.)",
      category: "Stoicism",
      note: "Personal reflections of the Roman Emperor on inner stillness, duty, and the flow of human centuries.",
      effect_label: "",
    },
    kepler_harmonia: {
      title: "Harmony of the World",
      author: "Johannes Kepler (1619)",
      category: "Astronomy",
      note: "The treatise formulating the third law of planetary motion and the idea of celestial musical harmony.",
      effect_label: "Resonance of Spheres",
    },
    copernicus: {
      title: "On the Revolutions of the Heavenly Spheres",
      author: "Nicolaus Copernicus (1543)",
      category: "Astronomy",
      note: "The epochal work that placed the Sun at the center of the planetary system.",
      effect_label: "Orbital Harmony",
    },
    bruno_worlds: {
      title: "On the Infinite Universe and Worlds",
      author: "Giordano Bruno (1584)",
      category: "Cosmology",
      note: "Dialogues on the multitude of inhabited worlds and the infinity of space.",
      effect_label: "",
    },
    galileo_messenger: {
      title: "Sidereus Nuncius (Starry Messenger)",
      author: "Galileo Galilei (1610)",
      category: "Observations",
      note: "The first telescopic sketches of the Moon's mountains, the Milky Way, and the four moons of Jupiter.",
      effect_label: "Orbital Alignment",
    },
    lomonosov_venus: {
      title: "The Appearance of Venus on the Sun",
      author: "Mikhail Lomonosov (1761)",
      category: "Astrophysics",
      note: "Historic report on the discovery of a dense atmosphere on Venus during its transit across the solar disc.",
      effect_label: "Light of Venus",
    },
    laplace_mechanics: {
      title: "Treatise on Celestial Mechanics",
      author: "Pierre-Simon Laplace (1799)",
      category: "Mathematics",
      note: "Fundamental analytical study of the orbital stability of the Solar System's planets.",
      effect_label: "Resonance of Spheres",
    },
    dante_comedy: {
      title: "The Divine Comedy",
      author: "Dante Alighieri (1321)",
      category: "Classics",
      note: "An epic poem ascending through the nine celestial spheres — from the Moon and Venus to the Primum Mobile.",
      effect_label: "",
    },
    newton_principia: {
      title: "Mathematical Principles of Natural Philosophy",
      author: "Isaac Newton (1687)",
      category: "Physics",
      note: "The masterwork uniting terrestrial mechanics and planetary motion under universal gravitation.",
      effect_label: "Gravity Impulse",
    },
    einstein_relativity: {
      title: "Relativity: The Special and the General Theory",
      author: "Albert Einstein (1917)",
      category: "Physics",
      note: "A clear exposition of the deep weave connecting space, time, and gravitation.",
      effect_label: "Time Dilation",
    },
    hawking_time: {
      title: "A Brief History of Time",
      author: "Stephen Hawking (1988)",
      category: "Cosmology",
      note: "An exploration of the origin of the Universe, black holes, and the three arrows of time.",
      effect_label: "Stream of Time",
    },
    huygens_light: {
      title: "Treatise on Light",
      author: "Christiaan Huygens (1690)",
      category: "Optics",
      note: "The wave theory of light and optical studies by the inventor of the pendulum clock.",
      effect_label: "Lamp Radiance",
    },
    kozyrev_time: {
      title: "Causal or Unsymmetrical Mechanics",
      author: "Nikolai Kozyrev (1958)",
      category: "Chronometry",
      note: "An original theory on the physical properties of time and its link to celestial rotation.",
      effect_label: "Sand Acceleration",
    },
    tsiolkovsky_dreams: {
      title: "Dreams of Earth and Sky",
      author: "Konstantin Tsiolkovsky (1895)",
      category: "Cosmonautics",
      note: "Scientific-philosophical essays on weightlessness, artificial satellites, and life among the stars.",
      effect_label: "",
    },
    ptolemy_almagest: {
      title: "Almagest",
      author: "Claudius Ptolemy (2nd c.)",
      category: "Ancient Astronomy",
      note: "The great star catalog and geometric model of the Sun, Moon, and the five planets known to antiquity.",
      effect_label: "Celestial Order",
    },
    flammarion: {
      title: "Popular Astronomy",
      author: "Camille Flammarion (1880)",
      category: "Astronomy",
      note: "A poetic and richly illustrated description of Mars, Venus, Jupiter, and distant stars.",
      effect_label: "Orbital Harmony",
    },
    wells_time_machine: {
      title: "The Time Machine",
      author: "H. G. Wells (1895)",
      category: "Science Fiction",
      note: "The classic novel of journeying across epochs and witnessing the fading of distant suns.",
      effect_label: "Flow of Time",
    },
    sagan_cosmos: {
      title: "Cosmos",
      author: "Carl Sagan (1980)",
      category: "Planetary Science",
      note: "A voyage across planets and galaxies from the Library of Alexandria to the edge of the Universe.",
      effect_label: "Resonance of Spheres",
    },
    faust_goethe: {
      title: "Faust",
      author: "Johann Wolfgang von Goethe (1808)",
      category: "Drama",
      note: "The tragedy of a scholar striving to fathom the secrets of the cosmos and arrest the fleeting moment.",
      effect_label: "Sanctuary Magic",
    },
    tolstoy_war_peace: {
      title: "War and Peace",
      author: "Leo Tolstoy (1869)",
      category: "Epic Novel",
      note: "A monumental work on destiny, history, and the 'lofty infinite sky' above humanity.",
      effect_label: "",
    },
    seneca_letters: {
      title: "Moral Letters to Lucilius",
      author: "Seneca (1st c.)",
      category: "Philosophy",
      note: "Letters on the value of every hour: 'It is not that we have a short time to live, but that we waste much of it.'",
      effect_label: "",
    },
    verne_moon: {
      title: "From the Earth to the Moon",
      author: "Jules Verne (1865)",
      category: "Adventure",
      note: "An engineering-minded novel of the first projectile voyage beyond Earth's gravity.",
      effect_label: "",
    },
    borges_library: {
      title: "The Library of Babel",
      author: "Jorge Luis Borges (1941)",
      category: "Prose",
      note: "A philosophical parable of an infinite Universe arranged as hexagonal galleries of books.",
      effect_label: "Secret Catalog",
    },
    exupery_prince: {
      title: "The Little Prince",
      author: "Antoine de Saint-Exupéry (1943)",
      category: "Poetic Tale",
      note: "A poetic story of journeys between tiny planets and devotion to one's own world.",
      effect_label: "Stardust",
    },
    dostoevsky_karamazov: {
      title: "The Brothers Karamazov",
      author: "Fyodor Dostoevsky (1880)",
      category: "Literature",
      note: "A philosophical novel on the meaning of existence, free will, and human conscience.",
      effect_label: "",
    },
    bulgakov_master: {
      title: "The Master and Margarita",
      author: "Mikhail Bulgakov (1940)",
      category: "Novel",
      note: "The celebrated novel on the power of art, eternity, and the truth that 'manuscripts don't burn.'",
      effect_label: "Lamp Spark",
    },
    pushkin_onegin: {
      title: "Eugene Onegin",
      author: "Alexander Pushkin (1833)",
      category: "Poetry",
      note: "An encyclopedia of Russian life in verse, adorned with gilt-edged pages.",
      effect_label: "",
    },
    lem_solaris: {
      title: "Solaris",
      author: "Stanisław Lem (1961)",
      category: "Sci-Fi",
      note: "A classic novel about a distant planet covered by a sentient ocean and the limits of human knowledge.",
      effect_label: "Ocean Wake",
    },
    descartes_method: {
      title: "Discourse on the Method",
      author: "René Descartes (1637)",
      category: "Philosophy",
      note: "Foundational treatise on clear rational inquiry, optics, and spatial coordinates.",
      effect_label: "Clear Light",
    },
    avicenna_canon: {
      title: "The Canon of Medicine",
      author: "Avicenna / Ibn Sina (11th c.)",
      category: "Medicine",
      note: "The grand encyclopedia of medieval medicine, anatomy, and natural philosophy.",
      effect_label: "",
    },
    vesalius_fabrica: {
      title: "On the Fabric of the Human Body",
      author: "Andreas Vesalius (1543)",
      category: "Anatomy",
      note: "The revolutionary Renaissance atlas that founded modern scientific anatomy.",
      effect_label: "",
    },
    leonardo_notebooks: {
      title: "Notebooks",
      author: "Leonardo da Vinci (15th–16th c.)",
      category: "Art & Science",
      note: "A volume bearing the master's miniature portrait on the spine: studies in optics, anatomy, flight, and celestial bodies.",
      effect_label: "Secret Mechanism",
    },
    shakespeare_sonnets: {
      title: "Sonnets",
      author: "William Shakespeare (1609)",
      category: "Poetry",
      note: "The immortal cycle of sonnets on beauty, eternity, and poetry's defiance of Time.",
      effect_label: "",
    },
    tesla_inventions: {
      title: "My Inventions",
      author: "Nikola Tesla (1919)",
      category: "Autobiography",
      note: "Memoirs of the great inventor on resonance, rotating magnetic fields, and the energy of light.",
      effect_label: "Current Resonance",
    },
    bradbury_chronicles: {
      title: "The Martian Chronicles",
      author: "Ray Bradbury (1950)",
      category: "Sci-Fi",
      note: "Lyrical stories of the red sands of Mars, silent canals, and human memory.",
      effect_label: "Echo of Mars",
    },
    harvey_circulation: {
      title: "On the Motion of the Heart and Blood",
      author: "William Harvey (1628)",
      category: "Anatomy",
      note: "The green-bound treatise that first demonstrated the closed circulation of blood in the human body.",
      effect_label: "",
    },
    sinelnikov_anatomy: {
      title: "Atlas of Human Anatomy",
      author: "R. D. Sinelnikov",
      category: "Anatomy · On the Desk",
      note: "Classic comprehensive anatomical atlas in brown leather binding with detailed engravings of the human body.",
      effect_label: "Interactive Atlas",
    },
  };

  // =========================================================
  // Procedural Golden Sand Strip Menu Bar
  // =========================================================
  class SandMenuStrip {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas ? canvas.getContext("2d") : null;
      this.w = 0;
      this.h = 0;
      this.baseCanvas = document.createElement("canvas");
      this.baseCtx = this.baseCanvas.getContext("2d");
      this.grains = [];
      this.mouseX = -1000;

      if (this.canvas) {
        this.resize();
        window.addEventListener("resize", () => this.resize());
        window.addEventListener("pointermove", (e) => {
          if (e.clientY <= 70) {
            this.mouseX = e.clientX;
          } else {
            this.mouseX = -1000;
          }
        });
      }
    }

    resize() {
      if (!this.canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = this.canvas.getBoundingClientRect();
      this.w = Math.max(320, Math.floor(rect.width));
      this.h = Math.max(24, Math.floor(rect.height));
      this.canvas.width = Math.floor(this.w * dpr);
      this.canvas.height = Math.floor(this.h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      this.baseCanvas.width = this.w;
      this.baseCanvas.height = this.h;
      this.buildSandTexture();

      const count = Math.min(68, Math.floor(this.w / 18));
      this.grains = Array.from({ length: count }, () => ({
        x: Math.random() * this.w,
        y: this.h - 2 - Math.pow(Math.random(), 1.6) * (this.h * 0.55),
        vx: 6 + Math.random() * 14,
        vy: (Math.random() - 0.5) * 1.4,
        r: 0.38 + Math.random() * 0.68,
        phase: Math.random() * Math.PI * 2,
        bright: Math.random() > 0.4,
      }));
    }

    buildSandTexture() {
      const ctx = this.baseCtx;
      const w = this.w;
      const h = this.h;
      ctx.clearRect(0, 0, w, h);

      const ridgeY = (x) =>
        h -
        3.2 +
        Math.sin(x * 0.011) * 1.1 +
        Math.cos(x * 0.029) * 0.65;

      // Gossamer-thin warm sand mist only along the bottom filament (top remains transparent)
      const mist = ctx.createLinearGradient(0, h * 0.45, 0, h);
      mist.addColorStop(0, "rgba(212, 166, 86, 0)");
      mist.addColorStop(0.75, "rgba(212, 166, 86, 0.05)");
      mist.addColorStop(1, "rgba(238, 192, 108, 0.14)");
      ctx.fillStyle = mist;
      ctx.fillRect(0, 0, w, h);

      // Delicate wind-swept sand threads along bottom edge
      const threads = [
        { off: -0.8, amp: 0.9, freq: 0.017, alpha: 0.22, width: 0.7 },
        { off: 0.0, amp: 0.5, freq: 0.023, alpha: 0.42, width: 0.95 },
        { off: 0.7, amp: 0.7, freq: 0.031, alpha: 0.18, width: 0.6 },
      ];
      for (const th of threads) {
        ctx.strokeStyle = `rgba(244, 206, 132, ${th.alpha})`;
        ctx.lineWidth = th.width;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 6) {
          const y = ridgeY(x) + th.off + Math.sin(x * th.freq) * th.amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Fine organic micro-sand dust clustered tightly around the wind-swept filament
      const palette = [
        [255, 240, 196],
        [240, 198, 118],
        [210, 158, 76],
        [168, 116, 48],
      ];
      const grainDots = Math.min(1800, Math.floor(w * 1.4));
      let seed = 7919;
      const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
      for (let i = 0; i < grainDots; i++) {
        const gx = rand() * w;
        const baseR = ridgeY(gx);
        // Exponentially concentrated near the bottom filament so upper menu stays ultra-clear
        const spread = Math.pow(rand(), 2.4) * (h * 0.62);
        const gy = clamp(baseR - spread + (rand() - 0.5) * 1.6, 1, h - 0.8);
        const prox = 1 - clamp(spread / (h * 0.62), 0, 1);
        const r = 0.28 + rand() * 0.52 * (0.5 + 0.5 * prox);
        const col = palette[i % palette.length];
        const alpha = (0.1 + 0.42 * prox) * (0.5 + 0.5 * rand());
        ctx.fillStyle = `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(gx, gy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    updateAndDraw(dt, timeSec) {
      if (!this.ctx || !this.w) return;
      const ctx = this.ctx;
      const w = this.w;
      const h = this.h;

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(this.baseCanvas, 0, 0);

      // Subtle travelling golden glint along the thin sand filament
      const waveX = ((timeSec * 52) % (w + 260)) - 130;
      const shim = ctx.createRadialGradient(waveX, h - 3, 2, waveX, h - 3, 110);
      shim.addColorStop(0, "rgba(255, 238, 184, 0.22)");
      shim.addColorStop(1, "rgba(255, 215, 130, 0)");
      ctx.fillStyle = shim;
      ctx.fillRect(0, 0, w, h);

      // Drifting & sparkling micro-sand particles
      for (const g of this.grains) {
        g.x += g.vx * dt;
        g.y += (g.vy + Math.sin(timeSec * 1.9 + g.phase) * 1.2) * dt;
        if (Math.abs(g.x - this.mouseX) < 60) {
          g.x += (g.x >= this.mouseX ? 1 : -1) * 22 * dt;
        }
        if (g.x > w + 4) g.x = -4;
        if (g.y < h * 0.35) g.y = h - 2.5;
        if (g.y > h - 1) g.y = h * 0.45;

        const twinkle = 0.35 + 0.65 * Math.sin(timeSec * 3.1 + g.phase);
        ctx.fillStyle = g.bright
          ? `rgba(255, 242, 196, ${0.72 * twinkle})`
          : `rgba(228, 180, 96, ${0.52 * twinkle})`;
        ctx.beginPath();
        ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // =========================================================
  // Interactive Archival Illustrations Gallery & Lightbox
  // =========================================================
  class ArchivalGallery {
    constructor(assets = {}) {
      this.assets = assets;
      this.lang = document.documentElement.lang || "ru";
      this.activePlate = 0;
      this.isOpen = false;
      this.previousFocus = null;

      this.plateMeta = [
        { roman: "TABULA I", code: "ARCHIVE · MS-GII-01", latin: "VENUS ET MERIDIANUS COELESTIS" },
        { roman: "TABULA II", code: "ARCHIVE · MS-GII-02", latin: "CLEPSYDRA ARENA · RATIO AUREA" },
        { roman: "TABULA III", code: "ARCHIVE · MS-GII-03", latin: "ARCHITECTURA CRANII ET THORACIS" },
        { roman: "TABULA IV", code: "ARCHIVE · MS-GII-04", latin: "JUPITER ET TITAN · HARMONIA" },
        { roman: "TABULA V", code: "ARCHIVE · MS-GII-05", latin: "ARBOR ARTERIARUM ET PULSUS" },
        { roman: "TABULA VI", code: "ARCHIVE · MS-GII-06", latin: "BIBLIOTHECA HEXAGONALIS" },
      ];

      this.renderAllThumbnails();
      this.bindEvents();
    }

    setLanguage(lang) {
      this.lang = lang;
      if (this.isOpen) {
        this.updateLightboxText(this.activePlate);
      }
    }

    renderAllThumbnails() {
      const canvases = document.querySelectorAll("[data-plate-canvas]");
      canvases.forEach((c) => {
        const idx = parseInt(c.getAttribute("data-plate-canvas"), 10) || 0;
        const ctx = c.getContext("2d");
        this.drawPlate(ctx, c.width, c.height, idx);
      });
    }

    bindEvents() {
      const filterBtns = Array.from(document.querySelectorAll("#galleryFilters .dg-filter-btn"));
      const cards = Array.from(document.querySelectorAll("#galleryGrid .dg-plate-card"));

      filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const f = btn.getAttribute("data-filter");
          filterBtns.forEach((b) => b.classList.toggle("active", b === btn));
          cards.forEach((card) => {
            const cat = card.getAttribute("data-category");
            const show = f === "all" || cat === f;
            card.classList.toggle("hidden", !show);
          });
        });
      });

      cards.forEach((card) => {
        const idx = parseInt(card.getAttribute("data-plate-id"), 10) || 0;
        card.addEventListener("click", () => this.openLightbox(idx));
        card.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this.openLightbox(idx);
          }
        });
      });

      this.lightbox = document.getElementById("galleryLightbox");
      this.lbCanvas = document.getElementById("lightboxCanvas");
      if (!this.lightbox || !this.lbCanvas) return;

      document.getElementById("lbClose").addEventListener("click", () => this.closeLightbox());
      document.getElementById("lightboxBackdrop").addEventListener("click", () => this.closeLightbox());
      document.getElementById("lbPrev").addEventListener("click", () => {
        this.openLightbox((this.activePlate + 5) % 6);
      });
      document.getElementById("lbNext").addEventListener("click", () => {
        this.openLightbox((this.activePlate + 1) % 6);
      });

      window.addEventListener("keydown", (e) => {
        if (!this.isOpen) return;
        if (e.key === "Escape") this.closeLightbox();
        else if (e.key === "ArrowLeft") this.openLightbox((this.activePlate + 5) % 6);
        else if (e.key === "ArrowRight") this.openLightbox((this.activePlate + 1) % 6);
        else if (e.key === "Tab") {
          const focusable = Array.from(
            this.lightbox.querySelectorAll("button, [href], [tabindex]:not([tabindex='-1'])")
          ).filter((el) => !el.hasAttribute("disabled"));
          if (!focusable.length) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      });
    }

    openLightbox(idx) {
      if (!this.lightbox || !this.lbCanvas) return;
      if (!this.isOpen) {
        this.previousFocus = document.activeElement;
        document.body.classList.add("dg-modal-open");
      }
      this.activePlate = idx;
      this.isOpen = true;
      const ctx = this.lbCanvas.getContext("2d");
      this.drawPlate(ctx, this.lbCanvas.width, this.lbCanvas.height, idx);
      this.updateLightboxText(idx);
      this.lightbox.classList.add("open");
      this.lightbox.setAttribute("aria-hidden", "false");
      const closeButton = document.getElementById("lbClose");
      if (closeButton) closeButton.focus();
    }

    updateLightboxText(idx) {
      const dict = I18N_PAGE[this.lang] || I18N_PAGE.ru;
      const meta = this.plateMeta[idx] || this.plateMeta[0];
      document.getElementById("lbRoman").textContent = meta.roman;
      document.getElementById("lbCat").textContent = dict[`plate_${idx}_cat`] || "";
      document.getElementById("lbTitle").textContent = dict[`plate_${idx}_title`] || "";
      document.getElementById("lbDesc").textContent = dict[`plate_${idx}_desc`] || "";
      document.getElementById("lbArchiveCode").textContent = meta.code;
    }

    closeLightbox() {
      if (!this.lightbox) return;
      this.isOpen = false;
      this.lightbox.classList.remove("open");
      this.lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("dg-modal-open");
      if (this.previousFocus && typeof this.previousFocus.focus === "function") {
        this.previousFocus.focus();
      }
      this.previousFocus = null;
    }

    drawBaseFolio(g, W, H, meta) {
      const bg = g.createRadialGradient(W * 0.5, H * 0.46, 20, W * 0.5, H * 0.5, W * 0.65);
      bg.addColorStop(0, "#241c13");
      bg.addColorStop(0.58, "#18130d");
      bg.addColorStop(1, "#100d09");
      g.fillStyle = bg;
      g.fillRect(0, 0, W, H);

      // Subtle coordinate grid lines
      g.strokeStyle = "rgba(214, 176, 112, 0.06)";
      g.lineWidth = 1;
      const step = 40;
      for (let x = step; x < W; x += step) {
        g.beginPath();
        g.moveTo(x, 18);
        g.lineTo(x, H - 18);
        g.stroke();
      }
      for (let y = step; y < H; y += step) {
        g.beginPath();
        g.moveTo(18, y);
        g.lineTo(W - 18, y);
        g.stroke();
      }

      // Double gold-sepia archival border
      g.strokeStyle = "rgba(214, 176, 112, 0.36)";
      g.lineWidth = 1.2;
      g.strokeRect(16, 16, W - 32, H - 32);
      g.strokeStyle = "rgba(214, 176, 112, 0.16)";
      g.lineWidth = 0.8;
      g.strokeRect(22, 22, W - 44, H - 44);

      // Corner ornaments
      const corners = [
        [22, 22, 1, 1],
        [W - 22, 22, -1, 1],
        [22, H - 22, 1, -1],
        [W - 22, H - 22, -1, -1],
      ];
      g.strokeStyle = "rgba(235, 198, 128, 0.55)";
      g.lineWidth = 1.3;
      for (const [cx, cy, dx, dy] of corners) {
        g.beginPath();
        g.moveTo(cx, cy + dy * 14);
        g.lineTo(cx, cy);
        g.lineTo(cx + dx * 14, cy);
        g.stroke();
      }

      // Top & Bottom Latin inscription headers
      g.fillStyle = "rgba(214, 176, 112, 0.68)";
      g.font = "600 10px 'Plus Jakarta Sans', sans-serif";
      g.textAlign = "right";
      g.fillText(meta.code, W - 32, 38);
      g.textAlign = "center";
      g.font = "italic 12px 'Cormorant Garamond', Georgia, serif";
      g.fillStyle = "rgba(232, 202, 146, 0.78)";
      g.fillText(meta.latin, W * 0.5, H - 30);
    }

    drawPlate(ctx, W, H, idx) {
      ctx.save();
      const scaleX = W / 640;
      const scaleY = H / 440;
      ctx.scale(scaleX, scaleY);
      const w = 640;
      const h = 440;
      const meta = this.plateMeta[idx] || this.plateMeta[0];
      this.drawBaseFolio(ctx, w, h, meta);

      if (idx === 0) this.drawPlateVenusAstrolabe(ctx, w, h);
      else if (idx === 1) this.drawPlateHourglassStudy(ctx, w, h);
      else if (idx === 2) this.drawPlateOsteologySpiral(ctx, w, h);
      else if (idx === 3) this.drawPlateJupiterHarmony(ctx, w, h);
      else if (idx === 4) this.drawPlateVascularPulse(ctx, w, h);
      else this.drawPlateBabelHexagons(ctx, w, h);

      ctx.restore();
    }

    drawPlateVenusAstrolabe(g, W, H) {
      const cx = W * 0.5;
      const cy = H * 0.47;

      // Outer graduated astrolabe ring
      g.strokeStyle = "rgba(228, 188, 118, 0.55)";
      g.lineWidth = 1.4;
      for (const r of [142, 132, 98, 62]) {
        g.beginPath();
        g.arc(cx, cy, r, 0, Math.PI * 2);
        g.stroke();
      }

      // Degree ticks around outer ring
      for (let a = 0; a < 72; a++) {
        const ang = (a / 72) * Math.PI * 2;
        const r1 = a % 6 === 0 ? 126 : 132;
        const r2 = 142;
        g.beginPath();
        g.moveTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
        g.lineTo(cx + Math.cos(ang) * r2, cy + Math.sin(ang) * r2);
        g.stroke();
      }

      // Pentagram of Venus 8:5 orbital resonance rosette
      g.strokeStyle = "rgba(255, 222, 152, 0.34)";
      g.lineWidth = 1.0;
      g.beginPath();
      for (let i = 0; i <= 360; i++) {
        const t = (i / 360) * Math.PI * 2 * 5;
        const r = 78 + 38 * Math.cos((8 / 5) * t);
        const x = cx + Math.cos(t) * r;
        const y = cy + Math.sin(t) * r;
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();

      // Axis crosshairs
      g.strokeStyle = "rgba(214, 176, 112, 0.25)";
      g.beginPath();
      g.moveTo(cx - 165, cy);
      g.lineTo(cx + 165, cy);
      g.moveTo(cx, cy - 160);
      g.lineTo(cx, cy + 160);
      g.stroke();

      // Central Illuminated Venus Sphere
      const vGrad = g.createRadialGradient(cx - 14, cy - 14, 4, cx, cy, 44);
      vGrad.addColorStop(0, "#fff2c6");
      vGrad.addColorStop(0.45, "#e2b668");
      vGrad.addColorStop(0.82, "#9a6c2e");
      vGrad.addColorStop(1, "#3d2710");
      g.fillStyle = vGrad;
      g.beginPath();
      g.arc(cx, cy, 44, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#ffe3a3";
      g.lineWidth = 1.3;
      g.stroke();

      // Sulfuric cloud bands across Venus
      g.strokeStyle = "rgba(255, 244, 210, 0.38)";
      g.lineWidth = 1.1;
      for (const dy of [-18, -6, 7, 19]) {
        const chord = Math.sqrt(Math.max(0, 42 * 42 - dy * dy));
        g.beginPath();
        g.moveTo(cx - chord, cy + dy);
        g.quadraticCurveTo(cx, cy + dy + 6, cx + chord, cy + dy);
        g.stroke();
      }

      // Orbiting Mars satellite on outer ring
      const mx = cx + Math.cos(-0.65) * 115;
      const my = cy + Math.sin(-0.65) * 115;
      const mGrad = g.createRadialGradient(mx - 5, my - 5, 2, mx, my, 18);
      mGrad.addColorStop(0, "#f59d6c");
      mGrad.addColorStop(0.6, "#bd4b24");
      mGrad.addColorStop(1, "#45180a");
      g.fillStyle = mGrad;
      g.beginPath();
      g.arc(mx, my, 18, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#f2a872";
      g.stroke();

      // 7 Phase crescents along left & right margins
      for (let i = 0; i < 5; i++) {
        const py = 92 + i * 56;
        g.strokeStyle = "rgba(228, 188, 118, 0.5)";
        g.beginPath();
        g.arc(76, py, 12, 0, Math.PI * 2);
        g.stroke();
        g.fillStyle = "rgba(238, 202, 134, 0.35)";
        g.beginPath();
        g.arc(76, py, 12, -Math.PI * 0.5, Math.PI * 0.5);
        g.fill();
      }
    }

    drawPlateHourglassStudy(g, W, H) {
      const cx = W * 0.36;
      const cy = H * 0.49;

      // Golden Ratio construction rectangles around hourglass
      g.strokeStyle = "rgba(228, 188, 118, 0.32)";
      g.setLineDash([4, 4]);
      g.strokeRect(cx - 82, cy - 134, 164, 268);
      g.beginPath();
      g.arc(cx, cy - 42, 74, 0, Math.PI * 2);
      g.arc(cx, cy + 42, 74, 0, Math.PI * 2);
      g.stroke();
      g.setLineDash([]);

      // Draw actual hourglass assets if loaded
      if (this.assets.hgBack && this.assets.hgFront && this.assets.hgGlass) {
        const hw = 152;
        const hh = 238;
        const x0 = cx - hw * 0.5;
        const y0 = cy - hh * 0.5;
        g.drawImage(this.assets.hgBack, x0, y0, hw, hh);
        const rw = hw * 0.4746;
        const rh = hh * 0.6334;
        const rcx = x0 + hw * 0.5;
        const rcy = y0 + hh * 0.3172;
        g.drawImage(this.assets.hgGlass, rcx - rw * 0.5, rcy - rh * 0.5, rw, rh);
        g.drawImage(this.assets.hgFront, x0, y0, hw, hh);
      }

      // 180° Gimbal rotation callout arc
      g.strokeStyle = "rgba(255, 224, 156, 0.72)";
      g.lineWidth = 1.4;
      g.beginPath();
      g.arc(cx, cy - 42, 92, -Math.PI * 0.38, Math.PI * 0.38);
      g.stroke();
      g.fillStyle = "#ffe2a3";
      g.font = "600 11px 'Plus Jakarta Sans', sans-serif";
      g.textAlign = "left";
      g.fillText("180° AXIS", cx + 98, cy - 40);
      g.fillText("Φ = 1.618", cx - 138, cy - 118);

      // Right side: Sand flow vortex & accumulation curve schematic
      const rx = 380;
      const ry = 88;
      const rw = 206;
      const rh = 248;
      g.strokeStyle = "rgba(214, 176, 112, 0.42)";
      g.strokeRect(rx, ry, rw, rh);

      // Funnel & Mound technical curves
      g.strokeStyle = "#ebd098";
      g.lineWidth = 1.6;
      for (let k = 0; k < 4; k++) {
        const p = (k + 1) / 5;
        const sy = ry + 26 + p * 72;
        g.beginPath();
        g.moveTo(rx + 24, sy);
        g.quadraticCurveTo(rx + rw * 0.5, sy + 24, rx + rw - 24, sy);
        g.stroke();

        const by = ry + rh - 18 - p * 68;
        g.beginPath();
        g.moveTo(rx + 20, by + 22);
        g.quadraticCurveTo(rx + rw * 0.5, by - 18, rx + rw - 20, by + 22);
        g.stroke();
      }
      g.strokeStyle = "rgba(255, 232, 172, 0.85)";
      g.beginPath();
      g.moveTo(rx + rw * 0.5, ry + 95);
      g.lineTo(rx + rw * 0.5, ry + rh - 24);
      g.stroke();
    }

    drawPlateOsteologySpiral(g, W, H) {
      const cx = W * 0.34;
      const cy = H * 0.48;

      // Vitruvian circle & square around cranium
      g.strokeStyle = "rgba(228, 188, 118, 0.38)";
      g.lineWidth = 1.2;
      g.beginPath();
      g.arc(cx, cy, 122, 0, Math.PI * 2);
      g.stroke();
      g.strokeRect(cx - 98, cy - 98, 196, 196);

      // Detailed Cranium Profile Engraving
      g.save();
      g.translate(cx, cy + 6);
      g.strokeStyle = "#ebd098";
      g.lineWidth = 2.0;
      g.beginPath();
      g.arc(0, -24, 58, Math.PI * 0.84, Math.PI * 2.14, false);
      g.quadraticCurveTo(56, 14, 44, 32);
      g.lineTo(50, 54);
      g.lineTo(28, 72);
      g.lineTo(-14, 68);
      g.quadraticCurveTo(-46, 44, -52, 4);
      g.closePath();
      g.fillStyle = "rgba(218, 178, 112, 0.14)";
      g.fill();
      g.stroke();

      // Orbit & Zygomatic arch
      g.fillStyle = "#17120c";
      g.beginPath();
      g.ellipse(22, -8, 14, 12, -0.1, 0, Math.PI * 2);
      g.fill();
      g.stroke();

      // Cranial suture hatching
      g.strokeStyle = "rgba(235, 204, 142, 0.5)";
      g.lineWidth = 1.0;
      g.beginPath();
      g.moveTo(-36, -42);
      g.quadraticCurveTo(-6, -24, 18, -50);
      g.stroke();
      g.restore();

      // Right side: Ribcage & Fibonacci Golden Spiral
      const rcx = W * 0.72;
      const rcy = H * 0.48;
      g.save();
      g.translate(rcx, rcy);
      g.strokeStyle = "#e6c788";
      g.lineWidth = 1.6;
      // Sternum
      g.beginPath();
      g.moveTo(0, -86);
      g.lineTo(0, 56);
      g.stroke();

      for (let i = 0; i < 7; i++) {
        const ry = -72 + i * 20;
        const rw = 36 + Math.sin((i / 6) * Math.PI) * 44;
        for (const dir of [-1, 1]) {
          g.beginPath();
          g.moveTo(dir * 4, ry);
          g.bezierCurveTo(dir * rw * 0.65, ry - 8, dir * rw, ry + 8, dir * rw * 0.68, ry + 22);
          g.stroke();
        }
      }

      // Golden spiral overlay
      g.strokeStyle = "rgba(255, 232, 172, 0.65)";
      g.lineWidth = 1.3;
      g.beginPath();
      for (let t = 0; t <= Math.PI * 3.5; t += 0.08) {
        const r = 4 * Math.exp(0.28 * t);
        const x = Math.cos(t) * r;
        const y = Math.sin(t) * r;
        if (t === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
      g.restore();
    }

    drawPlateJupiterHarmony(g, W, H) {
      const lx = W * 0.31;
      const rx = W * 0.69;
      const cy = H * 0.44;

      // Connecting harmonic chords between Jupiter and Titan
      g.strokeStyle = "rgba(228, 188, 118, 0.28)";
      g.lineWidth = 1.0;
      for (let k = -3; k <= 3; k++) {
        g.beginPath();
        g.moveTo(lx, cy + k * 24);
        g.bezierCurveTo(W * 0.5, cy - k * 42, W * 0.5, cy + k * 42, rx, cy + k * 18);
        g.stroke();
      }

      // Jupiter Hemisphere
      const jGrad = g.createRadialGradient(lx - 20, cy - 20, 6, lx, cy, 86);
      jGrad.addColorStop(0, "#ffe8b6");
      jGrad.addColorStop(0.55, "#d49a4e");
      jGrad.addColorStop(1, "#4e3012");
      g.fillStyle = jGrad;
      g.beginPath();
      g.arc(lx, cy, 86, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#f2cf8d";
      g.lineWidth = 1.5;
      g.stroke();

      // Jupiter bands & Great Vortex
      g.strokeStyle = "rgba(74, 40, 14, 0.52)";
      g.lineWidth = 3.2;
      for (const dy of [-52, -32, -12, 10, 30, 50]) {
        const ch = Math.sqrt(Math.max(0, 84 * 84 - dy * dy));
        g.beginPath();
        g.moveTo(lx - ch, cy + dy);
        g.lineTo(lx + ch, cy + dy);
        g.stroke();
      }
      g.strokeStyle = "#ffe3a3";
      g.lineWidth = 1.4;
      g.beginPath();
      g.ellipse(lx + 24, cy + 20, 18, 11, 0.1, 0, Math.PI * 2);
      g.stroke();

      // Titan Amber Sphere
      const tGrad = g.createRadialGradient(rx - 14, cy - 14, 4, rx, cy, 64);
      tGrad.addColorStop(0, "#ffe49e");
      tGrad.addColorStop(0.65, "#c98432");
      tGrad.addColorStop(1, "#3d220a");
      g.fillStyle = tGrad;
      g.beginPath();
      g.arc(rx, cy, 64, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#f2cf8d";
      g.lineWidth = 1.4;
      g.stroke();

      // Outer atmospheric halo on Titan
      g.strokeStyle = "rgba(255, 218, 138, 0.36)";
      g.setLineDash([3, 3]);
      g.beginPath();
      g.arc(rx, cy, 74, 0, Math.PI * 2);
      g.stroke();
      g.setLineDash([]);

      // Bottom Keplerian Musical Staff of the Spheres
      const sy = H - 88;
      g.strokeStyle = "rgba(228, 188, 118, 0.45)";
      g.lineWidth = 1.0;
      for (let line = 0; line < 5; line++) {
        g.beginPath();
        g.moveTo(86, sy + line * 7);
        g.lineTo(W - 86, sy + line * 7);
        g.stroke();
      }
      const notes = [140, 200, 260, 320, 380, 440, 500];
      notes.forEach((nx, i) => {
        const ny = sy + ((i * 2) % 5) * 7;
        g.fillStyle = "#ffe2a3";
        g.beginPath();
        g.ellipse(nx, ny, 5, 3.6, -0.3, 0, Math.PI * 2);
        g.fill();
      });
    }

    drawPlateVascularPulse(g, W, H) {
      const lx = W * 0.3;
      const cy = H * 0.48;

      // Anatomical Heart & Golden Vascular Tree
      g.save();
      g.translate(lx, cy + 16);
      g.strokeStyle = "#ebd098";
      g.fillStyle = "rgba(212, 162, 88, 0.16)";
      g.lineWidth = 2.0;
      g.beginPath();
      g.moveTo(-24, -36);
      g.bezierCurveTo(-58, -32, -62, 24, 4, 72);
      g.bezierCurveTo(56, 28, 54, -28, 18, -36);
      g.closePath();
      g.fill();
      g.stroke();

      // Branching arterial tree upward
      const branch = (x, y, len, ang, depth) => {
        if (depth <= 0) return;
        const nx = x + Math.cos(ang) * len;
        const ny = y + Math.sin(ang) * len;
        g.lineWidth = depth * 0.65;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(nx, ny);
        g.stroke();
        branch(nx, ny, len * 0.74, ang - 0.42, depth - 1);
        branch(nx, ny, len * 0.74, ang + 0.38, depth - 1);
      };
      g.strokeStyle = "rgba(255, 224, 156, 0.78)";
      branch(0, -36, 38, -Math.PI * 0.5, 5);
      g.restore();

      // Right side: Acoustic & Cardiac Pulse Waveform
      const wx0 = 310;
      const wx1 = 584;
      const wy = H * 0.46;

      g.strokeStyle = "rgba(214, 176, 112, 0.32)";
      g.lineWidth = 1.0;
      g.beginPath();
      g.arc(446, wy, 96, 0, Math.PI * 2);
      g.arc(446, wy, 64, 0, Math.PI * 2);
      g.stroke();

      g.strokeStyle = "#ffe2a3";
      g.lineWidth = 2.0;
      g.beginPath();
      for (let x = wx0; x <= wx1; x += 2) {
        const u = (x - wx0) / (wx1 - wx0);
        const beat =
          Math.exp(-Math.pow((u - 0.28) * 18, 2)) * -58 +
          Math.exp(-Math.pow((u - 0.33) * 28, 2)) * 34 +
          Math.exp(-Math.pow((u - 0.72) * 18, 2)) * -58 +
          Math.exp(-Math.pow((u - 0.77) * 28, 2)) * 34 +
          Math.sin(u * Math.PI * 16) * 4;
        const y = wy + beat;
        if (x === wx0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
    }

    drawPlateBabelHexagons(g, W, H) {
      const cx = W * 0.5;
      const cy = H * 0.47;

      // Concentric perspective hexagonal galleries of the Library of Babel
      const drawHex = (x, y, r, rot = 0) => {
        g.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = rot + (i / 6) * Math.PI * 2;
          const hx = x + Math.cos(a) * r;
          const hy = y + Math.sin(a) * r;
          if (i === 0) g.moveTo(hx, hy);
          else g.lineTo(hx, hy);
        }
        g.closePath();
        g.stroke();
      };

      const radii = [150, 116, 86, 60, 38, 20];
      radii.forEach((r, idx) => {
        g.strokeStyle = `rgba(235, 198, 128, ${0.75 - idx * 0.09})`;
        g.lineWidth = idx === 0 ? 1.8 : 1.2;
        drawHex(cx, cy, r, Math.PI / 6);
      });

      // Radial gallery perspective spokes connecting hexagon vertices
      g.strokeStyle = "rgba(214, 176, 112, 0.42)";
      g.lineWidth = 1.1;
      for (let i = 0; i < 6; i++) {
        const a = Math.PI / 6 + (i / 6) * Math.PI * 2;
        g.beginPath();
        g.moveTo(cx + Math.cos(a) * 20, cy + Math.sin(a) * 20);
        g.lineTo(cx + Math.cos(a) * 150, cy + Math.sin(a) * 150);
        g.stroke();
      }

      // Flanking satellite hexagons & constellation stars
      for (const dir of [-1, 1]) {
        const sx = cx + dir * 206;
        g.strokeStyle = "rgba(228, 188, 118, 0.45)";
        drawHex(sx, cy - 52, 42, 0);
        drawHex(sx, cy + 52, 42, 0);

        g.fillStyle = "#ffe3a3";
        for (const dy of [-52, 0, 52]) {
          g.beginPath();
          g.arc(sx, cy + dy, 3, 0, Math.PI * 2);
          g.fill();
        }
      }

      // Central luminous star of wisdom
      const sGrad = g.createRadialGradient(cx, cy, 2, cx, cy, 26);
      sGrad.addColorStop(0, "#fff4d2");
      sGrad.addColorStop(0.5, "rgba(238, 192, 108, 0.45)");
      sGrad.addColorStop(1, "rgba(238, 192, 108, 0)");
      g.fillStyle = sGrad;
      g.beginPath();
      g.arc(cx, cy, 26, 0, Math.PI * 2);
      g.fill();
    }
  }

  function createParchmentPage(W, H, romanLabel) {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const g = c.getContext("2d");

    // Warm antique ivory-parchment wash suited for real Sinelnikov plates
    const bg = g.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#faf2df");
    bg.addColorStop(0.5, "#f4e7cb");
    bg.addColorStop(1, "#ead7b1");
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);

    return { c, g };
  }

  function finishParchmentSpread(g, W, H, romanLabel) {
    // Subtle spine gutter darkening across middle x = W / 2
    const gutter = g.createLinearGradient(W * 0.44, 0, W * 0.56, 0);
    gutter.addColorStop(0, "rgba(75, 42, 18, 0)");
    gutter.addColorStop(0.46, "rgba(62, 34, 14, 0.28)");
    gutter.addColorStop(0.5, "rgba(38, 18, 7, 0.46)");
    gutter.addColorStop(0.54, "rgba(62, 34, 14, 0.25)");
    gutter.addColorStop(1, "rgba(75, 42, 18, 0)");
    g.fillStyle = gutter;
    g.fillRect(0, 0, W, H);

    // Double sepia ruled borders on left & right pages
    g.strokeStyle = "rgba(86, 52, 26, 0.38)";
    g.lineWidth = 2.0;
    g.strokeRect(18, 18, W * 0.5 - 36, H - 36);
    g.strokeRect(W * 0.5 + 18, 18, W * 0.5 - 36, H - 36);

    // Plate Roman numeral header on top-left corner
    g.fillStyle = "#5c3018";
    g.font = "bold 18px Georgia, serif";
    g.textAlign = "left";
    g.fillText(`ТАБЛ. ${romanLabel}`, 30, 42);
  }

  function drawImageFitMultiply(g, img, sx, sy, sw, sh, dx, dy, dw, dh) {
    if (!img) return;
    const srcAspect = sw / sh;
    const dstAspect = dw / dh;
    let rw = dw;
    let rh = dh;
    if (srcAspect > dstAspect) {
      rh = dw / srcAspect;
    } else {
      rw = dh * srcAspect;
    }
    const rx = dx + (dw - rw) * 0.5;
    const ry = dy + (dh - rh) * 0.5;
    g.save();
    g.globalCompositeOperation = "multiply";
    g.drawImage(img, sx, sy, sw, sh, rx, ry, rw, rh);
    g.restore();
  }

  function buildAtlasPlates(plateImgs = []) {
    const W = 880;
    const H = 528;
    const [ap1, ap2, ap3] = plateImgs;

    // Plate I: Uploaded Image 1 (Рис. 698 — Положение органов в грудной полости; вид спереди)
    const p1 = createParchmentPage(W, H, "I");
    if (ap1) {
      // Left page: full Sinelnikov page (header + lungs + 3-column caption text)
      drawImageFitMultiply(p1.g, ap1, 0, 0, ap1.width, ap1.height, 26, 48, 388, 456);
      // Right page: large magnified view of the thoracic organs illustration (Рис. 698)
      drawImageFitMultiply(
        p1.g,
        ap1,
        Math.round(ap1.width * 0.08),
        Math.round(ap1.height * 0.13),
        Math.round(ap1.width * 0.84),
        Math.round(ap1.height * 0.64),
        466,
        28,
        388,
        472
      );
    }
    finishParchmentSpread(p1.g, W, H, "I");

    // Plate II: Uploaded Image 2 (Рис. 926 — Продолговатый мозг, мост и ножки мозга)
    const p2 = createParchmentPage(W, H, "II");
    if (ap2) {
      // Left page: full Sinelnikov page (CNS text columns + brainstem figure + caption)
      drawImageFitMultiply(p2.g, ap2, 0, 0, ap2.width, ap2.height, 26, 48, 388, 456);
      // Right page: large magnified view of the brainstem & cranial nerves (Рис. 926)
      drawImageFitMultiply(
        p2.g,
        ap2,
        Math.round(ap2.width * 0.08),
        Math.round(ap2.height * 0.34),
        Math.round(ap2.width * 0.84),
        Math.round(ap2.height * 0.62),
        466,
        28,
        388,
        472
      );
    }
    finishParchmentSpread(p2.g, W, H, "II");

    // Plate III: Uploaded Image 3 (49. Череп, cranium; вид справа)
    const p3 = createParchmentPage(W, H, "III");
    if (ap3) {
      // Left page: full Sinelnikov page (Ossa skeleti axialis header + skull + caption)
      drawImageFitMultiply(p3.g, ap3, 0, 0, ap3.width, ap3.height, 26, 48, 388, 456);
      // Right page: large magnified view of the colored skull (49. Череп, cranium; вид справа)
      drawImageFitMultiply(
        p3.g,
        ap3,
        Math.round(ap3.width * 0.1),
        Math.round(ap3.height * 0.26),
        Math.round(ap3.width * 0.82),
        Math.round(ap3.height * 0.56),
        466,
        28,
        388,
        472
      );
    }
    finishParchmentSpread(p3.g, W, H, "III");

    return [p1.c, p2.c, p3.c];
  }

  class DeskBook {
    /** Interactive flat-lying desk volume ("Атлас анатомии человека") that opens into an illustrated spread. */
    constructor(meta, img, plateImgs = []) {
      this.meta = meta;
      this.img = img;
      this.x1 = meta.x1;
      this.y1 = meta.y1;
      this.x2 = meta.x2;
      this.y2 = meta.y2;
      this.w = meta.x2 - meta.x1;
      this.h = meta.y2 - meta.y1;
      this.cx = (meta.x1 + meta.x2) * 0.5;
      this.cy = (meta.y1 + meta.y2) * 0.5;
      this.poly = meta.poly || [
        [this.x1, this.y1],
        [this.x2, this.y1],
        [this.x2, this.y2],
        [this.x1, this.y2],
      ];
      this.pull = 0;
      this.vel = 0;
      this.isPulled = false;

      this.plateIndex = 0;
      this.flipAnim = 0;
      this.plates = buildAtlasPlates(plateImgs);
    }

    nextPlate() {
      this.plateIndex = (this.plateIndex + 1) % this.plates.length;
      this.flipAnim = 1.0;
    }

    getOpenRect() {
      const ease = smoothstep(0.08, 0.96, clamp(this.pull, 0, 1));
      const cx = lerp(this.cx, 166, ease);
      const cy = lerp(this.cy, 588, ease);
      const topW = lerp(152, 258, ease);
      const botW = lerp(172, 286, ease);
      const h = lerp(68, 156, ease);
      return { cx, cy, topW, botW, h, ease };
    }

    getTransform() {
      const p = clamp(this.pull, 0, 0.25);
      return { dx: 6 * p, dy: -6 * p, scale: 1 + 0.04 * p };
    }

    isCornerHit(sx, sy) {
      if (!this.isPulled || this.pull < 0.75) return false;
      const { cx, cy, botW, h } = this.getOpenRect();
      const rx = cx + botW * 0.5;
      const ry = cy + h * 0.5;
      return sx >= rx - 46 && sx <= rx + 12 && sy >= ry - 44 && sy <= ry + 12;
    }

    hitTest(sx, sy) {
      if (this.isPulled || this.pull > 0.22) {
        const { cx, cy, botW, h } = this.getOpenRect();
        return (
          sx >= cx - botW * 0.54 &&
          sx <= cx + botW * 0.54 &&
          sy >= cy - h * 0.54 &&
          sy <= cy + h * 0.56
        );
      }
      return pointInPoly(sx, sy, this.poly);
    }

    update(dt, isHovered) {
      const target = this.isPulled ? 1.0 : isHovered ? 0.08 : 0.0;
      const stiffness = 135;
      const damping = 16;
      const force = (target - this.pull) * stiffness - this.vel * damping;
      this.vel += force * dt;
      this.pull = clamp(this.pull + this.vel * dt, 0, 1.1);
      if (this.flipAnim > 0) {
        this.flipAnim = Math.max(0, this.flipAnim - dt * 3.1);
      }
    }

    drawOpenFolio(ctx, isHovered, isCornerHovered) {
      const { cx, cy, topW, botW, h, ease } = this.getOpenRect();
      const topY = cy - h * 0.5;
      const botY = cy + h * 0.5;
      const openAlpha = smoothstep(0.06, 0.28, this.pull);
      const padX = 9;
      const padY = 6;

      ctx.save();
      ctx.globalAlpha = openAlpha;

      // Soft ambient drop shadow on desk blotter
      ctx.fillStyle = `rgba(6, 3, 1, ${0.52 * openAlpha})`;
      ctx.beginPath();
      ctx.moveTo(cx - topW * 0.5 - padX + 4, topY - padY + 6);
      ctx.lineTo(cx + topW * 0.5 + padX + 8, topY - padY + 8);
      ctx.lineTo(cx + botW * 0.5 + padX + 12, botY + padY + 12);
      ctx.lineTo(cx - botW * 0.5 - padX + 2, botY + padY + 12);
      ctx.closePath();
      ctx.fill();

      // Brown leather binding boards (trapezoid desk perspective)
      const leatherGrad = ctx.createLinearGradient(cx - botW * 0.5, topY, cx + botW * 0.5, botY);
      leatherGrad.addColorStop(0, "#4b2615");
      leatherGrad.addColorStop(0.5, "#6b3920");
      leatherGrad.addColorStop(1, "#432111");
      ctx.fillStyle = leatherGrad;
      ctx.strokeStyle = isHovered ? "rgba(255, 224, 150, 0.9)" : "#150a05";
      ctx.lineWidth = isHovered ? 2.0 : 1.7;
      ctx.beginPath();
      ctx.moveTo(cx - topW * 0.5 - padX, topY - padY);
      ctx.lineTo(cx + topW * 0.5 + padX, topY - padY);
      ctx.lineTo(cx + botW * 0.5 + padX, botY + padY);
      ctx.lineTo(cx - botW * 0.5 - padX, botY + padY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Stacked parchment page block edges along bottom/outer sides
      ctx.fillStyle = "#ceb789";
      ctx.strokeStyle = "#1c0e06";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(cx - botW * 0.5, botY);
      ctx.lineTo(cx + botW * 0.5, botY);
      ctx.lineTo(cx + botW * 0.5, botY + 4);
      ctx.lineTo(cx - botW * 0.5, botY + 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Project two-page anatomical plate smoothly in trapezoid perspective!
      const plate = this.plates[this.plateIndex];
      const pageReveal = smoothstep(0.18, 0.62, ease);
      if (pageReveal > 0.01) {
        ctx.save();
        ctx.globalAlpha = openAlpha * pageReveal;
        const slices = 24;
        const srcH = plate.height / slices;
        for (let i = 0; i < slices; i++) {
          const v0 = i / slices;
          const v1 = (i + 1) / slices;
          const y0 = lerp(topY, botY, v0);
          const y1 = lerp(topY, botY, v1);
          const wSlice = lerp(topW, botW, (v0 + v1) * 0.5);
          ctx.drawImage(
            plate,
            0,
            i * srcH,
            plate.width,
            srcH + 0.6,
            cx - wSlice * 0.5,
            y0,
            wSlice,
            y1 - y0 + 0.5
          );
        }
        ctx.restore();
      }

      // Cover flip-open animation wing during early opening phase (hinging left over cx)
      if (ease < 0.62) {
        const wingAngle = clamp(ease / 0.62, 0, 1) * Math.PI;
        const wingCos = Math.cos(wingAngle);
        const wingLift = Math.sin(wingAngle) * 24;
        ctx.save();
        ctx.fillStyle = wingCos >= 0 ? "#65361e" : "#80492b";
        ctx.strokeStyle = "#160a05";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, topY - padY);
        ctx.lineTo(cx + (topW * 0.5 + padX) * wingCos, topY - padY - wingLift);
        ctx.lineTo(cx + (botW * 0.5 + padX) * wingCos, botY + padY - wingLift);
        ctx.lineTo(cx, botY + padY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Animated single-page turn curl when switching plates
      if (this.flipAnim > 0.01) {
        const ft = 1.0 - this.flipAnim;
        const fCos = Math.cos(ft * Math.PI);
        const fLift = Math.sin(ft * Math.PI) * 18;
        ctx.save();
        ctx.fillStyle = fCos >= 0 ? "rgba(244, 228, 194, 0.92)" : "rgba(225, 204, 162, 0.92)";
        ctx.strokeStyle = "#5c361a";
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(cx, topY);
        ctx.lineTo(cx + topW * 0.5 * fCos, topY - fLift);
        ctx.lineTo(cx + botW * 0.5 * fCos, botY - fLift);
        ctx.lineTo(cx, botY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Outer ink frame around open parchment spread + spine stitch line
      ctx.strokeStyle = "#2b160a";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx - topW * 0.5, topY);
      ctx.lineTo(cx + topW * 0.5, topY);
      ctx.lineTo(cx + botW * 0.5, botY);
      ctx.lineTo(cx - botW * 0.5, botY);
      ctx.closePath();
      ctx.stroke();

      // Crimson silk ribbon bookmark draping out the bottom center spine
      const sway = Math.sin(performance.now() * 0.0022) * 1.4;
      ctx.fillStyle = "#8e231f";
      ctx.strokeStyle = "#180a06";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(cx - 2.5, topY + 2);
      ctx.lineTo(cx + 2.5, topY + 2);
      ctx.lineTo(cx + 3 + sway * 0.3, botY + 12);
      ctx.lineTo(cx + sway, botY + 18);
      ctx.lineTo(cx - 2 + sway, botY + 14);
      ctx.lineTo(cx - 4 + sway, botY + 19);
      ctx.lineTo(cx - 3 + sway * 0.3, botY + 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Subtle lifted lower-right page corner cue to flip plates
      if (ease > 0.72) {
        const rx = cx + botW * 0.5;
        const ry = botY;
        ctx.save();
        ctx.fillStyle = isCornerHovered ? "#ffe6a6" : "#ead19d";
        ctx.strokeStyle = "#3c200e";
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(rx - 15, ry);
        ctx.lineTo(rx, ry - 15);
        ctx.lineTo(rx - 3, ry - 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    }

    draw(ctx, isHovered, isCornerHovered = false) {
      const p = this.pull;
      if (p < 0.004 && !isHovered) {
        ctx.drawImage(this.img, this.x1, this.y1, this.w, this.h);
        return;
      }

      if (p < 0.25) {
        const closedAlpha = 1.0 - smoothstep(0.08, 0.24, p);
        if (closedAlpha > 0.01) {
          const { dx, dy, scale } = this.getTransform();
          ctx.save();
          ctx.globalAlpha = closedAlpha;
          if (p > 0.015) {
            ctx.fillStyle = `rgba(6, 3, 1, ${0.42 * Math.min(1, p * 4)})`;
            ctx.beginPath();
            for (let i = 0; i < this.poly.length; i++) {
              const px = this.poly[i][0] + 4 * p;
              const py = this.poly[i][1] + 7 * p;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
          }
          ctx.translate(this.cx + dx, this.cy + dy);
          ctx.scale(scale, scale);
          ctx.translate(-this.cx, -this.cy);
          ctx.drawImage(this.img, this.x1, this.y1, this.w, this.h);
          if (isHovered) {
            ctx.strokeStyle = "rgba(255, 224, 150, 0.88)";
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            for (let i = 0; i < this.poly.length; i++) {
              const [px, py] = this.poly[i];
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      if (p >= 0.06) {
        this.drawOpenFolio(ctx, isHovered, isCornerHovered);
      }
    }
  }

  function solveCubicBezierY(t, p1x, p1y, p2x, p2y) {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let lo = 0;
    let hi = 1;
    let u = t;
    for (let i = 0; i < 12; i++) {
      u = 0.5 * (lo + hi);
      const inv = 1 - u;
      const x = 3 * inv * inv * u * p1x + 3 * inv * u * u * p2x + u * u * u;
      if (x < t) lo = u;
      else hi = u;
    }
    u = 0.5 * (lo + hi);
    const inv = 1 - u;
    return 3 * inv * inv * u * p1y + 3 * inv * u * u * p2y + u * u * u;
  }

  // =========================================================
  // Custom Baroque Gimbal Hourglass (User Project Integration)
  // =========================================================
  class DeskHourglass {
    constructor() {
      // Placement & dimensions calibrated for the scholar's desk
      this.cx = 521;
      this.baseY = 644;
      this.targetW = 109;
      this.targetH = 170;
      this.x0 = this.cx - this.targetW * 0.5;
      this.y0 = this.baseY - this.targetH;

      // Exact rotor geometry inside 1062x1655 baroque artboard:
      // left: 50%, top: 31.72%, width: 47.46%, height: 63.34%
      this.rotorCx = this.x0 + this.targetW * 0.5;
      this.rotorCy = this.y0 + this.targetH * 0.3172;
      this.rotorW = this.targetW * 0.4746;
      this.rotorH = this.targetH * 0.6334;

      // Timing & flip state (ported from hourglass_30s.html)
      this.cycleSec = 30.0;
      this.flipSec = 1.05;
      this.topFrac = 0.76; // starts mid-flow so sand falls immediately on open
      this.flipAnim = 0;
      this.isFlipping = false;
      this.swappedHalfway = false;
      this.sandReversed = false;
      this.rotorAngle = 0;
      this.flipStartAngle = 0;
      this.flipTargetAngle = 0;
      this.hover = 0;
      this.glowPulse = 0;

      // Logical sand simulation buffer (360 x 520) & masked rotor compositing buffer (253 x 526)
      this.sandW = 360;
      this.sandH = 520;
      this.sandCanvas = document.createElement("canvas");
      this.sandCanvas.width = this.sandW;
      this.sandCanvas.height = this.sandH;
      this.sandCtx = this.sandCanvas.getContext("2d");

      this.maskW = 253;
      this.maskH = 526;
      this.rotorCanvas = document.createElement("canvas");
      this.rotorCanvas.width = this.maskW;
      this.rotorCanvas.height = this.maskH;
      this.rotorCtx = this.rotorCanvas.getContext("2d");

      // Image layers loaded by StudyMotionApp
      this.backImg = null;
      this.frontImg = null;
      this.maskImg = null;
      this.glassImg = null;
      this.assetsReady = false;

      // Dynamic falling sand particles (inside 360x520 logical space)
      this.particles = [];
      this.spawnAcc = 0;
      this.dustPuffs = [];
    }

    setAssets(backImg, frontImg, maskImg, glassImg) {
      this.backImg = backImg;
      this.frontImg = frontImg;
      this.maskImg = maskImg;
      this.glassImg = glassImg;
      if (maskImg && maskImg.width > 0 && maskImg.height > 0) {
        this.maskW = maskImg.width;
        this.maskH = maskImg.height;
        this.rotorCanvas.width = this.maskW;
        this.rotorCanvas.height = this.maskH;
      }
      this.assetsReady = Boolean(backImg && frontImg && maskImg && glassImg);
    }

    hitTest(sx, sy) {
      return (
        sx >= this.x0 - 8 &&
        sx <= this.x0 + this.targetW + 8 &&
        sy >= this.y0 - 4 &&
        sy <= this.baseY + 6
      );
    }

    triggerFlip() {
      if (this.isFlipping) return false;
      this.isFlipping = true;
      this.flipAnim = 0.0001;
      this.swappedHalfway = false;
      this.flipStartAngle = this.rotorAngle;
      this.flipTargetAngle = this.rotorAngle + Math.PI;
      this.particles.length = 0;
      return true;
    }

    // Exact sand height & cone math from hourglass_30s.html
    getTopSandState(p) {
      const amount = 1 - p;
      const surfaceY = lerp(72, 224, p);
      const dipY = Math.min(254, surfaceY + lerp(40, 20, amount));
      return { amount, surfaceY, dipY };
    }

    getBottomSandState(p) {
      const sideY = 510 - p * 192;
      const peakLift = lerp(36, 10, p);
      const spread = 90 + p * 58;
      return { sideY, peakLift, spread };
    }

    bottomSurfaceYAt(x, p) {
      const { sideY, peakLift, spread } = this.getBottomSandState(p);
      const dx = clamp(Math.abs(x - 180) / spread, 0, 1);
      const mound = Math.pow(1 - dx, 1.58);
      const flatten = clamp((p - 0.78) / 0.22, 0, 1);
      return sideY - peakLift * mound + flatten * 8 * dx * dx;
    }

    spawnParticle(botP, reverseDir) {
      const targetY = this.bottomSurfaceYAt(180, botP);
      if (reverseDir) {
        this.particles.push({
          x: 180 + (Math.random() - 0.5) * 20,
          y: targetY - Math.random() * 8,
          vx: (Math.random() - 0.5) * 14,
          vy: -(240 + Math.random() * 110),
          r: 3.4 + Math.random() * 2.8,
          alpha: 0.72 + Math.random() * 0.28,
          upward: true,
        });
      } else {
        this.particles.push({
          x: 180 + (Math.random() - 0.5) * 6,
          y: 266 + Math.random() * 10,
          vx: (Math.random() - 0.5) * 18,
          vy: 230 + Math.random() * 120,
          r: 3.4 + Math.random() * 2.8,
          alpha: 0.76 + Math.random() * 0.24,
          upward: false,
        });
      }
    }

    update(dt, timeScale, isHovered) {
      this.hover += ((isHovered ? 1 : 0) - this.hover) * Math.min(1, dt * 10);
      this.glowPulse += dt * 2.4;

      if (this.isFlipping) {
        this.flipAnim += dt / this.flipSec;
        const t = Math.min(1, this.flipAnim);
        const eased = solveCubicBezierY(t, 0.2, 0.78, 0.18, 1);
        this.rotorAngle = lerp(this.flipStartAngle, this.flipTargetAngle, eased);

        if (eased >= 0.5 && !this.swappedHalfway) {
          this.sandReversed = !this.sandReversed;
          this.topFrac = 1.0 - this.topFrac;
          this.swappedHalfway = true;
        }

        if (this.flipAnim >= 1.0) {
          this.flipAnim = 0;
          this.isFlipping = false;
          this.rotorAngle = this.flipTargetAngle;
          // Normalize modulo 2*PI so long runs stay numerically bounded
          const twoPi = Math.PI * 2;
          this.rotorAngle = ((this.rotorAngle % twoPi) + twoPi) % twoPi;

          // Subtle brass gimbal click dust puff near pedestal
          for (let i = 0; i < 10; i++) {
            const ang = (i / 10) * Math.PI * 2;
            this.dustPuffs.push({
              x: this.cx + Math.cos(ang) * 20,
              y: this.baseY - 4 + Math.sin(ang) * 4,
              vx: Math.cos(ang) * (14 + Math.random() * 18),
              vy: Math.sin(ang) * 4 - 6 - Math.random() * 8,
              life: 1.0,
            });
          }
        }
      } else {
        const rate = (1 / this.cycleSec) * timeScale;
        this.topFrac = clamp(this.topFrac - rate * dt, 0.0, 1.0);
      }

      const activeFlow =
        !this.isFlipping &&
        ((timeScale > 0 && this.topFrac > 0.003) || (timeScale < 0 && this.topFrac < 0.997));

      const botP = 1.0 - this.topFrac;
      const absSpeed = Math.abs(timeScale);
      const effDt = dt * Math.max(0.25, absSpeed);

      if (activeFlow && timeScale !== 0) {
        const spawnRate = 24 * Math.max(0.5, absSpeed);
        this.spawnAcc += dt * spawnRate;
        while (this.spawnAcc >= 1) {
          this.spawnAcc -= 1;
          if (this.particles.length < 48) {
            this.spawnParticle(botP, timeScale < 0);
          }
        }
      }

      if (timeScale !== 0) {
        const moundCenterY = this.bottomSurfaceYAt(180, botP);
        for (let i = this.particles.length - 1; i >= 0; i--) {
          const pt = this.particles[i];
          if (pt.upward) {
            pt.vy -= 180 * effDt;
            pt.x += pt.vx * effDt * 0.4;
            pt.y += pt.vy * effDt;
            if (pt.y <= 258) {
              this.particles.splice(i, 1);
            }
          } else {
            pt.vy += 420 * effDt;
            pt.x += pt.vx * effDt;
            pt.y += pt.vy * effDt;
            const impactY = this.bottomSurfaceYAt(pt.x, botP);
            if (pt.y >= Math.min(impactY, moundCenterY + 26)) {
              this.particles.splice(i, 1);
            }
          }
        }
      }

      for (let i = this.dustPuffs.length - 1; i >= 0; i--) {
        const pf = this.dustPuffs[i];
        pf.x += pf.vx * dt;
        pf.y += pf.vy * dt;
        pf.vy += 26 * dt;
        pf.life -= dt * 2.0;
        if (pf.life <= 0) this.dustPuffs.splice(i, 1);
      }
    }

    renderSandBuffer(timeScale, nightMix) {
      const ctx = this.sandCtx;
      const W = this.sandW;
      const H = this.sandH;
      ctx.clearRect(0, 0, W, H);

      ctx.save();
      if (this.sandReversed) {
        ctx.translate(W * 0.5, H * 0.5);
        ctx.rotate(Math.PI);
        ctx.translate(-W * 0.5, -H * 0.5);
      }

      const p = 1.0 - this.topFrac; // drained progress [0..1]
      const glowShift = nightMix * 0.22;

      // Subtle warm interior amber glow (ported from drawInnerGlow)
      const g1 = ctx.createRadialGradient(180, 148, 12, 180, 148, 138);
      g1.addColorStop(0, `rgba(255, 212, 132, ${0.18 + glowShift})`);
      g1.addColorStop(1, "rgba(255, 192, 100, 0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H * 0.52);

      const g2 = ctx.createRadialGradient(180, 396, 12, 180, 396, 142);
      g2.addColorStop(0, `rgba(255, 206, 124, ${0.2 + glowShift})`);
      g2.addColorStop(1, "rgba(255, 184, 92, 0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, H * 0.48, W, H * 0.52);

      // 1. Top Bulb Sand (funnel depression draining down into neck)
      const topState = this.getTopSandState(p);
      if (topState.amount > 0.003) {
        const fade = clamp(topState.amount / 0.05, 0, 1);
        const surfY = lerp(256, topState.surfaceY, fade);
        const dipY = lerp(262, topState.dipY, fade);

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, W, 272);
        ctx.clip();

        const topGrad = ctx.createLinearGradient(0, surfY, 0, 272);
        topGrad.addColorStop(0, "#ffe4a3");
        topGrad.addColorStop(0.28, "#f0ba5c");
        topGrad.addColorStop(0.75, "#cc8632");
        topGrad.addColorStop(1, "#9a5d1c");
        ctx.fillStyle = topGrad;

        ctx.beginPath();
        ctx.moveTo(0, surfY);
        ctx.bezierCurveTo(95, surfY - 4, 152, surfY + 2, 180, dipY);
        ctx.bezierCurveTo(208, surfY + 2, 265, surfY - 4, W, surfY);
        ctx.lineTo(W, 272);
        ctx.lineTo(0, 272);
        ctx.closePath();
        ctx.fill();

        // Warm lit slope & crisp top funnel highlight
        ctx.strokeStyle = `rgba(255, 245, 208, ${0.72 * fade})`;
        ctx.lineWidth = 6.5;
        ctx.beginPath();
        ctx.moveTo(16, surfY);
        ctx.bezierCurveTo(98, surfY - 4, 152, surfY + 2, 180, dipY);
        ctx.bezierCurveTo(208, surfY + 2, 262, surfY - 4, W - 16, surfY);
        ctx.stroke();
        ctx.restore();
      }

      // 2. Bottom Bulb Sand (conical mound rising from floor)
      if (p > 0.003) {
        const fade = clamp(p / 0.05, 0, 1);
        const peakY = this.bottomSurfaceYAt(180, p);
        const sideY = this.bottomSurfaceYAt(0, p);
        const adjSide = lerp(520, sideY, fade);
        const adjPeak = lerp(516, peakY, fade);

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 256, W, H - 256);
        ctx.clip();

        const botGrad = ctx.createLinearGradient(0, adjPeak, 0, H);
        botGrad.addColorStop(0, "#ffe4a6");
        botGrad.addColorStop(0.25, "#eab154");
        botGrad.addColorStop(0.7, "#be7b2b");
        botGrad.addColorStop(1, "#874e18");
        ctx.fillStyle = botGrad;

        ctx.beginPath();
        ctx.moveTo(0, H);
        ctx.lineTo(0, adjSide);
        const steps = 36;
        for (let i = 0; i <= steps; i++) {
          const sx = (i / steps) * W;
          const sy = lerp(518, this.bottomSurfaceYAt(sx, p), fade);
          ctx.lineTo(sx, sy);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();

        // Left-side subtle ambient shading (since lamp shines from upper-right)
        ctx.fillStyle = "rgba(62, 30, 8, 0.24)";
        ctx.beginPath();
        ctx.moveTo(180, adjPeak);
        for (let i = steps / 2; i >= 0; i--) {
          const sx = (i / steps) * W;
          const sy = lerp(518, this.bottomSurfaceYAt(sx, p), fade);
          ctx.lineTo(sx, sy);
        }
        ctx.lineTo(0, H);
        ctx.lineTo(180, H);
        ctx.closePath();
        ctx.fill();

        // Crisp highlighted ridge along mound
        ctx.strokeStyle = `rgba(255, 240, 186, ${0.72 * fade})`;
        ctx.lineWidth = 6.0;
        ctx.beginPath();
        for (let i = 3; i <= steps - 3; i++) {
          const sx = (i / steps) * W;
          const sy = lerp(518, this.bottomSurfaceYAt(sx, p), fade);
          if (i === 3) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
        ctx.restore();
      }

      // 3. Falling Sand Stream & Tumbling Spark Particles
      const activeFlow =
        !this.isFlipping &&
        ((timeScale > 0 && this.topFrac > 0.003) || (timeScale < 0 && this.topFrac < 0.997));

      if (activeFlow) {
        const endY = Math.max(276, this.bottomSurfaceYAt(180, p) + 4);
        const streamGrad = ctx.createLinearGradient(0, 250, 0, endY);
        streamGrad.addColorStop(0, "rgba(255, 242, 198, 0.96)");
        streamGrad.addColorStop(0.5, "rgba(246, 196, 98, 0.92)");
        streamGrad.addColorStop(1, "rgba(232, 166, 68, 0.96)");

        ctx.strokeStyle = streamGrad;
        ctx.lineWidth = 9.0;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(180, 252);
        ctx.lineTo(180, endY);
        ctx.stroke();

        ctx.strokeStyle = "rgba(255, 250, 228, 0.85)";
        ctx.lineWidth = 3.8;
        ctx.beginPath();
        ctx.moveTo(180, 254);
        ctx.lineTo(180, endY - 2);
        ctx.stroke();
      }

      for (const pt of this.particles) {
        ctx.fillStyle = `rgba(255, 234, 168, ${pt.alpha})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    draw(ctx, timeScale, lampIntensity, nightMix) {
      if (!this.assetsReady) return;

      // 1. Directional Desk Cast Shadow + Warm Hover / Night Halo
      ctx.save();
      ctx.translate(this.cx, this.baseY);
      const sGrad = ctx.createRadialGradient(-16, 2, 6, -24, 5, 58);
      sGrad.addColorStop(0, "rgba(12, 6, 3, 0.5)");
      sGrad.addColorStop(0.62, "rgba(14, 7, 3, 0.24)");
      sGrad.addColorStop(1, "rgba(14, 7, 3, 0)");
      ctx.fillStyle = sGrad;
      ctx.beginPath();
      ctx.ellipse(-20, 3, 56, 13, -0.14, 0, Math.PI * 2);
      ctx.fill();

      const haloAlpha = Math.max(
        this.hover * 0.45,
        nightMix * (0.28 + 0.06 * Math.sin(this.glowPulse))
      );
      if (haloAlpha > 0.02) {
        ctx.globalCompositeOperation = "screen";
        const hGrad = ctx.createRadialGradient(0, -this.targetH * 0.56, 6, 0, -this.targetH * 0.56, 68);
        hGrad.addColorStop(0, `rgba(255, 210, 120, ${haloAlpha * lampIntensity})`);
        hGrad.addColorStop(1, "rgba(255, 200, 100, 0)");
        ctx.fillStyle = hGrad;
        ctx.beginPath();
        ctx.arc(0, -this.targetH * 0.56, 68, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 2. Stationary Back Filigree Cradle (behind rotating bulb)
      ctx.drawImage(this.backImg, this.x0, this.y0, this.targetW, this.targetH);

      // 3. Render & Composite Masked Glass Rotor
      this.renderSandBuffer(timeScale, nightMix);
      const rCtx = this.rotorCtx;
      rCtx.globalCompositeOperation = "source-over";
      rCtx.clearRect(0, 0, this.maskW, this.maskH);
      rCtx.drawImage(this.sandCanvas, 0, 0, this.maskW, this.maskH);
      rCtx.drawImage(this.glassImg, 0, 0, this.maskW, this.maskH);
      rCtx.globalCompositeOperation = "destination-in";
      rCtx.drawImage(this.maskImg, 0, 0, this.maskW, this.maskH);
      rCtx.globalCompositeOperation = "source-over";

      ctx.save();
      ctx.translate(this.rotorCx, this.rotorCy);
      ctx.rotate(this.rotorAngle);
      ctx.drawImage(
        this.rotorCanvas,
        -this.rotorW * 0.5,
        -this.rotorH * 0.5,
        this.rotorW,
        this.rotorH
      );
      ctx.restore();

      // 4. Stationary Front Filigree Clasp Medallion & Turquoise Base
      ctx.drawImage(this.frontImg, this.x0, this.y0, this.targetW, this.targetH);

      // Subtle golden hover rim glint around turquoise/bronze frame
      if (this.hover > 0.04) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = this.hover * 0.14;
        ctx.drawImage(this.frontImg, this.x0, this.y0, this.targetW, this.targetH);
        ctx.restore();
      }

      // 5. Dust puffs on flip settle
      for (const pf of this.dustPuffs) {
        ctx.fillStyle = `rgba(244, 206, 134, ${pf.life * 0.6})`;
        ctx.beginPath();
        ctx.arc(pf.x, pf.y, 1.8 * pf.life, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // =========================================================
  // Main Motion Stage Application
  // =========================================================
  class StudyMotionApp {
    constructor(bundle) {
      this.bundle = bundle;
      this.canvas = document.getElementById("sceneCanvas");
      this.ctx = this.canvas.getContext("2d");
      this.audio = new StudyAudio();

      // State
      this.timeScale = 1.0;
      this.nightMode = true;
      this.nightMix = 1.0;
      this.lampPulse = 0;
      this.syncBoost = 0;
      this.dustSwirl = 0;
      this.lang = "en";
      try {
        const saved = localStorage.getItem("drgii_lang");
        if (saved === "ru" || saved === "en") this.lang = saved;
      } catch (e) {}
      this.sandStrip = new SandMenuStrip(document.getElementById("sandStripCanvas"));

      // Mouse & Parallax
      this.mouseX = SCENE_W * 0.5;
      this.mouseY = SCENE_H * 0.5;
      this.parX = 0;
      this.parY = 0;

      // Interaction states
      this.hoveredPlanet = null;
      this.hoveredBook = null;
      this.hoveredDeskBook = false;
      this.hoveredDeskBookCorner = false;
      this.hoveredHourglass = false;
      this.hoveredLamp = false;
      this.draggedPlanet = null;
      this.lastDragX = 0;
      this.activeDossierBook = null;

      // Ambient Dust Motes
      this.dust = Array.from({ length: 48 }, () => ({
        x: 420 + Math.random() * 580,
        y: 120 + Math.random() * 560,
        r: 0.9 + Math.random() * 1.9,
        vx: (Math.random() - 0.5) * 6,
        vy: -3 - Math.random() * 7,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.25 + Math.random() * 0.5,
      }));

      this.hourglass = new DeskHourglass();
      this.deskBook = null;
      this.planets = [];
      this.books = [];
      this.bgStudyImg = null;
      this.manFgImg = null;

      this.initElements();
    }

    initElements() {
      this.tooltip = document.getElementById("sceneTooltip");
      this.ttTitle = this.tooltip.querySelector(".tt-title");
      this.ttSub = this.tooltip.querySelector(".tt-sub");
      this.dossier = document.getElementById("dossierCard");
      this.toast = document.getElementById("statusToast");
      this.toastTimer = null;

      this.btnLamp = document.getElementById("btnLamp");
      this.btnBooks = document.getElementById("btnBooks");
      this.btnFlip = document.getElementById("btnFlip");
      this.btnSound = document.getElementById("btnSound");
      this.speedButtons = Array.from(document.querySelectorAll("[data-speed]"));

      if (this.btnLamp) {
        this.btnLamp.addEventListener("click", () => this.toggleNightMode());
      }
      if (this.btnBooks) {
        this.btnBooks.addEventListener("click", () => this.toggleAllBooks());
      }
      if (this.btnFlip) {
        this.btnFlip.addEventListener("click", () => {
          if (this.hourglass.triggerFlip()) {
            this.audio.playHourglassFlip();
            this.showToast("Песочные часы перевернуты на 180°");
          }
        });
      }
      if (this.btnSound) {
        this.btnSound.addEventListener("click", () => {
          const on = this.audio.toggle();
          this.btnSound.classList.toggle("active", on);
          this.btnSound.textContent = on ? "Звук: Вкл" : "Звук";
          this.showToast(on ? "Звуковое сопровождение включено" : "Звук отключен");
        });
      }

      this.speedButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const sp = parseFloat(btn.dataset.speed);
          this.setTimeScale(sp);
        });
      });

      this.btnDossierFlip = document.getElementById("dossierFlipPage");
      this.btnDossierPush = document.getElementById("dossierPush");
      document.getElementById("dossierClose").addEventListener("click", () => {
        this.closeDossier();
      });
      this.btnDossierFlip.addEventListener("click", () => {
        this.turnDeskAtlasPage();
      });
      this.btnDossierPush.addEventListener("click", () => {
        if (this.activeDossierBook) {
          this.activeDossierBook.isPulled = false;
          this.audio.playBookSlide(false);
          this.closeDossier();
          this.updateBooksButtonLabel();
        }
      });

      this.langButtons = Array.from(document.querySelectorAll(".sand-lang-btn[data-lang]"));
      this.langButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          this.setLanguage(btn.dataset.lang);
        });
      });
      this.setLanguage(this.lang);

      this.bindCanvasEvents();
      this.bindKeyboard();
    }

    getPlanetName(p) {
      if (this.lang === "en" && PLANETS_EN[p.meta.key]) {
        return PLANETS_EN[p.meta.key];
      }
      return p.meta.name;
    }

    getBookCopy(book) {
      if (this.lang === "en" && BOOKS_EN[book.meta.key]) {
        return BOOKS_EN[book.meta.key];
      }
      return {
        title: book.meta.title,
        author: book.meta.author,
        category: book.meta.category,
        note: book.meta.note,
        effect_label: book.meta.effect_label,
      };
    }

    getAtlasPlateName(idx) {
      const info = ATLAS_PLATES[idx] || ATLAS_PLATES[0];
      return this.lang === "en" ? info.name_en : info.name;
    }

    setLanguage(lang) {
      if (lang !== "ru" && lang !== "en") return;
      this.lang = lang;
      document.documentElement.lang = lang;
      try {
        localStorage.setItem("drgii_lang", lang);
      } catch (e) {}

      this.langButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.lang === lang);
      });

      const dict = I18N_PAGE[lang];
      if (dict) {
        document.querySelectorAll("[data-i18n]").forEach((el) => {
          const key = el.getAttribute("data-i18n");
          if (dict[key] !== undefined) {
            el.textContent = dict[key];
          }
        });
        document.querySelectorAll("[data-i18n-html]").forEach((el) => {
          const key = el.getAttribute("data-i18n-html");
          if (dict[key] !== undefined) {
            el.innerHTML = dict[key];
          }
        });
      }

      if (this.activeDossierBook) {
        this.openDossier(this.activeDossierBook);
      }
      if (this.gallery) {
        this.gallery.setLanguage(lang);
      }
    }

    async loadAndStart() {
      const imgs = this.bundle.images;
      const [bgImg, manImg, hgBack, hgFront, hgMask, hgGlass] = await Promise.all([
        loadImage(imgs.bg_study),
        loadImage(imgs.gentleman_fg),
        loadImage(imgs.hg_back),
        loadImage(imgs.hg_front),
        loadImage(imgs.hg_mask),
        loadImage(imgs.hg_glass),
      ]);
      this.bgStudyImg = bgImg;
      this.manFgImg = manImg;
      this.hourglass.setAssets(hgBack, hgFront, hgMask, hgGlass);
      this.gallery = new ArchivalGallery({ hgBack, hgFront, hgGlass });

      // Pre-render midnight-tinted gentleman sprite cleanly (no rectangular artifacts!)
      const manNight = document.createElement("canvas");
      manNight.width = SCENE_W;
      manNight.height = SCENE_H;
      const mnCtx = manNight.getContext("2d");
      mnCtx.drawImage(manImg, 0, 0, SCENE_W, SCENE_H);
      mnCtx.globalCompositeOperation = "source-atop";
      mnCtx.fillStyle = "rgba(10, 16, 38, 0.52)";
      mnCtx.fillRect(0, 0, SCENE_W, SCENE_H);
      this.manNightImg = manNight;

      // Load 4 planets
      this.planets = await Promise.all(
        this.bundle.planets.map(async (p) => {
          const [tex, light] = await Promise.all([
            loadImage(imgs[`planet_${p.id}_tex`]),
            loadImage(imgs[`planet_${p.id}_light`]),
          ]);
          return new PlanetGlobe(p, tex, light);
        })
      );

      // Load shelf books
      this.books = await Promise.all(
        this.bundle.books.map(async (b) => {
          const bImg = await loadImage(imgs[`book_${b.id}`]);
          return new InteractiveBook(b, bImg);
        })
      );

      // Load interactive desk atlas ("Атлас анатомии человека") with the 3 uploaded Sinelnikov plates
      if (this.bundle.deskBook && imgs.desk_book) {
        const [dbImg, ap1, ap2, ap3] = await Promise.all([
          loadImage(imgs.desk_book),
          loadImage(imgs.atlas_plate_1 || "assets/atlas_plate_1.jpg"),
          loadImage(imgs.atlas_plate_2 || "assets/atlas_plate_2.jpg"),
          loadImage(imgs.atlas_plate_3 || "assets/atlas_plate_3.jpg"),
        ]);
        this.deskBook = new DeskBook(this.bundle.deskBook, dbImg, [ap1, ap2, ap3]);
      }

      this.resizeCanvas();
      window.addEventListener("resize", () => this.resizeCanvas());
      this.updateBooksButtonLabel();

      this.isStudyVisible = true;
      this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const studyObserver = new IntersectionObserver((entries) => {
        this.isStudyVisible = entries[0] ? entries[0].isIntersecting : true;
      }, { threshold: 0.05 });
      studyObserver.observe(this.canvas);

      let lastTs = performance.now();
      const tick = (now) => {
        const dt = Math.min(0.05, (now - lastTs) / 1000);
        lastTs = now;
        if (document.hidden || !this.isStudyVisible) {
          requestAnimationFrame(tick);
          return;
        }
        if (this.reducedMotion) {
          requestAnimationFrame(tick);
          return;
        }
        this.update(dt, now * 0.001);
        this.render(now * 0.001);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }

    resizeCanvas() {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (this.canvas.width !== w || this.canvas.height !== h) {
        this.canvas.width = w;
        this.canvas.height = h;
      }
    }

    toSceneCoords(clientX, clientY) {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: ((clientX - rect.left) / rect.width) * SCENE_W,
        y: ((clientY - rect.top) / rect.height) * SCENE_H,
      };
    }

    bindCanvasEvents() {
      this.canvas.addEventListener("pointermove", (e) => {
        const { x, y } = this.toSceneCoords(e.clientX, e.clientY);
        this.mouseX = x;
        this.mouseY = y;

        if (this.draggedPlanet) {
          const dx = x - this.lastDragX;
          this.lastDragX = x;
          this.draggedPlanet.angle += dx * 0.028;
          this.draggedPlanet.spinVel = clamp(dx * 1.9, -14, 14);
          return;
        }
        this.updateHover(x, y, e.clientX, e.clientY);
      });

      this.canvas.addEventListener("pointerdown", (e) => {
        const { x, y } = this.toSceneCoords(e.clientX, e.clientY);
        const bx = x - this.parX * 2.2;
        const by = y - this.parY * 2.2;

        // 1. Hourglass click -> 180° flip!
        if (this.hourglass.hitTest(bx, by)) {
          if (this.hourglass.triggerFlip()) {
            this.audio.playHourglassFlip();
            this.showToast(
              this.lang === "en"
                ? "Hourglass flipped 180°"
                : "Песочные часы перевернуты на 180°"
            );
          }
          return;
        }

        // 2. Planet click / drag-to-spin
        for (const p of this.planets) {
          if (p.hitTest(bx, by)) {
            this.draggedPlanet = p;
            p.isDragging = true;
            this.dragStartX = x;
            this.lastDragX = x;
            this.canvas.setPointerCapture(e.pointerId);
            return;
          }
        }

        const toggleVolume = (vol) => {
          vol.isPulled = !vol.isPulled;
          this.audio.playBookSlide(vol.isPulled);
          if (vol.isPulled) {
            this.openDossier(vol);
            this.applyBookEffect(vol);
          } else if (this.activeDossierBook === vol) {
            this.closeDossier();
          }
          this.updateBooksButtonLabel();
        };

        // 3. Shelf book click -> pull out / push in
        for (let i = this.books.length - 1; i >= 0; i--) {
          const bk = this.books[i];
          if (bk.hitTest(bx, by)) {
            toggleVolume(bk);
            return;
          }
        }

        // 3b. Desk atlas click -> turn plate on corner click or open/close the folio
        if (this.deskBook && this.deskBook.isCornerHit(bx, by)) {
          this.turnDeskAtlasPage();
          return;
        }
        if (this.deskBook && this.deskBook.hitTest(bx, by)) {
          toggleVolume(this.deskBook);
          return;
        }

        // 4. Desk lamp click -> toggle lighting mode
        if (this.hitTestLamp(bx, by)) {
          this.toggleNightMode();
        }
      });

      const endDrag = (e) => {
        if (!this.draggedPlanet) return;
        const p = this.draggedPlanet;
        p.isDragging = false;
        const moved = Math.abs(this.lastDragX - this.dragStartX);
        if (moved < 5) {
          // Crisp click impulse!
          p.pulse = 1.0;
          p.spinVel += (p.baseSpeed >= 0 ? 1 : -1) * 5.2;
          this.audio.playPlanetChime(p.meta.id);
          const pName = this.getPlanetName(p);
          this.showToast(
            this.lang === "en"
              ? `${pName}: orbital impulse`
              : `${pName}: орбитальный импульс`
          );
        }
        this.draggedPlanet = null;
        if (this.canvas.hasPointerCapture(e.pointerId)) {
          this.canvas.releasePointerCapture(e.pointerId);
        }
      };

      this.canvas.addEventListener("pointerup", endDrag);
      this.canvas.addEventListener("pointercancel", endDrag);
      this.canvas.addEventListener("pointerleave", () => {
        this.hoveredPlanet = null;
        this.hoveredBook = null;
        this.hoveredDeskBook = false;
        this.hoveredDeskBookCorner = false;
        this.hoveredHourglass = false;
        this.hoveredLamp = false;
        this.hideTooltip();
      });

      // Mouse wheel over Hourglass cycles time speed smoothly
      this.canvas.addEventListener(
        "wheel",
        (e) => {
          const { x, y } = this.toSceneCoords(e.clientX, e.clientY);
          const bx = x - this.parX * 2.2;
          const by = y - this.parY * 2.2;
          if (this.hourglass.hitTest(bx, by)) {
            e.preventDefault();
            const steps = [-1, 0, 1, 3];
            const curIdx = steps.indexOf(this.timeScale);
            const nextIdx = clamp(
              (curIdx === -1 ? 2 : curIdx) + (e.deltaY < 0 ? 1 : -1),
              0,
              steps.length - 1
            );
            this.setTimeScale(steps[nextIdx]);
          }
        },
        { passive: false }
      );
    }

    bindKeyboard() {
      window.addEventListener("keydown", (e) => {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
        if (e.code === "Space") {
          e.preventDefault();
          this.setTimeScale(this.timeScale === 0 ? 1 : 0);
        } else if (e.key === "f" || e.key === "F" || e.key === "а" || e.key === "А") {
          if (this.hourglass.triggerFlip()) {
            this.audio.playHourglassFlip();
            this.showToast(
              this.lang === "en"
                ? "Hourglass flipped 180°"
                : "Песочные часы перевернуты на 180°"
            );
          }
        } else if (e.key === "l" || e.key === "L" || e.key === "д" || e.key === "Д") {
          this.toggleNightMode();
        } else if (e.key === "b" || e.key === "B" || e.key === "и" || e.key === "И") {
          this.toggleAllBooks();
        }
      });
    }

    hitTestLamp(bx, by) {
      return bx >= 655 && bx <= 790 && by >= 192 && by <= 268;
    }

    updateHover(sx, sy, clientX, clientY) {
      const bx = sx - this.parX * 2.2;
      const by = sy - this.parY * 2.2;

      this.hoveredHourglass = this.hourglass.hitTest(bx, by);
      this.hoveredPlanet = null;
      this.hoveredBook = null;
      this.hoveredDeskBookCorner = this.deskBook ? this.deskBook.isCornerHit(bx, by) : false;
      this.hoveredDeskBook = this.deskBook ? this.deskBook.hitTest(bx, by) : false;
      this.hoveredLamp = false;

      if (!this.hoveredHourglass) {
        for (const p of this.planets) {
          if (p.hitTest(bx, by)) {
            this.hoveredPlanet = p;
            break;
          }
        }
      }

      if (!this.hoveredHourglass && !this.hoveredPlanet) {
        for (let i = this.books.length - 1; i >= 0; i--) {
          if (this.books[i].hitTest(bx, by)) {
            this.hoveredBook = this.books[i];
            break;
          }
        }
      }

      if (!this.hoveredHourglass && !this.hoveredPlanet && !this.hoveredBook) {
        this.hoveredLamp = this.hitTestLamp(bx, by);
      }

      // Cursor & Tooltip
      const isEn = this.lang === "en";
      if (this.hoveredPlanet) {
        this.canvas.style.cursor = "grab";
        this.showTooltip(
          this.getPlanetName(this.hoveredPlanet),
          isEn
            ? "Drag to rotate or click for orbital impulse"
            : "Потяните для вращения или нажмите для импульса",
          clientX,
          clientY
        );
      } else if (this.hoveredHourglass) {
        this.canvas.style.cursor = "pointer";
        const pct = Math.round(this.hourglass.topFrac * 100);
        this.showTooltip(
          isEn ? "Hourglass" : "Песочные часы",
          isEn
            ? `Remaining on top: ${pct}% · Click to flip`
            : `Остаток сверху: ${pct}% · Нажмите, чтобы перевернуть`,
          clientX,
          clientY
        );
      } else if (this.hoveredBook) {
        this.canvas.style.cursor = "pointer";
        const copy = this.getBookCopy(this.hoveredBook);
        const verb = this.hoveredBook.isPulled
          ? isEn
            ? "Click to return to shelf"
            : "Нажмите, чтобы вернуть на полку"
          : isEn
            ? "Click to pull volume"
            : "Нажмите, чтобы выдвинуть том";
        this.showTooltip(copy.title, verb, clientX, clientY);
      } else if (this.hoveredDeskBookCorner && this.deskBook) {
        this.canvas.style.cursor = "pointer";
        const info = ATLAS_PLATES[this.deskBook.plateIndex];
        this.showTooltip(
          isEn
            ? `Atlas of Anatomy · Plate ${info.roman}`
            : `Атлас анатомии · Табл. ${info.roman}`,
          isEn
            ? "Click the page corner to turn plate"
            : "Нажмите на уголок страницы, чтобы перелистнуть",
          clientX,
          clientY
        );
      } else if (this.hoveredDeskBook && this.deskBook) {
        this.canvas.style.cursor = "pointer";
        const copy = this.getBookCopy(this.deskBook);
        const verb = this.deskBook.isPulled
          ? isEn
            ? "Click to close atlas (or top-right corner to turn plate)"
            : "Нажмите, чтобы закрыть атлас (или по правому углу — листать)"
          : isEn
            ? "Click to open atlas"
            : "Нажмите, чтобы открыть атлас";
        this.showTooltip(copy.title, verb, clientX, clientY);
      } else if (this.hoveredLamp) {
        this.canvas.style.cursor = "pointer";
        this.showTooltip(
          isEn ? "Brass Desk Lamp" : "Латунная настольная лампа",
          this.nightMode
            ? isEn
              ? "Switch to warm evening lamp light"
              : "Включить теплый вечерний свет"
            : isEn
              ? "Switch to cosmic night"
              : "Переключить в космическую ночь",
          clientX,
          clientY
        );
      } else {
        this.canvas.style.cursor = "default";
        this.hideTooltip();
      }
    }

    showTooltip(title, sub, clientX, clientY) {
      const stageRect = this.canvas.parentElement.getBoundingClientRect();
      const x = clamp(clientX - stageRect.left, 90, stageRect.width - 90);
      const y = clamp(clientY - stageRect.top - 10, 56, stageRect.height - 20);
      this.ttTitle.textContent = title;
      this.ttSub.textContent = sub;
      this.tooltip.style.left = `${x}px`;
      this.tooltip.style.top = `${y}px`;
      this.tooltip.classList.add("visible");
    }

    hideTooltip() {
      this.tooltip.classList.remove("visible");
    }

    turnDeskAtlasPage() {
      if (!this.deskBook) return;
      if (!this.deskBook.isPulled) {
        this.deskBook.isPulled = true;
      }
      this.deskBook.nextPlate();
      this.audio.playBookSlide(true);
      const info = ATLAS_PLATES[this.deskBook.plateIndex];
      const plateName = this.getAtlasPlateName(this.deskBook.plateIndex);
      this.openDossier(this.deskBook);
      this.showToast(
        this.lang === "en"
          ? `Plate ${info.roman}: ${plateName}`
          : `Табл. ${info.roman}: ${plateName}`
      );
    }

    openDossier(book) {
      this.activeDossierBook = book;
      const isDesk = book === this.deskBook;
      const isEn = this.lang === "en";
      const copy = this.getBookCopy(book);
      const info = ATLAS_PLATES[this.deskBook ? this.deskBook.plateIndex : 0];
      const plateName = this.getAtlasPlateName(this.deskBook ? this.deskBook.plateIndex : 0);

      document.getElementById("dossierCat").textContent = copy.category;
      document.getElementById("dossierTitle").textContent = copy.title;
      document.getElementById("dossierAuthor").textContent = copy.author;
      document.getElementById("dossierNote").textContent = isDesk
        ? isEn
          ? `${copy.note} Open to Plate ${info.roman}: "${plateName}".`
          : `${copy.note} Открыта таблица ${info.roman}: «${plateName}».`
        : copy.note;
      const eff = document.getElementById("dossierEffect");
      const fallbackEff = isEn ? "✦ Archival Volume" : "✦ Архивный том";
      eff.textContent = copy.effect_label ? `✦ ${copy.effect_label}` : fallbackEff;

      this.dossier.classList.toggle("desk-mode", isDesk);
      this.btnDossierPush.textContent = isDesk
        ? isEn
          ? "Close Atlas"
          : "Закрыть атлас"
        : isEn
          ? "Return to Shelf"
          : "Убрать на полку";
      this.btnDossierFlip.style.display = isDesk ? "inline-flex" : "none";
      if (isDesk) {
        this.btnDossierFlip.textContent = isEn
          ? `Plate ${this.deskBook.plateIndex + 1}/3 ›`
          : `Лист ${this.deskBook.plateIndex + 1}/3 ›`;
      }
      this.dossier.classList.add("open");
    }

    closeDossier() {
      this.activeDossierBook = null;
      this.dossier.classList.remove("open", "desk-mode");
    }

    applyBookEffect(book) {
      const eff = book.meta.effect;
      const isEn = this.lang === "en";
      const copy = this.getBookCopy(book);
      if (eff === "open_atlas") {
        this.showToast(
          isEn
            ? 'Opened "Atlas of Human Anatomy" — R. D. Sinelnikov'
            : "Открыт «Атлас анатомии человека» — Р. Д. Синельников"
        );
      } else if (eff === "sync_planets") {
        this.syncBoost = 1.0;
        this.planets.forEach((p) => (p.pulse = 1.0));
        this.audio.playPlanetChime(2);
        this.showToast(
          isEn
            ? `Resonance of spheres: "${copy.title}"`
            : `Резонанс сфер: «${copy.title}»`
        );
      } else if (eff === "reverse_pulse") {
        this.planets.forEach((p) => {
          p.pulse = 0.9;
          p.spinVel = -p.baseSpeed * 12;
        });
        this.audio.playPlanetChime(0);
        this.showToast(
          isEn ? "Reverse gravitational impulse!" : "Обратный импульс гравитации!"
        );
      } else if (eff === "sand_boost") {
        if (this.hourglass.topFrac < 0.15) this.hourglass.triggerFlip();
        this.setTimeScale(3);
        this.showToast(
          isEn ? "Time stream accelerated (3×)" : "Ускорение потока времени (3×)"
        );
      } else if (eff === "lamp_pulse") {
        this.lampPulse = 1.0;
        this.showToast(isEn ? "Lamp reflection intensified" : "Отражение лампы усилено");
      } else if (eff === "dust_swirl") {
        this.dustSwirl = 1.0;
        this.showToast(
          isEn ? "Golden dust motes swirled in the air" : "В воздухе закружились золотые пылинки"
        );
      } else if (eff === "secret_chime") {
        this.audio.playSecretClick();
        this.lampPulse = 0.8;
        this.planets.forEach((p) => (p.pulse = 0.6));
        this.showToast(
          isEn
            ? `Secret mechanism activated: "${copy.title}"`
            : `Активирован тайный механизм: «${copy.title}»`
        );
      }
    }

    setTimeScale(sp) {
      this.timeScale = sp;
      this.speedButtons.forEach((b) => {
        b.classList.toggle("active", parseFloat(b.dataset.speed) === sp);
      });
      const isEn = this.lang === "en";
      const labels = isEn
        ? {
            "-1": "Reverse time flow (−1×)",
            "0": "Time paused",
            "1": "Natural time flow (1×)",
            "3": "Accelerated time flow (3×)",
          }
        : {
            "-1": "Обратный ход времени (−1×)",
            "0": "Время остановлено (Пауза)",
            "1": "Естественный ход времени (1×)",
            "3": "Ускоренный поток времени (3×)",
          };
      this.showToast(labels[String(sp)] || (isEn ? `Speed: ${sp}×` : `Скорость: ${sp}×`));
    }

    toggleNightMode() {
      this.nightMode = !this.nightMode;
      const isEn = this.lang === "en";
      if (this.btnLamp) {
        this.btnLamp.classList.toggle("active", this.nightMode);
        this.btnLamp.textContent = this.nightMode ? "Ночь" : "Вечер";
      }
      this.audio.playLampClick(!this.nightMode);
      this.showToast(
        this.nightMode
          ? isEn
            ? "Cosmic night: planets and sand glow in the twilight"
            : "Космическая ночь: планеты и песок сияют в полумраке"
          : isEn
            ? "Warm desk lamp light"
            : "Теплый свет настольной лампы"
      );
    }

    toggleAllBooks() {
      const isEn = this.lang === "en";
      const pulledCount = this.books.filter((b) => b.isPulled).length;
      if (pulledCount > 0) {
        this.books.forEach((b) => (b.isPulled = false));
        if (this.deskBook) this.deskBook.isPulled = false;
        this.closeDossier();
        this.audio.playBookSlide(false);
        this.showToast(
          isEn ? "All books returned to the shelves" : "Все книги убраны обратно на полки"
        );
      } else {
        const curated = [0, 12, 19, 34];
        curated.forEach((idx, k) => {
          if (this.books[idx]) {
            this.books[idx].isPulled = true;
            this.books[idx].vel += 4.5 + k * 0.6;
          }
        });
        if (this.deskBook) {
          this.deskBook.isPulled = false;
        }
        this.audio.playBookSlide(true);
        if (this.books[0]) this.openDossier(this.books[0]);
        this.showToast(
          isEn ? "Curated volumes pulled from the collection" : "Выдвинуты избранные тома коллекции"
        );
      }
      this.updateBooksButtonLabel();
    }

    updateBooksButtonLabel() {
      if (!this.btnBooks) return;
      const count = this.books.filter((b) => b.isPulled).length;
      this.btnBooks.textContent = count > 0 ? `Собрать (${count})` : "Книги";
      this.btnBooks.classList.toggle("active", count > 0);
    }

    showToast(msg) {
      this.toast.textContent = msg;
      this.toast.classList.add("visible");
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        this.toast.classList.remove("visible");
      }, 2600);
    }

    update(dt, timeSec) {
      // Smooth 2.5D camera parallax target
      const targetParX = clamp((this.mouseX - SCENE_W * 0.5) / (SCENE_W * 0.5), -1, 1);
      const targetParY = clamp((this.mouseY - SCENE_H * 0.5) / (SCENE_H * 0.5), -1, 1);
      this.parX += (targetParX - this.parX) * Math.min(1, dt * 4.5);
      this.parY += (targetParY - this.parY) * Math.min(1, dt * 4.5);

      this.nightMix += ((this.nightMode ? 1 : 0) - this.nightMix) * Math.min(1, dt * 3.5);
      this.lampPulse = Math.max(0, this.lampPulse - dt * 0.7);
      this.syncBoost = Math.max(0, this.syncBoost - dt * 0.65);
      this.dustSwirl = Math.max(0, this.dustSwirl - dt * 0.7);

      for (const p of this.planets) {
        p.update(dt, this.timeScale, this.hoveredPlanet === p, this.syncBoost);
      }
      for (const b of this.books) {
        b.update(dt, this.hoveredBook === b);
      }
      if (this.deskBook) {
        this.deskBook.update(dt, this.hoveredDeskBook);
      }

      this.hourglass.update(dt, this.timeScale, this.hoveredHourglass);
      if (this.sandStrip) {
        this.sandStrip.updateAndDraw(dt, timeSec);
      }

      // Update dust motes in warm lamp beam
      const swirlMult = 1 + this.dustSwirl * 3.2;
      const flowDir = this.timeScale === 0 ? 0.15 : Math.sign(this.timeScale) * Math.max(0.6, Math.abs(this.timeScale) * 0.7);
      for (const m of this.dust) {
        m.x += (m.vx * swirlMult + Math.sin(timeSec * 0.9 + m.phase) * 5) * dt;
        m.y += m.vy * flowDir * swirlMult * dt;
        if (m.y < 70) m.y = 690;
        if (m.y > 700) m.y = 80;
        if (m.x < 320) m.x = 1000;
        if (m.x > 1010) m.x = 340;
      }
    }

    render(timeSec) {
      const ctx = this.ctx;
      const cw = this.canvas.width;
      const ch = this.canvas.height;
      ctx.save();
      ctx.setTransform(cw / SCENE_W, 0, 0, ch / SCENE_H, 0, 0);

      // Fill deep wood base so subtle parallax never exposes blank margin
      ctx.fillStyle = "#160d08";
      ctx.fillRect(0, 0, SCENE_W, SCENE_H);

      // Organic lamp flicker (0.96 .. 1.04)
      const flicker =
        1.0 +
        0.025 * Math.sin(timeSec * 6.3) +
        0.015 * Math.sin(timeSec * 14.7) +
        this.lampPulse * 0.18 -
        this.nightMix * 0.24;

      // Layer 1: Study Background + Books + Planets + Desk (parallax ±2.2px)
      const bgDx = -this.parX * 2.2;
      const bgDy = -this.parY * 1.8;

      ctx.save();
      // Slight scale up (1.01) so parallax edges stay hidden inside frame
      ctx.translate(SCENE_W * 0.5 + bgDx, SCENE_H * 0.5 + bgDy);
      ctx.scale(1.01, 1.01);
      ctx.translate(-SCENE_W * 0.5, -SCENE_H * 0.5);

      ctx.drawImage(this.bgStudyImg, 0, 0, SCENE_W, SCENE_H);

      // Layer 2: Pull-Out Books (resting books first, pulled/hovered books on top)
      const resting = [];
      const activeBooks = [];
      for (const b of this.books) {
        if (b.pull > 0.02 || b === this.hoveredBook) activeBooks.push(b);
        else resting.push(b);
      }
      activeBooks.sort((a, b) => a.pull - b.pull);
      for (const b of resting) b.draw(ctx, false);
      for (const b of activeBooks) b.draw(ctx, b === this.hoveredBook);

      // Night Mode atmospheric color grade over bookshelves & credenza (keeps planets luminous!)
      if (this.nightMix > 0.01) {
        ctx.save();
        ctx.fillStyle = `rgba(10, 16, 36, ${this.nightMix * 0.56})`;
        ctx.fillRect(-20, -20, SCENE_W + 40, SCENE_H + 40);
        ctx.restore();
      }

      // Layer 3: 3D Spinning Planets inside cradles
      for (const p of this.planets) {
        p.draw(ctx, flicker, this.nightMix);
      }

      ctx.restore(); // End bg/shelf/desk parallax plane

      // Layer 4: Living Gentleman (breathing + deeper foreground parallax ±4.6px!)
      const breathY = (Math.sin(timeSec * 1.35) - 0.5) * 1.5;
      const manDx = -this.parX * 3.7;
      const manDy = -this.parY * 2.4 + breathY;
      ctx.save();
      ctx.translate(SCENE_W * 0.5 + manDx, SCENE_H * 0.5 + manDy);
      ctx.scale(1.01, 1.01);
      ctx.translate(-SCENE_W * 0.5, -SCENE_H * 0.5);
      ctx.drawImage(this.manFgImg, 0, 0, SCENE_W, SCENE_H);
      if (this.nightMix > 0.01 && this.manNightImg) {
        ctx.globalAlpha = this.nightMix;
        ctx.drawImage(this.manNightImg, 0, 0, SCENE_W, SCENE_H);
        ctx.globalAlpha = 1;
      }
      ctx.restore();

      // Layer 5: Interactive Desk Book & Standing Hourglass anchored to the desk plane (bgDx, bgDy)
      ctx.save();
      ctx.translate(SCENE_W * 0.5 + bgDx, SCENE_H * 0.5 + bgDy);
      ctx.scale(1.01, 1.01);
      ctx.translate(-SCENE_W * 0.5, -SCENE_H * 0.5);
      if (this.deskBook) {
        this.deskBook.draw(ctx, this.hoveredDeskBook, this.hoveredDeskBookCorner);
      }
      this.hourglass.draw(ctx, this.timeScale, flicker, this.nightMix);
      ctx.restore();

      // Layer 6: Warm Lamp Volumetric Cone + Floating Dust Motes + Subtle Vignette
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const lampBaseAlpha = (0.14 + this.lampPulse * 0.16) * (1 - this.nightMix * 0.55) * flicker;
      const beamGrad = ctx.createRadialGradient(736 + bgDx, 240 + bgDy, 12, 660 + bgDx, 430 + bgDy, 340);
      beamGrad.addColorStop(0, `rgba(255, 206, 118, ${lampBaseAlpha * 1.4})`);
      beamGrad.addColorStop(0.5, `rgba(255, 178, 82, ${lampBaseAlpha * 0.55})`);
      beamGrad.addColorStop(1, "rgba(255, 160, 60, 0)");
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(680 + bgDx, 240 + bgDy);
      ctx.lineTo(790 + bgDx, 240 + bgDy);
      ctx.lineTo(960 + bgDx, 680 + bgDy);
      ctx.lineTo(440 + bgDx, 680 + bgDy);
      ctx.closePath();
      ctx.fill();

      // Dust motes drifting across the study light
      const dustDx = -this.parX * 8.5;
      const dustDy = -this.parY * 5.5;
      for (const m of this.dust) {
        const twinkle = 0.55 + 0.45 * Math.sin(timeSec * 2.2 + m.phase);
        const mx = m.x + dustDx;
        const my = m.y + dustDy;
        const distLamp = Math.hypot(mx - 740, my - 350);
        const beamBoost = clamp(1.3 - distLamp / 360, 0.25, 1.2);
        const a = m.alpha * twinkle * beamBoost * (1 - this.nightMix * 0.25);
        ctx.fillStyle = this.nightMix > 0.5 ? `rgba(175, 224, 255, ${a})` : `rgba(255, 225, 160, ${a})`;
        ctx.beginPath();
        ctx.arc(mx, my, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Subtle cinematic vignette
      const vig = ctx.createRadialGradient(
        SCENE_W * 0.5,
        SCENE_H * 0.48,
        SCENE_W * 0.34,
        SCENE_W * 0.5,
        SCENE_H * 0.5,
        SCENE_W * 0.68
      );
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, `rgba(8, 4, 2, ${0.34 + this.nightMix * 0.22})`);
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, SCENE_W, SCENE_H);

      ctx.restore();
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    if (!window.SCENE_BUNDLE) {
      console.error("SCENE_BUNDLE not loaded!");
      return;
    }
    const app = new StudyMotionApp(window.SCENE_BUNDLE);
    app.loadAndStart().catch((err) => console.error("Failed to initialize scene:", err));
  });
})();
