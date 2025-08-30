import { ChangeEvent, useMemo, useRef } from "react";
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Switch,
  TextField,
  Typography
} from "@mui/material";

export type FormProps = {
  /** Current settings (controlled) */
  settings: TpqSettings;
  /** Push updated settings */
  onChange: (next: TpqSettings) => void;
  /** Optional: trigger a quantization run */
  onRun?: () => void;
  /** Optional: handle image file selection */
  onImagePick?: (file: File) => void;
  /** Disable all interactive controls (e.g., while running) */
  disabled?: boolean;
};

const number = (v: string, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export const BigForm = ({ settings, onChange, onRun, onImagePick, disabled = false }: FormProps) => {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const set = <K extends keyof TpqSettings>(k: K, v: TpqSettings[K]) =>
    onChange({ ...settings, [k]: v });

  const paletteChoices = useMemo(() => [1, 2, 3, 4], []);
  const colorsChoices = useMemo(() => Array.from({ length: 16 }, (_, i) => i + 1), []);
  const bpcChoices = useMemo(() => [1, 2, 3, 4, 5, 6, 7, 8] as const, []);

  const pickFile = () => fileRef.current?.click();
  const onPickFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && onImagePick) onImagePick(f);
    // allow re-selecting same file
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Box
      component="form"
      noValidate
      autoComplete="off"
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Image */}
      <Section title="Source Image">
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button variant="contained" size="small" onClick={pickFile} disabled={disabled}>
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
            slotProps={{
              htmlInput: { min: 1, step: 1 }}}
            disabled={disabled}
            sx={{ width: { xs: "100%", sm: 160 } }}
          />
          <FormControl sx={{ width: { xs: "100%", sm: 160 } }} disabled={disabled}>
            <InputLabel id="palettes-label">Palettes</InputLabel>
            <Select
              labelId="palettes-label"
              label="Palettes"
              value={settings.palettes}
              onChange={(e) => set("palettes", Number(e.target.value) as TpqSettings["palettes"])}>
              {paletteChoices.map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Genesis uses up to 4</FormHelperText>
          </FormControl>

          <FormControl sx={{ width: { xs: "100%", sm: 200 } }} disabled={disabled}>
            <InputLabel id="cpp-label">Colors / palette</InputLabel>
            <Select
              labelId="cpp-label"
              label="Colors / palette"
              value={settings.colorsPerPalette}
              onChange={(e) => set("colorsPerPalette", Number(e.target.value) as TpqSettings["colorsPerPalette"])}>
              {colorsChoices.map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Genesis max is 16</FormHelperText>
          </FormControl>

          <FormControl sx={{ width: { xs: "100%", sm: 200 } }} disabled={disabled}>
            <InputLabel id="bpc-label">Bits / channel</InputLabel>
            <Select
              labelId="bpc-label"
              label="Bits / channel"
              value={settings.bitsPerChannel}
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
          </FormControl>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.dither}
                onChange={(e) => set("dither", e.target.checked)}
                disabled={disabled}
              />
            }
            label="Enable dithering"
          />
        </Stack>
      </Section>

      <Divider flexItem />

      {/* Palette policy */}
      <Section title="Palette Policy">
        <FormControl component="fieldset" disabled={disabled}>
          <RadioGroup
            row
            name="index0"
            value={settings.index0}
            onChange={(e) => set("index0", e.target.value as TpqSettings["index0"])}>
            <FormControlLabel
              value="unique"
              control={<Radio />}
              label="Index-0 unique per palette"
            />
            <FormControlLabel
              value="shared"
              control={<Radio />}
              label="Index-0 shared across palettes"
            />
          </RadioGroup>
          <FormHelperText>
            For backgrounds, “unique” is typical. Keep index ordering stable for SGDK.
          </FormHelperText>
        </FormControl>
      </Section>

      {/* Actions */}
      <Stack direction="row" spacing={1} sx={{ pt: 1, flexWrap: "wrap" }}>
        <Button variant="contained" onClick={onRun} disabled={disabled}>
          Run Quantizer
        </Button>
        <Button
          variant="text"
          onClick={() =>
            onChange({
              tileSize: 8,
              palettes: 4,
              colorsPerPalette: 16,
              bitsPerChannel: 3,
              dither: false,
              index0: "unique"
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
