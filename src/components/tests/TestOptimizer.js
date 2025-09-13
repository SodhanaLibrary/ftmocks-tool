import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Alert,
  Snackbar,
  Chip,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import OptimizeIcon from '@mui/icons-material/TuneOutlined';

const TestOptimizer = ({
  selectedTest,
  fetchMockData,
  resetMockData,
  fetchTestData,
}) => {
  const [unusedMocks, setUnusedMocks] = useState([]);
  const [hasServedMocks, setHasServedMocks] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedTest && selectedTest.filteredMockData) {
      analyzeTestMocks();
    }
  }, [selectedTest]);

  const analyzeTestMocks = () => {
    if (!selectedTest?.filteredMockData) return;

    const mockData = selectedTest.filteredMockData;
    const servedMocks = mockData.filter((mock) => mock.served === true);
    const unservedMocks = mockData.filter((mock) => mock.served === false);

    setHasServedMocks(servedMocks.length > 0);
    setUnusedMocks(unservedMocks);
  };

  const deleteUnusedMocks = async () => {
    if (!selectedTest || unusedMocks.length === 0) return;

    setLoading(true);
    try {
      const deletePromises = unusedMocks.map((mock) =>
        fetch(
          `/api/v1/tests/${selectedTest.id}/mockdata/${mock.id}?name=${selectedTest.name}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        )
      );

      const responses = await Promise.all(deletePromises);
      const allSuccessful = responses.every((response) => response.ok);

      if (allSuccessful) {
        setSnackbarMessage(
          `Successfully deleted ${unusedMocks.length} unused mock(s)`
        );
        setSnackbarOpen(true);

        // Refresh mock data
        if (fetchMockData) {
          await fetchMockData(selectedTest);
        }
        if (resetMockData) {
          resetMockData();
        }

        // Reset state
        setUnusedMocks([]);
        setHasServedMocks(false);
      } else {
        setSnackbarMessage('Failed to delete some unused mocks');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error deleting unused mocks:', error);
      setSnackbarMessage('Error deleting unused mocks');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const updateTest = async (updatedTest) => {
    const response = await fetch(`/api/v1/tests/${selectedTest.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ name: updatedTest.name, mode: updatedTest.mode }),
    });
    if (response.ok) {
      setSnackbarMessage('Test updated successfully');
      setSnackbarOpen(true);
      fetchTestData();
    } else {
      setSnackbarMessage('Failed to update test');
      setSnackbarOpen(true);
    }
  };

  const moveDefaultMocks = async () => {
    const endpoint = `/api/v1/moveDefaultmocks`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
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
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const renderStrictMode = () => {
    return (
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedTest.mode === 'strict'}
              onChange={(e) => {
                // Update the selectedTest with the new strict value
                const updatedTest = {
                  ...selectedTest,
                  mode: e.target.checked ? 'strict' : 'moderate',
                };
                updateTest(updatedTest);
              }}
            />
          }
          label={
            <Box>
              <Typography variant="body2" fontWeight="medium">
                Strict Mode
              </Typography>
              <Typography variant="caption" color="text.secondary">
                It will make strict matching of APIs
              </Typography>
            </Box>
          }
        />
      </Box>
    );
  };

  if (!selectedTest) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Select a test case to optimize mock data
        </Typography>
      </Box>
    );
  }

  if (!hasServedMocks) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Test Optimizer
        </Typography>
        {renderStrictMode()}
        <Alert severity="info">
          No served mocks found. Run the test first to identify unused mock
          data.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <OptimizeIcon />
        Test Optimizer
      </Typography>
      {renderStrictMode()}

      {unusedMocks.length === 0 ? (
        <Alert severity="success">
          All mock data in this test has been used. No optimization needed!
        </Alert>
      ) : (
        <Box>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Found {unusedMocks.length} unused mock(s) that can be safely
            removed.
          </Alert>

          <Typography variant="subtitle1" gutterBottom>
            Unused Mock Data:
          </Typography>

          <List sx={{ maxHeight: 300, overflow: 'auto', mb: 2 }}>
            {unusedMocks.map((mock, index) => (
              <ListItem
                key={index}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  mb: 1,
                  borderRadius: 1,
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={mock.method} size="small" color="primary" />
                      <Typography variant="body2">{mock.url}</Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>

          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={deleteUnusedMocks}
            disabled={loading}
            sx={{ mt: 1 }}
          >
            {loading
              ? 'Deleting...'
              : `Delete ${unusedMocks.length} Unused Mock(s)`}
          </Button>
        </Box>
      )}

      <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Default Mock Management
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          Move default mock data to all individual tests. This will copy all
          default mocks to each test.
        </Alert>

        <Button
          variant="contained"
          color="primary"
          onClick={moveDefaultMocks}
          disabled={loading}
          sx={{ mt: 1 }}
        >
          {loading ? 'Moving...' : 'Move Default Mocks to Tests'}
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
          severity={
            snackbarMessage.includes('successfully') ? 'success' : 'error'
          }
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TestOptimizer;
