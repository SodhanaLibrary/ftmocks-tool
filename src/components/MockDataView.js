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
import Autocomplete from '@mui/material/Autocomplete';
import Popover from '@mui/material/Popover';
import {
  getDuplicateMocks,
  isMockInDefaultMocks,
  convertToValidJSON,
  isValidJSON,
} from './utils/CommonUtils';
import { FtJSON } from './utils/FtJSON';

const MockDataView = ({
  envDetails,
  mockItem,
  onClose,
  selectedTest,
  onClickUpload,
  defaultMocks,
}) => {
  const [mockData, setMockData] = useState(mockItem);
  const [mockDataString, setMockDataString] = useState();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [ipInputValue, setIpInputValue] = useState('');

  useEffect(() => {
    setMockDataString(FtJSON.stringify(mockData, null, 2));
  }, [mockData]);

  useEffect(() => {
    if (mockItem) {
      try {
        mockItem.response.content = mockItem.response.content
          ? FtJSON.stringify(FtJSON.parse(mockItem.response.content), null, 2)
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
      : `/api/v1/defaultmocks/${mockItem.id}`;
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

  const deleteDuplicate = async (mock) => {
    const endpoint = selectedTest
      ? `/api/v1/tests/${selectedTest.id}/mockdata/${mock.id}?name=${selectedTest.name}`
      : `/api/v1/defaultmocks/${mock.id}`;
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

  const deleteAllDuplicates = async () => {
    const duplicates = getDuplicateMocks(selectedTest.mockData, mockItem);
    duplicates.forEach(async (mock) => {
      await deleteDuplicate(mock);
    });
    setSnackbarMessage('All duplicates deleted successfully');
    setSnackbarOpen(true);
    onClose(true);
  };

  const onUpdate = async () => {
    const endpoint = selectedTest
      ? `/api/v1/tests/${selectedTest.id}/mockdata/${mockItem.id}?name=${selectedTest.name}`
      : `/api/v1/defaultmocks/${mockItem.id}`;
    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: FtJSON.stringify(mockData),
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
      const parsedContent = convertToValidJSON(event.target.value);
      setMockData({
        ...mockData,
        response: { ...mockData.response, content: parsedContent },
      });
    } catch (error) {
      console.error('Invalid JSON content:', error);
    }
  };

  const onPostDataChange = (event) => {
    try {
      const parsedContent = convertToValidJSON(event.target.value);
      setMockData({
        ...mockData,
        request: { ...mockData.request, postData: { text: parsedContent } },
      });
    } catch (error) {
      console.error('Invalid JSON content:', error);
    }
  };

  const onDataChange = (event) => {
    try {
      setMockDataString(event.target.value);
      setMockData(FtJSON.parse(event.target.value));
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

  const onWaitForChange = (event, newMockIds) => {
    setMockData({
      ...mockData,
      waitFor: newMockIds,
    });
  };

  const ignoreForAll = async (chip) => {
    const response = await fetch('/api/v1/ignoreForAll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: FtJSON.stringify(
        {
          param: chip,
          testName: selectedTest.name,
        },
        null,
        2
      ),
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
      : `/api/v1/defaultmocks`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: FtJSON.stringify(mockData, null, 2),
      });

      if (response.ok) {
        setSnackbarMessage('Mock data duplicated successfully');
        setSnackbarOpen(true);
        onClose();
      } else {
        setSnackbarMessage('Failed to duplicate mock data');
        setSnackbarOpen(true);
      }
      onClose(true);
    } catch (error) {
      console.error('Error updating mock data:', error);
      setSnackbarMessage('Error updating mock data');
      setSnackbarOpen(true);
    }
  };

  const copyToDefaultMockData = async () => {
    const endpoint = `/api/v1/moveMockToDefaultMocks`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: FtJSON.stringify(
          { mockIds: [mockItem.id], testName: selectedTest.name },
          null,
          2
        ),
      });
      if (response.ok) {
        setSnackbarMessage('Mock data sent to default mock data successfully');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('Failed to send mock data to default mock data');
      }
    } catch (error) {
      console.error('Error sending mock data to default mock data:', error);
      setSnackbarMessage('Error sending mock data to default mock data');
      setSnackbarOpen(true);
    }
  };

  const copyDefaultMockToAllTests = async () => {
    const endpoint = `/api/v1/moveDefaultmocks`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: FtJSON.stringify({ mockIds: [mockItem.id] }, null, 2),
      });
      if (response.ok) {
        setSnackbarMessage('Default mocks moved successfully');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('Failed to move default mocks');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error moving default mocks:', error);
      setSnackbarMessage('Error moving default mocks');
      setSnackbarOpen(true);
    } finally {
      onClose();
    }
  };

  if (!mockItem) return null;

  const enableSendToDefaultMockData =
    !mockItem.isDuplicate &&
    selectedTest &&
    !isMockInDefaultMocks(defaultMocks, mockItem);
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
      {selectedTest && (
        <Autocomplete
          multiple
          freeSolo
          options={[]}
          name="waitFor"
          value={mockData.waitFor}
          onChange={onWaitForChange}
          onInputChange={(event, newInputValue, reason) => {
            if (reason === 'input' && newInputValue.includes(',')) {
              const mockIds = newInputValue
                .split(',')
                .map((p) => p.trim())
                .filter((p) => p.length > 0);
              const existingMockIds = mockData.waitFor || [];
              const newMockIds = [...existingMockIds, ...mockIds];
              onWaitForChange(event, newMockIds);
            }
          }}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                variant="outlined"
                label={option}
                {...getTagProps({ index })}
                key={index}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              name="waitFor"
              {...params}
              label="Wait for Mocks to be served"
              placeholder="Enter mock id, then press Enter"
              margin="normal"
              fullWidth
            />
          )}
        />
      )}

      <Box
        sx={{ width: '100%', display: 'flex', gap: 1, alignItems: 'center' }}
      >
        <Box>
          {mockData.ignoreParams?.map((chip, index) => (
            <Tooltip
              placement="right-start"
              title={
                <Box style={{ width: 200 }}>
                  Click below for to make {chip} as Ignore Parameter for all API
                  requests
                  <Box p={2}>
                    <Button
                      variant="contained"
                      onClick={() => ignoreForAll(chip)}
                      size="small"
                      color="primary"
                    >
                      Ignore for all
                    </Button>
                  </Box>
                </Box>
              }
              arrow
            >
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
        error={!isValidJSON(mockData.response.content)}
        helperText={
          !isValidJSON(mockData.response.content)
            ? 'Invalid JSON'
            : 'Valid JSON'
        }
      />
      {mockData?.request?.postData?.text && (
        <TextField
          label="Post Data"
          fullWidth
          multiline
          rows={8}
          margin="normal"
          value={
            mockData?.request?.postData?.mimeType === 'application/json'
              ? FtJSON.stringify(
                  FtJSON.parse(mockData?.request?.postData?.text),
                  null,
                  2
                )
              : mockData?.request?.postData?.text
          }
          onChange={onPostDataChange}
        />
      )}
      <TextField
        label="Full Mock Data"
        fullWidth
        multiline
        rows={8}
        margin="normal"
        value={mockDataString}
        onChange={onDataChange}
        error={!isValidJSON(mockDataString)}
        helperText={
          !isValidJSON(mockDataString) ? 'Invalid JSON' : 'Valid JSON'
        }
      />
      <Box display="flex" gap={1} justifyContent="space-between">
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={onUpdate}
            style={{ marginTop: '16px' }}
            disabled={!isValidJSON(mockDataString)}
          >
            Update Mock Data
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={duplicateMockData}
            style={{ marginTop: '16px' }}
            disabled={!isValidJSON(mockDataString)}
          >
            Duplicate
          </Button>
        </Box>
        <Box display="flex" gap={1}>
          {mockItem.isDuplicate && (
            <Button
              variant="contained"
              color="secondary"
              onClick={deleteAllDuplicates}
              style={{ marginTop: '16px' }}
            >
              Delete All Duplicates
            </Button>
          )}
          {enableSendToDefaultMockData && (
            <Button
              variant="contained"
              color="secondary"
              onClick={copyToDefaultMockData}
              style={{ marginTop: '16px' }}
            >
              Copy it to Default Mock Data
            </Button>
          )}
          {!enableSendToDefaultMockData && (
            <Button
              variant="contained"
              color="secondary"
              onClick={copyDefaultMockToAllTests}
              style={{ marginTop: '16px' }}
            >
              Copy it to All Tests
            </Button>
          )}
        </Box>
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
  defaultMocks: PropTypes.array.isRequired,
  envDetails: PropTypes.object.isRequired,
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
  defaultMocks: [],
  envDetails: null,
};

export default MockDataView;
