import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import AppAppBar from './components/AppAppBar';
import FAQ from './components/FAQ';
import TestSummary from './components/summary/TestSummary';
import getMPTheme from './theme/getMPTheme';
import Tests from './components/tests/Tests';
import DefaultMockData from './components/defaultMocks/DefaultMockData';
import MockServer from './components/MockServer';
import CoverageReport from './components/CoverageReport';
import RenderMap from './components/RenderMap';
import { Box } from '@mui/material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});


export default function FtMocksTool() {
  const [mode, setMode] = React.useState('dark');
  
  // This code only runs on the client side, to determine the system color preference
  React.useEffect(() => {
    // Check if there is a preferred mode in localStorage
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) {
      setMode(savedMode);
    } else {
      // If no preference is found, it uses system preference
      const systemPrefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      setMode(systemPrefersDark ? 'dark' : 'light');
    }
  }, []);
  const handleModeChange = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline enableColorScheme />
      <BrowserRouter>
        <AppAppBar onModeChange={handleModeChange} />
        <Box sx={{mt: 10}}>
          <Routes>
            <Route path="/" element={
              <>
                <TestSummary />
              </>
            } />
            <Route path="/tests" element={<Tests />} />
            <Route path="/default-mock-data" element={<DefaultMockData />} />
            <Route path="/mock-server" element={<MockServer />} />
            <Route path="/coverage-report" element={<CoverageReport />} />
            <Route path="/render-map" element={<RenderMap />} />
          </Routes>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}
