import React from 'react';
import {
  Box,
  Typography,
  Divider,
  List,
  Tooltip,
  IconButton,
  Button,
} from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import FiberSmartRecordIcon from '@mui/icons-material/FiberSmartRecord';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import RecordedEventListItem from './RecordedEventListItem';

export default function RecordedEventsListPanel({
  recordedEvents,
  mockModeAnchorEl,
  onMockModeClick,
  onMockModeClose,
  runInMockMode,
  recordEventsAgainInMockMode,
  recordContinueEventsFromLastEventInMockMode,
  playAllEventsInMockMode,
  runInPresentationMode,
  runInTrainingMode,
  runEventsForScreenshots,
  runForHealingSelectors,
  onGenPlaywrightCode,
  onDownload,
  onDeleteAll,
  draggedItem,
  dragOverIndex,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onEditEvent,
  onDuplicateEvent,
  onAddEmptyEvent,
  onDeleteEvent,
}) {
  return (
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
          {recordedEvents.length > 0 && (
            <Box>
              <Tooltip title="Run in mock mode">
                <IconButton
                  id="recorded-events-mock-mode-btn"
                  color="primary"
                  onClick={onMockModeClick}
                >
                  <FiberSmartRecordIcon />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={mockModeAnchorEl}
                open={Boolean(mockModeAnchorEl)}
                onClose={onMockModeClose}
              >
                <MenuItem id="recorded-events-run-mock-mode" onClick={runInMockMode}>
                  Run in mock mode
                </MenuItem>
                <MenuItem
                  id="recorded-events-record-again"
                  onClick={recordEventsAgainInMockMode}
                >
                  Record events again
                </MenuItem>
                <MenuItem
                  id="recorded-events-record-from-last"
                  onClick={recordContinueEventsFromLastEventInMockMode}
                >
                  Record events from last event
                </MenuItem>
                <MenuItem id="recorded-events-play-all" onClick={playAllEventsInMockMode}>
                  Play all events
                </MenuItem>
                <MenuItem
                  id="recorded-events-presentation-mode"
                  onClick={runInPresentationMode}
                >
                  Run in presentation mode
                </MenuItem>
                <MenuItem id="recorded-events-training-mode" onClick={runInTrainingMode}>
                  Run in training mode
                </MenuItem>
                <MenuItem
                  id="recorded-events-screenshots"
                  onClick={runEventsForScreenshots}
                >
                  Run for screenshots
                </MenuItem>
                <MenuItem
                  id="recorded-events-healing-selectors"
                  onClick={runForHealingSelectors}
                >
                  Run for healing selectors
                </MenuItem>
              </Menu>
            </Box>
          )}
          <Button
            id="recorded-events-gen-playwright-btn"
            variant="contained"
            onClick={onGenPlaywrightCode}
            sx={{ ml: 2 }}
          >
            Generate Playwright Code
          </Button>
        </Box>
        <Box>
          <Tooltip title="Download as file">
            <IconButton id="recorded-events-download-btn" onClick={onDownload}>
              <CloudDownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete all events">
            <IconButton id="recorded-events-delete-all-btn" onClick={onDeleteAll}>
              <DeleteSweepIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Divider />
      <List>
        {recordedEvents.map((re, index) => (
          <RecordedEventListItem
            key={re.id}
            re={re}
            index={index}
            draggedItem={draggedItem}
            dragOverIndex={dragOverIndex}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            onEdit={onEditEvent}
            onDuplicate={onDuplicateEvent}
            onAddEmpty={onAddEmptyEvent}
            onDelete={onDeleteEvent}
          />
        ))}
      </List>
      <Box sx={{ textAlign: 'center' }}>
        {!recordedEvents.length ? 'No events recorded' : null}
      </Box>
    </Box>
  );
}
