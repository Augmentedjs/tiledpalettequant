
type Index0Mode = 'shared' | 'unique';

type TpqSettings = {
  /** Tile size in pixels (Genesis backgrounds typically 8) */
  tileSize: number;

  /** Number of palettes available (Genesis max 4) */
  palettes: 1 | 2 | 3 | 4;

  /** Colors per palette (Genesis max 16) */
  colorsPerPalette: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

  /** Quantization depth per RGB channel */
  bitsPerChannel: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

  /** Enable/disable dithering during quantization */
  dither: boolean;

  /** Whether index 0 is unique per palette or shared across all palettes */
  index0: Index0Mode;
};

/** Optional: result type your worker/quantizer returns */
type QuantResult = {
  width: number;
  height: number;
  /** Global RGB palette (length 256*3; first palettes*16*3 are used) */
  paletteRGB: Uint8Array;
  /** One byte per pixel: global index = paletteId*16 + colorInPalette */
  indices: Uint8Array;
  /** One byte per 8×8 tile: which palette block (0..3) that tile uses */
  tileBlocks: Uint8Array;
};
