import React, { useEffect, useState } from 'react';
import {
  Autocomplete,
  Button,
  CircularProgress,
  TextField,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import Snackbar from '@mui/material/Snackbar';

const DefaultMockDataDuplicate = ({ selectedTest }) => {
  const [mockData, setMockData] = useState([]);
  const [selectedMock, setSelectedMock] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Fetch mock data
  const fetchDefaultMocks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/v1/defaultmocks');
      if (!response.ok) {
        throw new Error('Failed to fetch default mocks');
      }
      const data = await response.json();
      setMockData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDefaultMocks();
  }, []);

  // Handle duplicate action
  const handleDuplicate = async () => {
    if (selectedMock) {
      const endpoint = selectedTest
        ? `/api/v1/tests/${selectedTest.id}/mockdata?name=${selectedTest.name}`
        : `/api/v1/defaultmocks`;
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(selectedMock.mockData),
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
    } else {
      alert('Please select a mock item to duplicate');
    }
  };

  return (
    <Box sx={{ width: '100%', margin: '0 auto', textAlign: 'left', mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Select Mock Data to Duplicate
      </Typography>

      {isLoading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Autocomplete
          options={mockData}
          getOptionLabel={(option) => `${option.method} - ${option.url}`}
          onChange={(event, newValue) => setSelectedMock(newValue)}
          renderInput={(params) => (
            <TextField {...params} label="Mock Data" variant="outlined" />
          )}
          sx={{ mb: 2 }}
        />
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleDuplicate}
        disabled={!selectedMock}
      >
        Import
      </Button>
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

export default DefaultMockDataDuplicate;
