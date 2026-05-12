import React from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

import DraggableMockList from './MockDataList';
import Snaps from './Snaps';
import LogViewer from './LogViewer';
import RecordMockOrTest from './RecordMockOrTest';
import TestOptimizer from './TestOptimizer';
import Documentator from './Documentator';

export default function TestDetailPanel({
  selectedTest,
  mockSearchTerm,
  onMockSearchChange,
  selectedTab,
  onSelectTab,
  onEditTestName,
  onDuplicateTest,
  onResetMockData,
  onOpenMockDataCreator,
  onDeleteAllMockData,
  handleMockItemClick,
  selectedMockItem,
  setFilteredMockData,
  testCases,
  fetchMockData,
  envDetails,
  fetchTestData,
}) {
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
                id="tests-edit-selected-name-btn"
                className="edit-icon"
                sx={{ ml: 0.5, cursor: 'pointer' }}
                size="small"
                onClick={() => onEditTestName(selectedTest)}
                aria-label="edit test"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        {selectedTest && selectedTest?.type !== 'folder' ? (
          <Box>
            <Tooltip title="Duplicate Test">
              <IconButton
                id="tests-duplicate-btn"
                onClick={onDuplicateTest}
                aria-label="duplicate test"
              >
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reset Mock Data">
              <IconButton
                id="tests-reset-mock-data-btn"
                onClick={onResetMockData}
                aria-label="reset mock data"
              >
                <RestartAltIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add Mock Data">
              <IconButton
                id="tests-add-mock-data-btn"
                onClick={onOpenMockDataCreator}
                aria-label="add mock data"
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete All Mock Data">
              <IconButton
                id="tests-delete-all-mock-data-btn"
                onClick={onDeleteAllMockData}
                aria-label="delete all mock data"
              >
                <DeleteSweepIcon />
              </IconButton>
            </Tooltip>
          </Box>
        ) : null}
      </Box>
      {selectedTest?.filteredMockData && selectedTest.type !== 'folder' ? (
        <Box>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Button
              id="tests-tab-record"
              sx={buttonStyle(3)}
              variant="text"
              color="info"
              size="small"
              onClick={() => onSelectTab(3)}
            >
              Record
            </Button>
            <Button
              id="tests-tab-mocks"
              sx={buttonStyle(0)}
              variant="text"
              color="info"
              size="small"
              onClick={() => onSelectTab(0)}
            >
              Mocks
            </Button>
            <Button
              id="tests-tab-logs"
              sx={buttonStyle(2)}
              variant="text"
              color="info"
              size="small"
              onClick={() => onSelectTab(2)}
            >
              Logs
            </Button>
            <Button
              id="tests-tab-optimize"
              sx={buttonStyle(4)}
              variant="text"
              color="info"
              size="small"
              onClick={() => onSelectTab(4)}
            >
              Optimize
            </Button>
            <Button
              id="tests-tab-documentation"
              sx={buttonStyle(5)}
              variant="text"
              color="info"
              size="small"
              onClick={() => onSelectTab(5)}
            >
              Documentation
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
                  onChange={(e) => onMockSearchChange(e.target.value)}
                />
                <DraggableMockList
                  draggable={mockSearchTerm.trim() === '' ? true : false}
                  selectedTest={selectedTest}
                  selectedMockItem={selectedMockItem}
                  handleMockItemClick={handleMockItemClick}
                  setFilteredMockData={setFilteredMockData}
                  deleteAllMockData={onDeleteAllMockData}
                />
              </Box>
            )}
            {selectedTab === 1 && <Snaps selectedTest={selectedTest} />}
            {selectedTab === 2 && <LogViewer selectedTest={selectedTest} />}
            {selectedTab === 3 && (
              <RecordMockOrTest
                testCases={testCases}
                selectedTest={selectedTest}
                fetchMockData={fetchMockData}
                envDetails={envDetails}
                resetMockData={onResetMockData}
              />
            )}
            {selectedTab === 4 && (
              <TestOptimizer
                selectedTest={selectedTest}
                fetchMockData={fetchMockData}
                envDetails={envDetails}
                resetMockData={onResetMockData}
                fetchTestData={fetchTestData}
              />
            )}
            {selectedTab === 5 && (
              <Documentator
                selectedTest={selectedTest}
                fetchMockData={fetchMockData}
                envDetails={envDetails}
                resetMockData={onResetMockData}
                fetchTestData={fetchTestData}
              />
            )}
          </Box>
        </Box>
      ) : (
        <Typography>Select a test case to view mock data</Typography>
      )}
    </Box>
  );
}
