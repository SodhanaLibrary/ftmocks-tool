import React, { useState } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material';

export default function MockServer() {
  const [selectedTest, setSelectedTest] = useState('');
  const [port, setPort] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleTestChange = (event) => {
    setSelectedTest(event.target.value);
  };

  const handlePortChange = (event) => {
    setPort(event.target.value);
  };

  const handleRun = () => {
    setIsRunning(true);
    // Add logic to start the mock server
  };

  const handleStop = () => {
    setIsRunning(false);
    // Add logic to stop the mock server
  };

  const testCases = [
    { id: 1, name: 'Test Case 1', mockData: ['Mock Data 1', 'Mock Data 2', 'Mock Data 3'] },
    { id: 2, name: 'Test Case 2', mockData: ['Mock Data 4', 'Mock Data 5'] },
    { id: 3, name: 'Test Case 3', mockData: ['Mock Data 6', 'Mock Data 7', 'Mock Data 8', 'Mock Data 9'] },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
      <FormControl fullWidth>
        <InputLabel id="test-select-label">Test</InputLabel>
        <Select
          labelId="test-select-label"
          id="test-select"
          value={selectedTest}
          label="Test"
          onChange={handleTestChange}
        >
          {testCases.map((test) => (
            <MenuItem key={test.id} value={test.id}>{test.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        fullWidth
        label="Port"
        variant="outlined"
        value={port}
        onChange={handlePortChange}
        type="number"
      />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRun}
          disabled={isRunning}
        >
          Run
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleStop}
          disabled={!isRunning}
        >
          Stop
        </Button>
      </Box>
    </Box>
  );
}
