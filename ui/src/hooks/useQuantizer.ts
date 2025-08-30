import { useCallback, useRef, useState } from 'react';
import type { QuantResult, TpqSettings } from '../types';

// ---------- Genesis-ish defaults ----------
export const GENESIS_DEFAULTS: TpqSettings = {
  tileSize: 8,
  palettes: 4,
  colorsPerPalette: 16,
  bitsPerChannel: 3,
  dither: false,
  index0: 'unique',
};

// ---------- Types for worker bridge ----------
type RunMsg = { type: 'RUN'; imageData: ImageData; settings: TpqSettings };
type DoneMsg = { type: 'DONE'; result: QuantResult };
type ErrMsg = { type: 'ERROR'; error: string };
type WorkerMsg = DoneMsg | ErrMsg;

// ---------- Hook ----------
export const useQuantizer = () => {
  const [state, setState] = useState<TpqSettings>(GENESIS_DEFAULTS);
  const [result, setResult] = useState<QuantResult | null>(null);
  const [source, setSource] = useState<ImageData | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);

  // Create worker lazily (webpack 5 module worker). If not present, we’ll fallback.
  const getWorker = useCallback(() => {
    if (workerRef.current) return workerRef.current;
    try {
      // Adjust path if you keep workers elsewhere
      const w = new Worker(new URL('../workers/quantWorker.ts', import.meta.url), { type: 'module' });
      workerRef.current = w;
      return w;
    } catch {
      return null;
    }
  }, []);

  // ---------- image IO ----------
  const fileToImageData = useCallback(async (file: File): Promise<ImageData> => {
    const buf = await file.arrayBuffer();
    // Prefer ImageBitmap for speed; fallback to HTMLImageElement
    if ('createImageBitmap' in window) {
      const bmp = await createImageBitmap(new Blob([buf]));
      const { width, height } = bmp;
      if ('OffscreenCanvas' in window) {
        const oc = new OffscreenCanvas(width, height);
        const ctx = oc.getContext('2d')!;
        ctx.drawImage(bmp, 0, 0);
        return ctx.getImageData(0, 0, width, height);
      } else {
        const cv = document.createElement('canvas');
        cv.width = width; cv.height = height;
        const ctx = cv.getContext('2d')!;
        ctx.drawImage(bmp, 0, 0);
        return ctx.getImageData(0, 0, width, height);
      }
    } else {
      const url = URL.createObjectURL(new Blob([buf]));
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = url;
      });
      const cv = document.createElement('canvas');
      cv.width = img.width; cv.height = img.height;
      const ctx = cv.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      return ctx.getImageData(0, 0, img.width, img.height);
    }
  }, []);

  const loadFile = useCallback(async (file: File) => {
    setError(null);
    const img = await fileToImageData(file);
    setSource(img);
    return img;
  }, [fileToImageData]);

  // ---------- quant run (worker preferred; fallback to handlers) ----------
  const run = useCallback(async (img?: ImageData) => {
    const imageData = img ?? source;
    if (!imageData) throw new Error('No source image loaded.');
    setBusy(true); setError(null);

    const worker = getWorker();
    if (worker) {
      const res = await new Promise<QuantResult>((resolve, reject) => {
        const onMsg = (ev: MessageEvent<WorkerMsg>) => {
          const m = ev.data;
          if (m?.type === 'DONE') { cleanup(); resolve(m.result); }
          else if (m?.type === 'ERROR') { cleanup(); reject(new Error(m.error)); }
        };
        const onErr = (e: MessageEvent) => { cleanup(); reject(new Error(String(e))); };
        const cleanup = () => {
          worker.removeEventListener('message', onMsg as any);
          worker.removeEventListener('error', onErr as any);
        };
        worker.addEventListener('message', onMsg as any);
        worker.addEventListener('error', onErr as any);
        const msg: RunMsg = { type: 'RUN', imageData, settings: state };
        worker.postMessage(msg);
      }).catch((e) => { throw e; });

      setResult(res);
      setBusy(false);
      return res;
    }

    // Fallback: call legacy quantizer directly
    try {
      const { quantize } = await import(/* webpackChunkName: "handlers-quantize" */ '../../handlers/quantize');
      const res: QuantResult = await quantize(imageData, state);
      setResult(res);
      return res;
    } catch (e: any) {
      setError(e?.message ?? String(e));
      throw e;
    } finally {
      setBusy(false);
    }
  }, [getWorker, source, state]);

  // ---------- exporters ----------
  const savePNG = useCallback(async (name = 'tpq.png', transparentIndex: number | null = null) => {
    if (!result) return;
    const { width, height, indices, paletteRGB } = result;
    const cv = document.createElement('canvas');
    cv.width = width; cv.height = height;
    const ctx = cv.getContext('2d')!;
    const out = ctx.createImageData(width, height);
    const data = out.data;

    for (let i = 0, p = 0; i < indices.length; i++, p += 4) {
      const idx = indices[i] | 0;
      const base = idx * 3;
      data[p]     = paletteRGB[base]   ?? 0;
      data[p + 1] = paletteRGB[base+1] ?? 0;
      data[p + 2] = paletteRGB[base+2] ?? 0;
      data[p + 3] = (transparentIndex !== null && idx === transparentIndex) ? 0 : 255;
    }
    ctx.putImageData(out, 0, 0);
    cv.toBlob((blob) => blob && downloadBlob(blob, name), 'image/png');
  }, [result]);

  const saveBMP = useCallback((name = 'tpq.bmp', transparentIndex: number | null = null) => {
    if (!result) return;
    const blob = encodeBMPIndexed8(result, transparentIndex);
    downloadBlob(blob, name);
  }, [result]);

  return {
    state, setState,
    source, setSource,
    result,
    busy, error,
    loadFile,
    run,
    savePNG,
    saveBMP,
  };
};

// ---------- helpers: download ----------
const downloadBlob = (blob: Blob, name: string) => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
};

// ---------- BMP encoder (8bpp indexed, palette-preserving) ----------
/**
 * Writes an 8bpp indexed BMP (Windows V3, BI_RGB). Palette entries are BGR0.
 * - Keeps palette order exactly as `result.paletteRGB` (first 256 entries used)
 * - Rows are bottom-up, padded to 4-byte boundaries
 */
const encodeBMPIndexed8 = (res: QuantResult, transparentIndex: number | null = null): Blob => {
  const { width: w, height: h, indices, paletteRGB } = res;

  const bytesPerRowPadded = ((w + 3) & ~3); // pad to 4
  const paletteCount = 256;                 // fixed 256 slots; we’ll fill from paletteRGB
  const headerSize = 14 + 40;               // BITMAPFILEHEADER(14) + BITMAPINFOHEADER(40)
  const paletteSize = paletteCount * 4;     // RGBA(4) each, but BMP uses BGR0
  const pixelDataSize = bytesPerRowPadded * h;
  const fileSize = headerSize + paletteSize + pixelDataSize;

  const buf = new ArrayBuffer(fileSize);
  const dv = new DataView(buf);
  let off = 0;

  // BITMAPFILEHEADER
  dv.setUint8(off++, 0x42); // 'B'
  dv.setUint8(off++, 0x4D); // 'M'
  dv.setUint32(off, fileSize, true); off += 4;
  dv.setUint16(off, 0, true); off += 2;
  dv.setUint16(off, 0, true); off += 2;
  dv.setUint32(off, headerSize + paletteSize, true); off += 4;

  // BITMAPINFOHEADER (V3)
  dv.setUint32(off, 40, true); off += 4;          // biSize
  dv.setInt32(off, w, true); off += 4;            // biWidth
  dv.setInt32(off, h, true); off += 4;            // biHeight (positive => bottom-up)
  dv.setUint16(off, 1, true); off += 2;           // biPlanes
  dv.setUint16(off, 8, true); off += 2;           // biBitCount = 8
  dv.setUint32(off, 0, true); off += 4;           // biCompression = BI_RGB
  dv.setUint32(off, pixelDataSize, true); off += 4;// biSizeImage
  dv.setInt32(off, 2835, true); off += 4;         // biXPelsPerMeter (~72 DPI)
  dv.setInt32(off, 2835, true); off += 4;         // biYPelsPerMeter
  dv.setUint32(off, paletteCount, true); off += 4;// biClrUsed
  dv.setUint32(off, 0, true); off += 4;           // biClrImportant

  // Palette (256 entries of B,G,R,0) — preserve order from paletteRGB
  for (let i = 0; i < paletteCount; i++) {
    const base = i * 3;
    const r = paletteRGB[base]   ?? 0;
    const g = paletteRGB[base+1] ?? 0;
    const b = paletteRGB[base+2] ?? 0;
    dv.setUint8(off++, b);
    dv.setUint8(off++, g);
    dv.setUint8(off++, r);
    dv.setUint8(off++, (transparentIndex !== null && i === transparentIndex) ? 0 : 0);
  }

  // Pixel data (bottom-up rows, 1 byte per pixel, padded)
  const row = new Uint8Array(buf, headerSize + paletteSize, pixelDataSize);
  for (let y = 0; y < h; y++) {
    const srcY = h - 1 - y;                    // bottom-up
    const dstRowStart = y * bytesPerRowPadded;
    for (let x = 0; x < w; x++) {
      row[dstRowStart + x] = indices[srcY * w + x] & 0xFF;
    }
    // pad zeros to 4-byte boundary implicitly (row is already zero-filled)
  }

  return new Blob([buf], { type: 'image/bmp' });
};
