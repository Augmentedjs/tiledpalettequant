import { Box, Button, LinearProgress, Stack, Typography } from "@mui/material";
import { useEffect, useRef } from "react";
import { PaletteLegend } from "./paletteLegend";

type Props = {
  busy: boolean;
  progress: number;
  drawToCanvas: (el: HTMLCanvasElement) => void;
  onSavePng?: () => void;
  palettes?: number[][][]; // from worker
  palettesCount?: number; // settings.palettes
  colorsPerPalette?: number; // settings.colorsPerPalette
};

export const PreviewPane = ({
  busy,
  progress,
  drawToCanvas,
  onSavePng,
  palettes,
  palettesCount = 4,
  colorsPerPalette = 16
}: Props) => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (ref.current) drawToCanvas(ref.current);
  }, [drawToCanvas]);

  return (
    <Stack spacing={2}>
      {busy && (
        <Stack spacing={1}>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            Quantizing…
          </Typography>
          <LinearProgress variant="determinate" value={progress} />
        </Stack>
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "stretch",
          gap: 2,
          border: "1px solid",
          borderColor: "divider",
          p: 2,
          minHeight: 240
        }}>
        <Box sx={{ flex: 1, display: "grid", placeItems: "center" }}>
          <canvas ref={ref} />
        </Box>

        <PaletteLegend
          palettes={palettes}
          palettesCount={palettesCount}
          colorsPerPalette={colorsPerPalette}
        />
      </Box>

      <Stack direction="row" spacing={1}>
        <Button variant="outlined" onClick={onSavePng} disabled={busy}>
          Save PNG
        </Button>
      </Stack>
    </Stack>
  );
};
