import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Divider,
  Button,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PropTypes from 'prop-types';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import UploadIcon from '@mui/icons-material/Upload';
import Alert from '@mui/material/Alert';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Popover from '@mui/material/Popover'

const MockDataView = ({
  mockItem,
  onClose,
  selectedTest,
  recordedMock,
  onClickUpload,
}) => {
  const [mockData, setMockData] = useState(mockItem);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [ipInputValue, setIpInputValue] = useState('');

  useEffect(() => {
    if (mockItem) {
      try {
        mockItem.response.content = mockItem.response.content
          ? JSON.stringify(JSON.parse(mockItem.response.content), null, 2)
          : '';
        setMockData({ ...mockItem });
      } catch (e) {
        setMockData({ ...mockItem });
        console.log(e);
      }
    }
  }, [mockItem]);

  const onDelete = async () => {
    const endpoint = selectedTest
      ? `/api/v1/tests/${selectedTest.id}/mockdata/${mockItem.id}?name=${selectedTest.name}`
      : `/api/v1/${!recordedMock ? 'defaultmocks' : 'recordedMocks'}/${mockItem.id}`;
    await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          console.log('Mock data deleted successfully');
        } else {
          console.error('Failed to delete mock data');
        }
      })
      .catch((error) => {
        console.error('Error deleting mock data:', error);
      });
    onClose(true);
  };

  const onUpdate = async () => {
    const endpoint = selectedTest
      ? `/api/v1/tests/${selectedTest.id}/mockdata/${mockItem.id}?name=${selectedTest.name}`
      : `/api/v1/${!recordedMock ? 'defaultmocks' : 'recordedMocks'}/${mockItem.id}`;
    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(mockData),
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
      setMockData({
        ...mockData,
        response: { ...mockData.response, content: parsedContent },
      });
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
    const newChips = mockData.ignoreParams.filter(
      (chip) => chip !== chipToDelete
    );
    setMockData({ ...mockData, ignoreParams: newChips });
  };

  const addChip = (chip) => {
    if (chip && !mockData.ignoreParams?.includes(chip)) {
      setMockData({
        ...mockData,
        ignoreParams: [...(mockData.ignoreParams || []), chip],
      });
      setIpInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addChip(ipInputValue.trim());
    }
  };

  const onInputChange = (e) => {
    if (e.target.name === 'waitForPrevious') {
      mockData[e.target.name] = e.target.checked;
    } else {
      mockData[e.target.name] = e.target.value;
    }
    setMockData({ ...mockData });
  };

  const ignoreForAll = async chip => {
    const response = await fetch('/api/v1/ignoreForAll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        param: chip,
        testName: selectedTest.name,
      }, null, 2),
    });
    if (response.ok) {
      setSnackbarMessage('Mock data updated successfully');
      setSnackbarOpen(true);
      onClose(true);
    } else {
      setSnackbarMessage('Failed to update mock data');
      setSnackbarOpen(true);
    }
  };

  const duplicateMockData = async () => {
    const endpoint = selectedTest
      ? `/api/v1/tests/${selectedTest.id}/mockdata?name=${selectedTest.name}`
      : `/api/v1/${!recordedMock ? 'defaultmocks' : 'recordedMocks'}`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(mockData, null, 2),
      });

      if (response.ok) {
        setSnackbarMessage('Mock data duplicated successfully');
        setSnackbarOpen(true);
        onClose();
      } else {
        setSnackbarMessage('Failed to duplicate mock data');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error updating mock data:', error);
      setSnackbarMessage('Error updating mock data');
      setSnackbarOpen(true);
    }
  };

  if (!mockItem) return null;

  return (
    <Box
      sx={{
        minWidth: 700,
        p: 2,
        maxHeight: 'calc(100vh - 80px)',
        overflowY: 'scroll',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 2,
          alignItems: 'center',
        }}
      >
        <Typography variant="h5" gutterBottom>
          Mock Item Details
        </Typography>
        <Box>
          {selectedTest && (
            <IconButton onClick={onClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          )}
          {recordedMock && (
            <Tooltip title="Move this mock to Test or Default mock data">
              <IconButton onClick={onClickUpload} aria-label="delete">
                <UploadIcon color="secondary" />
              </IconButton>
            </Tooltip>
          )}
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
      <TextField
        label="Delay (in milliseconds)"
        fullWidth
        margin="normal"
        value={mockData.delay}
        type="number"
        name="delay"
        onChange={onInputChange}
      />
      {selectedTest && (
        <FormControlLabel
          control={
            <Checkbox
              checked={mockItem.waitForPrevious}
              name="waitForPrevious"
              onChange={onInputChange}
            />
          }
          label="Wait for previous mock trigger"
        />
      )}

      <Box
        sx={{ width: '100%', display: 'flex', gap: 1, alignItems: 'center' }}
      >
        <Box>
          {mockData.ignoreParams?.map((chip, index) => (
            <Tooltip placement="right-start" title={
                <Box style={{width: 200}}> 
                   Click below for to make {chip} as Ignore Parameter for all API requests
                   <Box p={2}>
                     <Button variant='contained' onClick={() => ignoreForAll(chip)} size='small' color='primary'>Ignore for all</Button>
                   </Box>
                </Box>
              } arrow>
              <Chip
                key={index}
                label={chip}
                onDelete={handleDelete(chip)}
                sx={{ margin: '4px' }}
              />
            </Tooltip>
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
      <Box display="flex" gap={1}>
        <Button
          variant="contained"
          color="primary"
          onClick={onUpdate}
          style={{ marginTop: '16px' }}
        >
          Update Mock Data
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={duplicateMockData}
          style={{ marginTop: '16px' }}
        >
          Duplicate
        </Button>
      </Box>
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

MockDataView.propTypes = {
  onClose: PropTypes.func,
  mockItem: PropTypes.shape({
    url: PropTypes.string.isRequired,
    method: PropTypes.string.isRequired,
    response: PropTypes.shape({
      headers: PropTypes.shape({
        'content-type': PropTypes.string.isRequired,
      }).isRequired,
      content: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  selectedTest: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }),
};

MockDataView.defaultProps = {
  onClose: null,
  mockItem: {
    url: '',
    method: '',
    response: {
      headers: {
        'content-type': '',
      },
      content: '{}',
    },
  },
  selectedTest: null,
  recordedMock: false,
};

export default MockDataView;
