/* ==========================================================================
   UNKNOWN — garment artwork
   Every piece is drawn as a lightweight inline SVG (no image files needed),
   converted to a data URI once at boot and preloaded. Front and back variants
   are generated from the same silhouette with per-colour shading.
   ========================================================================== */

const G = (() => {
  /* ── colour helpers ──────────────────────────────────────────────────── */

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function mix(hex, target, amount) {
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const t = target;
    const out = [r, g, b].map((v, i) => Math.round(v + (t[i] - v) * amount));
    return `rgb(${out[0]}, ${out[1]}, ${out[2]})`;
  }

  const darken = (hex, a) => mix(hex, [0, 0, 0], a);
  const lighten = (hex, a) => mix(hex, [255, 255, 255], a);

  function isLight(hex) {
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.52;
  }

  const svgURI = (svg) =>
    "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);

  /* ── hanger (wire) ───────────────────────────────────────────────────── */

  const HANGER = `
    <svg viewBox="0 0 120 76" aria-hidden="true" focusable="false">
      <path d="M61 5c-10 0-15 8-11 14 3 5 10 5 12 0"
            fill="none" stroke="#87877f" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M61 22v11" fill="none" stroke="#87877f" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M61 33 17 61c-5 3-3 8 3 8h80c6 0 8-5 3-8L61 33Z"
            fill="none" stroke="#87877f" stroke-width="3.4"
            stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M61 24v9M61 35 21 62M61 35l40 27"
            fill="none" stroke="#d9d9d2" stroke-width="1" opacity=".85"
            stroke-linecap="round"/>
    </svg>`;

  /* ── shared parts ────────────────────────────────────────────────────── */

  function sleeve(base, band, seam) {
    return `
      <path d="M80 72 C62 78 50 96 43 122 L32 182
               C35 189 47 193 56 189 L74 148 L84 120 Z"
            fill="${base}"/>
      <path d="M33 181 C36 188 48 192 56 188 L58 176
               C50 180 38 176 35 168 Z"
            fill="${band}"/>
      <path d="M80 72 C82 94 83 108 84 120"
            fill="none" stroke="${seam}" stroke-width="1.2"/>
    `;
  }

  function sleeves(base, band, seam) {
    return `
      <g>${sleeve(base, band, seam)}</g>
      <g transform="translate(260 0) scale(-1 1)">${sleeve(base, band, seam)}</g>`;
  }

  function hoodieBody(base, seam) {
    return `
      <path d="M80 70 C104 60 156 60 180 70 L187 250
               C150 263 110 263 73 250 Z"
            fill="${base}"/>
      <path d="M80 70 C68 118 66 190 73 250 C66 190 68 118 80 70Z"
            fill="rgba(0,0,0,.05)"/>
      <path d="M180 70 C192 118 194 190 187 250 C194 190 192 118 180 70Z"
            fill="rgba(0,0,0,.03)"/>
      <path d="M98 67 C90 69 85 71 80 74 M162 67 C170 69 175 71 180 74"
            fill="none" stroke="${seam}" stroke-width="1.1"/>`;
  }

  function hemBand(base, band, seam) {
    return `
      <path d="M73 250 C110 263 150 263 187 250 L188 261
               C150 274 110 274 72 261 Z"
            fill="${band}"/>
      <path d="M78 255 C112 266 148 266 182 255"
            fill="none" stroke="${seam}" stroke-width="1"/>`;
  }

  function backPrint(ink, name, y = 156) {
    return `
      <text x="130" y="${y}" text-anchor="middle"
            font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
            font-size="13.5" font-weight="600" letter-spacing="3.8"
            fill="${ink}" opacity=".88">UNKNOWN</text>
      <text x="130" y="${y + 12}" text-anchor="middle"
            font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
            font-size="3.6" letter-spacing="1.9"
            fill="${ink}" opacity=".5">Nº 01 — SS26 — ${name}</text>`;
  }

  function garmentFrame(inner, back) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 300" ${
      back ? "" : ""
    }>${inner}</svg>`;
  }

  /* ── hoodie ──────────────────────────────────────────────────────────── */

  function hoodie(product, side) {
    const base = product.color.hex;
    const light = isLight(base);
    const seam = light ? "rgba(0,0,0,.16)" : "rgba(255,255,255,.14)";
    const band = light ? darken(base, 0.12) : lighten(base, 0.07);
    const tone = light ? darken(base, 0.07) : lighten(base, 0.05);
    const ink = light ? "#38382f" : "rgba(241,239,231,.92)";
    const cord = light ? "rgba(40,40,34,.62)" : "rgba(241,239,231,.72)";
    const isBack = side === "back";

    const hood = isBack
      ? `<path d="M97 69 C92 27 168 27 163 69 C150 83 110 83 97 69 Z" fill="${tone}"/>
         <path d="M104 64 C116 80 144 80 156 64 L158 71 C144 88 116 88 102 71 Z"
               fill="${darken(base, 0.2)}"/>
         <path d="M97 69 C108 58 152 58 163 69" fill="none"
               stroke="${seam}" stroke-width="1"/>`
      : `<path d="M97 69 C92 27 168 27 163 69 C150 83 110 83 97 69 Z" fill="${tone}"/>
         <path d="M105 65 C103 37 157 37 155 65 C146 78 114 78 105 65 Z"
               fill="${darken(base, 0.42)}"/>
         <path d="M104 64 C115 77 145 77 156 64 L158 71 C145 86 115 86 102 71 Z"
               fill="${darken(base, 0.18)}"/>`;

    const frontDetails = isBack
      ? backPrint(ink, "HOODIE")
      : `
        <path d="M93 197 Q130 190 167 197 L161 240 Q130 247 99 240 Z"
              fill="${light ? darken(base, 0.045) : lighten(base, 0.035)}"/>
        <path d="M93 197 Q130 190 167 197 L167 201 Q130 194 93 201 Z"
              fill="${band}"/>
        <path d="M93 197 L99 240 M167 197 L161 240"
              fill="none" stroke="${seam}" stroke-width="1"/>
        <path d="M114 76 C112 88 111 99 112 111"
              fill="none" stroke="${cord}" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M146 76 C148 88 149 99 148 111"
              fill="none" stroke="${cord}" stroke-width="2.6" stroke-linecap="round"/>
        <circle cx="112" cy="112.5" r="2.2" fill="${cord}"/>
        <circle cx="148" cy="112.5" r="2.2" fill="${cord}"/>
        <circle cx="114" cy="74" r="1.6" fill="rgba(0,0,0,.28)"/>
        <circle cx="146" cy="74" r="1.6" fill="rgba(0,0,0,.28)"/>`;

    return garmentFrame(
      `${sleeves(base, band, seam)}
       ${hoodieBody(base, seam)}
       ${hood}
       ${hemBand(base, band, seam)}
       <path d="M84 120 C82 140 82 168 86 196"
             fill="none" stroke="${seam}" stroke-width="1.2" opacity=".65"/>
       <path d="M176 120 C178 140 178 168 174 196"
             fill="none" stroke="${seam}" stroke-width="1.2" opacity=".65"/>
       ${frontDetails}`,
      isBack
    );
  }

  /* ── tee ─────────────────────────────────────────────────────────────── */

  function tee(product, side) {
    const base = product.color.hex;
    const light = isLight(base);
    const seam = light ? "rgba(0,0,0,.15)" : "rgba(255,255,255,.14)";
    const band = light ? darken(base, 0.1) : lighten(base, 0.06);
    const ink = light ? "#38382f" : "rgba(241,239,231,.92)";
    const isBack = side === "back";

    const sleeveTee = (b) => `
      <path d="M80 72 C64 78 50 90 40 108 L29 138
               C33 145 45 149 51 144 L68 118 L82 104 Z" fill="${b}"/>
      <path d="M29 138 C33 145 45 149 51 144 L53 137
               C45 141 36 137 31 130 Z" fill="${band}"/>
      <path d="M80 72 C81 86 82 96 82 104"
            fill="none" stroke="${seam}" stroke-width="1.2" opacity=".5"/>
      <path d="M51 97 C48 110 41 123 34 134"
            fill="none" stroke="${seam}" stroke-width="1" opacity=".55"/>`;

    const collar = isBack
      ? `<path d="M104 62 C116 72 144 72 156 62 L157 68
                C144 80 116 80 103 68 Z" fill="${darken(base, 0.2)}"/>
         <path d="M104 62 C116 72 144 72 156 62" fill="none"
               stroke="${seam}" stroke-width="1"/>`
      : `<path d="M103 66 C112 84 148 84 157 66 L158 60
                C148 74 112 74 102 60 Z" fill="${darken(base, 0.2)}"/>
         <path d="M105 64 C115 76 145 76 155 64
                C145 70 115 70 105 64 Z" fill="${darken(base, 0.38)}"/>
         <path d="M103 66 C112 84 148 84 157 66" fill="none"
               stroke="${seam}" stroke-width="1"/>`;

    return garmentFrame(
      `<g>${sleeveTee(base)}</g>
       <g transform="translate(260 0) scale(-1 1)">${sleeveTee(base)}</g>
       <path d="M80 70 C104 60 156 60 180 70 L186 248
                C150 261 110 261 74 248 Z" fill="${base}"/>
       <path d="M80 70 C69 110 68 180 74 248 C68 180 69 110 80 70Z"
             fill="rgba(0,0,0,.05)"/>
       <path d="M98 69 C90 71 85 73 80 75 M162 69 C170 71 175 73 180 75"
             fill="none" stroke="${seam}" stroke-width="1.1" opacity=".5"/>
       ${collar}
       <path d="M74 248 C110 261 150 261 186 248 L187 256
                C150 269 110 269 73 256 Z" fill="${band}"/>
       <path d="M80 72 C81 90 82 100 83 106"
             fill="none" stroke="${seam}" stroke-width="1" opacity=".7"/>
       ${
         isBack
           ? backPrint(ink, "TEE", 150)
           : `<path d="M74 200 C110 211 150 211 186 200"
                    fill="none" stroke="${seam}" stroke-width="1" opacity=".35"/>`
       }`,
      isBack
    );
  }

  /* ── jacket ──────────────────────────────────────────────────────────── */

  function jacket(product, side) {
    const base = product.color.hex;
    const light = isLight(base);
    const seam = light ? "rgba(0,0,0,.2)" : "rgba(255,255,255,.16)";
    const band = light ? darken(base, 0.12) : lighten(base, 0.07);
    const accent = light ? darken(base, 0.28) : lighten(base, 0.18);
    const ink = light ? "#38382f" : "rgba(241,239,231,.92)";
    const isBack = side === "back";

    const frontDetails = isBack
      ? `<path d="M80 112 Q130 122 180 112"
                fill="none" stroke="${seam}" stroke-width="1.2"/>
         ${backPrint(ink, "JACKET", 150)}`
      : `<path d="M92 191 L117 200" fill="none" stroke="${accent}"
                stroke-width="4.5" stroke-linecap="round"/>
         <path d="M168 191 L143 200" fill="none" stroke="${accent}"
                stroke-width="4.5" stroke-linecap="round"/>
         <path d="M130 70 L130 252" fill="none" stroke="${darken(base, 0.34)}"
                stroke-width="2.4"/>
         <path d="M130 70 L130 252" fill="none" stroke="rgba(255,255,255,.16)"
                stroke-width="0.8" stroke-dasharray="2 2"/>
         <path d="M122 74 L122 250 M138 74 L138 250" fill="none"
               stroke="${seam}" stroke-width="0.9" opacity=".55"/>
         <rect x="126" y="96" width="8" height="17" rx="3"
               fill="none" stroke="${accent}" stroke-width="1.6"/>
         <circle cx="130" cy="114" r="2.4" fill="${accent}"/>`;

    return garmentFrame(
      `${sleeves(base, band, seam)}
       <path d="M80 70 C104 60 156 60 180 70 L187 252
                C150 264 110 264 73 252 Z" fill="${base}"/>
       <path d="M80 70 C68 118 66 192 73 252 C66 192 68 118 80 70Z"
             fill="rgba(0,0,0,.05)"/>
       <path d="M98 67 C90 69 85 71 80 74 M162 67 C170 69 175 71 180 74"
             fill="none" stroke="${seam}" stroke-width="1.1"/>
       <path d="M84 120 C82 142 82 172 86 200"
             fill="none" stroke="${seam}" stroke-width="1" opacity=".6"/>
       <path d="M176 120 C178 142 178 172 174 200"
             fill="none" stroke="${seam}" stroke-width="1" opacity=".6"/>
       <path d="M102 68 L110 52 Q130 60 150 52 L158 68
                Q130 78 102 68 Z" fill="${darken(base, 0.16)}"/>
       <path d="M110 55 Q130 62 150 55" fill="none"
             stroke="${seam}" stroke-width="1"/>
       <path d="M73 252 C110 264 150 264 187 252 L188 263
                C150 275 110 275 72 263 Z" fill="${band}"/>
       <path d="M78 257 C112 268 148 268 182 257"
             fill="none" stroke="${seam}" stroke-width="1"/>
       ${frontDetails}`,
      isBack
    );
  }

  /* ── public API ──────────────────────────────────────────────────────── */

  const builders = { hoodie, tee, jacket };

  function image(product, side = "front") {
    const build = builders[product.type] || hoodie;
    return svgURI(build(product, side));
  }

  return { image, hanger: () => HANGER };
})();
