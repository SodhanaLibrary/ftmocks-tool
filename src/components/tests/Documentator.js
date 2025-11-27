import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  Card,
  CardMedia,
} from '@mui/material';

const Documentator = ({ selectedTest }) => {
  const [events, setEvents] = useState([]);

  const fetchEvents = async () => {
    const response = await fetch(
      `/api/v1/recordedEvents?name=${selectedTest.name}`
    );
    const data = await response.json();
    setEvents(data.filter((event) => event.screenshotInfo));
  };

  useEffect(() => {
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
                <Card sx={{ maxWidth: 600, my: 1 }}>
                  <CardMedia
                    component="img"
                    image={`/api/v1/screenshots?file=${event.screenshotInfo.name}&testName=${selectedTest.name}`}
                    alt={event.description || `Screenshot ${idx + 1}`}
                    sx={{ objectFit: 'contain' }}
                  />
                </Card>
              )}
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Documentator;
