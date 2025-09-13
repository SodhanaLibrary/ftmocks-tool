import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  TextField,
  Drawer,
  Chip,
  Tooltip,
  IconButton,
  Divider,
  Button,
} from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

import {
  generatePlaywrightCode,
  generateRTLCode,
  nameToFolder,
} from './CodeUtils';

export default function RecordedEventsData({
  selectedTest,
  recordingStatus,
  envDetails,
  recordEvents,
  playwrightCodeGen,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [erroe, setError] = useState(null);
  const [recordedEvents, setRecordedEvents] = useState([]);
  const [testsSummary, setTestsSummary] = useState([]);
  const [genCode, setGenCode] = useState('');
  const [genCodeType, setGenCodeType] = useState(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [generateCodeAnchorEl, setGenerateCodeAnchorEl] = useState(null);
  const [showEvents, setShowEvents] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchRecordedEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/v1/recordedEvents?${selectedTest?.name ? `name=${selectedTest.name}` : ''}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch default mocks');
      }
      const data = await response.json();
      setRecordedEvents(data);

      if (data.length > 0) {
        const url = data.find((event) => event.type === 'url').target;
        setCurrentUrl(url);
      }

      const resp = await fetch('/api/v1/testsSummary');
      if (!resp.ok) {
        throw new Error('Failed to fetch tests summary');
      }
      const dataTestsSummary = await resp.json();
      setTestsSummary(dataTestsSummary);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTextAsFile = () => {
    // Create a Blob object with the text
    const blob = new Blob([JSON.stringify(recordedEvents, null, 2)], {
      type: 'text/plain',
    });

    // Create a URL for the Blob object
    const url = URL.createObjectURL(blob);

    // Create a temporary <a> element
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ftmocks-events.json'; // Set the filename for the download
    document.body.appendChild(a); // Append the <a> to the DOM
    a.click(); // Trigger the download
    document.body.removeChild(a); // Remove the <a> from the DOM

    // Revoke the Blob URL to free up memory
    URL.revokeObjectURL(url);
  };

  const deleteAll = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/v1/deleteAllEvents?${selectedTest?.name ? `name=${selectedTest.name}` : ''}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch default mocks');
      }
      await response.json();
      fetchRecordedEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  function copyToClipboard() {
    navigator.clipboard
      .writeText(genCode)
      .then(() => {
        console.log('Text copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  }

  const genRTLCode = () => {
    setGenCode(generateRTLCode(recordedEvents, testsSummary, selectedTest));
    setGenCodeType('rtl');
    setShowEvents(false);
    setGenerateCodeAnchorEl(null);
  };

  const genPlayWriteCode = () => {
    setGenCode(
      generatePlaywrightCode(
        recordedEvents,
        testsSummary,
        selectedTest,
        envDetails
      )
    );
    setGenCodeType('playwright');
    setShowEvents(false);
    setGenerateCodeAnchorEl(null);
  };

  useEffect(() => {
    fetchRecordedEvents();

    if (recordingStatus) {
      const interval = setInterval(() => {
        if (recordingStatus) {
          fetchRecordedEvents();
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [recordingStatus]);

  const handleGenerateCodeClick = (event) => {
    setGenerateCodeAnchorEl(event.currentTarget);
  };

  const handleGenerateCodeClose = () => {
    setGenerateCodeAnchorEl(null);
  };

  const deleteEvent = async (recordedEvent) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/v1/recordedEvents/${recordedEvent.id}?name=${selectedTest.name}`,
        { method: 'DELETE' }
      );
      if (!response.ok) {
        throw new Error('Failed to delete event');
      }
      await response.json();
      fetchRecordedEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const editEvent = (recordedEvent) => {
    setSelectedEvent(recordedEvent);
  };

  const saveFile = async () => {
    const saveData = {
      generatedCode: genCode,
      fileName: `${nameToFolder(selectedTest?.name).toLowerCase()}.${genCodeType === 'playwright' ? 'spec.js' : 'test.js'}`,
    };

    try {
      const response = await fetch('/api/v1/code/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveData),
      });

      if (!response.ok) {
        throw new Error('Failed to save file');
      }

      const result = await response.json();
      console.log('File saved successfully:', result);
    } catch (error) {
      console.error('Error saving file:', error);
      setError(error.message);
    }
  };

  const playTest = async () => {
    const response = await fetch(`/api/v1/code/runTest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        testName: selectedTest.name,
        fileName: `${nameToFolder(selectedTest?.name).toLowerCase()}.${genCodeType === 'playwright' ? 'spec.js' : 'test.js'}`,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to play test');
    }
    const data = await response.json();
    console.log(data);
  };

  return (
    <Box width="100%">
      {showEvents && (
        <Box p={2}>
          <Box
            p={1}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            width="100%"
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h5">Events Data</Typography>
              <Button
                variant="contained"
                onClick={handleGenerateCodeClick}
                endIcon={<ArrowDropDownIcon />}
                sx={{ ml: 2 }}
              >
                Generate Code
              </Button>
              <Menu
                anchorEl={generateCodeAnchorEl}
                open={Boolean(generateCodeAnchorEl)}
                onClose={handleGenerateCodeClose}
              >
                <MenuItem onClick={genRTLCode}>Generate RTL Code</MenuItem>
                <MenuItem onClick={genPlayWriteCode}>
                  Generate Playwright Code
                </MenuItem>
              </Menu>
            </Box>
            <Box>
              <IconButton onClick={downloadTextAsFile}>
                <CloudDownloadIcon />
              </IconButton>
              <IconButton onClick={deleteAll}>
                <DeleteSweepIcon />
              </IconButton>
            </Box>
          </Box>
          <Divider />
          <List>
            {recordedEvents.map((re, index) => (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  gap: 1,
                  '& .action-buttons': {
                    display: 'none',
                  },
                  '&:hover .action-buttons': {
                    display: 'flex',
                  },
                }}
                p={1}
                key={re.id}
                onClick={() => editEvent(re)}
              >
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body1">
                    {re.type} ({re.target})
                  </Typography>
                  <Typography variant="body2">{re.time}</Typography>
                </Box>
                <Box className="action-buttons">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      editEvent(re);
                    }}
                    aria-label="edit"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteEvent(re);
                    }}
                    aria-label="delete"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </List>
          <Box sx={{ textAlign: 'center' }}>
            {!recordedEvents.length ? 'No events recorded' : null}
          </Box>
          {recordedEvents.length > 0 && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                onClick={() => recordEvents(currentUrl)}
                variant="contained"
              >
                Record Events Again
              </Button>
            </Box>
          )}
        </Box>
      )}
      {!showEvents && (
        <Box
          width="100%"
          p={2}
          sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
        >
          <Box
            p={1}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center" gap={1}>
              <IconButton color="primary" onClick={() => setShowEvents(true)}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h5">Generated Code</Typography>
            </Box>
            <Box>
              <Tooltip title="Run Test">
                <IconButton onClick={playTest} sx={{ mr: 1 }}>
                  <PlayArrowIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Save File">
                <IconButton onClick={saveFile} sx={{ mr: 1 }}>
                  <SaveIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Copy to Clipboard">
                <IconButton onClick={copyToClipboard}>
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Divider />
          <Box
            p={2}
            sx={{
              textAlign: 'left',
              width: '100%',
              overflowX: 'scroll',
            }}
          >
            {genCode?.length === 0 && '-----'}
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
              {genCode}
            </pre>
            {genCodeType === 'playwright' && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  or you can Run playwright codegen to generate the code
                </Typography>
                <Button
                  sx={{ mt: 1 }}
                  onClick={playwrightCodeGen}
                  variant="outlined"
                >
                  Run playwright codegen
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      )}
      {/* Edit Event Modal */}
      <Drawer
        anchor="right"
        open={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        sx={{
          '& .MuiDrawer-paper': {
            width: '50%',
            p: 2,
          },
        }}
      >
        {selectedEvent && (
          <Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <Typography variant="h6">Edit Event</Typography>
              <IconButton onClick={() => setSelectedEvent(null)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Box
              component="form"
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <TextField
                select
                label="Type"
                value={selectedEvent.type || ''}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, type: e.target.value })
                }
                fullWidth
              >
                <MenuItem value="click">Click</MenuItem>
                <MenuItem value="hover">Hover</MenuItem>
                <MenuItem value="input">Input</MenuItem>
                <MenuItem value="submit">Submit</MenuItem>
                <MenuItem value="url">URL</MenuItem>
                <MenuItem value="keydown">Key Down</MenuItem>
                <MenuItem value="change">Change</MenuItem>
              </TextField>

              <TextField
                label="Target"
                value={selectedEvent.target || ''}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, target: e.target.value })
                }
                fullWidth
              />

              <TextField
                label="Value"
                value={selectedEvent.value || ''}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, value: e.target.value })
                }
                fullWidth
              />

              <Box display="flex" mt={2}>
                <Box display="flex" gap={1} width="50%">
                  <Button
                    variant="contained"
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        const response = await fetch(
                          `/api/v1/recordedEvents/${selectedEvent.id}?name=${selectedTest.name}`,
                          {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              ...selectedEvent,
                              type: selectedEvent.type,
                              target: selectedEvent.target,
                              value: selectedEvent.value,
                            }),
                          }
                        );
                        if (!response.ok) {
                          throw new Error('Failed to update event');
                        }
                        await response.json();
                        fetchRecordedEvents();
                        setSelectedEvent(null);
                      } catch (err) {
                        setError(err.message);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    fullWidth
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setSelectedEvent(null)}
                    fullWidth
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
