import React from 'react';
import { Box } from '@mui/material';
import TestCasesSidebar from './TestCasesSidebar';
import TestDetailPanel from './TestDetailPanel';
import TestsDrawers from './TestsDrawers';
import { useTestsPage } from './useTestsPage';

export default function Tests({ envDetails }) {
  const {
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
  } = useTestsPage();

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 3,
        pt: 0,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 0,
        }}
      >
        <TestCasesSidebar
          testSearchTerm={testSearchTerm}
          onTestSearchChange={setTestSearchTerm}
          onCreateFolder={handleCreateFolder}
          onCreateTestCase={handleCreateTestCase}
          getRootTests={getRootTests}
          selectedTest={selectedTest}
          expandedFolders={expandedFolders}
          draggedTestId={draggedTestId}
          dragOverTestId={dragOverTestId}
          getChildTests={getChildTests}
          onToggleFolder={toggleFolderExpanded}
          onTestClick={handleTestClickWithDragCheck}
          onEditTestName={handleEditTestName}
          onDeleteTest={handleDeleteTest}
          onDragStart={handleTestDragStart}
          onDragOver={handleTestDragOver}
          onDragLeave={handleTestDragLeave}
          onDrop={handleTestDrop}
          onDragEnd={handleTestDragEnd}
        />
        <TestDetailPanel
          selectedTest={selectedTest}
          mockSearchTerm={mockSearchTerm}
          onMockSearchChange={setMockSearchTerm}
          selectedTab={selectedTab}
          onSelectTab={setSelectedTab}
          onEditTestName={handleEditTestName}
          onDuplicateTest={duplicateTest}
          onResetMockData={resetMockData}
          onOpenMockDataCreator={() => setMockDataCreatorOpen(true)}
          onDeleteAllMockData={deleteAllMockData}
          handleMockItemClick={handleMockItemClick}
          selectedMockItem={selectedMockItem}
          setFilteredMockData={setFilteredMockData}
          testCases={testCases}
          fetchMockData={fetchMockData}
          envDetails={envDetails}
          fetchTestData={fetchTestData}
        />
      </Box>
      <TestsDrawers
        envDetails={envDetails}
        selectedTest={selectedTest}
        defaultMocks={defaultMocks}
        selectedMockItem={selectedMockItem}
        drawerOpen={drawerOpen}
        onCloseMockDrawer={handleDrawerClose}
        testCaseCreatorOpen={testCaseCreatorOpen}
        testCaseEditorOpen={testCaseEditorOpen}
        currentTestCaseType={currentTestCaseType}
        currentParentId={currentParentId}
        testCases={testCases}
        onCloseTestCaseCreator={onCloseTestCaseCreator}
        mockDataCreatorOpen={mockDataCreatorOpen}
        onCloseMockDataCreator={onCloseMockDataCreator}
      />
    </Box>
  );
}
