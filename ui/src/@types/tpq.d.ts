// ui/src/@types/tpq.d.ts
export { };

declare global {
  type Index0Mode = 'unique' | 'shared';

  type DitherMode = 'off' | 'fast' | 'slow';
  type DitherPattern = 'diag4' | 'horiz4' | 'vert4' | 'diag2' | 'horiz2' | 'vert2';
  type Color0Behaviour =
    | 'unique'
    | 'shared'
    | 'transparentFromTransparent'
    | 'transparentFromColor';

  type RGB = { r: number; g: number; b: number };

  type TpqSettings = {
    tileSize: number;
    palettes: number;
    colorsPerPalette: number;
    bitsPerChannel: number;

    // existing simple flags:
    dither: boolean;       // kept for compat; ignored if ditherMode is present
    index0: Index0Mode;    // kept for compat; ignored if color0Behaviour is present

    // NEW: legacy-equivalent controls
    ditherMode?: DitherMode;        // off | fast | slow
    ditherWeight?: number;          // 0..1
    ditherPattern?: DitherPattern;  // diag4 | horiz4 | vert4 | diag2 | horiz2 | vert2

    color0Behaviour?: Color0Behaviour; // legacy colorZeroBehaviour
    color0?: RGB;                         // legacy colorZeroValue
  };

  type QuantResult = {
    width: number;
    height: number;
    paletteRGB: Uint8Array;
    indices: Uint8Array;
    tileBlocks?: Uint8Array;
  };
}
