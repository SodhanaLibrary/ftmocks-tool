import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';

const MockDataByUserInput = ({ selectedTest }) => {
  const [text, setText] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
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

  return (
    <Box sx={{ width: '100%', margin: '0 auto', textAlign: 'left', mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Enter Text
      </Typography>

      <TextField
        label="Enter your text here"
        multiline
        rows={10}
        variant="outlined"
        fullWidth
        value={text}
        onChange={(e) => setText(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Button variant="contained" color="primary" onClick={handleSubmit}>
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
          severity="success"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MockDataByUserInput;
