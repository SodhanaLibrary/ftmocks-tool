import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const TestCaseCreator = ({ onClose, selectedTest }) => {
  const [testName, setTestName] = useState(
    selectedTest ? selectedTest.name : ''
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = selectedTest
        ? `/api/v1/tests/${selectedTest.id}`
        : '/api/v1/tests';
      const response = await fetch(endpoint, {
        method: selectedTest ? 'PUT' : 'POST',
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
      onClose(true);
    } catch (error) {
      console.error('Error creating test case:', error);
    }
  };

  return (
    <Box sx={{ p: 2, width: '400px' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Typography variant="h6" gutterBottom>
          {selectedTest ? 'Edit Test Case' : 'Create New Test Case'}
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
          {selectedTest ? 'Update Test Case' : 'Create Test Case'}
        </Button>
      </form>
    </Box>
  );
};

export default TestCaseCreator;
