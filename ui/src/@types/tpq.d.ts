
export {};

declare global {
  type Index0Mode = 'unique' | 'shared';

  type TpqSettings = {
    tileSize: number;
    palettes: number;  
    colorsPerPalette: number; 
    bitsPerChannel: number;  
    dither: boolean;
    index0: Index0Mode;
  };

  type QuantResult = {
    width: number;
    height: number;
    paletteRGB: Uint8Array;
    indices: Uint8Array;
    tileBlocks?: Uint8Array;
  };
}
