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

const MockMover = ({ mockItem, onClose }) => {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);

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
      <Button variant="contained" color="primary" fullWidth>
        Move It To Default Mock Data
      </Button>

      <Divider sx={{ my: 2 }} />

      <Typography align="center" variant="subtitle1" sx={{ my: 1 }}>
        OR
      </Typography>

      <Divider sx={{ my: 2 }} />

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
            <MenuItem key={test.id} value={test.name}>
              {test.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button sx={{ mt: 1 }} variant="contained" color="secondary">
        Move it
      </Button>

      {/* Divider */}
      <Divider sx={{ my: 3 }} />

      {/* Info Text */}
      <Typography
        variant="body2"
        color="textSecondary"
        align="center"
        sx={{ mb: 2 }}
      >
        Default mock data and tests are empty. Now you can create them with a
        single click.
      </Typography>

      {/* Initiate Button */}
      <Button variant="outlined" color="success" fullWidth>
        Initiate
      </Button>
    </Box>
  );
};

export default MockMover;
