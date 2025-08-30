import { CssBaseline, Container, Button } from "@mui/material";
import { SystemThemeProvider } from "../theme";
import { Base } from "../pages/base";
import { BigForm } from "../pages/form";
// import { ControlsPanel } from './components/ControlsPanel';
// import { PreviewPane } from './components/PreviewPane';
import { useQuantizer } from "../hooks/useQuantizer";

const App = () => {
  const q = useQuantizer();

  return (
    <SystemThemeProvider>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* main preview/canvas */}
        <Base
          title="Tiled Palette Quant"
          actions={
            <Button variant="outlined" size="small">
              Export
            </Button>
          }
          sidebar={
            <BigForm
              settings={q.state}
              onChange={q.setState}
              onRun={() => q.result ? q.run(q.result as any) : undefined /* or pass current ImageData */}
              onImagePick={(file) => {
                // your image load → canvas/ImageBitmap → q.run(imageData)
              }}
              disabled={false}
            />
          }
          sidebarWidth={360}
        >
        </Base>
      </Container>
    </SystemThemeProvider>
  );
};

export default App;
