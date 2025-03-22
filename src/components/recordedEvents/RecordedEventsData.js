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
import { sortUrlsByMatch } from '../utils/SearchUtils';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { generatePlaywrightCode, generateRTLCode } from './CodeUtils';

export default function RecordedEventsData({selectedTest}) {
  const [isLoading, setIsLoading] = useState(true);
  const [erroe, setError] = useState(null);
  const [recordedEvents, setRecordedEvents] = useState([]);
  const [testsSummary, setTestsSummary] = useState([]);
  const [genCode, setGenCode] = useState('');

  const fetchRecordedEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/v1/recordedEvents?${selectedTest?.name ? `name=${selectedTest.name}` : ''}`);
      if (!response.ok) {
        throw new Error('Failed to fetch default mocks');
      }
      const data = await response.json();
      setRecordedEvents(data);

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
      const response = await fetch(`/api/v1/deleteAllEvents?${selectedTest?.name ? `name=${selectedTest.name}` : ''}`, {
        method: 'DELETE',
      });
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
  };

  const genPlayWriteCode = () => {
    setGenCode(generatePlaywrightCode(recordedEvents, testsSummary, selectedTest));
  };

  useEffect(() => {
    fetchRecordedEvents();
  }, []);

  return (
    <Box display="flex">
      <Box width="40%" p={2}>
        <Box
          p={1}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h5">Events Data</Typography>
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
        <Timeline position="alternate-reverse">
          {recordedEvents.map((re) => (
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Box>
                  {re.type} ({re.time})
                </Box>
                <Box>{re.target}</Box>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
        <Box sx={{ textAlign: 'center' }}>
          {!recordedEvents.length ? 'No events recorded' : null}
        </Box>
      </Box>
      <Box
        p={2}
        pt={10}
        style={{ borderLeft: '1px solid #333', borderRight: '1px solid #333' }}
      >
        <Box
          sx={{
            textAlign: 'center',
            width: '100%',
            pb: 2,
          }}
        >
          <Button onClick={genRTLCode} variant="outlined">
            Generate RTL Code
          </Button>
        </Box>
        <Box
          sx={{
            textAlign: 'center',
            width: '100%',
            pb: 2,
          }}
        >
          <Button onClick={genPlayWriteCode} variant="outlined">
            Generate Play Write Code
          </Button>
        </Box>
      </Box>
      <Box width="40%" p={2}>
        <Box
          p={1}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h5">Generated Code</Typography>
          <Box>
            <IconButton onClick={copyToClipboard}>
              <ContentCopyIcon />
            </IconButton>
          </Box>
        </Box>
        <Divider />
        <Box
          p={2}
          sx={{ textAlign: 'left', width: '100%', overflowX: 'scroll' }}
        >
          {genCode?.length === 0 && '-----'}
          <pre>{genCode}</pre>
        </Box>
      </Box>
    </Box>
  );
}
