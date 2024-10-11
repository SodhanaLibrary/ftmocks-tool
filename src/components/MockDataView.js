import React from 'react';
import { Box, Typography, TextField, IconButton, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const MockDataView = ({ mockItem, onClose }) => {
  if (!mockItem) return null;

  return (
    <Box sx={{ width: 700, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Mock Item Details
        </Typography>
        <IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <TextField
        label="URL"
        fullWidth
        margin="normal"
        value={mockItem.url}
        InputProps={{
          readOnly: true,
        }}
      />
      <TextField
        label="Method"
        fullWidth
        margin="normal"
        value={mockItem.method}
        InputProps={{
          readOnly: true,
        }}
      />
      <TextField
        label="Response Type"
        fullWidth
        margin="normal"
        value={mockItem.responseType}
        InputProps={{
          readOnly: true,
        }}
      />
      <TextField
        label="Mock Data"
        fullWidth
        multiline
        rows={4}
        margin="normal"
        value={JSON.stringify(mockItem.mockData, null, 2)}
      />
      <TextField
        label="Full Mock Data"
        fullWidth
        multiline
        rows={8}
        margin="normal"
        value={JSON.stringify(mockItem, null, 2)}
      />
    </Box>
  );
};

export default MockDataView;
