import React from 'react';
import { Box, ListItem, ListItemText } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export function isFolder(test) {
  return test.type === 'folder' || test.isFolder === true;
}

export default function TestCaseTreeItem({
  test,
  depth,
  testSearchTerm,
  selectedTest,
  expandedFolders,
  draggedTestId,
  dragOverTestId,
  getChildTests,
  onToggleFolder,
  onTestClick,
  onEditTestName,
  onDeleteTest,
  onCreateFolder,
  onCreateTestCase,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}) {
  const isTestFolder = isFolder(test);
  const isExpanded = expandedFolders.has(test.id);
  const childTests = isTestFolder ? getChildTests(test.id) : [];

  const handleItemClick = (e) => {
    if (isTestFolder) {
      e.stopPropagation();
      onToggleFolder(test.id);
    } else {
      onTestClick(test);
    }
  };

  return (
    <React.Fragment>
      <ListItem
        id={`tests-list-item-${test.id}`}
        button
        draggable={testSearchTerm.trim() === ''}
        onDragStart={(e) => onDragStart(e, test.id)}
        onDragOver={(e) => onDragOver(e, test.id)}
        onDragLeave={(e) => onDragLeave(e, test.id)}
        onDrop={(e) => onDrop(e, test.id)}
        onDragEnd={onDragEnd}
        onClick={handleItemClick}
        selected={!isTestFolder && selectedTest && selectedTest.id === test.id}
        sx={{
          pl: 2 + depth * 3,
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
          '& .hover-icon': {
            display: 'none',
          },
          '&:hover .hover-icon': {
            display: 'block',
          },
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
          <Tooltip
            title={isTestFolder ? 'Edit Folder Name' : 'Edit Test Name'}
          >
            <IconButton
              id={`tests-edit-${test.id}`}
              className="hover-icon"
              onClick={(e) => {
                e.stopPropagation();
                onEditTestName(test);
              }}
              aria-label="edit"
              size="small"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={isTestFolder ? 'Delete Folder' : 'Delete Test'}>
            <IconButton
              id={`tests-delete-${test.id}`}
              className="hover-icon"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTest(test);
              }}
              aria-label="delete"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          {isTestFolder && (
            <Tooltip title="Create New Folder">
              <IconButton
                id={`tests-create-folder-${test.id}`}
                className="hover-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateFolder(test.id);
                }}
                aria-label="create folder"
              >
                <CreateNewFolderIcon />
              </IconButton>
            </Tooltip>
          )}
          {isTestFolder && (
            <Tooltip title="Add New Test Case">
              <IconButton
                id={`tests-add-test-${test.id}`}
                className="hover-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateTestCase(test.id);
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

      {isTestFolder && isExpanded && childTests.length > 0 && (
        <Box>
          {childTests.map((childTest) => (
            <TestCaseTreeItem
              key={childTest.id}
              test={childTest}
              depth={depth + 1}
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
        </Box>
      )}
    </React.Fragment>
  );
}
