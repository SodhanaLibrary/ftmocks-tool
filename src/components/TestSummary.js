import React, { useState, useEffect } from 'react';
import { Box, List, ListItem, ListItemText, Typography, TextField, Drawer } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export default function Tests() {
  const [testCases, setTestCases] = useState([]);
  
  const fetchTestData = async () => {
    try {
      const response = await fetch('/api/v1/tests');
      if (!response.ok) {
        throw new Error('Failed to fetch test data');
      }
      const data = await response.json();
      setTestCases(data);
    } catch (error) {
      console.error('Error fetching test data:', error);
      // Handle the error appropriately, e.g., show an error message to the user
    }
  };

  useEffect(() => {
    fetchTestData();
  }, []);

  
  return (
    <Box sx={{ flexGrow: 1, p: 3, pt: 0, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1, margin: 'auto', mt: 20, justifyContent: 'center' }}>
        <Box sx={{ p: 2, border: 1, borderColor: 'divider', boxShadow: 1, width: '300px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Test Cases
            </Typography>
            <Box>{testCases.length}</Box>
          </Box>
        </Box>
        <Box sx={{ p: 2, border: 1, borderColor: 'divider', boxShadow: 1, width: '300px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Default Mock Data
            </Typography>
            <Box>{testCases.length}</Box>
          </Box>
        </Box>
    </Box>
  );

}
