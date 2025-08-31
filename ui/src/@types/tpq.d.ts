export {};

declare global {
  type DitherMode = "off" | "fast" | "slow";
  type DitherPattern = "diag4" | "horiz4" | "vert4" | "diag2" | "horiz2" | "vert2";
  type Color0Behaviour =
    | "unique"
    | "shared"
    | "transparentFromTransparent"
    | "transparentFromColor";

  type RGB = { r: number; g: number; b: number };

  type TpqSettings = {
    tileSize: number;
    palettes: number; // allow 1..8
    colorsPerPalette: number; // 1..16
    bitsPerChannel: number; // 1..8

    // legacy-equivalent controls
    fractionOfPixels?: number; // 0..1  (default 1.0)
    ditherMode?: DitherMode; // off | fast | slow
    ditherWeight?: number; // 0..1
    ditherPattern?: DitherPattern; // diag4 | horiz4 | vert4 | diag2 | horiz2 | vert2
    color0Behaviour?: Color0Behaviour;
    color0?: RGB;

    // kept for compat, not shown in UI anymore
    dither: boolean;
    index0: "unique" | "shared";
  };

  type QuantResult = {
    width: number;
    height: number;
    paletteRGB: Uint8Array;
    indices: Uint8Array;
    tileBlocks?: Uint8Array;
  };
}
