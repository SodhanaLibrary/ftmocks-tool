import React, { useState } from 'react';
import { Button, Typography, Box, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Divider from '@mui/material/Divider';

const MockDataCreator = ({ selectedTest, onClose }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
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

  return (
    <Box sx={{ width: 400, pl: 3, pr: 3, pt: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Typography variant="h6" gutterBottom>
                Create New Mock Data
            </Typography>
            <IconButton onClick={onClose} aria-label="close">
                <CloseIcon />
            </IconButton>
        </Box>
        <Divider />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 6 }}>
        <Typography variant="h6">Upload HAR File</Typography>
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
        </Box>
    </Box>
  );
};

export default MockDataCreator;
