import { Box, Button, LinearProgress, Stack, Typography } from "@mui/material";
import { useEffect, useRef } from "react";
import { PaletteLegend } from "./paletteLegend";

type Props = {
  busy: boolean;
  progress: number;
  drawToCanvas: (el: HTMLCanvasElement) => void;
  onSaveBmp: () => void;
  palettes?: number[][][];
  palettesCount?: number;
  colorsPerPalette?: number;
};

export const PreviewPane = ({
  busy, progress, drawToCanvas, onSaveBmp,
  palettes, palettesCount = 4, colorsPerPalette = 16
}: Props) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => { if (ref.current) drawToCanvas(ref.current); }, [drawToCanvas]);

  return (
    <Stack spacing={2}>
      {busy && (
        <Stack spacing={1}>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>Quantizing…</Typography>
          <LinearProgress variant="determinate" value={progress} />
        </Stack>
      )}
      <Box sx={{ display: "flex", alignItems: "stretch", gap: 2, border: "1px solid", borderColor: "divider", p: 2, minHeight: 240 }}>
        <Box sx={{ flex: 1, display: "grid", placeItems: "center" }}>
          <canvas ref={ref} />
        </Box>
        <PaletteLegend palettes={palettes} palettesCount={palettesCount} colorsPerPalette={colorsPerPalette} />
      </Box>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" onClick={() => onSaveBmp()} disabled={busy}>
          Save BMP (Indexed 8-bpp)
        </Button>
      </Stack>
    </Stack>
  );
};
