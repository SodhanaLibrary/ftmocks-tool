/* eslint-disable jsx-a11y/iframe-has-title */
import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const DefaultRecorder = ({ fetchMockData }) => {
  const [isRecordingMockData, setIsRecordingMockData] = useState(false);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState({
    url: '',
    pattern: '^/api/.*',
    testName: null,
  });

  const recordMockData = async () => {
    try {
      setIsRecordingMockData(true);
      const response = await fetch(`/api/v1/record/mocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      if (!response.ok) {
        throw new Error('Failed to record mock data');
      }
    } catch (err) {
      setError(err.message);
      setIsRecordingMockData(false);
    }
  };

  const onUrlChange = (event) => {
    setConfig({
      ...config,
      url: event.target.value,
    });
  };

  const onPatternChange = (event) => {
    setConfig({
      ...config,
      pattern: event.target.value,
    });
  };

  const stopRecordingMockData = async () => {
    try {
      setIsRecordingMockData(false);
      const response = await fetch(`/api/v1/record`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to stop recording mock data');
      }
      fetchMockData(null, {
        stopRecording: true,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchRecordingStatus = async () => {
    const response = await fetch(`/api/v1/record/status`);
    const data = await response.json();
    setIsRecordingMockData(data.status === 'running');
  };

  useEffect(() => {
    setTimeout(fetchRecordingStatus, 1000);
  }, []);

  return (
    <Box
      gap={1}
      display="flex"
      flexDirection="column"
      sx={{ width: '500px', margin: '0 auto', textAlign: 'left', mt: 4 }}
    >
      <Box sx={{ pl: 3 }}>
        <Typography variant="h6" gutterBottom>
          Record Mock Data
        </Typography>
      </Box>

      <Box width="100%" display="flex" flexDirection="row" gap={1}>
        {!isRecordingMockData && (
          <Box
            p={3}
            sx={{ textAlign: 'center', border: '1px solid #333' }}
            width="100%"
            display="flex"
            flexDirection="column"
            gap={1}
          >
            <TextField
              label="URL"
              fullWidth
              margin="normal"
              value={config.url}
              onChange={onUrlChange}
            />
            <TextField
              label="Pattern"
              fullWidth
              margin="normal"
              value={config.pattern}
              onChange={onPatternChange}
            />
            <Button
              color="primary"
              onClick={recordMockData}
              variant="contained"
            >
              Record Mock Data
            </Button>
          </Box>
        )}
        {isRecordingMockData && (
          <Box
            p={3}
            minWidth="100%"
            sx={{ textAlign: 'center', border: '1px solid #333' }}
            display="flex"
            flexDirection="column"
            gap={1}
          >
            <Typography>Recording in progress...</Typography>
            <Button
              color="primary"
              onClick={stopRecordingMockData}
              variant="contained"
            >
              Stop recording
            </Button>
          </Box>
        )}
      </Box>
      {error && <Typography color="error">{error}</Typography>}
    </Box>
  );
};

export default DefaultRecorder;
