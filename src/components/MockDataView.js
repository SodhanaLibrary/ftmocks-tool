import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, IconButton, Divider, Button, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PropTypes from 'prop-types';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const MockDataView = ({ mockItem, onClose, selectedTest }) => {
  const [mockData, setMockData] = useState(mockItem);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [ipInputValue, setIpInputValue] = useState('');

  useEffect(() => {
    if(mockItem) {
      try {
        mockItem.response.content = JSON.stringify(JSON.parse(mockItem.response.content), null, 2);
        setMockData({...mockItem});
      } catch(e) {
        // 
      }
    }
  }, [mockItem]);

  const onDelete = async () => {
    const endpoint = selectedTest ? `/api/v1/tests/${selectedTest.id}/mockdata/${mockItem.id}` : `/api/v1/defaultmocks/${mockItem.id}`;
    await fetch(endpoint, { 
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).then(response => {
      if (response.ok) {
        console.log('Mock data deleted successfully');
      } else {
        console.error('Failed to delete mock data');
      }
    }).catch(error => {
      console.error('Error deleting mock data:', error);
    });
    onClose(true);
  };

  const onUpdate = async () => {
    const endpoint = selectedTest ? `/api/v1/tests/${selectedTest.id}/mockdata/${mockItem.id}` : `/api/v1/defaultmocks/${mockItem.id}`;
    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(mockData)
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

  const onContentChange = (event) => {
    try {
      const parsedContent = event.target.value;
      setMockData({ ...mockData, response: { ...mockData.response, content: parsedContent } });
    } catch (error) {
      console.error('Invalid JSON content:', error);
    }
  };  

  const onDataChange = (event) => {
    try {
      setMockData(JSON.parse(event.target.value));
    } catch (error) {
      console.error('Invalid JSON data:', error);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleDelete = (chipToDelete) => () => {
    const newChips = mockData.ignoreParams.filter((chip) => chip !== chipToDelete);
    setMockData({ ...mockData, ignoreParams: newChips });
  };

  const addChip = (chip) => {
    if (chip && !mockData.ignoreParams?.includes(chip)) {
      setMockData({ ...mockData, ignoreParams: [ ...(mockData.ignoreParams || []), chip ] });
      setIpInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addChip(ipInputValue.trim());
    }
  };

  if (!mockItem) return null;

  return (
    <Box sx={{ minWidth: 700, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Mock Item Details
        </Typography>
        <Box>
        {selectedTest && (<IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>)}
        <Tooltip title="Delete">
            <IconButton onClick={onDelete} aria-label="delete">
              <DeleteIcon color="secondary" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Divider />
      <TextField
        label="URL"
        fullWidth
        margin="normal"
        value={mockData.url}
        inputProps={{
          readOnly: true,
        }}
      />
      <TextField
        label="Method"
        fullWidth
        margin="normal"
        value={mockData.method}
        inputProps={{
          readOnly: true,
        }}
      />
      <TextField
        label="Response Type"
        fullWidth
        margin="normal"
        value={mockData.response.headers['content-type']}
        inputProps={{
          readOnly: true,
        }}
      />
      <Box sx={{width: '100%', display: 'flex', gap: 1, alignItems: 'center'}}>
        <Box>
          {mockData.ignoreParams?.map((chip, index) => (
            <Chip
              key={index}
              label={chip}
              onDelete={handleDelete(chip)}
              sx={{ margin: '4px' }}
            />
          ))}
        </Box>

        <TextField
          value={ipInputValue}
          fullWidth
          onChange={(e) => setIpInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type and press Enter or Comma"
          margin="normal"
          label="Ignore Parameters"
        />
      </Box>
      <TextField
        label="Mock Data"
        fullWidth
        multiline
        rows={8}
        margin="normal"
        value={mockData.response.content}
        onChange={onContentChange}
      />
      <TextField
        label="Full Mock Data"
        fullWidth
        multiline
        rows={8}
        margin="normal"
        value={JSON.stringify(mockData, null, 2)}
        onChange={onDataChange}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={onUpdate}
        style={{ marginTop: '16px' }}
      >
        Update Mock Data
      </Button>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

MockDataView.propTypes = {
  onClose: PropTypes.func,
  mockItem: PropTypes.shape({
    url: PropTypes.string.isRequired,
    method: PropTypes.string.isRequired,
    response: PropTypes.shape({
      headers: PropTypes.shape({
        'content-type': PropTypes.string.isRequired
      }).isRequired,
      content: PropTypes.string.isRequired
    }).isRequired
  }).isRequired,
  selectedTest: PropTypes.shape({
    id: PropTypes.string.isRequired
  })
};

MockDataView.defaultProps = {
  onClose: null,
  mockItem: {
    url: '',
    method: '',
    response: {
      headers: {
        'content-type': ''
      },
      content: '{}'
    }
  },
  selectedTest: null
};




export default MockDataView;
