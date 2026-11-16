import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppAppBar from './components/AppAppBar';
import TestSummary from './components/summary/TestSummary';
import Tests from './components/tests/Tests';
import DefaultMockData from './components/defaultMocks/DefaultMockData';
import MockServer from './components/MockServer';
import ApiSpecs from './components/ApiSpecs';
import { Box } from '@mui/material';

export default function FtMocksTool() {
  const [mode, setMode] = React.useState('dark');
  const [envDetails, setEnvDetails] = React.useState(null);

  const theme = React.useMemo(
    () => createTheme({ palette: { mode } }),
    [mode]
  );

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
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <BrowserRouter>
        <AppAppBar mode={mode} onModeChange={handleModeChange} />
        <Box sx={{ mt: 10 }}>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <TestSummary
                    envDetails={envDetails}
                    fetchEnvDetails={fetchEnvDetails}
                  />
                </>
              }
            />
            <Route path="/tests" element={<Tests envDetails={envDetails} />} />
            <Route
              path="/tests/:testId"
              element={<Tests envDetails={envDetails} />}
            />
            <Route path="/default-mock-data" element={<DefaultMockData />} />
            <Route path="/mock-server" element={<MockServer />} />
            <Route path="/api-specs" element={<ApiSpecs />} />
          </Routes>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}
