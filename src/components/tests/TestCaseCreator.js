import React, { useState } from 'react';
import { Box, TextField, Button, Typography, IconButton, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';


const TestCaseCreator = ({ onClose }) => {
  const [testName, setTestName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/v1/tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: testName }),
      });

      if (!response.ok) {
        throw new Error('Failed to create test case');
      }

      const data = await response.json();
      console.log('Test case created:', data);
      onClose();
    } catch (error) {
      console.error('Error creating test case:', error);
    }
  };

  return (
    <Box sx={{ p: 2, width: '400px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Create New Test Case
        </Typography>
        <IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ my: 2 }} />
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Test Case Name"
          variant="outlined"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          margin="normal"
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
        >
          Create Test Case
        </Button>
      </form>
    </Box>
  );
};

export default TestCaseCreator;
