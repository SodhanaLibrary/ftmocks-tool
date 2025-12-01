import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem } from '@mui/material';

const Documentator = ({ selectedTest }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await fetch(
        `/api/v1/recordedEvents?name=${selectedTest.name}`
      );
      const data = await response.json();
      setEvents(data.filter((event) => event.screenshotInfo));
    };

    if (selectedTest) {
      fetchEvents();
    }
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
      <Typography variant="h6" gutterBottom>
        Test Walkthrough with Screenshots
      </Typography>
      <List>
        {events.map((event, idx) => (
          <ListItem
            key={idx}
            alignItems="flex-start"
            sx={{ mb: 2, display: 'block' }}
          >
            <Box>
              <Typography variant="subtitle2">
                {event.label || event.text || `Step ${idx + 1}`}
              </Typography>
              {event.screenshotInfo && (
                <Box>
                  {(() => {
                    const displayWidth = 600;
                    const scale =
                      displayWidth / event.screenshotInfo.position.windowWidth;
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
                            width={event.screenshotInfo.position.width * scale}
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
    </Box>
  );
};

export default Documentator;
