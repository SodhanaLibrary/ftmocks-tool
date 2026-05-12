import React from 'react';
import { Box, List, Typography, TextField } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';

import TestCaseTreeItem from './TestCaseTreeItem';

export default function TestCasesSidebar({
  testSearchTerm,
  onTestSearchChange,
  onCreateFolder,
  onCreateTestCase,
  getRootTests,
  selectedTest,
  expandedFolders,
  draggedTestId,
  dragOverTestId,
  getChildTests,
  onToggleFolder,
  onTestClick,
  onEditTestName,
  onDeleteTest,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}) {
  return (
    <Box
      sx={{
        p: 2,
        border: 1,
        borderColor: 'divider',
        boxShadow: 1,
        minWidth: '30%',
        width: '450px',
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
              id="tests-create-folder-btn"
              onClick={() => onCreateFolder(null)}
              aria-label="create folder"
            >
              <CreateNewFolderIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Create New Test Case">
            <IconButton
              id="tests-create-test-btn"
              onClick={() => onCreateTestCase(null)}
              aria-label="add"
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <TextField
        id="tests-search-input"
        hiddenLabel
        fullWidth
        variant="outlined"
        placeholder="Search test cases"
        margin="normal"
        value={testSearchTerm}
        onChange={(e) => onTestSearchChange(e.target.value)}
      />
      <List
        id="test-cases-list"
        sx={{ height: 'calc(100vh - 235px)', overflowY: 'scroll' }}
      >
        {getRootTests().map((test) => (
          <TestCaseTreeItem
            key={test.id}
            test={test}
            depth={0}
            testSearchTerm={testSearchTerm}
            selectedTest={selectedTest}
            expandedFolders={expandedFolders}
            draggedTestId={draggedTestId}
            dragOverTestId={dragOverTestId}
            getChildTests={getChildTests}
            onToggleFolder={onToggleFolder}
            onTestClick={onTestClick}
            onEditTestName={onEditTestName}
            onDeleteTest={onDeleteTest}
            onCreateFolder={onCreateFolder}
            onCreateTestCase={onCreateTestCase}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
          />
        ))}
      </List>
    </Box>
  );
}
