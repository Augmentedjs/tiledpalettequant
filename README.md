# Tiled Palette Quant (TPQ) — Dockerized Fork

Tile-aware palette quantization for retro consoles (e.g., Sega Genesis / Mega Drive).
This fork adds a **zero-dependency Docker setup** and handy **start/stop scripts** so you can run the tool locally any time.

> Original project: [https://github.com/rilden/tiledpalettequant](https://github.com/rilden/tiledpalettequant)
> Live page (upstream): [https://rilden.github.io/tiledpalettequant/](https://rilden.github.io/tiledpalettequant/)

## What this tool does (quick theory)

* TPQ takes a source image and quantizes it into **N palettes** with **M colors each** (e.g., **4×16** for Genesis), honoring a **tile size** (usually **8×8**).
* It outputs a **paletted image** where every 8×8 tile uses **one** 16-entry block of the global colormap:
  `PNG_index = palette_id * 16 + color_index_in_palette`
  For Genesis, that’s 4 palettes × 16 colors = 64 global entries.
* This layout lets your importer (e.g., SGDK’s rescomp) deduce per-tile palette selection from pixel indices.

Why you sometimes get “palette index” errors after editing:

* If you paint inside one tile with colors from two different 16-entry blocks, the tile no longer has a single palette → error.
* If your editor “optimizes” the palette (reorders or removes unused entries), the `palette_id*16 + color` encoding breaks → error.

---

## Contents

* [Quick Start](#quick-start)
* [Development vs Production](#development-vs-production)
* [Scripts](#scripts)

  * [`start.sh`](#startsh)
  * [`teardown.sh`](#teardownsh)
* [Configuration](#configuration)

  * [`docker-compose.yml`](#docker-composeyml)
  * [`nginx.conf`](#nginxconf)
  * [`Dockerfile` (prod)](#dockerfile-prod)
* [Using the App](#using-the-app)
* [Editing Pipeline That Won’t Break Palettes](#editing-pipeline-that-wont-break-palettes)
* [Optional: Palette Fix & Tile Checker (tools/)](#optional-palette-fix--tile-checker-toolst)
* [Troubleshooting](#troubleshooting)
* [Credits & License](#credits--license)

---

## Quick Start

Prereqs: Docker Desktop (or Docker Engine + Compose), Bash.

```bash
# Clone your fork
git clone https://github.com/Augmentedjs/tiledpalettequant
cd tiledpalettequant

# Start in dev mode (bind-mounts repo)
./start.sh

# Open http://localhost:8080
```

Stop everything:

```bash
./teardown.sh
```

Change port:

```bash
PORT=5173 ./start.sh
```

Production image (no bind mount):

```bash
./start.sh --prod --rebuild
```

---

## Development vs Production

* **Dev (default):**

  * Uses the official `nginx:alpine` image.
  * **Bind-mounts** your working tree into `/usr/share/nginx/html`.
  * Edits show up on refresh (no build step).

* **Prod (`--prod`):**

  * Builds a tiny static image with your files baked in.
  * Great for pushing to a registry or running without local files.

---

## Scripts

### `start.sh`

Starts the site in **dev** (default) or **prod** mode.

**Options**

```
--prod            Use the 'prod' profile (builds image; no bind mount)
--rebuild         Pass --build to Compose
--port <num>      Port to expose (default: 8080 or $PORT)
--logs            Follow logs after start
--open            Open browser (macOS 'open')
-h, --help        Show help
```

**Examples**

```bash
./start.sh                          # dev on 8080
./start.sh --port 9000              # dev on 9000
./start.sh --prod --rebuild --logs  # build and run prod, follow logs
```

### `teardown.sh`

Stops and removes containers for this project.

**Options**

```
--volumes         Also remove volumes (Compose mode only)
--images          Remove images built by this project (Compose mode only)
--prune           After cleanup, run 'docker system prune -f' (dangling only)
-h, --help        Show help
```

**Examples**

```bash
./teardown.sh                 # stop/remove containers
./teardown.sh --volumes       # also remove volumes
./teardown.sh --images        # also remove locally built images
./teardown.sh --prune         # prune dangling resources after
```

---

## Configuration

These files live at the repo root.

### `docker-compose.yml`

* **web** (dev): serves your working tree via Nginx using a **bind mount**.
* **prod**: builds a small static image (no bind mount); enabled via a Compose **profile**.

```yaml
version: "3.9"

services:
  web:
    image: nginx:1.27-alpine
    container_name: tpq-web
    ports:
      - "${PORT:-8080}:80"
    volumes:
      - ./:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro

  prod:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: tpq-prod
    ports:
      - "${PORT:-8080}:80"
    profiles: ["prod"]
```

### `nginx.conf`

A minimal `server {}` block.
**Do not** include `mime.types` or `default_type` here — the base image already loads those globally.

```nginx
server {
  listen 80;
  server_name _;

  root  /usr/share/nginx/html;
  index index.html;

  charset utf-8;

  location / {
    try_files $uri $uri/ /index.html;
    add_header Cache-Control "no-store" always;
  }
}
```

### `Dockerfile` (prod)

Copies your site into the image and uses the same `nginx.conf`.

```dockerfile
FROM nginx:1.27-alpine

COPY . /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

---

## Using the App

Open `http://localhost:<PORT>`.

Common settings for Sega Genesis backgrounds:

* **Tile size:** `8 × 8`
* **Palettes:** `4`
* **Colors per palette:** `16`
* **Index 0 policy:** often **Unique** (per-palette color 0) for backgrounds
* **Dithering:** taste/preference
* **Bits per channel:** Genesis ≈ 3bpc; you can set/approximate to see closer hues

**Output notes**

* Click the generated image to save — upstream exports **BMP** by default (which preserves palette order nicely).
* If you later need PNGs, be careful (see next section) or use the optional fixer tool.

---

## Editing Pipeline That Won’t Break Palettes

If you use GIMP/other editors:

1. Keep the image in **Indexed** mode at all times (don’t convert to RGB).
2. Open **Colormap** dialog and remember the rule:

   * Entries **0–15** → palette 0
   * **16–31** → palette 1
   * **32–47** → palette 2
   * **48–63** → palette 3
3. Enable an **8×8 grid** and **Snap to Grid**. Each tile must use colors from **one** block only.
4. When exporting PNG, **do not optimize/reorder** palette or “remove unused colors”.
5. If anything gets messed up (palette entries reordered), fix with the **tools** below or just re-export BMP from the app and use that.

**SGDK tip:** rescomp infers the tile’s palette from pixel indices (`palette = index >> 4`). Mixed blocks within a tile or a shuffled palette will cause errors.

---

## Optional: Palette Fix & Tile Checker (`tools/`)

If you want a safety net, add a tiny Python tool (Pillow) to your repo under `tools/`:

* **`export-palette IN.bmp ref.json`** — saves the exact 64-entry palette order from a TPQ BMP
* **`bmp2png IN.bmp OUT.png`** — converts BMP → PNG **without changing palette order or indices**
* **`reindex edited.png ref.json fixed.png`** — reorders any shuffled PNG back to the original palette order
* **`check fixed.png`** — validates that **every 8×8 tile** uses a **single** palette block
* **`reblock edited.png forced.png`** — forces each tile to its **majority** block (as a last resort)

> If you want, I’ll drop these into the repo in a `tools/` folder ready to go.

---

## Troubleshooting

**Browser downloads the HTML instead of rendering**
You likely defined a `types { ... }` block that **overrode** the default MIME table, or re-included `mime.types`.
Use the minimal `nginx.conf` above (no extra `types`, no `default_type`).

**Nginx startup error: “`default_type` directive is duplicate”**
The base image already sets it. Remove `default_type` from your `nginx.conf`.

**macOS Bash error: “`rebuild_flag[@]: unbound variable`”**
Older macOS Bash + `set -u`. The provided `start.sh` avoids empty-array expansions.

**Port already in use**
Start with a different port: `PORT=5173 ./start.sh` or stop the other process.

**SGDK palette index errors after editing**
You either mixed palette blocks within a tile or your editor reordered the palette.
Use the **BMP output** directly, or run the **reindex**/**check** helper scripts.

---

## Credits & License

* Original TPQ by **rilden** (see upstream repo for license).
* This fork adds Docker, scripts, and docs for easier local hosting and editing workflows.
* If you rediscover bugs in the quantizer itself, please open issues here and/or upstream.
