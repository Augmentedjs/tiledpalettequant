import { useCallback, useEffect, useRef, useState } from 'react';

export const GENESIS_DEFAULTS: TpqSettings = {
  tileSize: 8,
  palettes: 4,
  colorsPerPalette: 16,
  bitsPerChannel: 3,
  dither: false,
  index0: 'unique',
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

const LEGACY = {
  ColorZeroBehaviour: { Unique: 0, Shared: 1, TransparentFromTransparent: 2, TransparentFromColor: 3 },
  Dither: { Off: 0, Fast: 1, Slow: 2 },
  DitherPattern: { Diagonal4: 0, Horizontal4: 1, Vertical4: 2, Diagonal2: 3, Horizontal2: 4, Vertical2: 5 },
  Action: { UpdateProgress: 1, UpdateQuantizedImage: 2, UpdatePalettes: 3, DoneQuantization: 4 },
} as const;

export const useQuantizer = () => {
  const [state, setState] = useState<TpqSettings>(GENESIS_DEFAULTS);

  const [source, setSource] = useState<ImageData | null>(null);
  const [preview, setPreview] = useState<ImageData | null>(null);
  const [palettes, setPalettes] = useState<number[][] | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);

  // create/destroy worker
  useEffect(() => {
    const w = new Worker(new URL('../workers/legacy/worker-legacy.js', import.meta.url)); // classic worker
    workerRef.current = w;
    return () => { try { w.terminate(); } catch { /* noop */ } };
  }, []);

  // image loader -> ImageData
  const fileToImageData = useCallback(async (file: File) => {
    const buf = await file.arrayBuffer();
    const blob = new Blob([buf]);
    const bmp = await createImageBitmap(blob);
    const cv = document.createElement('canvas');
    cv.width = bmp.width; cv.height = bmp.height;
    const ctx = cv.getContext('2d')!;
    ctx.drawImage(bmp, 0, 0);
    return ctx.getImageData(0, 0, bmp.width, bmp.height);
  }, []);

  const loadFile = useCallback(async (file: File) => {
    setError(null);
    const img = await fileToImageData(file);
    setSource(img);
    setPreview(null);
    return img;
  }, [fileToImageData]);

  // build legacy quantization options from our state
  const toLegacyOptions = useCallback((s: TpqSettings): LegacyQuantOptions => {
    return {
      tileWidth: s.tileSize,
      tileHeight: s.tileSize,
      numPalettes: s.palettes,
      colorsPerPalette: s.colorsPerPalette,
      bitsPerChannel: s.bitsPerChannel,
      fractionOfPixels: 1.0,          // simple default
      colorZeroBehaviour: s.index0 === 'unique' ? LEGACY.ColorZeroBehaviour.Unique : LEGACY.ColorZeroBehaviour.Shared,
      colorZeroValue: [0, 0, 0],      // default black for index-0 if needed
      dither: s.dither ? LEGACY.Dither.Fast : LEGACY.Dither.Off,
      ditherWeight: 1.0,
      ditherPattern: LEGACY.DitherPattern.Diagonal4,
    };
  }, []);

  // run quantizer via worker
  const run = useCallback(async (img?: ImageData) => {
    const w = workerRef.current;
    if (!w) throw new Error('Worker not ready');
    const imageData = img ?? source;
    if (!imageData) throw new Error('No source image loaded');

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
          case LEGACY.Action.UpdateQuantizedImage:
            // data.imageData is an ImageData coming from the worker
            setPreview(data.imageData);
            break;
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
        quantizationOptions: toLegacyOptions(state),
      });
    });
  }, [source, state, toLegacyOptions]);

  // helper: draw current preview into a canvas (call from your PreviewPane)
  const drawToCanvas = useCallback((canvas: HTMLCanvasElement) => {
    if (!preview) return;
    canvas.width = preview.width;
    canvas.height = preview.height;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(preview, 0, 0);
  }, [preview]);

  return {
    // settings
    state, setState,
    // io
    loadFile, run,
    // status
    busy, error, progress,
    // outputs
    preview, palettes,
    // util for preview
    drawToCanvas,
  };
};
