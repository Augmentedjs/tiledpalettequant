import { CssBaseline, Container } from "@mui/material";
import { SystemThemeProvider } from "../theme";
import { Base } from "../pages/base";
import { BigForm } from "../pages/form";
import { useQuantizer } from "../hooks/useQuantizer";
import { PreviewPane } from "./previewPane";

const App = () => {
  const q = useQuantizer();

  return (
    <SystemThemeProvider>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 3 }}>
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
          <PreviewPane busy={q.busy} progress={q.progress} drawToCanvas={q.drawToCanvas} />
        </Base>
      </Container>
    </SystemThemeProvider>
  );
};

export default App;
