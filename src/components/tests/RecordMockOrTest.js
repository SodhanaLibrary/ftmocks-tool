/* eslint-disable jsx-a11y/iframe-has-title */
import React, { useEffect, useState } from 'react';
import {
  Box,
} from '@mui/material';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import RecordedEventsData from '../recordedEvents/RecordedEventsData';

const RecordMockOrTest = ({ selectedTest, fetchMockData, envDetails }) => {
  const [recordedEvents, setRecordedEvents] = useState([]);
  const [isRecordingMockData, setIsRecordingMockData] = useState(false);
  const [isRecordingTest, setIsRecordingTest] = useState(false);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState({
    url: '',
    pattern: '^/api/.*',
    avoidDuplicatesWithDefaultMocks: true,
    stopMockServer: true,
    startMockServer: true,
    testName: selectedTest.name,
    avoidDuplicatesInTheTest: true,
  });

    // Fetch mock data
    const fetchRecordedEvents = async () => {
      try {
        const response = await fetch(`/api/v1/recordedEvents?name=${selectedTest.name}`);
        if (!response.ok) {
          throw new Error('Failed to fetch default mocks');
        }
        const data = await response.json();
        setRecordedEvents(data);
      } catch (err) {
        setError(err.message);
      } 
    };
  

  const recordMockData = async () => {
    try {
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
      setIsRecordingMockData(true);
    } catch (err) {
      setError(err.message);
    } 
  }

  const recordTest = async () => {
    try {
      const response = await fetch(`/api/v1/record/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      if (!response.ok) {
        throw new Error('Failed to record test');
      }
      setIsRecordingTest(true);
    } catch (err) {
      setError(err.message);
    }
  }

  const onCheckboxChange = (event) => {
    setConfig({
      ...config,
      [event.target.name]: event.target.checked,
    });
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
      fetchMockData(selectedTest);
    } catch (err) {
      setError(err.message);
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchRecordedEvents();
  }, [selectedTest]);

  return (
    <Box gap={1}  display="flex" flexDirection="column" sx={{ width: '100%', margin: '0 auto', textAlign: 'left', mt: 4 }}>
        <Box width="100%" display="flex" flexDirection="row" gap={1}>
          {!isRecordingMockData && !isRecordingTest && <Box p={3} sx={{textAlign: 'center', border: '1px solid #333'}} width="50%" display="flex" flexDirection="column" gap={1}>
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
              <FormControlLabel
                  control={
                      <Checkbox
                      checked={config.avoidDuplicatesWithDefaultMocks}
                      name="avoidDuplicatesWithDefaultMocks"
                      onChange={onCheckboxChange}
                      />
                  }
                  label="Avoid duplicates with default mocks"
              />
              <FormControlLabel
                  control={
                      <Checkbox
                      checked={config.avoidDuplicatesInTheTest}
                      name="avoidDuplicatesInTheTest"
                      onChange={onCheckboxChange}
                      />
                  }
                  label="Avoid duplicates in the test"
              />
              <FormControlLabel
                  control={
                      <Checkbox
                      checked={config.stopMockServer}
                      name="stopMockServer"
                      onChange={onCheckboxChange}
                      />
                  }
                  label="Stop mock server"
              />
              <Button color='primary' onClick={recordMockData} variant='contained'>Record Mock Data</Button>
          </Box>}
          {isRecordingMockData && <Box p={3} width="50%" sx={{textAlign: 'center', border: '1px solid #333'}} display="flex" flexDirection="column" gap={1}>
            <Typography>Recording mock data...</Typography>
            <Button color='primary' onClick={stopRecordingMockData} variant='contained'>Stop recording</Button>
          </Box>}
          {!isRecordingMockData && <Box p={3} width="50%" sx={{textAlign: 'center', border: '1px solid #333'}} display="flex" flexDirection="column" gap={1}>
            <TextField
                label="URL"
                fullWidth
                margin="normal"
                value={config.url}
                onChange={onUrlChange}
            />
            <FormControlLabel
                control={
                    <Checkbox
                    checked={config.startMockServer}
                    name="startMockServer"
                    onChange={onCheckboxChange}
                    />
                }
                label="Start mock server"
            />
            <Button color='primary' onClick={recordTest} variant='contained'>Record Test</Button>
          </Box>}
        </Box>
        <Box width="100%" display="flex" flexDirection="row" gap={1} sx={{textAlign: 'center', border: '1px solid #333'}}>
          <RecordedEventsData selectedTest={selectedTest} />
        </Box>
    </Box>
  );
};

export default RecordMockOrTest;
