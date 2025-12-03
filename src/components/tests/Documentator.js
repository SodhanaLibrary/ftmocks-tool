import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, Button } from '@mui/material';
import { ButtonGroup, IconButton, Tooltip } from '@mui/material';
import BlurOnIcon from '@mui/icons-material/BlurOn';

import ListIcon from '@mui/icons-material/List';
import TrainIcon from '@mui/icons-material/Train';

const Documentator = ({ selectedTest }) => {
  const [events, setEvents] = useState([]);
  const [mode, setMode] = useState('list');
  const [displayWidth, setDisplayWidth] = useState(600);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await fetch(
        `/api/v1/recordedEvents?name=${selectedTest.name}`
      );
      const data = await response.json();
      const screenshotData = data.filter((event) => event.screenshotInfo);
      setEvents(screenshotData);
    };

    if (selectedTest) {
      fetchEvents();
    }
    setDisplayWidth(window.innerWidth - 600);
  }, [selectedTest]);

  if (events.length === 0) {
    return (
      <Box p={5} mt={3} sx={{ border: '1px solid #555' }}>
        <Typography variant="h6">
          No screenshots found, Please go to 'RECORD' tab and record the test
          case then generate screenshots
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" gutterBottom>
          {mode === 'list' && 'Test Walkthrough'}
          {mode === 'training' && 'Test Training'}
          {mode === 'differentiate' && 'Test Differentiate'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <ButtonGroup variant="outlined" aria-label="screenshot navigation">
            <Tooltip title="List Mode">
              <IconButton
                color={mode === 'list' ? 'primary' : 'default'}
                onClick={() => setMode('list')}
              >
                <ListIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Training Mode">
              <IconButton
                color={mode === 'training' ? 'primary' : 'default'}
                onClick={() => setMode('training')}
              >
                <TrainIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Differentiate Mode">
              <IconButton
                color={mode === 'differentiate' ? 'primary' : 'default'}
                onClick={() => setMode('differentiate')}
              >
                <BlurOnIcon />
              </IconButton>
            </Tooltip>
          </ButtonGroup>
        </Box>
      </Box>
      {mode === 'list' && (
        <List>
          {events.map((event, idx) => (
            <ListItem
              key={idx}
              alignItems="flex-start"
              sx={{ mb: 2, display: 'block' }}
            >
              <Box>
                <Typography variant="subtitle2">
                  {event.description || `Step ${idx + 1}`}
                </Typography>
                {event.screenshotInfo && (
                  <Box>
                    {(() => {
                      const scale =
                        displayWidth /
                        event.screenshotInfo.position.windowWidth;
                      const displayHeight =
                        event.screenshotInfo.position.windowHeight * scale;

                      return (
                        <Box
                          sx={{
                            position: 'relative',
                            width: displayWidth,
                            height: displayHeight,
                          }}
                        >
                          <img
                            src={`/api/v1/screenshots?file=${event.screenshotInfo.name}&testName=${selectedTest.name}`}
                            alt={event.description || `Screenshot ${idx + 1}`}
                            style={{
                              width: displayWidth,
                              height: displayHeight,
                              display: 'block',
                            }}
                          />
                          <svg
                            width={displayWidth}
                            height={displayHeight}
                            style={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              pointerEvents: 'none',
                            }}
                          >
                            <rect
                              x={event.screenshotInfo.position.x * scale}
                              y={event.screenshotInfo.position.y * scale}
                              width={
                                event.screenshotInfo.position.width * scale
                              }
                              height={
                                event.screenshotInfo.position.height * scale
                              }
                              fill="rgba(255, 215, 0, 0.3)"
                              stroke="orange"
                              strokeWidth="3"
                              rx="4"
                            />
                          </svg>
                        </Box>
                      );
                    })()}
                  </Box>
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      )}
      {mode === 'training' && events.length && (
        <Box id="ftmocks-training-mode">
          <Box>
            <Typography variant="subtitle2">
              {events[currentEventIndex].description ||
                `Step ${currentEventIndex + 1}`}
            </Typography>
            {events[currentEventIndex]?.screenshotInfo && (
              <Box>
                {(() => {
                  const scale =
                    displayWidth /
                    events[currentEventIndex].screenshotInfo.position
                      .windowWidth;
                  const displayHeight =
                    events[currentEventIndex].screenshotInfo.position
                      .windowHeight * scale;

                  return (
                    <Box
                      sx={{
                        position: 'relative',
                        width: displayWidth,
                        height: displayHeight,
                        margin: 'auto',
                      }}
                    >
                      <img
                        src={`/api/v1/screenshots?file=${events[currentEventIndex].screenshotInfo.name}&testName=${selectedTest.name}`}
                        alt={
                          events[currentEventIndex].description ||
                          `Screenshot ${currentEventIndex + 1}`
                        }
                        style={{
                          width: displayWidth,
                          height: displayHeight,
                          display: 'block',
                        }}
                      />
                      <svg
                        width={displayWidth}
                        height={displayHeight}
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                        }}
                      >
                        <rect
                          onClick={() => {
                            if (currentEventIndex < events.length - 1) {
                              setCurrentEventIndex(currentEventIndex + 1);
                            }
                          }}
                          cursor="pointer"
                          x={
                            events[currentEventIndex].screenshotInfo.position
                              .x * scale
                          }
                          y={
                            events[currentEventIndex].screenshotInfo.position
                              .y * scale
                          }
                          width={
                            events[currentEventIndex].screenshotInfo.position
                              .width * scale
                          }
                          height={
                            events[currentEventIndex].screenshotInfo.position
                              .height * scale
                          }
                          fill="rgba(255, 215, 0, 0.3)"
                          stroke="orange"
                          strokeWidth="3"
                          rx="4"
                        />
                      </svg>
                    </Box>
                  );
                })()}
              </Box>
            )}
          </Box>
          <Box pt={2} display="flex" justifyContent="space-between">
            <Button
              variant="contained"
              color="primary"
              disabled={currentEventIndex === 0}
              onClick={() => {
                setCurrentEventIndex(currentEventIndex - 1);
              }}
            >
              Previous
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={currentEventIndex === events.length - 1}
              onClick={() => {
                setCurrentEventIndex(currentEventIndex + 1);
              }}
            >
              Next
            </Button>
          </Box>
        </Box>
      )}
      {mode === 'differentiate' && (
        <List>
          {events.map((event, idx) => {
            if (!event.screenshotInfo?.diffPath) {
              return null;
            }
            return (
              <ListItem
                key={idx}
                alignItems="flex-start"
                sx={{ mb: 2, display: 'block' }}
              >
                <Box>
                  <Typography variant="subtitle2">
                    {event.description || `Step ${idx + 1}`}
                  </Typography>
                  {event.screenshotInfo && (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 2,
                      }}
                    >
                      <img
                        src={`/api/v1/screenshots?file=${event.screenshotInfo.name}&testName=${selectedTest.name}`}
                        alt={event.description || `Screenshot ${idx + 1}`}
                        style={{ width: '50%', height: 'auto' }}
                      />
                      <img
                        src={`/api/v1/screenshots?file=${event.screenshotInfo.diffPath}&testName=${selectedTest.name}`}
                        alt={event.description || `Screenshot ${idx + 1}`}
                        style={{ width: '50%', height: 'auto' }}
                      />
                    </Box>
                  )}
                </Box>
              </ListItem>
            );
          })}
        </List>
      )}
    </Box>
  );
};

export default Documentator;
