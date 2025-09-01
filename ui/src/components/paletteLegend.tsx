import { Box, Typography } from "@mui/material";

type Props = {
  /** legacy worker palettes: [palette][color][3] with 0..255 RGB */
  palettes?: number[][][];
  /** fallback counts (from settings) */
  palettesCount?: number; // e.g., 4 (legacy also allowed 8)
  colorsPerPalette?: number; // e.g., 16
  /** UI tweaks */
  title?: string;
  cell?: number; // swatch size (px)
};

const rgbCss = (r = 0, g = 0, b = 0) => `rgb(${r | 0}, ${g | 0}, ${b | 0})`;

export const PaletteLegend = ({
  palettes,
  palettesCount = 4,
  colorsPerPalette = 16,
  title = "Palettes",
  cell = 18
}: Props) => {
  const cols = palettesCount;
  const rows = colorsPerPalette;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minWidth: cell * 4 + 24 }}>
      <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
        {title}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${cell * 1.5}px)`,
          gap: 1
        }}>
        {Array.from({ length: cols }).map((_, p) => (
          <Box
            key={`pal-${p}`}
            sx={{
              display: "flex",
              flexDirection: "column",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              overflow: "hidden"
            }}>
            <Box sx={{ px: 0.75, py: 0.5, borderBottom: "1px solid", borderColor: "divider" }}>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                P{p}
              </Typography>
            </Box>

            <Box sx={{ display: "grid", gridTemplateRows: `repeat(${rows}, ${cell}px)` }}>
              {Array.from({ length: rows }).map((__, c) => {
                const rgb = palettes?.[p]?.[c];
                const bg = rgb ? rgbCss(rgb[0], rgb[1], rgb[2]) : "transparent";
                const isZero = c === 0;

                return (
                  <Box
                    key={`p${p}-c${c}`}
                    sx={{
                      width: "100%",
                      height: `${cell}px`,
                      bgcolor: bg === "transparent" ? "transparent" : undefined,
                      backgroundColor: bg !== "transparent" ? bg : undefined,
                      // checkerboard for missing entries
                      ...(bg === "transparent"
                        ? {
                            backgroundImage:
                              `linear-gradient(45deg,#bbb 25%,transparent 25%),` +
                              `linear-gradient(-45deg,#bbb 25%,transparent 25%),` +
                              `linear-gradient(45deg,transparent 75%,#bbb 75%),` +
                              `linear-gradient(-45deg,transparent 75%,#bbb 75%)`,
                            backgroundSize: "20px 20px",
                            backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px"
                          }
                        : null),
                      borderBottom: c < rows - 1 ? "1px solid rgba(0,0,0,0.08)" : "none",
                      outline: isZero ? "2px solid rgba(255,255,255,0.9)" : "none",
                      outlineOffset: isZero ? -2 : 0
                    }}
                    title={`P${p} C${c}${rgb ? ` — rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})` : ""}`}
                  />
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
