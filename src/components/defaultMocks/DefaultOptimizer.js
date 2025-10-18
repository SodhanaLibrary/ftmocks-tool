import React, { useState } from 'react';
import {
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';

const DefaultOptimizer = ({ onClose, mockData = [] }) => {
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const unusedMocks = mockData.filter((mock) => !mock?.mockData?.served);
  const usedMocks = mockData.filter((mock) => mock?.mockData?.served);

  const resetAllMocks = async () => {
    if (usedMocks.length === 0) return;

    setLoading(true);
    try {
      const updatePromises = usedMocks.map((mock) =>
        fetch(`/api/v1/defaultmocks/${mock.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(
            Object.assign({}, mock.mockData, { served: false })
          ),
        })
      );

      const responses = await Promise.all(updatePromises);
      const allSuccessful = responses.every((response) => response.ok);

      if (allSuccessful) {
        setSnackbarMessage(
          `Successfully deleted ${unusedMocks.length} unused mock(s)`
        );
        setSnackbarOpen(true);
        // Refresh mock data
        if (onClose) {
          await onClose();
        }
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

  const deleteUnusedMocks = async () => {
    if (unusedMocks.length === 0) return;

    setLoading(true);
    try {
      const deletePromises = unusedMocks.map((mock) =>
        fetch(`/api/v1/defaultmocks/${mock.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
      );

      const responses = await Promise.all(deletePromises);
      const allSuccessful = responses.every((response) => response.ok);

      if (allSuccessful) {
        setSnackbarMessage(
          `Successfully deleted ${unusedMocks.length} unused mock(s)`
        );
        setSnackbarOpen(true);
        await resetAllMocks();
        // Refresh mock data
        if (onClose) {
          await onClose();
        }
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

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={2}
      p={3}
      sx={{ width: '500px', margin: '0 auto', textAlign: 'left' }}
    >
      <Box>
        <Typography variant="h6" gutterBottom>
          Default Optimizer
        </Typography>
      </Box>
      <Box>
        {unusedMocks.length === 0 && unusedMocks.length !== mockData.length ? (
          <Alert severity="success">
            All mock data in this test has been used. No optimization needed!
          </Alert>
        ) : (
          <Alert severity="warning">
            Found {unusedMocks.length} unused mock(s) that can be safely
            removed.
          </Alert>
        )}
      </Box>
      <Button
        variant="contained"
        color="secondary"
        onClick={deleteUnusedMocks}
        disabled={
          loading ||
          unusedMocks.length === 0 ||
          unusedMocks.length === mockData.length
        }
      >
        Delete All Unused Mocks
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={resetAllMocks}
        disabled={loading || unusedMocks.length === mockData.length}
      >
        Reset All Mocks
      </Button>
      {loading && <CircularProgress size={24} />}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="info"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DefaultOptimizer;
