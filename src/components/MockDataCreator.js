import React, { useState } from 'react';
import {
  Button,
  Typography,
  Box,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Divider from '@mui/material/Divider';
import { useDropzone } from 'react-dropzone';
import { Checkbox, FormControlLabel } from '@mui/material';
import DefaultMockDataDuplicate from './tests/DefaultMockDataDuplicate';
import MockDataByUserInput from './common/MockDataByUserInput';

const MockDataCreator = ({ selectedTest, onClose }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [avoidDuplicates, setAvoidDuplicates] = useState(true);

  const onDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        '.har': [],
        '.json': [], // Accept Postman collections (typically .json)
      }, // Accept HAR and Postman collection files
      multiple: false, // Allow only single file
    });

  const handleChange = (event) => {
    setAvoidDuplicates(event.target.checked);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus('Please select a HAR or Postman collection file first.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Uploading...');

    const formData = new FormData();
    formData.append(
      file.type === 'application/json' ? 'postmanFile' : 'harFile',
      file
    );
    formData.append('avoidDuplicates', avoidDuplicates);
    if (selectedTest?.name) {
      formData.append('testName', selectedTest?.name);
    }
    let endpoint = null;

    if (file.type === 'application/json') {
      if (selectedTest) {
        endpoint = `/api/v1/tests/${selectedTest.id}/postmanMockdata`;
      } else {
        endpoint = '/api/v1/defaultPostmanMocks';
      }
    } else {
      endpoint = selectedTest
        ? `/api/v1/tests/${selectedTest.id}/harMockdata`
        : '/api/v1/defaultHarMocks';
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadStatus(
          'HAR file or Postman collection file uploaded and processed successfully!'
        );
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

  const renderHARfileSection = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 2,
        pt: 6,
      }}
    >
      <Typography variant="h6">
        Upload HAR or Postman Collection File
      </Typography>
      {selectedTest && (
        <FormControlLabel
          control={
            <Checkbox
              checked={avoidDuplicates}
              onChange={handleChange}
              color="primary"
            />
          }
          label="Do not create a mock, if it is already in default mock data"
        />
      )}
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragReject ? 'error.main' : 'primary.main',
          borderRadius: 2,
          padding: 4,
          textAlign: 'center',
          backgroundColor: isDragActive ? 'action.hover' : 'background.default',
          cursor: 'pointer',
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <Typography variant="h6" color="primary">
            Drop the the file here...
          </Typography>
        ) : (
          <Typography variant="h6">
            Drag & drop a HAR file or Postman collection file here, or click to
            select one
          </Typography>
        )}
        <Button variant="outlined" sx={{ mt: 2 }}>
          Choose the file
        </Button>
      </Box>
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
      {uploadStatus && (
        <Typography
          color={uploadStatus.includes('failed') ? 'error' : 'success'}
        >
          {uploadStatus}
        </Typography>
      )}
    </Box>
  );

  const renderByUserInput = () => (
    <MockDataByUserInput selectedTest={selectedTest} />
  );

  const renderFromDefaultMocks = () => (
    <DefaultMockDataDuplicate selectedTest={selectedTest} />
  );

  return (
    <Box sx={{ width: 600, pl: 3, pr: 3, pt: 1 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Create New Mock Data
        </Typography>
        <IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <Tabs
        value={selectedTab}
        onChange={(e, val) => setSelectedTab(val)}
        aria-label="basic tabs example"
      >
        <Tab label="Uploader" />
        <Tab label="By User Input" />
        {selectedTest && <Tab label="From Default Mocks" />}
      </Tabs>
      {selectedTab === 0 && renderHARfileSection()}
      {selectedTab === 1 && renderByUserInput()}
      {selectedTab === 2 && selectedTest && renderFromDefaultMocks()}
    </Box>
  );
};

export default MockDataCreator;
