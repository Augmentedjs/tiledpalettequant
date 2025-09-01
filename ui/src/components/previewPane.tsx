import { Box, Button, LinearProgress, Stack, Typography } from "@mui/material";
import { useEffect, useRef } from "react";
import { PaletteLegend } from "./paletteLegend";

type Props = {
  busy: boolean;
  progress: number;
  drawToCanvas: (el: HTMLCanvasElement) => void;
  onSavePng?: () => void;
  palettes?: number[][][];
  palettesCount?: number;
  colorsPerPalette?: number;
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

  const savePNG = () => {
    if (onSavePng) return onSavePng();

    const canvas = ref.current;
    if (!canvas) return;

    const filename = `tpq_${new Date().toISOString().replace(/[:.]/g, "-")}.png`;

    const downloadBlobUrl = (url: string) => {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    };

    // Prefer toBlob if available; otherwise use data URL
    if (typeof (canvas as HTMLCanvasElement).toBlob === "function") {
      (canvas as HTMLCanvasElement).toBlob((blob) => {
        if (blob) {
          downloadBlobUrl(URL.createObjectURL(blob));
        } else {
          // Safari can return null; fallback to dataURL
          const dataUrl = canvas.toDataURL("image/png");
          downloadBlobUrl(dataUrl);
        }
      }, "image/png");
    } else {
      const dataUrl = canvas.toDataURL("image/png");
      downloadBlobUrl(dataUrl);
    }
  };

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
        }}
      >
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
        <Button variant="outlined" onClick={savePNG} disabled={busy}>
          Save PNG
        </Button>
      </Stack>
    </Stack>
  );
};
