import React, { useState, useEffect } from 'react';
import {
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Box,
  Typography,
  List,
  ListItem,
  IconButton,
  ListItemText,
} from '@mui/material';
import UpdateIcon from '@mui/icons-material/Update';
import CloseIcon from '@mui/icons-material/Close';
import { v4 as uuidv4 } from 'uuid';

const DefaultOptimizer = ({ onClose, mockData = [] }) => {
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [duplicateIdMocks, setDuplicateIdMocks] = useState([]);
  const unusedMocks = mockData.filter((mock) => !mock?.mockData?.served);
  const usedMocks = mockData.filter((mock) => mock?.mockData?.served);

  const moveDefaultMocks = async () => {
    setLoading(true);
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
      onClose();
    }
  };

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

  const updateDuplicateIds = async () => {
    // Generate new uuids, assign to mocks, and call update
    if (duplicateIdMocks.length === 0) return;

    setLoading(true);
    try {
      const updatePromises = duplicateIdMocks.map(async (mock) => {
        const newId = uuidv4();
        // Call update endpoint with new id for the mock
        const response = await fetch(`/api/v1/defaultmocks/${mock.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ ...mock, id: newId }),
        });
        return response.ok;
      });

      const results = await Promise.all(updatePromises);

      if (results.every(Boolean)) {
        setSnackbarMessage('Duplicate mock IDs updated successfully');
        setSnackbarOpen(true);
        if (onClose) {
          await onClose();
        }
      } else {
        setSnackbarMessage('Failed to update some duplicate mock IDs');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error updating duplicate mock IDs:', error);
      setSnackbarMessage('Error updating duplicate mock IDs');
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

  useEffect(() => {
    const idCount = {};
    mockData.forEach((mock) => {
      idCount[mock.id] = (idCount[mock.id] || 0) + 1;
    });
    const dupIdMocks = mockData.filter((mock) => idCount[mock.id] > 1);
    setDuplicateIdMocks(dupIdMocks);
  }, [mockData]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={2}
      p={3}
      sx={{ width: '500px', margin: '0 auto', textAlign: 'left' }}
    >
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h6" gutterBottom>
          Default Optimizer
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
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
      {duplicateIdMocks.length > 0 && (
        <Box>
          <hr />
          <Box sx={{ p: 0, pt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Duplicate ID Mocks:
            </Typography>
          </Box>
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {duplicateIdMocks.map((mock, index) => (
              <ListItem key={index}>
                <ListItemText primary={mock.id} />
              </ListItem>
            ))}
          </List>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<UpdateIcon />}
            onClick={updateDuplicateIds}
            disabled={loading}
            sx={{ mt: 1 }}
          >
            Update Duplicate ID Mocks with new ID
          </Button>
        </Box>
      )}
      {loading && <CircularProgress size={24} />}
      <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <hr />
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
          Move Default Mocks to Tests
        </Button>
      </Box>
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
