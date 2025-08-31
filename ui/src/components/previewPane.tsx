import { Box, Button, LinearProgress, Stack, Typography } from "@mui/material";
import { useEffect, useRef } from "react";

type Props = {
  busy: boolean;
  progress: number;
  drawToCanvas: (el: HTMLCanvasElement) => void;
  onSavePng?: () => void;
};

export const PreviewPane = ({ busy, progress, drawToCanvas, onSavePng }: Props) => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (ref.current) drawToCanvas(ref.current);
  }, [drawToCanvas]);

  return (
    <Stack spacing={2}>
      {busy && <LinearProgress variant="determinate" value={progress} />}
      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          minHeight: 300,
          display: "grid",
          placeItems: "center"
        }}>
        <canvas ref={ref} />
      </Box>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" onClick={onSavePng} disabled={busy}>
          Save PNG
        </Button>
      </Stack>
      <Typography variant="caption" color="text.secondary">
        Palette blocks: see sidebar while we wire export.
      </Typography>
    </Stack>
  );
};
