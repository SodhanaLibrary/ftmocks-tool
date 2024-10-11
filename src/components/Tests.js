import React, { useState } from 'react';
import { Box, List, ListItem, ListItemText, Typography, TextField, Drawer } from '@mui/material';
import { mockData } from './mockdata';
import MockDataView from './MockDataView';


const testCases = [
  { id: 1, name: 'Test Case 1', mockData: mockData },
  { id: 2, name: 'Test Case 2', mockData: mockData },
  { id: 3, name: 'Test Case 3', mockData: mockData },
];

export default function Tests() {
  const [selectedTest, setSelectedTest] = useState(null);
  const [filteredTestCases, setFilteredTestCases] = useState(testCases);
  const [mockSearchTerm, setMockSearchTerm] = React.useState('');
  const [testSearchTerm, setTestSearchTerm] = useState('');
  const [selectedMockItem, setSelectedMockItem] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);


  const handleTestClick = (test) => {
    setSelectedTest({...test, filteredMockData: test.mockData});
    setMockSearchTerm('');
  };
  
  const handleMockItemClick = (item) => {
    setSelectedMockItem(item);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const renderMockDataDrawer = () => {
    if (!selectedMockItem) return null;

    return (
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerClose}
        sx={{ width: 300 }}
      >
        <MockDataView onClose={handleDrawerClose} mockItem={selectedMockItem} />
      </Drawer>
    );
  };
  return (
    <Box sx={{ flexGrow: 1, p: 3, pt: 0, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 0 }}>
        <Box sx={{ p: 2, border: 1, borderColor: 'divider', boxShadow: 1, width: '300px' }}>
          <Typography variant="h6" gutterBottom>
            Test Cases
          </Typography>
          <TextField
            hiddenLabel
            fullWidth
            variant="outlined"
            placeholder="Search test cases"
            margin="normal"
            value={testSearchTerm}
            onChange={(e) => {
              setTestSearchTerm(e.target.value);
              const searchTerm = e.target.value.toLowerCase();
              const filteredTests = testCases.filter(test => 
                test.name.toLowerCase().includes(searchTerm)
              );
              setFilteredTestCases(filteredTests);
            }}
          />
          <List>
            {filteredTestCases.map((test) => (
              <ListItem
                button
                key={test.id}
                onClick={() => handleTestClick(test)}
                selected={selectedTest && selectedTest.id === test.id}
                sx={{
                  backgroundColor: (selectedTest && selectedTest.id === test.id) ? 'action.selected' : 'inherit',
                  '&:hover': {
                    backgroundColor: (selectedTest && selectedTest.id === test.id) ? 'action.selected' : 'action.hover',
                  },
                }}
              >
                <ListItemText primary={test.name} />
              </ListItem>
            ))}
          </List>
        </Box>
        <Box sx={{ p: 2, border: 1, borderColor: 'divider', boxShadow: 1, flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom>
            Mock Data
          </Typography>
          <TextField
            hiddenLabel
            fullWidth
            variant="outlined"
            placeholder="Search mock data"
            margin="normal"
            value={mockSearchTerm}
            onChange={(e) => {
              setMockSearchTerm(e.target.value);
              const searchTerm = e.target.value.toLowerCase();
              if (selectedTest) {
                const filteredMockData = selectedTest.mockData.filter(item =>
                  item.url.toLowerCase().includes(searchTerm)
                );
                setSelectedTest({...selectedTest, filteredMockData});
              }
            }}
          />
          {selectedTest ? (
            <List>
              {selectedTest.filteredMockData.map((mockItem, index) => (
                <ListItem
                  button
                  key={index}
                  onClick={() => handleMockItemClick(mockItem)}
                  selected={selectedMockItem === mockItem}
                  sx={{
                    backgroundColor: selectedMockItem === mockItem ? 'action.selected' : 'inherit',
                    '&:hover': {
                      backgroundColor: selectedMockItem === mockItem ? 'action.selected' : 'action.hover',
                    },
                  }}
                >
                  <ListItemText primary={mockItem.url} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>Select a test case to view mock data</Typography>
          )}
        </Box>
        {renderMockDataDrawer()}
    </Box>
  );

}
