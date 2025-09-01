Here’s a complete, drop-in **README.md** you can put at the repo root. It reflects the current React/Webpack/TypeScript app, the legacy worker bridge, the palette legend, and the **indexed 8-bpp BMP** export with optional palette sorting and the legacy filename scheme.

---

# Tiled Palette Quant (React)

High-color background quantization for **SEGA Genesis / Mega Drive** workflows.
Fork of the original *tiledpalettequant* tool, rewritten with **React + TypeScript + MUI 7**, bundled via **Webpack 5**, and wired to the legacy quantizer in a Web Worker.

> Designed for SGDK 2.11+ on real hardware. Exports **8-bpp indexed BMP** with correct palette order and 4-byte padded, bottom-up pixel rows (BI\_RGB / Windows V3).

---

## ✨ Features

* **Genesis-friendly** quantization:

  * Tile size (default **8×8**)
  * Up to **4 palettes × 16 colors** (Genesis limits), legacy UI supports up to **8** palettes
  * Bits per channel (typ. **3 bpc**)
  * Dithering: **Off / Fast / Slow**, weight and pattern
  * Color index **0 policy**: *unique*, *shared*, *transparent from transparent*, *transparent from color (+ picker)*
  * **Fraction of pixels** sampling (0–1) to accelerate large images
* Live **preview** and a **palette legend** showing P0..Pn with 16 entries each (index 0 outlined).
* **Export: Indexed 8-bpp BMP** (exact palette order; no RGB re-mapping).
* **Optional palette sorting on save** (per palette): darkest→lightest or light→dark, with pixel indices remapped to preserve the image.
* **Legacy-style filenames**: `basename-8x8-4p16c-s.bmp` (`u` = unique, `s` = shared, `t` = transparent).
* **OS theme** auto (prefers-color-scheme) with light/dark Material UI theme.

---

## 🚀 Quick Start

### Prereqs

* Node.js **18+** (recommended) and npm
* (Optional) Docker 24+ if you want to run in containers

### Install & run (local)

```bash
cd ui
npm ci
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) (or whatever your dev server prints).

### Build production

```bash
cd ui
npm run build
```

This produces a static bundle in `ui/dist/`. Serve it with any static server (e.g., Node/Express, nginx, or `npm run serve` if you’ve added one).

### Docker (optional)

If you’re using the compose setup:

```bash
docker compose up --build
# open http://localhost:8080
```

Tear down:

```bash
docker compose down
```

---

## 🧭 Using the App

1. **Choose Image…** (PNG/JPG/BMP). The raw image renders immediately.
2. Adjust **Quantization** (tile size, palettes, colors/palette, bits/channel).
3. Optionally tune **Dithering** (mode/weight/pattern) and **Fraction of pixels**.
4. Set **Color index zero behaviour**:

   * **unique** – index 0 per palette
   * **shared** – a single color across palettes (pick it)
   * **transparent from transparent pixels**
   * **transparent from color** – pick the key color
5. Click **Run Quantizer**. Preview updates; palette legend reflects the **export** palette (what GIMP/SGDK will see).
6. **Save BMP (Indexed 8-bpp)** to export SGDK-ready art.

   * Filenames: `basename-8x8-4p16c-{u|s|t}.bmp`
   * Optional palette sort on save (see below).

> ⚠️ Export requires **≤256 total colors** (`palettes × colorsPerPalette ≤ 256`). If you exceed this, export is blocked.

---

## 💾 Export details (SGDK-friendly)

* **Indexed BMP (8-bpp)**, **BI\_RGB** (no compression), Windows V3 header.
* Palette has **256 entries** (B,G,R,0). Only the first `palettes × 16` are relevant.
* Pixels are **1 byte per pixel**, **bottom-up** rows, **width padded** to a multiple of 4 bytes (BMP standard).
* **Global color index** = `palette * 16 + color`.
* The “transparent” policies choose which **index** to use (BMP has no alpha channel in the palette). Transparency is handled on the engine side (e.g., SGDK using index 0).

### Optional: palette sorting on save

To keep your workflow consistent (e.g., “brightest = index 15”), the exporter can **reorder each palette by luminance** and remap pixel indices accordingly. Index 0 is **pinned by default** to preserve transparency semantics.

Current options:

* `None` (default) – no reordering
* **Dark → Light** (`lumaAsc`)
* **Light → Dark** (`lumaDesc`)

> We only reorder **within each 16-entry palette block**; tile palette assignment (which block a tile uses) is unaffected.

---

## 🧩 Settings Reference

| Setting                        | Notes / Typical                                                                               |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| **Tile size**                  | Genesis backgrounds: **8×8**                                                                  |
| **Palettes**                   | Genesis max **4** (legacy UI supports **up to 8** for experimentation)                        |
| **Colors / palette**           | Genesis max **16**                                                                            |
| **Bits / channel**             | Approx Genesis **3**                                                                          |
| **Dither mode**                | Off / Fast / Slow                                                                             |
| **Dither weight**              | 0..1                                                                                          |
| **Dither pattern**             | diag4 / horiz4 / vert4 / diag2 / horiz2 / vert2                                               |
| **Fraction of pixels**         | 0..1 sampling ratio (1 = use all pixels)                                                      |
| **Color index zero behaviour** | unique / shared (with color) / transparentFromTransparent / transparentFromColor (with color) |

---

## 🧱 Architecture

```
repo/
├─ ui/
│  ├─ src/
│  │  ├─ components/
│  │  │  ├─ app.tsx              ← top-level layout
│  │  │  ├─ previewPane.tsx      ← canvas + palette legend + save
│  │  │  └─ PaletteLegend.tsx    ← “P0..Pn” 16× swatches per palette
│  │  ├─ pages/
│  │  │  └─ form.tsx             ← settings UI (MUI 7, Boxes not tables)
│  │  ├─ hooks/
│  │  │  └─ useQuantizer.ts      ← state, image IO, worker bridge, save BMP
│  │  ├─ workers/
│  │  │  └─ legacy/worker-legacy.js  ← original quantizer (unchanged core)
│  │  └─ @types/
│  │     └─ tpq.d.ts             ← global types (no imports)
│  ├─ webpack.config.cjs          ← Webpack 5 + ts-loader
│  └─ tsconfig.json               ← ESNext modules, DOM + WebWorker libs
└─ handlers/
   └─ quantize.ts (optional stub while porting)
```

* **UI (React + MUI 7)** keeps all settings in `TpqSettings`.
* **Worker** runs the quantization (legacy `worker.js` migrated into `ui/src/workers/legacy/worker-legacy.js`).
* **Bridge** (`useQuantizer`) translates settings → legacy numeric options, receives:

  * preview RGBA (for canvas),
  * final **paletteData** (B,G,R,0 × 256),
  * final **colorIndexes** (8-bpp, padded, bottom-up),
  * optional `palettes` snapshot during iteration.
* **Palette legend** derives from **paletteData** so it always matches the exported BMP (what GIMP sees).

---

## 🛠️ Troubleshooting

**“TypeScript emitted no output”**
Make sure `ui/tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "target": "ES2020",
    "lib": ["ES2023", "DOM", "WebWorker"],
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "noEmit": false,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src", "src/@types"]
}
```

**“Cannot find module …/quantize”**
Either add an alias (`handlers/*`) in Webpack + tsconfig, or correct the relative path to your `handlers/` or keep everything inside `ui/`.

**Worker doesn’t update the canvas**
Ensure the message handler converts the payload to `ImageData`:

```ts
const q = data.imageData;
const imgData = (q instanceof ImageData) ? q : new ImageData(q.data, q.width, q.height);
setPreview(imgData);
```

**GIMP palette order looks different from preview**
The legend now derives from **`paletteData`**, which is exactly what the BMP writes. In GIMP’s *Colormap* dialog, set **Columns = 16** to align with the “P0..Pn” blocks.

**Export saves RGB PNG instead of indexed BMP**
The **Save** button triggers `saveBMP()` and writes **8-bpp indexed** BMP with your **paletteData** + **colorIndexes**. If you see PNG: your button still calls an older canvas save—replace it with `onClick={() => onSaveBmp()}`.

**Filename is `{object Object}.bmp`**
Call save with a lambda: `onClick={() => onSaveBmp()}` to avoid passing the click event.

---

## 🔧 Config / Scripts (suggested)

Common `package.json` scripts:

```json
{
  "scripts": {
    "dev": "webpack serve --config webpack.config.cjs --mode development",
    "build": "webpack --config webpack.config.cjs --mode production",
    "serve": "node server.js"
  }
}
```

If you use Docker, your `docker-compose.yml` likely exposes port **8080** and binds the repo as a volume for live reload.

---

## 🗺️ Roadmap

* Export **.pal/.c** for SGDK (CRAM & palette tables).
* Optional **VRAM/tile** dumps and tilemap scaffolding.
* Batch mode (CLI) with the same settings.
* Explore **Sega CD** large-asset streaming (per your project scope).

---

## 🙏 Credits

* Original quantizer idea/tool by **rilden** (tiledpalettequant).
* This React rewrite, SGDK export path, and workflow glue by **@Augmentedjs** and contributors.

---

## 📝 License

MIT © 2025 Augmentedjs

See [LICENSE](./LICENSE) for full text.

> Portions of the legacy quantizer are derived from the original *tiledpalettequant* tool by rilden. Attribution retained.

---

### Support / Questions

Open an issue, or ping with:

* A sample input image,
* The settings you used,
* A screenshot of the legend vs what you see in GIMP/SGDK.

Happy quantizing! 🎮🟣🟢🟡🟠
