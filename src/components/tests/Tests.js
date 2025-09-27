import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  TextField,
  Drawer,
} from '@mui/material';
import MockDataView from '../MockDataView';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import TestCaseCreator from './TestCaseCreator';
import DeleteIcon from '@mui/icons-material/Delete';
import MockDataCreator from '../MockDataCreator';
import EditIcon from '@mui/icons-material/Edit';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { sortUrlsByMatch } from '../utils/SearchUtils';
import DraggableMockList from './MockDataList';
import Snaps from './Snaps';
import LogViewer from './LogViewer';
import RecordMockOrTest from './RecordMockOrTest';
import TestOptimizer from './TestOptimizer';
import { markDuplicateMocks } from '../utils/CommonUtils';

export default function Tests({ envDetails }) {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [filteredTestCases, setFilteredTestCases] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [mockSearchTerm, setMockSearchTerm] = React.useState('');
  const [testSearchTerm, setTestSearchTerm] = useState('');
  const [selectedMockItem, setSelectedMockItem] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [testCaseCreatorOpen, setTestCaseCreatorOpen] = useState(false);
  const [testCaseEditorOpen, setTestCaseEditorOpen] = useState(false);
  const [mockDataCreatorOpen, setMockDataCreatorOpen] = useState(false);
  const [defaultMocks, setDefaultMocks] = useState([]);

  const handleMockItemClick = (item) => {
    setSelectedMockItem(item);
    setDrawerOpen(true);
  };

  const fetchDefaultMocks = async () => {
    try {
      const response = await fetch('/api/v1/defaultmocks');
      if (!response.ok) {
        throw new Error('Failed to fetch default mocks');
      }
      const data = await response.json();
      setDefaultMocks(data);
    } catch (error) {
      setDefaultMocks([]);
      console.error('Error fetching default mocks:', error);
    }
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

  const fetchMockData = async (test, options) => {
    try {
      const response = await fetch(
        `/api/v1/tests/${test.id}/mockdata?name=${test.name}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch mock data');
      }
      const data = await response.json();
      const markedData = markDuplicateMocks(data);
      setSelectedTest((prevTest) => ({
        ...prevTest,
        mockData: markedData,
        filteredMockData: sortUrlsByMatch(mockSearchTerm, markedData),
      }));
      if (options?.testClick) {
        if (markedData.length === 0) {
          setSelectedTab(3);
        }
      } else if (!options?.stopRecording) {
        setSelectedTab(0);
      }
    } catch (error) {
      console.error('Error fetching mock data:', error);
      // Handle the error appropriately, e.g., show an error message to the user
    }
  };

  const handleTestClick = (test) => {
    setSelectedTest({ ...test, filteredMockData: [] });
    setMockSearchTerm('');
    navigate(`/tests/${test.id}`);
    fetchMockData(test, {
      testClick: true,
    });
  };

  const onTestCaseSearch = (searchTerm) => {
    const filteredTests = testCases.filter((test) =>
      test.name.toLowerCase().includes(searchTerm)
    );
    setFilteredTestCases(filteredTests);
  };

  useEffect(() => {
    fetchTestData();
    fetchDefaultMocks();
  }, []);

  // Handle URL parameter changes
  useEffect(() => {
    if (testId && testCases.length > 0) {
      const test = testCases.find((t) => t.id === testId);
      if (test) {
        setSelectedTest({ ...test, filteredMockData: [] });
        setMockSearchTerm('');
        fetchMockData(test, {
          testClick: true,
        });
      }
    } else if (!testId && selectedTest) {
      // If no testId in URL, clear selection
      setSelectedTest(null);
      setSelectedMockItem(null);
    }
  }, [testId, testCases]);

  useEffect(() => {
    if (testCases.length > 0) {
      onTestCaseSearch(testSearchTerm.toLowerCase());
    }
  }, [testSearchTerm]);

  useEffect(() => {
    if (testCases.length > 0) {
      onTestCaseSearch(testSearchTerm.toLowerCase());
    }
    if (selectedTest) {
      const newSelectedTest = testCases.find(
        (test) => test.id === selectedTest.id
      );
      if (newSelectedTest) {
        handleTestClick(newSelectedTest);
      } else {
        setSelectedTest(null);
        setSelectedMockItem(null);
      }
    }
  }, [testCases]);

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
        <MockDataView
          selectedTest={selectedTest}
          onClose={handleDrawerClose}
          mockItem={selectedMockItem}
          defaultMocks={defaultMocks}
        />
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
        <TestCaseCreator
          onClose={onCloseTestCaseCreator}
          selectedTest={testCaseEditorOpen ? selectedTest : null}
        />
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
        <MockDataCreator
          selectedTest={selectedTest}
          onClose={onCloseMockDataCreator}
        />
      </Drawer>
    );
  };

  const deleteAllMockData = () => {
    fetch(
      `/api/v1/tests/${selectedTest.id}/mockdata?name=${selectedTest.name}`,
      {
        method: 'DELETE',
      }
    ).then((response) => {
      if (response.ok) {
        console.log('Mock data deleted successfully');
        fetchMockData(selectedTest);
      }
    });
  };

  const handleDeleteTest = (test) => {
    fetch(`/api/v1/tests/${test.id}?name=${test.name}`, { method: 'DELETE' })
      .then((response) => {
        if (response.ok) {
          console.log('Test deleted successfully');
          fetchTestData();
          // Navigate back to tests list if we're viewing the deleted test
          if (selectedTest && selectedTest.id === test.id) {
            navigate('/tests');
          }
        } else {
          console.error('Failed to delete test');
        }
      })
      .catch((error) => {
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
    if (refresh) {
      fetchTestData();
      // Navigate back to tests list after creating/editing
      navigate('/tests');
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
    if (selectedTest?.mockData?.length) {
      let fData = [];
      try {
        fData = sortUrlsByMatch(mockSearchTerm, selectedTest?.mockData);
      } catch (error) {
        fData = selectedTest?.mockData?.filter((item) =>
          item.url.toLowerCase().includes(mockSearchTerm.toLowerCase())
        );
      }
      selectedTest.filteredMockData = fData;
      setSelectedTest({ ...selectedTest });
    }
  }, [mockSearchTerm]);

  const setFilteredMockData = (newFiltrdMocks) => {
    const newMockData = [];
    let pointer1 = 0,
      pointer2 = 0;
    while (
      pointer1 < selectedTest.mockData.length &&
      pointer2 < newFiltrdMocks.length
    ) {
      if (selectedTest.mockData[pointer1].id === newFiltrdMocks[pointer2].id) {
        newMockData.push(selectedTest.mockData[pointer1]);
        pointer1++;
        pointer2++;
      } else if (
        newMockData.find((md) => md.id === newFiltrdMocks[pointer2].id)
      ) {
        pointer1++;
      } else {
        newMockData.push(newFiltrdMocks[pointer2]);
        pointer2++;
      }
    }
    selectedTest.mockData = newMockData;
    setSelectedTest({ ...selectedTest });

    fetch(
      `/api/v1/tests/${selectedTest.id}/mockdata?name=${selectedTest.name}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedTest.mockData),
      }
    )
      .then((response) => {
        if (response.ok) {
          console.log('Mock data updated successfully');
          fetchMockData(selectedTest);
        } else {
          console.error('Failed to update mock data');
        }
      })
      .catch((error) => {
        console.error('Error updating mock data:', error);
      });
  };

  const resetMockData = () => {
    fetch(`/api/v1/tests/${selectedTest.id}/reset?name=${selectedTest.name}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selectedTest),
    })
      .then((response) => {
        if (response.ok) {
          console.log('Test reset successfully');
          fetchTestData();
        } else {
          console.error('Failed to reset test');
        }
      })
      .catch((error) => {
        console.error('Error resetting test:', error);
      });
  };

  const duplicateTest = () => {
    fetch(
      `/api/v1/tests/${selectedTest.id}/duplicate?name=${selectedTest.name}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedTest),
      }
    )
      .then((response) => {
        if (response.ok) {
          console.log('Test duplicated successfully');
          fetchTestData();
        } else {
          console.error('Failed to duplicate test');
        }
      })
      .catch((error) => {
        console.error('Error duplicating test:', error);
      });
  };

  const buttonStyle = (path) => ({
    borderBottom: selectedTab === path ? '2px solid' : 'none',
    borderRadius: 0,
    '&:hover': {
      borderBottom: '2px solid',
    },
  });

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 3,
        pt: 0,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 0,
      }}
    >
      <Box
        sx={{
          p: 2,
          border: 1,
          borderColor: 'divider',
          boxShadow: 1,
          minWidth: '30%',
          width: '30%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
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
        <List sx={{ height: 'calc(100vh - 235px)', overflowY: 'scroll' }}>
          {filteredTestCases.map((test) => (
            <ListItem
              button
              key={test.id}
              onClick={() => handleTestClick(test)}
              selected={selectedTest && selectedTest.id === test.id}
              sx={{
                backgroundColor:
                  selectedTest && selectedTest.id === test.id
                    ? 'action.selected'
                    : 'inherit',
                '&:hover': {
                  backgroundColor:
                    selectedTest && selectedTest.id === test.id
                      ? 'action.selected'
                      : 'action.hover',
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
              <Box display="flex" gap={0}>
                <Tooltip title="Edit Test Name">
                  <IconButton
                    className="delete-icon"
                    onClick={handleEditTestName}
                    aria-label="edit"
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Test">
                  <IconButton
                    className="delete-icon"
                    onClick={() => handleDeleteTest(test)}
                    aria-label="delete"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box
        sx={{
          p: 2,
          border: 1,
          borderColor: 'divider',
          boxShadow: 1,
          flexGrow: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              '&:hover .edit-icon': { display: 'block' },
              '& .edit-icon': { display: 'none' },
            }}
          >
            <Typography variant="h6" gutterBottom>
              {selectedTest ? selectedTest.name : 'Select a test case'}
            </Typography>
            {selectedTest && (
              <Tooltip title="Edit Test name">
                <IconButton
                  className="edit-icon"
                  sx={{ ml: 0.5, cursor: 'pointer' }}
                  size="small"
                  onClick={handleEditTestName}
                  aria-label="edit test"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          {selectedTest ? (
            <Box>
              <Tooltip title="Duplicate Test">
                <IconButton onClick={duplicateTest} aria-label="duplicate test">
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reset Mock Data">
                <IconButton
                  onClick={resetMockData}
                  aria-label="reset mock data"
                >
                  <RestartAltIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Add Mock Data">
                <IconButton
                  onClick={() => setMockDataCreatorOpen(true)}
                  aria-label="add mock data"
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete All Mock Data">
                <IconButton
                  onClick={() => deleteAllMockData()}
                  aria-label="delete all mock data"
                >
                  <DeleteSweepIcon />
                </IconButton>
              </Tooltip>
            </Box>
          ) : null}
        </Box>
        {selectedTest?.filteredMockData ? (
          <Box>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
              <Button
                sx={buttonStyle(3)}
                variant="text"
                color="info"
                size="small"
                onClick={() => setSelectedTab(3)}
              >
                Record
              </Button>
              <Button
                sx={buttonStyle(0)}
                variant="text"
                color="info"
                size="small"
                onClick={() => setSelectedTab(0)}
              >
                Mocks
              </Button>
              <Button
                sx={buttonStyle(1)}
                variant="text"
                color="info"
                size="small"
                onClick={() => setSelectedTab(1)}
              >
                Snaps
              </Button>
              <Button
                sx={buttonStyle(2)}
                variant="text"
                color="info"
                size="small"
                onClick={() => setSelectedTab(2)}
              >
                Logs
              </Button>
              <Button
                sx={buttonStyle(4)}
                variant="text"
                color="info"
                size="small"
                onClick={() => setSelectedTab(4)}
              >
                Optimize
              </Button>
            </Box>
            <Box sx={{ height: 'calc(100vh - 200px)', overflowY: 'scroll' }}>
              {selectedTab === 0 && (
                <Box>
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
                  <DraggableMockList
                    selectedTest={selectedTest}
                    selectedMockItem={selectedMockItem}
                    handleMockItemClick={handleMockItemClick}
                    setFilteredMockData={setFilteredMockData}
                    deleteAllMockData={deleteAllMockData}
                  />
                </Box>
              )}
              {selectedTab === 1 && <Snaps selectedTest={selectedTest} />}
              {selectedTab === 2 && <LogViewer selectedTest={selectedTest} />}
              {selectedTab === 3 && (
                <RecordMockOrTest
                  selectedTest={selectedTest}
                  fetchMockData={fetchMockData}
                  envDetails={envDetails}
                  resetMockData={resetMockData}
                />
              )}
              {selectedTab === 4 && (
                <TestOptimizer
                  selectedTest={selectedTest}
                  fetchMockData={fetchMockData}
                  envDetails={envDetails}
                  resetMockData={resetMockData}
                  fetchTestData={fetchTestData}
                />
              )}
            </Box>
          </Box>
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
