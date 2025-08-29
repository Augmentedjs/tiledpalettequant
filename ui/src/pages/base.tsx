import { PropsWithChildren, ReactNode } from "react";
import {
  AppBar,
  Box,
  Container,
  Divider,
  IconButton,
  Paper,
  Toolbar,
  Typography
} from "@mui/material";
import type { Breakpoint } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";

export type BaseProps = PropsWithChildren<{
  /** Title shown in the top AppBar */
  title?: string;
  /** Optional actions on the right side of the AppBar (e.g., buttons) */
  actions?: ReactNode;
  /** Optional left sidebar content (e.g., controls) */
  sidebar?: ReactNode;
  /** Width for the inner container; false = full-bleed */
  maxWidth?: Breakpoint | false;
  /** Whether to show a thin divider below the AppBar */
  showAppBarDivider?: boolean;
  /** Optional custom leading icon/button in the AppBar */
  leading?: ReactNode;
  /** Sidebar width on desktop (px) */
  sidebarWidth?: number;
}>;

/**
 * Base layout shell using Box (flexbox):
 * - AppBar + content container
 * - Responsive: column on mobile, row on desktop
 * - Optional sidebar on the left (fixed width on md+)
 */
export const Base = ({
  title = "Tiled Palette Quant",
  actions,
  leading,
  sidebar,
  children,
  maxWidth = "lg",
  showAppBarDivider = true,
  sidebarWidth = 320
}: BaseProps) => (
  <Box
    sx={{
      display: "flex",
      minHeight: "100dvh",
      flexDirection: "column",
      bgcolor: "background.default"
    }}>
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{ borderBottom: (t) => (showAppBarDivider ? `1px solid ${t.palette.divider}` : "none") }}>
      <Toolbar sx={{ gap: 1 }}>
        {leading ?? (
          <IconButton edge="start" sx={{ display: { md: "none" } }} aria-label="menu">
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
          {title}
        </Typography>
        {actions}
      </Toolbar>
    </AppBar>

    <Container
      maxWidth={maxWidth}
      sx={{ flex: 1, py: 2, display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", md: "row" },
          alignItems: "stretch",
          width: "100%",
          flex: 1,
          minHeight: 0
        }}>
        {sidebar && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              flex: { xs: "0 0 auto", md: "0 0 auto" },
              width: { xs: "100%", md: sidebarWidth },
              alignSelf: "flex-start"
            }}>
            {sidebar}
          </Paper>
        )}

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            flex: "1 1 auto",
            minWidth: 0 // allow children (e.g., canvas) to shrink properly
          }}>
          {children}
        </Paper>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Divider />
        <Box
          component="footer"
          sx={{
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1
          }}>
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} TPQ (React)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Genesis-friendly 4×16 palette blocks · 8×8 tiles
          </Typography>
        </Box>
      </Box>
    </Container>
  </Box>
);
