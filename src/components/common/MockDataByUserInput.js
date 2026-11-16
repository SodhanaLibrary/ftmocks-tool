import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';

const MockDataByUserInput = ({ selectedTest }) => {
  const [text, setText] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSubmit = async () => {
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
        body: text,
      });

      if (response.ok) {
        console.log('Mock data updated successfully');
        showSnackbar('Mock data updated successfully');
      } else {
        console.error('Failed to update mock data');
        showSnackbar('Failed to update mock data', 'error');
      }
    } catch (error) {
      console.error('Error updating mock data:', error);
      showSnackbar('Error updating mock data', 'error');
    }
  };

  return (
    <Box sx={{ width: '100%', margin: '0 auto', textAlign: 'left', mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Enter Text
      </Typography>

      <TextField
        id="mock-data-by-user-input-text"
        label="Enter your text here"
        multiline
        rows={10}
        variant="outlined"
        fullWidth
        value={text}
        onChange={(e) => setText(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Button id="mock-data-by-user-input-submit-btn" variant="contained" color="primary" onClick={handleSubmit}>
        Submit
      </Button>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MockDataByUserInput;
