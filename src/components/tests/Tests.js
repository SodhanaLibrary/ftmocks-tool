import React, { useState } from 'react';
import { Box, List, ListItem, ListItemText, Typography, TextField, Drawer } from '@mui/material';
import MockDataView from '../MockDataView';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import Tooltip from '@mui/material/Tooltip';
import TestCaseCreator from './TestCaseCreator';

export default function Tests() {
  const [selectedTest, setSelectedTest] = useState(null);
  const [filteredTestCases, setFilteredTestCases] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [mockSearchTerm, setMockSearchTerm] = React.useState('');
  const [testSearchTerm, setTestSearchTerm] = useState('');
  const [selectedMockItem, setSelectedMockItem] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [testCaseCreatorOpen, setTestCaseCreatorOpen] = useState(false);


  const handleMockItemClick = (item) => {
    setSelectedMockItem(item);
    setDrawerOpen(true);
  };

  const fetchTestData = async () => {
    try {
      const response = await fetch('/api/v1/tests');
      if (!response.ok) {
        throw new Error('Failed to fetch test data');
      }
      const data = await response.json();
      setFilteredTestCases(data);
      setTestCases(data);
    } catch (error) {
      console.error('Error fetching test data:', error);
      // Handle the error appropriately, e.g., show an error message to the user
    }
  };

  const fetchMockData = async (testId) => {
    try {
      const response = await fetch(`/api/v1/tests/${testId}/mockdata`);
      if (!response.ok) {
        throw new Error('Failed to fetch mock data');
      }
      const data = await response.json();
      setSelectedTest(prevTest => ({
        ...prevTest,
        mockData: data,
        filteredMockData: data
      }));
    } catch (error) {
      console.error('Error fetching mock data:', error);
      // Handle the error appropriately, e.g., show an error message to the user
    }
  };

  const handleTestClick = (test) => {
    setSelectedTest({...test, filteredMockData: []});
    setMockSearchTerm('');
    fetchMockData(test.id);
  };

  React.useEffect(() => {
    fetchTestData();
  }, []);

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

  const renderTestCaseCreator = () => {
    return (
      <Drawer
        anchor="right"
        open={testCaseCreatorOpen}
        onClose={() => setTestCaseCreatorOpen(false)}
        sx={{ width: 300 }}
      >
        <TestCaseCreator onClose={() => setTestCaseCreatorOpen(false)}/>
      </Drawer>
    );
  };
  
  return (
    <Box sx={{ flexGrow: 1, p: 3, pt: 0, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 0 }}>
        <Box sx={{ p: 2, border: 1, borderColor: 'divider', boxShadow: 1, width: '300px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Test Cases
            </Typography>
            <Tooltip title="Create New Test Case">
              <IconButton onClick={() => setTestCaseCreatorOpen(true)} aria-label="add">
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>
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
        {renderTestCaseCreator()}
    </Box>
  );

}
