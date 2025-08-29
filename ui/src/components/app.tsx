import { CssBaseline, ThemeProvider, Container, Stack, Paper, Typography } from '@mui/material';
import { createTheme } from '@mui/material/styles';
// import { ControlsPanel } from './components/ControlsPanel';
// import { PreviewPane } from './components/PreviewPane';
// import { useQuantizer } from './hooks/useQuantizer';

const theme = createTheme({ cssVariables: true, typography: { fontSize: 14 } });

const App = () => {
  // const q = useQuantizer();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h4">Tiled Palette Quant</Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <p>Test</p>
            {/* <ControlsPanel state={q.state} onChange={q.setState} onRun={q.run} /> */}
          </Paper>
          {/* <PreviewPane result={q.result} onSaveBmp={q.saveBMP} onSavePng={q.savePNG} /> */}
        </Stack>
      </Container>
    </ThemeProvider>
  );
};

export default App;
