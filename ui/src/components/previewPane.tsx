import {
  Box,
  Button,
  LinearProgress,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { PaletteLegend } from "./paletteLegend";

type Props = {
  busy: boolean;
  progress: number;
  drawToCanvas: (el: HTMLCanvasElement) => void;
  onSaveBmp: (name?: string, sort?: "none" | "lumaAsc" | "lumaDesc") => void;
  palettes?: number[][][];
  palettesCount?: number;
  colorsPerPalette?: number;
  // NEW: palette exporters
  onSaveGpl: (p: number) => void;
  onSavePalJasc: (p: number) => void;
  onSaveAct: (p: number) => void;
  onSaveC: (p: number) => void;
  logs?: string[];
  onClearLogs?: () => void;
};

export const PreviewPane = (props: Props) => {
  const {
    busy,
    progress,
    drawToCanvas,
    onSaveBmp,
    palettes,
    palettesCount = 4,
    colorsPerPalette = 16,
    onSaveGpl,
    onSavePalJasc,
    onSaveAct,
    onSaveC,
    logs = [],
    onClearLogs
  } = props;

  const ref = useRef<HTMLCanvasElement | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);
  const [pIdx, setPIdx] = useState(0);

  useEffect(() => {
    if (ref.current) drawToCanvas(ref.current);
  }, [drawToCanvas]);
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

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

      <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
        <Button variant="outlined" onClick={() => onSaveBmp(undefined, "none")} disabled={busy}>
          Save BMP (Indexed)
        </Button>
      </Stack>
      <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
        <FormControl size="small" sx={{ minWidth: 120, ml: 2 }}>
          <InputLabel id="palpick">Palette</InputLabel>
          <Select
            labelId="palpick"
            label="Palette"
            value={pIdx}
            onChange={(e) => setPIdx(Number(e.target.value))}>
            {Array.from({ length: palettesCount }).map((_, i) => (
              <MenuItem key={i} value={i}>
                P{i}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button size="small" variant="text" onClick={() => onSaveGpl(pIdx)} disabled={busy}>
          Save .gpl
        </Button>
        <Button size="small" variant="text" onClick={() => onSavePalJasc(pIdx)} disabled={busy}>
          Save .pal
        </Button>
        <Button size="small" variant="text" onClick={() => onSaveAct(pIdx)} disabled={busy}>
          Save .act
        </Button>
        <Button size="small" variant="text" onClick={() => onSaveC(pIdx)} disabled={busy}>
          Save .c (SGDK)
        </Button>
      </Stack>
    </Stack>
  );
};
