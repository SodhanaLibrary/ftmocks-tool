import React from 'react';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Divider,
  TextField,
  Button,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Autocomplete from '@mui/material/Autocomplete';

import { eventTypesWithValues } from './recordedEventsUtils';

export default function EditRecordedEventDrawer({
  selectedEvent,
  onClose,
  onEventChange,
  onSave,
}) {
  return (
    <Drawer
      anchor="right"
      open={Boolean(selectedEvent)}
      onClose={onClose}
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
            <IconButton id="recorded-events-edit-close-btn" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Box
            component="form"
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <TextField
              id="recorded-events-edit-type"
              select
              label="Type"
              value={selectedEvent.type || ''}
              onChange={(e) =>
                onEventChange({ ...selectedEvent, type: e.target.value })
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
                onEventChange({
                  ...selectedEvent,
                  target: value,
                });
              }}
              renderInput={(params) => (
                <TextField
                  id="recorded-events-edit-target"
                  {...params}
                  label="Target"
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 1 }}
                />
              )}
            />

            {(typeof selectedEvent.value === 'string' ||
              eventTypesWithValues.includes(selectedEvent.type)) && (
              <TextField
                id="recorded-events-edit-value"
                label="Value"
                value={selectedEvent.value || ''}
                onChange={(e) =>
                  onEventChange({
                    ...selectedEvent,
                    value: e.target.value,
                  })
                }
                fullWidth
              />
            )}
            <TextField
              id="recorded-events-edit-description"
              label="Description"
              value={selectedEvent.description || ''}
              onChange={(e) =>
                onEventChange({
                  ...selectedEvent,
                  description: e.target.value,
                })
              }
              fullWidth
            />

            <Box display="flex" mt={2}>
              <Box display="flex" gap={1} width="50%">
                <Button
                  id="recorded-events-edit-save-btn"
                  variant="contained"
                  onClick={onSave}
                  fullWidth
                >
                  Save Changes
                </Button>
                <Button
                  id="recorded-events-edit-cancel-btn"
                  variant="outlined"
                  onClick={onClose}
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
  );
}
