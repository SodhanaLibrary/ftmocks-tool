import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const TestCaseCreator = ({
  testCases,
  onClose,
  selectedTest,
  parentId,
  type = 'testcase',
}) => {
  const [testName, setTestName] = useState(
    selectedTest ? selectedTest.name : ''
  );
  const [selectedParentId, setSelectedParentId] = useState(
    selectedTest ? selectedTest.parentId || '' : parentId || ''
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
        body: JSON.stringify({
          name: testName.trim(),
          mode: selectedTest?.mode || 'moderate',
          type: type,
          parentId: selectedParentId || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create test case');
      }

      const data = await response.json();
      console.log('Test case created:', data);
      onClose(true, testName.trim());
    } catch (error) {
      console.error('Error creating test case:', error);
    }
  };

  const getErrorText = () => {
    // Ensure testName is unique (case-insensitive)
    if (
      testCases &&
      testName.trim() !== '' &&
      testCases.some(
        (test) =>
          test.name.trim().toLowerCase() === testName.trim().toLowerCase() &&
          (!selectedTest || test.id !== selectedTest.id)
      )
    ) {
      return 'Test case name must be unique';
    }
    if (testName.trim() === '') {
      return 'Test case name is required';
    }
    return '';
  };

  const getHeaderText = () => {
    if (type === 'testcase') {
      if (selectedTest) {
        return 'Edit Test Case';
      }
      return 'Create New Test Case';
    } else if (type === 'folder') {
      if (selectedTest) {
        return 'Edit Folder';
      }
      return 'Create New Folder';
    }
    return '';
  };

  const getButtonText = () => {
    if (type === 'testcase') {
      if (selectedTest) {
        return 'Update Test Case';
      }
      return 'Create Test Case';
    } else if (type === 'folder') {
      if (selectedTest) {
        return 'Update Folder';
      }
      return 'Create Folder';
    }
    return '';
  };

  const getAvailableFolders = () => {
    if (!testCases) return [];
    return testCases.filter(
      (test) => test.type === 'folder' || test.isFolder === true
    );
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
          {getHeaderText()}
        </Typography>
        <IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ my: 2 }} />
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label={type === 'folder' ? 'Folder Name' : 'Test Case Name'}
          variant="outlined"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          margin="normal"
          required
          helperText={getErrorText()}
          error={getErrorText() !== ''}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel id="parent-folder-label">
            Parent Folder (Optional)
          </InputLabel>
          <Select
            labelId="parent-folder-label"
            value={selectedParentId}
            label="Parent Folder (Optional)"
            onChange={(e) => setSelectedParentId(e.target.value)}
          >
            <MenuItem value="">
              <em>Root Level (No Folder)</em>
            </MenuItem>
            {getAvailableFolders()
              .filter((folder) => folder.id !== selectedTest?.id)
              .map((folder) => (
                <MenuItem key={folder.id} value={folder.id}>
                  📁 {folder.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={getErrorText() !== ''}
        >
          {getButtonText()}
        </Button>
      </form>
    </Box>
  );
};

export default TestCaseCreator;
