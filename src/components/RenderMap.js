import React, { useState } from 'react';
import { Box, List, ListItem, ListItemText, Typography, Paper } from '@mui/material';

const mockRoutes = [
  { path: '/users', testIds: ['test1', 'test2', 'test3'] },
  { path: '/products', testIds: ['test4', 'test5'] },
  { path: '/orders', testIds: ['test6', 'test7', 'test8'] },
];

export default function RenderMap() {
  const [selectedRoute, setSelectedRoute] = useState(null);

  const handleRouteClick = (route) => {
    setSelectedRoute(route);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
      <Box sx={{ flex: 1 }}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Routes
          </Typography>
          <List>
            {mockRoutes.map((route, index) => (
              <ListItem
                button
                key={index}
                onClick={() => handleRouteClick(route)}
                selected={selectedRoute && selectedRoute.path === route.path}
              >
                <ListItemText primary={route.path} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Test IDs
          </Typography>
          {selectedRoute ? (
            <List>
              {selectedRoute.testIds.map((testId, index) => (
                <ListItem key={index}>
                  <ListItemText primary={testId} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>Select a route to view test IDs</Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
