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
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
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
  const [currentTestCaseType, setCurrentTestCaseType] = useState('testcase');
  const [currentParentId, setCurrentParentId] = useState(null);
  const [defaultMocks, setDefaultMocks] = useState([]);

  // Drag and drop state for test cases
  const [draggedTestId, setDraggedTestId] = useState(null);
  const [dragOverTestId, setDragOverTestId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Folder state management
  const [expandedFolders, setExpandedFolders] = useState(new Set());

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
      return data;
    } catch (error) {
      console.error('Error fetching test data:', error);
      // Handle the error appropriately, e.g., show an error message to the user
    }
    return [];
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
          envDetails={envDetails}
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
          type={currentTestCaseType}
          parentId={currentParentId}
          testCases={testCases}
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
    if (
      !window.confirm(
        `Are you sure you want to delete all mock data for "${selectedTest?.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }
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
    if (
      !window.confirm(
        `Are you sure you want to delete the test "${test.name}"?`
      )
    ) {
      return;
    }
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

  const onCloseTestCaseCreator = async (refresh, testName) => {
    setTestCaseEditorOpen(false);
    setTestCaseCreatorOpen(false);
    if (refresh) {
      const data = await fetchTestData();
      // Navigate back to tests list after creating/editing
      if (!testName) {
        navigate('/tests');
      } else {
        const test = data.find((test) => test.name === testName);
        if (test) {
          if (test.type !== 'folder') {
            handleTestClick(test);
          }
          // Scroll to bottom of test cases list to show the newly created test
          setTimeout(() => {
            const testCasesList = document.getElementById('test-cases-list');
            if (testCasesList) {
              if (test.type === 'folder') {
                testCasesList.scrollTo({
                  top: 0,
                  behavior: 'smooth',
                });
              } else if (currentParentId === null) {
                testCasesList.scrollTo({
                  top: testCasesList.scrollHeight,
                  behavior: 'smooth',
                });
              }
            }
          }, 100);
        } else {
          navigate('/tests');
        }
      }
    }
  };

  const handleEditTestName = (type = 'testcase') => {
    setCurrentTestCaseType(type);
    setTestCaseEditorOpen(true);
    setTestCaseCreatorOpen(false);
  };

  const handleCreateTestCase = (parentId = null) => {
    setCurrentParentId(parentId);
    setCurrentTestCaseType('testcase');
    setTestCaseCreatorOpen(true);
    setTestCaseEditorOpen(false);
  };

  const handleCreateFolder = () => {
    setCurrentTestCaseType('folder');
    setTestCaseCreatorOpen(true);
    setTestCaseEditorOpen(false);
  };

  // Folder management functions
  const isFolder = (test) => {
    return test.type === 'folder' || test.isFolder === true;
  };

  const toggleFolderExpanded = (folderId) => {
    console.log('📁 Toggling folder:', folderId);
    setExpandedFolders((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(folderId)) {
        newExpanded.delete(folderId);
      } else {
        newExpanded.add(folderId);
      }
      return newExpanded;
    });
  };

  const getChildTests = (parentId) => {
    return filteredTestCases.filter((test) => test.parentId === parentId);
  };

  const getRootTests = () => {
    return filteredTestCases.filter((test) => !test.parentId);
  };

  // Render individual test item (folder or test case)
  const renderTestItem = (test, index, depth = 0) => {
    const isTestFolder = isFolder(test);
    const isExpanded = expandedFolders.has(test.id);
    const childTests = isTestFolder ? getChildTests(test.id) : [];

    const handleItemClick = (e) => {
      if (isTestFolder) {
        e.stopPropagation();
        toggleFolderExpanded(test.id);
      } else {
        handleTestClickWithDragCheck(test);
      }
    };

    return (
      <React.Fragment key={test.id}>
        <ListItem
          button
          draggable={
            testSearchTerm.trim() === '' && !isTestFolder ? true : false
          }
          onDragStart={(e) => handleTestDragStart(e, test.id)}
          onDragOver={(e) => handleTestDragOver(e, test.id)}
          onDragLeave={(e) => handleTestDragLeave(e, test.id)}
          onDrop={(e) => handleTestDrop(e, test.id)}
          onDragEnd={handleTestDragEnd}
          onClick={handleItemClick}
          selected={
            !isTestFolder && selectedTest && selectedTest.id === test.id
          }
          sx={{
            pl: 2 + depth * 3, // Indent nested items
            cursor: isTestFolder ? 'pointer' : 'move',
            opacity: draggedTestId === test.id ? 0.5 : 1,
            backgroundColor: (() => {
              if (dragOverTestId === test.id) return 'action.hover';
              if (!isTestFolder && selectedTest && selectedTest.id === test.id)
                return 'action.selected';
              return 'inherit';
            })(),
            border: dragOverTestId === test.id ? '2px dashed #2196f3' : 'none',
            borderRadius: dragOverTestId === test.id ? 1 : 0,
            '&:hover': {
              backgroundColor: (() => {
                if (dragOverTestId === test.id) return 'action.hover';
                if (
                  !isTestFolder &&
                  selectedTest &&
                  selectedTest.id === test.id
                )
                  return 'action.selected';
                return 'action.hover';
              })(),
            },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'all 0.2s ease',
            '& .delete-icon': {
              display: 'none',
            },
            '&:hover .delete-icon': {
              display: 'block',
            },
            // Add drag handle visual indicator only for non-folder items when not searching
            '&::before':
              testSearchTerm.trim() === '' && !isTestFolder
                ? {
                    content: '"⋮⋮"',
                    marginRight: '8px',
                    color: '#666',
                    fontSize: '14px',
                    cursor: 'grab',
                    userSelect: 'none',
                  }
                : {
                    display: 'none',
                  },
            '&:active::before': {
              cursor: 'grabbing',
            },
          }}
        >
          {isTestFolder && (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
              {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
              {isExpanded ? (
                <FolderOpenIcon sx={{ ml: 0.5 }} />
              ) : (
                <FolderIcon sx={{ ml: 0.5 }} />
              )}
            </Box>
          )}

          <ListItemText
            primary={test.name}
            sx={{
              '& .MuiListItemText-primary': {
                fontWeight: isTestFolder ? 'bold' : 'normal',
                color: isTestFolder ? 'primary.main' : 'inherit',
              },
            }}
          />

          <Box display="flex" gap={0}>
            <Tooltip title="Edit Test Name">
              <IconButton
                className="delete-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditTestName(test.type);
                }}
                aria-label="edit"
                size="small"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Test">
              <IconButton
                className="delete-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTest(test);
                }}
                aria-label="delete"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            {isTestFolder && (
              <Tooltip title="Add New Test Case">
                <IconButton
                  className="add-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateTestCase(test.id);
                  }}
                  aria-label="add test in folder"
                  size="small"
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </ListItem>

        {/* Render child items if folder is expanded */}
        {isTestFolder && isExpanded && childTests.length > 0 && (
          <Box>
            {childTests.map((childTest, childIndex) =>
              renderTestItem(childTest, index + childIndex + 1, depth + 1)
            )}
          </Box>
        )}
      </React.Fragment>
    );
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

  // Drag and Drop handlers for test cases
  const handleTestDragStart = (e, testId) => {
    const draggedTest = filteredTestCases.find((test) => test.id === testId);
    console.log('🎯 Test drag started:', testId, draggedTest);
    setDraggedTestId(testId);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target);
  };

  const handleTestDragOver = (e, testId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedTestId !== testId) {
      setDragOverTestId(testId);
    }
  };

  const handleTestDragLeave = (e, testId) => {
    // Only clear dragOverTestId if we're actually leaving the element
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverTestId(null);
    }
  };

  const handleTestDrop = (e, dropTestId) => {
    e.preventDefault();
    console.log('🎯 Test drop event:', { draggedTestId, dropTestId });

    if (draggedTestId === null || draggedTestId === dropTestId) {
      return;
    }

    // Find the dragged test and drop target test
    const draggedTest = filteredTestCases.find(
      (test) => test.id === draggedTestId
    );
    const dropTargetTest = filteredTestCases.find(
      (test) => test.id === dropTestId
    );

    if (!draggedTest || !dropTargetTest) {
      console.error('Could not find dragged or drop target test');
      return;
    }

    if (dropTargetTest.type === 'folder') {
      draggedTest.parentId = dropTargetTest.id;
      setTestCases([...testCases]);
      setFilteredTestCases([...filteredTestCases]);
      fetch(`/api/v1/tests/${draggedTest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draggedTest),
      })
        .then((response) => {
          if (response.ok) {
            console.log('Test moved to folder successfully');
            fetchTestData();
          } else {
            console.error('Failed to move test to folder');
          }
        })
        .catch((error) => {
          console.error('Error moving test to folder:', error);
          fetchTestData();
        });
    }

    console.log('🔄 Reordering test cases...');
    console.log(
      '📊 Before reorder:',
      filteredTestCases.map((t) => t.name)
    );

    const newFilteredTestCases = [...filteredTestCases];

    // Find current indices
    const draggedIndex = newFilteredTestCases.findIndex(
      (test) => test.id === draggedTestId
    );
    const dropIndex = newFilteredTestCases.findIndex(
      (test) => test.id === dropTestId
    );

    // Remove the dragged item
    newFilteredTestCases.splice(draggedIndex, 1);

    // Insert at new position (adjust index if dragging from before the drop target)
    const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newFilteredTestCases.splice(insertIndex, 0, draggedTest);

    console.log(
      '📊 After reorder:',
      newFilteredTestCases.map((t) => t.name)
    );
    console.log('✅ Test reorder completed');

    setFilteredTestCases(newFilteredTestCases);

    // Also update the main testCases array if no search filter is applied
    if (!testSearchTerm.trim()) {
      setTestCases(newFilteredTestCases);
      fetch(`/api/v1/reorderTests`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newOrder: newFilteredTestCases.map((t) => t.id),
        }),
      })
        .then((response) => {
          if (response.ok) {
            console.log('Test reordered successfully');
            fetchTestData();
          } else {
            console.error('Failed to reorder test');
          }
        })
        .catch((error) => {
          console.error('Error reordering test:', error);
        });
    }

    setDragOverTestId(null);
  };

  const handleTestDragEnd = () => {
    console.log('🏁 Test drag ended, clearing state');
    setDraggedTestId(null);
    setDragOverTestId(null);
    // Use setTimeout to prevent click events immediately after drag
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleTestClickWithDragCheck = (test) => {
    if (!isDragging) {
      handleTestClick(test);
    }
  };

  useEffect(() => {
    if (selectedTab === 0) {
      fetchMockData(selectedTest);
    }
  }, [selectedTab]);

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
          <Box>
            <Typography variant="h6" gutterBottom>
              Test Cases
            </Typography>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: 'block', mt: -1 }}
            >
              🔄 Drag to reorder test cases
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Create New Folder">
              <IconButton
                onClick={handleCreateFolder}
                aria-label="create folder"
              >
                <CreateNewFolderIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Create New Test Case">
              <IconButton onClick={handleCreateTestCase} aria-label="add">
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>
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
        <List
          id="test-cases-list"
          sx={{ height: 'calc(100vh - 235px)', overflowY: 'scroll' }}
        >
          {getRootTests().map((test, index) => renderTestItem(test, index, 0))}
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
              {/* <Button
                sx={buttonStyle(1)}
                variant="text"
                color="info"
                size="small"
                onClick={() => setSelectedTab(1)}
              >
                Snaps
              </Button> */}
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
                    draggable={mockSearchTerm.trim() === '' ? true : false}
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
