import React, { useState, useEffect } from 'react';
import { Box, List, ListItem, ListItemText, Typography, TextField, Drawer } from '@mui/material';
import MockDataView from '../MockDataView';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import Tooltip from '@mui/material/Tooltip';
import TestCaseCreator from './TestCaseCreator';
import DeleteIcon from '@mui/icons-material/Delete';
import MockDataCreator from '../MockDataCreator';
import EditIcon from '@mui/icons-material/Edit';
import { sortUrlsByMatch } from '../utils/SearchUtils';
import DraggableMockList from './MockDataList';

export default function Tests() {
  const [selectedTest, setSelectedTest] = useState(null);
  const [filteredTestCases, setFilteredTestCases] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [mockSearchTerm, setMockSearchTerm] = React.useState('');
  const [testSearchTerm, setTestSearchTerm] = useState('');
  const [selectedMockItem, setSelectedMockItem] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [testCaseCreatorOpen, setTestCaseCreatorOpen] = useState(false);
  const [testCaseEditorOpen, setTestCaseEditorOpen] = useState(false);
  const [mockDataCreatorOpen, setMockDataCreatorOpen] = useState(false);


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

  const fetchMockData = async (test) => {
    try {
      const response = await fetch(`/api/v1/tests/${test.id}/mockdata?name=${test.name}`);
      if (!response.ok) {
        throw new Error('Failed to fetch mock data');
      }
      const data = await response.json();
      setSelectedTest(prevTest => ({
        ...prevTest,
        mockData: data,
        filteredMockData: sortUrlsByMatch(mockSearchTerm, data)
      }));
    } catch (error) {
      console.error('Error fetching mock data:', error);
      // Handle the error appropriately, e.g., show an error message to the user
    }
  };

  const handleTestClick = (test) => {
    setSelectedTest({...test, filteredMockData: []});
    setMockSearchTerm('');
    fetchMockData(test);
  };

  const onTestCaseSearch = (searchTerm) => {
    const filteredTests = testCases.filter(test => 
      test.name.toLowerCase().includes(searchTerm)
    );
    setFilteredTestCases(filteredTests);
  };

  useEffect(() => {
    fetchTestData();
  }, []);

  useEffect(() => {
    if(testCases.length > 0) {
      onTestCaseSearch(testSearchTerm.toLowerCase());
    }
  }, [testSearchTerm])

  useEffect(() => {
    if(testCases.length > 0) {
      onTestCaseSearch(testSearchTerm.toLowerCase());
    }
    if(selectedTest) {
      const newSelectedTest = testCases.find(test => test.id === selectedTest.id);
      if(newSelectedTest) {
        handleTestClick(newSelectedTest);
      } else {
        setSelectedTest(null);
      }
    }
  }, [testCases])

  const handleDrawerClose = (refresh) => {
    setDrawerOpen(false);
    if (refresh) {
      fetchMockData(selectedTest);
    }
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
        <MockDataView selectedTest={selectedTest} onClose={handleDrawerClose} mockItem={selectedMockItem} />
      </Drawer>
    );
  };

  const renderTestCaseCreator = () => {
    return (
      <Drawer
        anchor="right"
        open={testCaseCreatorOpen || testCaseEditorOpen}
        onClose={onCloseTestCaseCreator}
        sx={{ width: 300 }}
      >
        <TestCaseCreator onClose={onCloseTestCaseCreator} selectedTest={testCaseEditorOpen ? selectedTest : null}/>
      </Drawer>
    );
  };

  const renderMockDataCreator = () => {
    return (
      <Drawer
        anchor="right"
        open={mockDataCreatorOpen}
        onClose={onCloseMockDataCreator}
        sx={{ width: 300 }}
      >
        <MockDataCreator selectedTest={selectedTest} onClose={onCloseMockDataCreator}/>
      </Drawer>
    );
  };

  const handleDeleteTest = (test) => {
    fetch(`/api/v1/tests/${test.id}?name=${test.name}`, { method: 'DELETE' })
      .then(response => {
        if (response.ok) {
          console.log('Test deleted successfully');
          fetchTestData();
        } else {
          console.error('Failed to delete test');
        }
      })
      .catch(error => {
        console.error('Error deleting test:', error);
      });
    setSelectedTest(null);
  };

  const onCloseMockDataCreator = () => {
    setMockDataCreatorOpen(false);
    fetchMockData(selectedTest);
  };

  const onCloseTestCaseCreator = (refresh) => {
    setTestCaseEditorOpen(false);
    setTestCaseCreatorOpen(false);
    if(refresh) {
      fetchTestData();
    }
  };

  const handleEditTestName = () => {
    setTestCaseEditorOpen(true);
    setTestCaseCreatorOpen(false);
  };

  const handleCreateTestCase = () => {
    setTestCaseCreatorOpen(true);
    setTestCaseEditorOpen(false);
  };

  useEffect(() => {
    if(selectedTest?.mockData?.length) {
      let fData = [];
      try {
        fData = sortUrlsByMatch(mockSearchTerm, selectedTest?.mockData)
      } catch(error) {
        fData = selectedTest?.mockData?.filter(item =>
          item.url.toLowerCase().includes(mockSearchTerm.toLowerCase())
        );
      }
      selectedTest.filteredMockData = fData;
      setSelectedTest({...selectedTest});
    }
  }, [mockSearchTerm]);

  const setFilteredMockData = (newFiltrdMocks) => {
    const indexes = [];
    newFiltrdMocks.forEach(element => {
      indexes.push(selectedTest.mockData.findIndex(md => md.id === element.id));
    });
    indexes.sort();
    let k = 0;
    indexes.forEach(i => {
      selectedTest.mockData[i] = newFiltrdMocks[k];
      k = k + 1;
    });
    selectedTest.filteredMockData = sortUrlsByMatch(mockSearchTerm, selectedTest.mockData)
    setSelectedTest({...selectedTest});


    fetch(`/api/v1/tests/${selectedTest.id}/mockdata?name=${selectedTest.name}`, 
      { 
        method: 'PUT', 
        headers: {
        'Content-Type': 'application/json',
        }, 
        body: JSON.stringify(selectedTest.mockData) 
      }
    ).then(response => {
        if (response.ok) {
          console.log('Test deleted successfully');
          fetchTestData();
        } else {
          console.error('Failed to delete test');
        }
      })
      .catch(error => {
        console.error('Error deleting test:', error);
      });
  };
  
  return (
    <Box sx={{ flexGrow: 1, p: 3, pt: 0, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 0 }}>
        <Box sx={{ p: 2, border: 1, borderColor: 'divider', boxShadow: 1, width: '300px' }}>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Test Cases
            </Typography>
            <Tooltip title="Create New Test Case">
              <IconButton onClick={handleCreateTestCase} aria-label="add">
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
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  '& .delete-icon': {
                    display: 'none',
                  },
                  '&:hover .delete-icon': {
                    display: 'block',
                  },
                }}
              >
                <ListItemText primary={test.name} />
                <IconButton className="delete-icon" onClick={() => handleDeleteTest(test)} aria-label="delete">
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Box>
        <Box sx={{ p: 2, border: 1, borderColor: 'divider', boxShadow: 1, flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            
            <Box sx={{ display: 'flex', alignItems: 'center', '&:hover .edit-icon': { display: 'block' }, '& .edit-icon': { display: 'none' } }}>
              <Typography variant="h6" gutterBottom>
                {selectedTest ? selectedTest.name : 'Select a test case'}
              </Typography>
              {selectedTest && (
                <Tooltip title="Edit Test name">
                  <IconButton className="edit-icon" sx={{ ml: 0.5, cursor: 'pointer' }} size="small" onClick={handleEditTestName} aria-label="edit test">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            {selectedTest ? <Tooltip title="Add Mock Data">
              <IconButton onClick={() => setMockDataCreatorOpen(true)} aria-label="add mock data">
                <AddIcon />
              </IconButton>
            </Tooltip> : null}
          </Box>
          <TextField
            hiddenLabel
            fullWidth
            variant="outlined"
            placeholder="Search mock data"
            margin="normal"
            value={mockSearchTerm}
            onChange={(e) => {
              setMockSearchTerm(e.target.value);
            }}
          />
          {selectedTest?.filteredMockData ? (
            <DraggableMockList 
               selectedTest={selectedTest}
               selectedMockItem={selectedMockItem}
               handleMockItemClick={handleMockItemClick}
               setFilteredMockData={setFilteredMockData}
            />
          ) : (
            <Typography>Select a test case to view mock data</Typography>
          )}
        </Box>
        {renderMockDataDrawer()}
        {renderTestCaseCreator()}
        {renderMockDataCreator()}
    </Box>
  );

}
