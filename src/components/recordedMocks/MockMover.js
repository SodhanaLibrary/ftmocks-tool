import React, { useEffect, useState } from 'react';
import {
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const MockMover = ({ mockItem, onClose }) => {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/v1/tests');
      if (!response?.ok) {
        throw new Error('Failed to fetch tests');
      }
      const data = await response.json();
      setTests(data);
      return data;
    } catch (error) {
      console.error('Error fetching tests:', error);
      // Handle the error appropriately, e.g., show an error message to the user
    }
  };

  const moveItDefaultMocks = async () => {
    const endpoint = `/api/v1/defaultmocks`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(mockItem.mockData),
      });

      if (response.ok) {
        console.log('Mock data updated successfully');
        setSnackbarMessage('Mock data updated successfully');
        setSnackbarOpen(true);
      } else {
        console.error('Failed to update mock data');
        setSnackbarMessage('Failed to update mock data');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error updating mock data:', error);
      setSnackbarMessage('Error updating mock data');
      setSnackbarOpen(true);
    }
  };

  const moveAllToDefaultMocks = async () => {
    const endpoint = `/api/v1/defaultmocks`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(mockItem.mockData),
      });

      if (response.ok) {
        console.log('Mock data updated successfully');
        setSnackbarMessage('Mock data updated successfully');
        setSnackbarOpen(true);
      } else {
        console.error('Failed to update mock data');
        setSnackbarMessage('Failed to update mock data');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error updating mock data:', error);
      setSnackbarMessage('Error updating mock data');
      setSnackbarOpen(true);
    }
  };

  const initiateRecordedMocks = async () => {
    const endpoint = `/api/v1/initiateRecordedMocks`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        console.log('Mock data updated successfully');
        setSnackbarMessage('Mock data updated successfully');
        setSnackbarOpen(true);
      } else {
        console.error('Failed to update mock data');
        setSnackbarMessage('Failed to update mock data');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error updating mock data:', error);
      setSnackbarMessage('Error updating mock data');
      setSnackbarOpen(true);
    }
  };

  const moveItToTest = async () => {
    const endpoint = `/api/v1/tests/${selectedTest}`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(mockItem.mockData),
      });

      if (response.ok) {
        console.log('Mock data updated successfully');
        setSnackbarMessage('Mock data updated successfully');
        setSnackbarOpen(true);
      } else {
        console.error('Failed to update mock data');
        setSnackbarMessage('Failed to update mock data');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error updating mock data:', error);
      setSnackbarMessage('Error updating mock data');
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 600,
        mx: 'auto',
        mt: 4,
        p: 3,
      }}
    >
      <Button
        onClick={moveItDefaultMocks}
        variant="contained"
        color="primary"
        fullWidth
      >
        Move It To Default Mock Data
      </Button>

      <Divider sx={{ my: 2 }} />

      <Button
        onClick={moveAllToDefaultMocks}
        variant="contained"
        color="primary"
        fullWidth
      >
        Move all GET requests To Default Mock Data
      </Button>

      <Divider sx={{ my: 2 }} />

      <Typography align="center" variant="subtitle1" sx={{ my: 1 }}>
        OR
      </Typography>

      <Divider sx={{ my: 2 }} />

      {tests.length !== 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Move it to Test
          </Typography>

          <FormControl fullWidth>
            <InputLabel id="test-select-label">Test</InputLabel>
            <Select
              labelId="test-select-label"
              id="test-select"
              value={selectedTest}
              label="Test"
              onChange={(e) => setSelectedTest(e.target.value)}
            >
              {tests.map((test) => (
                <MenuItem key={test.id} value={test.id}>
                  {test.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            onClick={moveItToTest}
            sx={{ mt: 1 }}
            variant="contained"
            color="secondary"
          >
            Move it
          </Button>

          <Divider sx={{ my: 3 }} />
        </Box>
      )}

      {tests.length === 0 && (
        <Box>
          <Typography
            variant="body2"
            color="textSecondary"
            align="center"
            sx={{ mb: 2 }}
          >
            Tests are empty. You can create test mock data and default mock data
            with a single click.
          </Typography>
          <Button
            onClick={initiateRecordedMocks}
            variant="outlined"
            color="success"
            fullWidth
          >
            Initiate
          </Button>
        </Box>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MockMover;
