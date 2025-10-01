/* eslint-disable jsx-a11y/iframe-has-title */
import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const DefaultRecorder = ({ onClose }) => {
  const [isRecordingMockData, setIsRecordingMockData] = useState(false);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState({
    url: '',
    patterns: ['^/api/.*'],
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

  const onPatternsChange = (event, newPatterns) => {
    setConfig({
      ...config,
      patterns: newPatterns,
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
      onClose(null, {
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

  const onCloseDrawer = () => {
    setIsRecordingMockData(false);
    onClose();
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
      <Box
        sx={{ pl: 3, pr: 3, display: 'flex', justifyContent: 'space-between' }}
      >
        <Typography variant="h6" gutterBottom>
          Record Mock Data
        </Typography>
        <IconButton
          color="primary"
          aria-label="record mock data"
          onClick={onCloseDrawer}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Box
        width="100%"
        display="flex"
        flexDirection="row"
        gap={1}
        sx={{ mt: -2 }}
      >
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
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={config.patterns}
              onChange={onPatternsChange}
              onInputChange={(event, newInputValue, reason) => {
                if (reason === 'input' && newInputValue.includes(',')) {
                  const patterns = newInputValue
                    .split(',')
                    .map((p) => p.trim())
                    .filter((p) => p.length > 0);
                  const existingPatterns = config.patterns;
                  const newPatterns = [...existingPatterns, ...patterns];
                  onPatternsChange(event, newPatterns);
                }
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                    key={index}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Patterns"
                  placeholder="Enter patterns separated by commas (e.g., ^/api/.*, ^/v1/.*)"
                  margin="normal"
                  fullWidth
                />
              )}
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
