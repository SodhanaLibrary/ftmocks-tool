import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sortUrlsByMatch } from '../utils/SearchUtils';
import { markDuplicateMocks } from '../utils/CommonUtils';

export function useTestsPage() {
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

  const [draggedTestId, setDraggedTestId] = useState(null);
  const [dragOverTestId, setDragOverTestId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

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
    }
    return [];
  };

  const fetchMockData = async (test, options) => {
    try {
      if (!test?.id) {
        return;
      }
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
    const includedIds = new Set();
    testCases.forEach((test) => {
      if (test.name.toLowerCase().includes(searchTerm)) {
        includedIds.add(test.id);
        let parentId = test.parentId;
        while (parentId) {
          includedIds.add(parentId);
          parentId = testCases.find((t) => t.id === parentId)?.parentId;
        }
      }
    });
    const filteredTests = testCases.filter((test) => includedIds.has(test.id));
    setFilteredTestCases(filteredTests);
  };

  useEffect(() => {
    fetchTestData();
    fetchDefaultMocks();
  }, []);

  useEffect(() => {
    if (testId && testCases.length > 0) {
      const test = testCases.find((t) => t.id === testId);
      if (test) {
        setSelectedTest({ ...test, filteredMockData: [] });
        setMockSearchTerm('');
        fetchMockData(test, {
          testClick: true,
        });
        let parentId = test.parentId;
        const expanded = new Set(expandedFolders);
        while (parentId) {
          expanded.add(parentId);
          parentId = testCases.find((t) => t.id === parentId)?.parentId;
        }
        setExpandedFolders(expanded);
      }
    } else if (!testId && selectedTest) {
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
      if (!testName) {
        navigate('/tests');
      } else {
        const test = data.find((test) => test.name === testName);
        if (test) {
          if (test.type !== 'folder') {
            handleTestClick(test);
          }
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

  const handleEditTestName = (test) => {
    setSelectedTest(test);
    setCurrentTestCaseType(test.type);
    setTestCaseEditorOpen(true);
    setTestCaseCreatorOpen(false);
  };

  const handleCreateTestCase = (parentId = null) => {
    setCurrentParentId(parentId);
    setCurrentTestCaseType('testcase');
    setTestCaseCreatorOpen(true);
    setTestCaseEditorOpen(false);
  };

  const handleCreateFolder = (parentId = null) => {
    setCurrentParentId(parentId);
    setCurrentTestCaseType('folder');
    setTestCaseCreatorOpen(true);
    setTestCaseEditorOpen(false);
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

    if (dropTargetTest.type === 'folder' && draggedTest.type !== 'folder') {
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

    const draggedIndex = newFilteredTestCases.findIndex(
      (test) => test.id === draggedTestId
    );
    const dropIndex = newFilteredTestCases.findIndex(
      (test) => test.id === dropTestId
    );

    newFilteredTestCases.splice(draggedIndex, 1);

    const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newFilteredTestCases.splice(insertIndex, 0, draggedTest);

    console.log(
      '📊 After reorder:',
      newFilteredTestCases.map((t) => t.name)
    );
    console.log('✅ Test reorder completed');

    setFilteredTestCases(newFilteredTestCases);

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
    setDraggedTestId(null);
    setIsDragging(false);
  };

  const handleTestDragEnd = () => {
    console.log('🏁 Test drag ended, clearing state');
    setDraggedTestId(null);
    setDragOverTestId(null);
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

  return {
    testSearchTerm,
    setTestSearchTerm,
    selectedTest,
    selectedTab,
    setSelectedTab,
    mockSearchTerm,
    setMockSearchTerm,
    selectedMockItem,
    drawerOpen,
    testCaseCreatorOpen,
    testCaseEditorOpen,
    mockDataCreatorOpen,
    setMockDataCreatorOpen,
    currentTestCaseType,
    currentParentId,
    defaultMocks,
    draggedTestId,
    dragOverTestId,
    expandedFolders,
    testCases,
    handleMockItemClick,
    fetchMockData,
    fetchTestData,
    handleDrawerClose,
    deleteAllMockData,
    handleDeleteTest,
    onCloseMockDataCreator,
    onCloseTestCaseCreator,
    handleEditTestName,
    handleCreateTestCase,
    handleCreateFolder,
    toggleFolderExpanded,
    getChildTests,
    getRootTests,
    setFilteredMockData,
    resetMockData,
    duplicateTest,
    handleTestDragStart,
    handleTestDragOver,
    handleTestDragLeave,
    handleTestDrop,
    handleTestDragEnd,
    handleTestClickWithDragCheck,
  };
}
