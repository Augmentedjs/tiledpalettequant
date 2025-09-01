import { ChangeEvent, useMemo, useRef } from "react";
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Slider,
  Stack,
  TextField,
  Typography
} from "@mui/material";

export type FormProps = {
  settings: TpqSettings;
  onChange: (next: TpqSettings) => void;
  onRun?: () => void;
  onImagePick?: (file: File) => void;
  disabled?: boolean;
};

const number = (v: string, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

// hex/RGB helpers (Color 0 picker)
const hexToRgb = (hex: string): RGB => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return { r: 0, g: 0, b: 0 };
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
};
const rgbToHex = ({ r, g, b }: RGB) =>
  "#" +
  [r, g, b]
    .map((n) =>
      Math.max(0, Math.min(255, n | 0))
        .toString(16)
        .padStart(2, "0")
    )
    .join("");

// NOTE: keep simple 2-arg setter everywhere to avoid the TS2554 errors
const makeSetter =
  (settings: TpqSettings, onChange: (n: TpqSettings) => void) =>
  <K extends keyof TpqSettings>(k: K, v: TpqSettings[K]) =>
    onChange({ ...settings, [k]: v });

export const BigForm = ({
  settings,
  onChange,
  onRun,
  onImagePick,
  disabled = false
}: FormProps) => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const set = makeSetter(settings, onChange);

  const paletteChoices = useMemo(() => [1, 2, 3, 4, 5, 6, 7, 8], []);
  const colorsChoices = useMemo(() => Array.from({ length: 16 }, (_, i) => i + 1), []);
  const bpcChoices = useMemo(() => [1, 2, 3, 4, 5, 6, 7, 8] as const, []);

  const pickFile = () => fileRef.current?.click();
  const onPickFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && onImagePick) onImagePick(f);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleRun = () => {
    window.scrollTo(0, 0);
    if (onRun) onRun();
  }

  return (
    <Box
      component="form"
      noValidate
      autoComplete="off"
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Source image */}
      <Section title="Source Image">
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button variant="contained" size="small" fullWidth={true} onClick={pickFile} disabled={disabled}>
            Choose Image…
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center" }}>
            BMP/PNG/JPG. For SGDK, BMP export preserves palette order best.
          </Typography>
        </Stack>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.bmp,.png,.jpg,.jpeg"
          onChange={onPickFile}
          hidden
        />
      </Section>

      <Divider flexItem />

      {/* Quantization */}
      <Section title="Quantization">
        <Stack direction="row" gap={2} flexWrap="wrap">
          <TextField
            label="Tile size"
            type="number"
            value={settings.tileSize}
            onChange={(e) =>
              set("tileSize", Math.max(1, number(e.target.value, settings.tileSize)))
            }
            slotProps={{ htmlInput: { min: 1, step: 1 } }}
            disabled={disabled}
            fullWidth={true}
          />

          <FormControl disabled={disabled} sx={{ width: "100%" }}>
            <InputLabel id="palettes-label">Palettes</InputLabel>
            <Select
              labelId="palettes-label"
              label="Palettes"
              value={settings.palettes}
              fullWidth={true}
              onChange={(e) => set("palettes", Number(e.target.value))}>
              {paletteChoices.map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Genesis uses up to 4</FormHelperText>
          </FormControl>

          <FormControl disabled={disabled} sx={{ width: "100%" }}>
            <InputLabel id="cpp-label">Colors / palette</InputLabel>
            <Select
              labelId="cpp-label"
              label="Colors / palette"
              value={settings.colorsPerPalette}
              fullWidth={true}
              onChange={(e) => set("colorsPerPalette", Number(e.target.value))}>
              {colorsChoices.map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Genesis max is 16</FormHelperText>
          </FormControl>

          <FormControl disabled={disabled} sx={{ width: "100%" }}>
            <InputLabel id="bpc-label">Bits / channel</InputLabel>
            <Select
              labelId="bpc-label"
              label="Bits / channel"
              value={settings.bitsPerChannel}
              fullWidth={true}
              onChange={(e) =>
                set("bitsPerChannel", Number(e.target.value) as TpqSettings["bitsPerChannel"])
              }>
              {bpcChoices.map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Genesis ≈ 3 bpc</FormHelperText>
            <FormLabel>Fraction of pixels</FormLabel>
            <Slider
              value={settings.fractionOfPixels ?? 1}
              min={0.05}
              max={1}
              step={0.05}
              
              onChange={(_, v) => set("fractionOfPixels", Array.isArray(v) ? v[0] : v)}
              valueLabelDisplay="auto"
            />
            <FormHelperText>Sampling ratio (classic default 1.0)</FormHelperText>
          </FormControl>
        </Stack>
      </Section>

      <Divider flexItem />

      {/* Dithering */}
      <Section title="Dithering">
        <Stack direction="row" spacing={2} gap={2} flexWrap="wrap">
          <FormControl component="fieldset" sx={{ width: "100%" }}>
            <FormLabel>Dither mode</FormLabel>
            <RadioGroup
              row
              value={settings.ditherMode ?? (settings.dither ? "fast" : "off")}
              onChange={(e) => set("ditherMode", e.target.value as DitherMode)}>
              <FormControlLabel value="off" control={<Radio />} label="Off" />
              <FormControlLabel value="fast" control={<Radio />} label="Fast" />
              <FormControlLabel value="slow" control={<Radio />} label="Slow" />
            </RadioGroup>
            <FormHelperText>Choose compute amount</FormHelperText>
          </FormControl>

          <Box sx={{ width: "90%" }}>
            <FormLabel>Weight</FormLabel>
            <Slider
              value={settings.ditherWeight ?? 1}
              min={0}
              max={1}
              step={0.05}
              onChange={(_, v) => set("ditherWeight", Array.isArray(v) ? v[0] : v)}
              valueLabelDisplay="auto"
            />
            <FormHelperText>Strength (0–1)</FormHelperText>
          </Box>

          <FormControl sx={{ width: "100%" }}>
            <InputLabel id="dpat">Pattern</InputLabel>
            <Select
              labelId="dpat"
              label="Pattern"
              value={settings.ditherPattern ?? "diag4"}
              fullWidth={true}
              onChange={(e) => set("ditherPattern", e.target.value as DitherPattern)}>
              <MenuItem value="diag4">Diagonal 4</MenuItem>
              <MenuItem value="horiz4">Horizontal 4</MenuItem>
              <MenuItem value="vert4">Vertical 4</MenuItem>
              <MenuItem value="diag2">Diagonal 2</MenuItem>
              <MenuItem value="horiz2">Horizontal 2</MenuItem>
              <MenuItem value="vert2">Vertical 2</MenuItem>
            </Select>
            <FormHelperText>Choose dither pattern</FormHelperText>
          </FormControl>
        </Stack>
      </Section>

      <Divider flexItem />

      <Section title="Color index zero behaviour">
        <FormControl component="fieldset" sx={{ mb: 1 }}>
          <RadioGroup
            value={settings.color0Behaviour ?? "unique"}
            onChange={(e) => set("color0Behaviour", e.target.value as Color0Behaviour)}>
            <FormControlLabel value="unique" control={<Radio />} label="unique" />
            <FormControlLabel value="shared" control={<Radio />} label="shared color:" />
            <FormControlLabel
              value="transparentFromTransparent"
              control={<Radio />}
              label="transparent, from transparent pixels"
            />
            <FormControlLabel
              value="transparentFromColor"
              control={<Radio />}
              label="transparent color:"
            />
          </RadioGroup>
        </FormControl>

        {(settings.color0Behaviour === "shared" ||
          settings.color0Behaviour === "transparentFromColor") && (
          <Stack direction="row" spacing={2} useFlexGap alignItems="center" flexWrap="wrap">
            <TextField
              label="Pick color"
              type="color"
              value={rgbToHex(settings.color0 ?? { r: 0, g: 0, b: 0 })}
              fullWidth={true}
              onChange={(e) => set("color0", hexToRgb(e.target.value))}
            />
            <TextField
              label="R"
              type="number"
              sx={{ width: 60 }}
              value={settings.color0?.r ?? 0}
              onChange={(e) =>
                set("color0", {
                  ...(settings.color0 ?? { r: 0, g: 0, b: 0 }),
                  r: Number(e.target.value)
                })
              }
              slotProps={{ htmlInput: { min: 0, max: 255 } }}
            />
            <TextField
              label="G"
              type="number"
              sx={{ width: 60 }}
              value={settings.color0?.g ?? 0}
              onChange={(e) =>
                set("color0", {
                  ...(settings.color0 ?? { r: 0, g: 0, b: 0 }),
                  g: Number(e.target.value)
                })
              }
              slotProps={{ htmlInput: { min: 0, max: 255 } }}
            />
            <TextField
              label="B"
              type="number"
              sx={{ width: 60 }}
              value={settings.color0?.b ?? 0}
              onChange={(e) =>
                set("color0", {
                  ...(settings.color0 ?? { r: 0, g: 0, b: 0 }),
                  b: Number(e.target.value)
                })
              }
              slotProps={{ htmlInput: { min: 0, max: 255 } }}
            />
          </Stack>
        )}
      </Section>

      <Divider flexItem />

      {/* Actions */}
      <Stack direction="row" spacing={1} alignContent={"center"} sx={{ pt: 1, flexWrap: "wrap" }}>
        <Button variant="contained" fullWidth={true} onClick={handleRun} disabled={disabled}>
          Run Quantizer
        </Button>
        <Button
          variant="text"
          fullWidth={true}
          onClick={() =>
            onChange({
              tileSize: 8,
              palettes: 4,
              colorsPerPalette: 16,
              bitsPerChannel: 3,
              dither: false,
              index0: "unique",
              ditherMode: "off",
              ditherWeight: 1,
              ditherPattern: "diag4",
              color0Behaviour: "unique",
              color0: { r: 0, g: 0, b: 0 }
            })
          }
          disabled={disabled}>
          Reset to Genesis Defaults
        </Button>
      </Stack>
    </Box>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
      {title}
    </Typography>
    {children}
  </Box>
);
