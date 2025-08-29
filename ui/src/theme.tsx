import { PropsWithChildren, useMemo } from "react";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

/**
 * Uses the OS preference (prefers-color-scheme) to pick light/dark.
 * - No user override; always follows the system
 * - Updates live if the OS theme changes
 */
export const SystemThemeProvider = ({ children }: PropsWithChildren) => {
  // noSsr avoids hydration warnings if you ever server-render
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)", { noSsr: true });

  const theme = useMemo(
    () =>
      createTheme({
        cssVariables: true, // MUI v7: enable CSS vars (nice for theming)
        palette: { mode: prefersDark ? "dark" : "light" },
        typography: { fontSize: 14 }
      }),
    [prefersDark]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
