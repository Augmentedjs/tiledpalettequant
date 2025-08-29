import { CssBaseline, Container, Button } from "@mui/material";
import { SystemThemeProvider } from "../theme";
import { Base } from "../pages/base";
import BigForm from "../pages/form";
// import { ControlsPanel } from './components/ControlsPanel';
// import { PreviewPane } from './components/PreviewPane';
// import { useQuantizer } from './hooks/useQuantizer';

const App = () => {
  // const q = useQuantizer();

  return (
    <SystemThemeProvider>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Base
          title="Tiled Palette Quant"
          actions={
            <Button variant="outlined" size="small">
              Export
            </Button>
          }
          sidebar={
            <div></div>
          }
          sidebarWidth={360}
        >
          <BigForm />
        </Base>
      </Container>
    </SystemThemeProvider>
  );
};

export default App;
