import { useEffect, useRef } from "react";
import { CssBaseline, Container } from "@mui/material";
import { SystemThemeProvider } from "../theme";
import { Base } from "../pages/base";
import { BigForm } from "../pages/form";
import { useQuantizer } from "../hooks/useQuantizer";
import { PreviewPane } from "./previewPane";

const App = () => {
  const q = useQuantizer();
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const w = new Worker(new URL("../workers/legacy/worker-legacy.js", import.meta.url));
    workerRef.current = w;
    return () => {
      try {
        w.terminate();
      } catch {
        /* noop */
      }
    };
  }, []);

  return (
    <SystemThemeProvider>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Base
          title="Tiled Palette Quantize"
          sidebar={
            <BigForm
              settings={q.state}
              onChange={q.setState}
              onImagePick={q.loadFile}
              onRun={() => q.run()}
              disabled={q.busy}
            />
          }>
          <PreviewPane
            busy={q.busy}
            progress={q.progress}
            drawToCanvas={q.drawToCanvas}
            onSaveBmp={q.saveBMP}
            palettes={q.palettes ?? undefined}
            palettesCount={q.state.palettes}
            colorsPerPalette={q.state.colorsPerPalette}
          />
        </Base>
      </Container>
    </SystemThemeProvider>
  );
};

export default App;
