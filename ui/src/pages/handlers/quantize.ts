// Minimal shim so the build succeeds. Replace with real logic later.

// export type TpqSettings = any; // keep loose for now

// // Ambient QuantResult if you added it in @types; otherwise inline a minimal version:
// type MinimalQuantResult = {
//   width: number;
//   height: number;
//   paletteRGB: Uint8Array;  // 256*3 RGB; we’ll fill entry 0
//   indices: Uint8Array;     // width*height; we’ll fill zeros
// };

/**
 * Minimal quantizer stub that satisfies QuantResult:
 * - paletteRGB: 256*3 RGB (we just seed entry 0 from the first pixel)
 * - indices: width*height (all zeros)
 * - tileBlocks: one byte per tile (all zeros), size = ceil(w/ts) * ceil(h/ts)
 */
export const quantize = async (
  imageData: ImageData,
  settings: TpqSettings
) => {
  const { width, height, data } = imageData;

  // palette: keep order; fill only entry 0 for now
  const paletteRGB = new Uint8Array(256 * 3);
  paletteRGB[0] = data[0] ?? 0;     // R
  paletteRGB[1] = data[1] ?? 0;     // G
  paletteRGB[2] = data[2] ?? 0;     // B

  // indices: 1 byte per pixel; default all zeros (palette entry 0)
  const indices = new Uint8Array(width * height);

  // tileBlocks: one per tile (all zero = palette block 0)
  const ts = Math.max(1, Math.floor((settings?.tileSize as number) || 8));
  const tilesX = Math.ceil(width / ts);
  const tilesY = Math.ceil(height / ts);
  const tileBlocks = new Uint8Array(tilesX * tilesY);

  // Return a shape compatible with your global QuantResult
  const result = {
    width,
    height,
    paletteRGB,
    indices,
    tileBlocks,
  };

  return result;
};

