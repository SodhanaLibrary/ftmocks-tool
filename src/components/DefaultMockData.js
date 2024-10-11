import React, { useState } from 'react';
import { Box, List, ListItem, ListItemText, Typography, Paper, Grid } from '@mui/material';

const mockDataList = [
  { url: '/api/users', data: '[\n  {\n    "id": 1,\n    "name": "John Doe",\n    "email": "john@example.com"\n  },\n  {\n    "id": 2,\n    "name": "Jane Smith",\n    "email": "jane@example.com"\n  }\n]' },
  { url: '/api/products', data: '[\n  {\n    "id": 1,\n    "name": "Product A",\n    "price": 19.99\n  },\n  {\n    "id": 2,\n    "name": "Product B",\n    "price": 29.99\n  }\n]' },
  { url: '/api/orders', data: '[\n  {\n    "id": 1,\n    "userId": 1,\n    "productId": 2,\n    "quantity": 3\n  },\n  {\n    "id": 2,\n    "userId": 2,\n    "productId": 1,\n    "quantity": 1\n  }\n]' },
];

export default function DefaultMockData() {
  const [selectedMockData, setSelectedMockData] = useState(null);

  const handleMockDataClick = (mockData) => {
    setSelectedMockData(mockData);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
      <Box sx={{ flex: 1 }}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            API Endpoints
          </Typography>
          <List>
            {mockDataList.map((mockData, index) => (
              <ListItem
                button
                key={index}
                onClick={() => handleMockDataClick(mockData)}
                selected={selectedMockData && selectedMockData.url === mockData.url}
              >
                <ListItemText primary={mockData.url} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Mock Data
          </Typography>
          {selectedMockData ? (
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {selectedMockData.data}
            </pre>
          ) : (
            <Typography>Select an API endpoint to view mock data</Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
