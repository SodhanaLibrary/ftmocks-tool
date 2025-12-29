import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  TextField,
  Drawer,
  Tooltip,
  IconButton,
  Divider,
  Button,
} from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FiberSmartRecordIcon from '@mui/icons-material/FiberSmartRecord';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Autocomplete from '@mui/material/Autocomplete';
import AddIcon from '@mui/icons-material/Add';
import GavelOutlined from '@mui/icons-material/GavelOutlined';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import AnsiToHtml from 'ansi-to-html';

import {
  generatePlaywrightCode,
  generatePlaywrightCodeForEventsMockMode,
  generatePlaywrightCodeForRunEvents,
  generatePlaywrightCodeForRunEventsInPresentationMode,
  generatePlaywrightCodeForRunEventsInTrainingMode,
  generatePlaywrightCodeForRunEventsForScreenshots,
  generatePlaywrightCodeForRunEventsForHealingSelectors,
  generatePlaywrightCodeForMockMode,
  generateRTLCode,
  nameToFolder,
} from './CodeUtils';

const eventTypesWithValues = [
  'input',
  'change',
  'keypress',
  'url',
  'waitForTimeout',
];

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
  const [mockModeAnchorEl, setMockModeAnchorEl] = useState(null);
  const [showEvents, setShowEvents] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [testOutput, setTestOutput] = useState('');
  const [runningTest, setRunningTest] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

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
      // Show confirmation dialog before proceeding
      if (
        !window.confirm(
          'Are you sure you want to delete all recorded events? This action cannot be undone.'
        )
      ) {
        return;
      }
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
  }, [recordingStatus, selectedTest]);

  useEffect(() => {
    fetchRecordedEvents();
    setShowEvents(true);
  }, [selectedTest]);

  const handleGenerateCodeClick = (event) => {
    setGenerateCodeAnchorEl(event.currentTarget);
  };

  const handleGenerateCodeClose = () => {
    setGenerateCodeAnchorEl(null);
  };

  const handleMockModeClick = (event) => {
    setMockModeAnchorEl(event.currentTarget);
  };

  const handleMockModeClose = () => {
    setMockModeAnchorEl(null);
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

  const playTest = async (withUI = false) => {
    setRunningTest(true);
    setTestOutput(''); // Clear previous output

    try {
      const response = await fetch(`/api/v1/code/runTest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          withUI,
          testName: selectedTest.name,
          generatedCode: genCode,
          fileName: `${nameToFolder(selectedTest?.name).toLowerCase()}.${genCodeType === 'playwright' ? 'spec.js' : 'test.js'}`,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          setTestOutput((prev) => prev + chunk);
        }
      } catch (streamError) {
        console.error('Error reading stream:', streamError);
        setTestOutput(
          (prev) => prev + `\nError reading stream: ${streamError.message}`
        );
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Error running test:', error);
    }
  };

  const onBackClick = () => {
    if (runningTest) {
      setRunningTest(false);
      setTestOutput('');
    } else {
      setShowEvents(true);
    }
  };

  // Duplicates a recorded event by calling the backend API and updating the local state
  const duplicateEvent = async (eventId) => {
    if (!selectedTest?.name || !eventId) return;
    try {
      const response = await fetch(
        `/api/v1/recordedEvents/${eventId}/duplicate?name=${encodeURIComponent(selectedTest.name)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to duplicate event');
      }
      const duplicatedEvent = await response.json();
      // Insert the duplicated event after the original in the local state
      setRecordedEvents((prevEvents) => {
        const idx = prevEvents.findIndex((e) => e.id === eventId);
        if (idx === -1) return prevEvents;
        const newEvents = [...prevEvents];
        newEvents.splice(idx + 1, 0, duplicatedEvent);
        return newEvents;
      });
    } catch (error) {
      console.error('Error duplicating event:', error);
    }
  };

  // Adds an empty event by calling the backend API and updating the local state
  const addEmptyEvent = async (eventId) => {
    if (!selectedTest?.name || !eventId) return;
    try {
      const response = await fetch(
        `/api/v1/recordedEvents/${eventId}/emptyEvent?name=${encodeURIComponent(selectedTest.name)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add empty event');
      }
      const newEvent = await response.json();
      // Insert the new empty event after the original in the local state
      setRecordedEvents((prevEvents) => {
        const idx = prevEvents.findIndex((e) => e.id === eventId);
        if (idx === -1) return prevEvents;
        const newEvents = [...prevEvents];
        newEvents.splice(idx + 1, 0, newEvent);
        return newEvents;
      });
    } catch (error) {
      console.error('Error adding empty event:', error);
    }
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e, event, index) => {
    setDraggedItem({ event, index });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.dataTransfer.setDragImage(e.target, 0, 0);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = (e) => {
    // Only clear if we're leaving the entire list area
    const rect = e.currentTarget.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (!draggedItem || draggedItem.index === targetIndex) {
      setDraggedItem(null);
      return;
    }

    const sourceIndex = draggedItem.index;
    const newRecordedEvents = Array.from(recordedEvents);
    const [reorderedItem] = newRecordedEvents.splice(sourceIndex, 1);
    newRecordedEvents.splice(targetIndex, 0, reorderedItem);

    // Update local state immediately for better UX
    setRecordedEvents(newRecordedEvents);
    setDraggedItem(null);

    // Update the backend with new order
    try {
      const response = await fetch(
        `/api/v1/reorderRecordedEvents?name=${encodeURIComponent(selectedTest.name)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventIds: newRecordedEvents.map((event) => event.id),
          }),
        }
      );

      if (!response.ok) {
        // If backend update fails, revert local state
        setRecordedEvents(recordedEvents);
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reorder events');
      }
    } catch (error) {
      console.error('Error reordering events:', error);
      // Revert to original order on error
      setRecordedEvents(recordedEvents);
      setError('Failed to save new order. Changes have been reverted.');
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const recordEventsAgainInMockMode = async () => {
    setMockModeAnchorEl(null);
    setRunningTest(true);
    setTestOutput(''); // Clear previous output

    try {
      const response = await fetch(`/api/v1/code/runTest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          withUI: false,
          testName: selectedTest.name,
          generatedCode: generatePlaywrightCodeForEventsMockMode(
            recordedEvents,
            testsSummary,
            selectedTest,
            envDetails
          ),
          fileName: `__ftmocks-mock-mode-ignore-me.spec.js`,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          setTestOutput((prev) => prev + chunk);
        }
      } catch (streamError) {
        console.error('Error reading stream:', streamError);
        setTestOutput(
          (prev) => prev + `\nError reading stream: ${streamError.message}`
        );
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Error running test:', error);
    }
  };

  const runInMockMode = async () => {
    setMockModeAnchorEl(null);
    setRunningTest(true);
    setTestOutput(''); // Clear previous output

    try {
      const response = await fetch(`/api/v1/code/runTest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          withUI: false,
          testName: selectedTest.name,
          generatedCode: generatePlaywrightCodeForMockMode(
            recordedEvents,
            testsSummary,
            selectedTest,
            envDetails
          ),
          fileName: `__ftmocks-mock-mode-ignore-me.spec.js`,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          setTestOutput((prev) => prev + chunk);
        }
      } catch (streamError) {
        console.error('Error reading stream:', streamError);
        setTestOutput(
          (prev) => prev + `\nError reading stream: ${streamError.message}`
        );
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Error running test:', error);
    }
  };

  const playAllEventsInMockMode = async () => {
    setMockModeAnchorEl(null);
    setRunningTest(true);
    setTestOutput(''); // Clear previous output

    try {
      const response = await fetch(`/api/v1/code/runTest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          withUI: false,
          testName: selectedTest.name,
          generatedCode: generatePlaywrightCodeForRunEvents(
            recordedEvents,
            testsSummary,
            selectedTest,
            envDetails
          ),
          fileName: `__ftmocks-mock-mode-ignore-me.spec.js`,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          setTestOutput((prev) => prev + chunk);
        }
      } catch (streamError) {
        console.error('Error reading stream:', streamError);
        setTestOutput(
          (prev) => prev + `\nError reading stream: ${streamError.message}`
        );
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Error running test:', error);
    }
  };

  const runInPresentationMode = async () => {
    setMockModeAnchorEl(null);
    setRunningTest(true);
    setTestOutput(''); // Clear previous output

    try {
      const response = await fetch(`/api/v1/code/runTest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          withUI: false,
          testName: selectedTest.name,
          generatedCode: generatePlaywrightCodeForRunEventsInPresentationMode(
            recordedEvents,
            testsSummary,
            selectedTest,
            envDetails
          ),
          fileName: `__ftmocks-mock-mode-ignore-me.spec.js`,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          setTestOutput((prev) => prev + chunk);
        }
      } catch (streamError) {
        console.error('Error reading stream:', streamError);
        setTestOutput(
          (prev) => prev + `\nError reading stream: ${streamError.message}`
        );
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Error running test:', error);
    }
  };

  const runInTrainingMode = async () => {
    setMockModeAnchorEl(null);
    setRunningTest(true);
    setTestOutput(''); // Clear previous output

    try {
      const response = await fetch(`/api/v1/code/runTest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          withUI: false,
          testName: selectedTest.name,
          generatedCode: generatePlaywrightCodeForRunEventsInTrainingMode(
            recordedEvents,
            testsSummary,
            selectedTest,
            envDetails
          ),
          fileName: `__ftmocks-mock-mode-ignore-me.spec.js`,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          setTestOutput((prev) => prev + chunk);
        }
      } catch (streamError) {
        console.error('Error reading stream:', streamError);
        setTestOutput(
          (prev) => prev + `\nError reading stream: ${streamError.message}`
        );
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Error running test:', error);
    }
  };

  const runEventsForScreenshots = async () => {
    setMockModeAnchorEl(null);
    setRunningTest(true);
    setTestOutput(''); // Clear previous output

    try {
      const response = await fetch(`/api/v1/code/runTest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          withUI: false,
          testName: selectedTest.name,
          generatedCode: generatePlaywrightCodeForRunEventsForScreenshots(
            recordedEvents,
            testsSummary,
            selectedTest,
            envDetails
          ),
          fileName: `__ftmocks-mock-mode-ignore-me.spec.js`,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          setTestOutput((prev) => prev + chunk);
        }
      } catch (streamError) {
        console.error('Error reading stream:', streamError);
        setTestOutput(
          (prev) => prev + `\nError reading stream: ${streamError.message}`
        );
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Error running test:', error);
    }
  };

  const runForHealingSelectors = async () => {
    setMockModeAnchorEl(null);
    setRunningTest(true);
    setTestOutput(''); // Clear previous output

    try {
      const response = await fetch(`/api/v1/code/runTest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          withUI: false,
          testName: selectedTest.name,
          generatedCode: generatePlaywrightCodeForRunEventsForHealingSelectors(
            recordedEvents,
            testsSummary,
            selectedTest,
            envDetails
          ),
          fileName: `__ftmocks-mock-mode-ignore-me.spec.js`,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          setTestOutput((prev) => prev + chunk);
        }
      } catch (streamError) {
        console.error('Error reading stream:', streamError);
        setTestOutput(
          (prev) => prev + `\nError reading stream: ${streamError.message}`
        );
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Error running test:', error);
    }
  };

  const convert = new AnsiToHtml();

  const htmlOutput = convert.toHtml(testOutput).replace(/\n/g, '<br/>');

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
              {/* <Button
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
              </Menu> */}
              {recordedEvents.length > 0 && (
                <Box>
                  <Tooltip title="Run in mock mode">
                    <IconButton color="primary" onClick={handleMockModeClick}>
                      <FiberSmartRecordIcon />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={mockModeAnchorEl}
                    open={Boolean(mockModeAnchorEl)}
                    onClose={handleMockModeClose}
                  >
                    <MenuItem onClick={runInMockMode}>
                      Run in mock mode
                    </MenuItem>
                    <MenuItem onClick={recordEventsAgainInMockMode}>
                      Record events again
                    </MenuItem>
                    <MenuItem onClick={playAllEventsInMockMode}>
                      Play all events
                    </MenuItem>
                    <MenuItem onClick={runInPresentationMode}>
                      Run in presentation mode
                    </MenuItem>
                    <MenuItem onClick={runInTrainingMode}>
                      Run in training mode
                    </MenuItem>
                    <MenuItem onClick={runEventsForScreenshots}>
                      Run for screenshots
                    </MenuItem>
                    <MenuItem onClick={runForHealingSelectors}>
                      Run for healing selectors
                    </MenuItem>
                  </Menu>
                </Box>
              )}
              <Button
                variant="contained"
                onClick={genPlayWriteCode}
                sx={{ ml: 2 }}
              >
                Generate Playwright Code
              </Button>
            </Box>
            <Box>
              <Tooltip title="Download as file">
                <IconButton onClick={downloadTextAsFile}>
                  <CloudDownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete all events">
                <IconButton onClick={deleteAll}>
                  <DeleteSweepIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Divider />
          <List>
            {recordedEvents.map((re, index) => (
              <Box
                key={re.id}
                draggable
                onDragStart={(e) => handleDragStart(e, re, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  backgroundColor:
                    draggedItem?.index === index
                      ? 'action.selected'
                      : dragOverIndex === index
                        ? 'background.light'
                        : 'transparent',
                  gap: 1,
                  '& .action-buttons': {
                    display: 'none',
                  },
                  '&:hover .action-buttons': {
                    display: 'flex',
                  },
                  transition: 'all 0.2s ease',
                  transform:
                    draggedItem?.index === index
                      ? 'rotate(3deg) scale(1.02)'
                      : 'none',
                  opacity: draggedItem?.index === index ? 0.7 : 1,
                  cursor: 'grab',
                  border:
                    dragOverIndex === index && draggedItem?.index !== index
                      ? '1px dashed'
                      : '0px solid transparent',
                  borderColor: 'primary.main',
                  borderRadius: 1,
                }}
                p={1}
                onClick={() => editEvent(re)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.main',
                      },
                      cursor: 'grab',
                      '&:active': {
                        cursor: 'grabbing',
                      },
                    }}
                  >
                    <DragIndicatorIcon />
                  </Box>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body1">
                      {re.type} ({re.target || re.value})
                    </Typography>
                    <Typography variant="body2">{re.time}</Typography>
                  </Box>
                </Box>
                <Box className="action-buttons">
                  <Tooltip title="Duplicate Event">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateEvent(re.id);
                      }}
                      aria-label="duplicate"
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Create New Event">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        addEmptyEvent(re.id);
                      }}
                      aria-label="create new event"
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit Event">
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
                  </Tooltip>
                  <Tooltip title="Delete Event">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEvent(re);
                      }}
                      aria-label="delete"
                      disabled={index === 0 && re.type === 'url'}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            ))}
          </List>
          <Box sx={{ textAlign: 'center' }}>
            {!recordedEvents.length ? 'No events recorded' : null}
          </Box>
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
              <IconButton color="primary" onClick={onBackClick}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h5">
                {runningTest ? 'Test Output' : 'Generated Code'}
              </Typography>
            </Box>
            <Box>
              <Tooltip title="Save and Run Test">
                <IconButton onClick={() => playTest(false)} sx={{ mr: 1 }}>
                  <PlayArrowIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Save and Run Test With Playwright UI">
                <IconButton onClick={() => playTest(true)} sx={{ mr: 1 }}>
                  <GavelOutlined />
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
          {!runningTest && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                p={2}
                sx={{
                  textAlign: 'left',
                  width: '100%',
                  overflowX: 'scroll',
                }}
              >
                <TextField
                  multiline
                  fullWidth
                  value={genCode}
                  onChange={(e) => setGenCode(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiInputBase-input': {
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                    },
                    mb: 2,
                  }}
                  rows={25}
                />
              </Box>
              {genCodeType === 'playwright' && playwrightCodeGen && (
                <Box
                  sx={{
                    textAlign: 'center',
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                    pl: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Find generated code above or you can Run playwright codegen
                    to generate the code
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
          )}
          {runningTest && (
            <Box
              p={2}
              sx={{
                textAlign: 'left',
                width: 'calc(100vw - 500px)',
                overflowX: 'scroll',
              }}
            >
              {/* <TextField
                multiline
                fullWidth
                value={testOutput}
                readOnly
                variant="outlined"
                rows={25}
              /> */}
              <div
                style={{
                  background: 'black',
                  color: 'white',
                  fontFamily: 'monospace',
                  padding: '10px',
                  borderRadius: '8px',
                  overflowY: 'auto',
                  height: '700px',
                }}
                dangerouslySetInnerHTML={{ __html: htmlOutput }}
              />
            </Box>
          )}
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
                <MenuItem value="waitForTimeout">Wait For Timeout</MenuItem>
              </TextField>

              <Autocomplete
                freeSolo
                options={
                  selectedEvent.selectors
                    ?.filter((s) => s.type === 'locator')
                    .map((s) => s.value || '') || []
                }
                value={selectedEvent.target || ''}
                onInputChange={(_, value) => {
                  setSelectedEvent({
                    ...selectedEvent,
                    target: value,
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Target"
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 1 }}
                  />
                )}
              />
              {/* <TextField
                label="Target"
                value={selectedEvent.target || ''}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, target: e.target.value })
                }
                fullWidth
              /> */}

              {(typeof selectedEvent.value === 'string' ||
                eventTypesWithValues.includes(selectedEvent.type)) && (
                <TextField
                  label="Value"
                  value={selectedEvent.value || ''}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      value: e.target.value,
                    })
                  }
                  fullWidth
                />
              )}
              <TextField
                label="Description"
                value={selectedEvent.description || ''}
                onChange={(e) =>
                  setSelectedEvent({
                    ...selectedEvent,
                    description: e.target.value,
                  })
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
