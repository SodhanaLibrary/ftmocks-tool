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
import RecordedMockData from './components/recordedMocks/RecordedMockData';
import RecordedEventsData from './components/recordedEvents/RecordedEventsData';
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
  const [envDetails, setEnvDetails] = React.useState(null);

  // This code only runs on the client side, to determine the system color preference
  React.useEffect(() => {
    // Check if there is a preferred mode in localStorage
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) {
      setMode(savedMode);
    } else {
      // If no preference is found, it uses system preference
      const systemPrefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      setMode(systemPrefersDark ? 'dark' : 'light');
    }
  }, []);
  const handleModeChange = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const fetchEnvDetails = async () => {
    try {
      const response = await fetch('/api/v1/env/project');
      if (!response.ok) {
        throw new Error('Failed to fetch test data');
      }
      const data = await response.json();
      setEnvDetails(data);
    } catch (error) {
      console.error('Error fetching test data:', error);
      // Handle the error appropriately, e.g., show an error message to the user
    }
  };

  React.useEffect(() => {
    fetchEnvDetails();
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline enableColorScheme />
      <BrowserRouter>
        <AppAppBar onModeChange={handleModeChange} />
        <Box sx={{ mt: 10 }}>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <TestSummary envDetails={envDetails} fetchEnvDetails={fetchEnvDetails}/>
                </>
              }
            />
            <Route path="/tests" element={<Tests envDetails={envDetails} />} />
            <Route path="/default-mock-data" element={<DefaultMockData />} />
            <Route path="/recorded-mock-data" element={<RecordedMockData />} />
            <Route path="/mock-server" element={<MockServer />} />
            <Route
              path="/recorded-events-data"
              element={<RecordedEventsData />}
            />
            <Route path="/coverage-report" element={<CoverageReport />} />
            <Route path="/render-map" element={<RenderMap />} />
          </Routes>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}
