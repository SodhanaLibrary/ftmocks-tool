import React, { useState } from 'react';
import { Button, Typography, Box, CircularProgress, Tabs, Tab } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Divider from '@mui/material/Divider';
import { Checkbox, FormControlLabel } from '@mui/material';

const MockDataCreator = ({ selectedTest, onClose }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [avoidDuplicates, setAvoidDuplicates] = useState(true);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleChange = (event) => {
    setAvoidDuplicates(event.target.checked);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus('Please select a HAR file first.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Uploading...');

    const formData = new FormData();
    formData.append('harFile', file);
    formData.append('avoidDuplicates', avoidDuplicates);
    if(selectedTest?.name) {
      formData.append('testName', selectedTest?.name);
    }
    let endpoint =  selectedTest ? `/api/v1/tests/${selectedTest.id}/harMockdata` : '/api/v1/defaultHarMocks';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadStatus('HAR file uploaded and processed successfully!');
      } else {
        const errorData = await response.json();
        setUploadStatus(`Upload failed: ${errorData.error}`);
      }
    } catch (error) {
      setUploadStatus(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const renderHARfileSection = () => (<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, pt: 6 }}>
        <Typography variant="h6">Upload HAR File</Typography>
        {selectedTest && <FormControlLabel
          control={
            <Checkbox
              checked={avoidDuplicates}
              onChange={handleChange}
              color="primary"
            />
          }
          label="Do not create a mock, if it is already in default mock data"
        />}
        <input
            accept=".har"
            style={{ display: 'none' }}
            id="raised-button-file"
            type="file"
            onChange={handleFileChange}
        />
        <label htmlFor="raised-button-file">
            <Button variant="contained" component="span" startIcon={<CloudUploadIcon />}>
            Choose HAR File
            </Button>
        </label>
        {file && <Typography variant="body2">{file.name}</Typography>}
        <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={!file || isUploading}
        >
            Upload and Process
        </Button>
        {isUploading && <CircularProgress />}
        {uploadStatus && <Typography color={uploadStatus.includes('failed') ? 'error' : 'success'}>{uploadStatus}</Typography>}
    </Box>);

  const renderByUserInput = () => (<Box>Users input</Box>);

  const renderFromDefaultMocks = () => (<Box>Default mocks</Box>);

  return (
    <Box sx={{ width: 600, pl: 3, pr: 3, pt: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Typography variant="h6" gutterBottom>
                Create New Mock Data
            </Typography>
            <IconButton onClick={onClose} aria-label="close">
                <CloseIcon />
            </IconButton>
        </Box>
        <Divider />
        <Tabs value={selectedTab} onChange={(e, val) => setSelectedTab(val)} aria-label="basic tabs example">
          <Tab label="HAR Uploader" />
          <Tab label="By User Input"/>
          {selectedTest && <Tab label="From Default Mocks"/>}
        </Tabs>
        {selectedTab === 0 && renderHARfileSection()}
        {selectedTab === 1 && renderByUserInput()}
        {selectedTab === 2 && selectedTest && renderFromDefaultMocks()}
    </Box>
  );
};

export default MockDataCreator;
