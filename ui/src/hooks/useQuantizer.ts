import { useCallback, useEffect, useRef, useState } from "react";

export const GENESIS_DEFAULTS: TpqSettings = {
  tileSize: 8,
  palettes: 4,
  colorsPerPalette: 16,
  bitsPerChannel: 3,
  dither: false,
  index0: "unique",
  fractionOfPixels: 1,
  ditherMode: "off",
  ditherWeight: 1,
  ditherPattern: "diag4",
  color0Behaviour: "unique",
  color0: { r: 0, g: 0, b: 0 }
};

type LegacyQuantOptions = {
  tileWidth: number;
  tileHeight: number;
  numPalettes: number;
  colorsPerPalette: number;
  bitsPerChannel: number;
  fractionOfPixels: number;
  colorZeroBehaviour: number;
  colorZeroValue: [number, number, number];
  dither: number;
  ditherWeight: number;
  ditherPattern: number;
};

type LegacyIndexed = {
  width: number;
  height: number;
  data: Uint8ClampedArray; // RGBA for on-screen preview
  totalPaletteColors: number; // numPalettes * colorsPerPalette
  paletteData: Uint8ClampedArray; // 256 * 4 entries, B,G,R,0
  colorIndexes: Uint8ClampedArray; // bmpWidth * height, bottom-up rows
};

const LEGACY = {
  ColorZeroBehaviour: {
    Unique: 0,
    Shared: 1,
    TransparentFromTransparent: 2,
    TransparentFromColor: 3
  },
  Dither: { Off: 0, Fast: 1, Slow: 2 },
  DitherPattern: {
    Diagonal4: 0,
    Horizontal4: 1,
    Vertical4: 2,
    Diagonal2: 3,
    Horizontal2: 4,
    Vertical2: 5
  },
  Action: {
    UpdateProgress: 1,
    UpdateQuantizedImage: 2,
    UpdatePalettes: 3,
    DoneQuantization: 4
  }
} as const;

export const useQuantizer = () => {
  const [state, setState] = useState<TpqSettings>(GENESIS_DEFAULTS);
  const [source, setSource] = useState<ImageData | null>(null);
  const [preview, setPreview] = useState<ImageData | null>(null);
  const [palettes, setPalettes] = useState<number[][][] | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [indexed, setIndexed] = useState<LegacyIndexed | null>(null);
  const workerRef = useRef<Worker | null>(null);

  // create/destroy worker
  useEffect(() => {
    const w = new Worker(new URL("../workers/legacy/worker-legacy.js", import.meta.url)); // classic worker
    workerRef.current = w;
    return () => {
      try {
        w.terminate();
      } catch {
        /* noop */
      }
    };
  }, []);

  // image loader -> ImageData
  const fileToImageData = useCallback(async (file: File) => {
    const buf = await file.arrayBuffer();
    const blob = new Blob([buf]);
    const bmp = await createImageBitmap(blob);
    const cv = document.createElement("canvas");
    cv.width = bmp.width;
    cv.height = bmp.height;
    const ctx = cv.getContext("2d")!;
    ctx.drawImage(bmp, 0, 0);
    return ctx.getImageData(0, 0, bmp.width, bmp.height);
  }, []);

  const mapDither = (mode?: DitherMode, simpleFlag?: boolean) =>
    mode
      ? { off: LEGACY.Dither.Off, fast: LEGACY.Dither.Fast, slow: LEGACY.Dither.Slow }[mode]
      : simpleFlag
      ? LEGACY.Dither.Fast
      : LEGACY.Dither.Off;

  const mapPattern = (p?: DitherPattern) =>
    (({ diag4: 0, horiz4: 1, vert4: 2, diag2: 3, horiz2: 4, vert2: 5 } as const)[p ?? "diag4"]);

  const mapColor0 = (beh?: Color0Behaviour) =>
    (({ unique: 0, shared: 1, transparentFromTransparent: 2, transparentFromColor: 3 } as const)[
      beh ?? "unique"
    ]);

  const clamp01 = (n: number | undefined, d = 1) => Math.max(0, Math.min(1, n ?? d));
  const c8 = (n: number | undefined) => Math.max(0, Math.min(255, Math.round(n ?? 0)));

  const toLegacyOptions = (s: TpqSettings) => ({
    tileWidth: s.tileSize,
    tileHeight: s.tileSize,
    numPalettes: s.palettes,
    colorsPerPalette: s.colorsPerPalette,
    bitsPerChannel: s.bitsPerChannel,
    fractionOfPixels: clamp01(s.fractionOfPixels, 1), // NEW

    dither: mapDither(s.ditherMode, s.dither),
    ditherWeight: clamp01(s.ditherWeight, 1),
    ditherPattern: mapPattern(s.ditherPattern),

    colorZeroBehaviour: mapColor0(s.color0Behaviour),
    // Used for 'shared' and 'transparentFromColor'; ignored by the other modes
    colorZeroValue: [c8(s.color0?.r), c8(s.color0?.g), c8(s.color0?.b)] as [number, number, number]
  });

  // run quantizer via worker
  const run = useCallback(
    async (img?: ImageData) => {
      const w = workerRef.current;
      if (!w) throw new Error("Worker not ready");
      const imageData = img ?? source;
      if (!imageData) throw new Error("No source image loaded");

      setBusy(true);
      setError(null);
      setProgress(0);

      const offHandlers = () => {
        w.onmessage = null;
        w.onerror = null;
      };

      const done = () => {
        setBusy(false);
        offHandlers();
      };

      return await new Promise<void>((resolve, reject) => {
        w.onmessage = (ev: MessageEvent<any>) => {
          const data = ev.data;
          switch (data?.action) {
            case LEGACY.Action.UpdateProgress:
              setProgress(Math.max(0, Math.min(100, Number(data.progress) || 0)));
              break;

            case LEGACY.Action.UpdateQuantizedImage: {
              // Worker posts an object with {width,height,data,totalPaletteColors,paletteData,colorIndexes}
              const q = data.imageData;
              if (q && q.width && q.height && q.data?.length) {
                setIndexed(q as LegacyIndexed); // keep the indexed payload for saving
                const imgData =
                  q instanceof ImageData ? q : new ImageData(q.data, q.width, q.height);
                setPreview(imgData); // draw to canvas
              }
              break;
            }
            case LEGACY.Action.UpdateQuantizedImage: {
              const q = data.imageData; // may be plain object { width, height, data: Uint8ClampedArray }
              const imgData = q instanceof ImageData ? q : new ImageData(q.data, q.width, q.height);
              setPreview(imgData);
              break;
            }
            case LEGACY.Action.UpdatePalettes:
              // array of palettes: number[numPalettes][numColors][3]
              setPalettes(data.palettes);
              break;
            case LEGACY.Action.DoneQuantization:
              done();
              resolve();
              break;
            default:
              // ignore other messages
              break;
          }
        };
        w.onerror = (e) => {
          setError(String(e?.message || e));
          done();
          reject(e);
        };

        w.postMessage({
          // the legacy worker doesn't actually check 'action' here, but sending it keeps parity
          action: 0,
          imageData,
          quantizationOptions: toLegacyOptions(state)
        });
      });
    },
    [source, state, toLegacyOptions, palettes]
  );

  const loadFile = useCallback(
    async (file: File) => {
      setError(null);
      const img = await fileToImageData(file);
      setSource(img);
      setPreview(img); // immediate raw preview
      void run(img); // auto-run (optional)
      return img;
    },
    [fileToImageData, run]
  );

  // helper: draw current preview into a canvas (call from your PreviewPane)
  const drawToCanvas = useCallback(
    (canvas: HTMLCanvasElement) => {
      if (!preview) return;
      canvas.width = preview.width;
      canvas.height = preview.height;
      const ctx = canvas.getContext("2d")!;
      ctx.putImageData(preview, 0, 0);
    },
    [preview]
  );

  const saveBMP = useCallback(
    (name = "tpq_indexed.bmp") => {
      if (!indexed) return;

      const { width: w, height: h, totalPaletteColors, paletteData, colorIndexes } = indexed;

      if (totalPaletteColors > 256) {
        // Can’t store >256 colors in an 8bpp BMP.
        // You could show a toast instead; this keeps it simple.
        alert(
          `Indexed BMP requires ≤256 colors (got ${totalPaletteColors}). Reduce palettes/colors.`
        );
        return;
      }

      const bmpWidth = Math.ceil(w / 4) * 4; // rows padded to 4
      const headerSize = 14 + 40; // FILE + INFO
      const paletteSize = 256 * 4; // always 256 entries (B,G, R,0)
      const pixelDataSize = bmpWidth * h; // 1 byte per pixel (already bottom-up)
      const fileSize = headerSize + paletteSize + pixelDataSize;

      const buf = new ArrayBuffer(fileSize);
      const dv = new DataView(buf);
      let off = 0;

      // BITMAPFILEHEADER
      dv.setUint8(off++, 0x42); // 'B'
      dv.setUint8(off++, 0x4d); // 'M'
      dv.setUint32(off, fileSize, true);
      off += 4;
      dv.setUint16(off, 0, true);
      off += 2;
      dv.setUint16(off, 0, true);
      off += 2;
      dv.setUint32(off, headerSize + paletteSize, true);
      off += 4;

      // BITMAPINFOHEADER (V3)
      dv.setUint32(off, 40, true);
      off += 4; // biSize
      dv.setInt32(off, w, true);
      off += 4; // biWidth
      dv.setInt32(off, h, true);
      off += 4; // biHeight (positive => bottom-up)
      dv.setUint16(off, 1, true);
      off += 2; // biPlanes
      dv.setUint16(off, 8, true);
      off += 2; // biBitCount
      dv.setUint32(off, 0, true);
      off += 4; // biCompression = BI_RGB
      dv.setUint32(off, pixelDataSize, true);
      off += 4; // biSizeImage
      dv.setInt32(off, 2835, true);
      off += 4; // X ppm (~72 DPI)
      dv.setInt32(off, 2835, true);
      off += 4; // Y ppm
      dv.setUint32(off, 256, true);
      off += 4; // biClrUsed (palette has 256 slots)
      dv.setUint32(off, 0, true);
      off += 4; // biClrImportant

      // Palette: worker already gives B,G,R,0 in length 1024
      new Uint8Array(buf, headerSize, paletteSize).set(paletteData);

      // Pixel indices (already padded & bottom-up from worker)
      new Uint8Array(buf, headerSize + paletteSize, pixelDataSize).set(colorIndexes);

      const blob = new Blob([buf], { type: "image/bmp" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    },
    [indexed]
  );

  return {
    // settings
    state,
    setState,
    // io
    loadFile,
    run,
    // status
    busy,
    error,
    progress,
    // outputs
    preview,
    palettes,
    saveBMP,
    // util for preview
    drawToCanvas
  };
};
