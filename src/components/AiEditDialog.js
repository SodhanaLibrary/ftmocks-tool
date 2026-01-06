import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PropTypes from 'prop-types';
import { isValidJSON } from './utils/CommonUtils';
import { FtJSON } from './utils/FtJSON';

// Editable span component for inline editing
const EditableSpan = ({ value, color, onSave, type }) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const startEditing = (e) => {
    e.stopPropagation();
    setEditValue(String(value));
    setEditing(true);
  };

  const handleSave = () => {
    let newValue = editValue;
    if (type === 'value') {
      // Try to parse as JSON value (number, boolean, null)
      if (editValue === 'null') {
        newValue = null;
      } else if (editValue === 'true') {
        newValue = true;
      } else if (editValue === 'false') {
        newValue = false;
      } else if (!isNaN(Number(editValue)) && editValue.trim() !== '') {
        newValue = Number(editValue);
      }
      // Otherwise keep as string
    }
    onSave(newValue);
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <input
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        autoFocus
        style={{
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          border: '1px solid #1976d2',
          borderRadius: 3,
          padding: '2px 4px',
          outline: 'none',
          minWidth: 60,
          color: color,
          backgroundColor: '#fff',
        }}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <span
      style={{
        color,
        cursor: 'text',
        padding: '1px 2px',
        borderRadius: 2,
      }}
      onClick={startEditing}
      title="Click to edit"
    >
      {type === 'key' ? `"${value}"` : null}
      {type === 'value' && typeof value === 'string' ? `"${value}"` : null}
      {type === 'value' && typeof value !== 'string' ? String(value) : null}
    </span>
  );
};

EditableSpan.propTypes = {
  value: PropTypes.any,
  color: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['key', 'value']).isRequired,
};

// JSON Tree Node Component
const JsonTreeNode = ({
  keyName,
  value,
  path,
  onDuplicate,
  onDelete,
  onUpdate,
  isLast,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDuplicate = () => {
    onDuplicate(path);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(path);
    handleMenuClose();
  };

  const handleKeyChange = (newKey) => {
    if (newKey !== keyName && newKey.trim() !== '') {
      onUpdate(path, value, newKey);
    }
  };

  const handleValueChange = (newValue) => {
    onUpdate(path, newValue);
  };

  const isObject =
    value !== null && typeof value === 'object' && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;

  const getValueColor = () => {
    if (value === null) return '#999';
    if (typeof value === 'boolean') return '#82AAFF';
    if (typeof value === 'number') return '#A6E22E';
    if (typeof value === 'string') return '#F78C6C';
    return '#999';
  };

  const comma = isLast ? '' : ',';

  if (!isExpandable) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          pl: 3,
          py: 0.25,
          '&:hover': { bgcolor: 'action.hover' },
          '&:hover .action-btn': { opacity: 1 },
        }}
      >
        <Box sx={{ flex: 1, fontFamily: 'monospace', fontSize: '0.9rem' }}>
          {keyName !== null && (
            <>
              <EditableSpan
                value={keyName}
                color="#9A77F5"
                onSave={handleKeyChange}
                type="key"
              />
              {': '}
            </>
          )}
          <EditableSpan
            value={value}
            color={getValueColor()}
            onSave={handleValueChange}
            type="value"
          />
          {comma}
        </Box>
        <IconButton
          size="small"
          onClick={handleMenuOpen}
          className="action-btn"
          sx={{ opacity: 0, transition: 'opacity 0.2s' }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
        <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose}>
          <MenuItem onClick={handleDuplicate}>Duplicate</MenuItem>
          <MenuItem onClick={handleDelete}>Delete</MenuItem>
        </Menu>
      </Box>
    );
  }

  const entries = isArray ? value : Object.entries(value);
  const bracketOpen = isArray ? '[' : '{';
  const bracketClose = isArray ? ']' : '}';

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          py: 0.25,
          '&:hover': { bgcolor: 'action.hover' },
          '&:hover .action-btn': { opacity: 1 },
        }}
      >
        <IconButton
          size="small"
          onClick={() => setExpanded(!expanded)}
          sx={{ p: 0.25 }}
        >
          {expanded ? (
            <RemoveIcon fontSize="small" />
          ) : (
            <AddIcon fontSize="small" />
          )}
        </IconButton>
        <Box
          sx={{
            flex: 1,
            fontFamily: 'monospace',
            fontSize: '0.9rem',
          }}
        >
          {keyName !== null && (
            <>
              <EditableSpan
                value={keyName}
                color="#9A77F5"
                onSave={handleKeyChange}
                type="key"
              />
              {': '}
            </>
          )}
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => setExpanded(!expanded)}
          >
            {bracketOpen}
          </span>
          {!expanded && (
            <span
              style={{ color: '#999', cursor: 'pointer' }}
              onClick={() => setExpanded(!expanded)}
            >
              {' '}
              {isArray
                ? `${value.length} items`
                : `${Object.keys(value).length} keys`}{' '}
            </span>
          )}
          {!expanded && (
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => setExpanded(!expanded)}
            >
              {bracketClose}
              {comma}
            </span>
          )}
        </Box>
        <IconButton
          size="small"
          onClick={handleMenuOpen}
          className="action-btn"
          sx={{ opacity: 0, transition: 'opacity 0.2s' }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
        <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose}>
          <MenuItem onClick={handleDuplicate}>Duplicate</MenuItem>
          <MenuItem onClick={handleDelete}>Delete</MenuItem>
        </Menu>
      </Box>
      {expanded && (
        <Box sx={{ pl: 2, borderLeft: '1px dashed #ccc', ml: 1.5 }}>
          {isArray
            ? entries.map((item, index) => (
                <JsonTreeNode
                  key={index}
                  keyName={null}
                  value={item}
                  path={[...path, index]}
                  onDuplicate={onDuplicate}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  isLast={index === entries.length - 1}
                />
              ))
            : entries.map(([key, val], index) => (
                <JsonTreeNode
                  key={key}
                  keyName={key}
                  value={val}
                  path={[...path, key]}
                  onDuplicate={onDuplicate}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  isLast={index === entries.length - 1}
                />
              ))}
        </Box>
      )}
      {expanded && (
        <Box sx={{ pl: 3, fontFamily: 'monospace', fontSize: '0.9rem' }}>
          {bracketClose}
          {comma}
        </Box>
      )}
    </Box>
  );
};

JsonTreeNode.propTypes = {
  keyName: PropTypes.string,
  value: PropTypes.any,
  path: PropTypes.array.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  isLast: PropTypes.bool,
};

JsonTreeNode.defaultProps = {
  keyName: null,
  isLast: true,
};

const AiEditDialog = ({ open, onClose, mockData, onSuccess }) => {
  const [aiMockData, setAiMockData] = useState('');
  const [aiInstructions, setAiInstructions] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [tabValue, setTabValue] = useState('Preview');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (open) {
      setAiMockData(mockData || '');
      setAiInstructions('');
      setAiError('');
    }
  }, [open, mockData]);

  // Helper to get value at path
  const getValueAtPath = (obj, path) => {
    return path.reduce((acc, key) => acc[key], obj);
  };

  // Helper to set value at path
  const setValueAtPath = (obj, path, value) => {
    if (path.length === 0) return value;
    const clone = Array.isArray(obj) ? [...obj] : { ...obj };
    if (path.length === 1) {
      clone[path[0]] = value;
      return clone;
    }
    clone[path[0]] = setValueAtPath(clone[path[0]], path.slice(1), value);
    return clone;
  };

  // Helper to delete at path
  const deleteAtPath = (obj, path) => {
    if (path.length === 0) return obj;
    const clone = Array.isArray(obj) ? [...obj] : { ...obj };
    if (path.length === 1) {
      if (Array.isArray(clone)) {
        clone.splice(path[0], 1);
      } else {
        delete clone[path[0]];
      }
      return clone;
    }
    clone[path[0]] = deleteAtPath(clone[path[0]], path.slice(1));
    return clone;
  };

  // Handle duplicate action from tree
  const handleTreeDuplicate = (path) => {
    try {
      const parsed = JSON.parse(aiMockData);
      const value = getValueAtPath(parsed, path);
      const parentPath = path.slice(0, -1);
      const parent =
        parentPath.length > 0 ? getValueAtPath(parsed, parentPath) : parsed;

      if (Array.isArray(parent)) {
        const index = path[path.length - 1];
        const newParent = [...parent];
        newParent.splice(index + 1, 0, JSON.parse(JSON.stringify(value)));
        const updated =
          parentPath.length > 0
            ? setValueAtPath(parsed, parentPath, newParent)
            : newParent;
        setAiMockData(JSON.stringify(updated, null, 2));
      } else {
        // For objects, create a copy with a new key
        const key = path[path.length - 1];
        const newKey = `${key}_copy`;
        const newParent = {
          ...parent,
          [newKey]: JSON.parse(JSON.stringify(value)),
        };
        const updated =
          parentPath.length > 0
            ? setValueAtPath(parsed, parentPath, newParent)
            : newParent;
        setAiMockData(JSON.stringify(updated, null, 2));
      }
    } catch (error) {
      console.error('Error duplicating:', error);
    }
  };

  // Handle delete action from tree
  const handleTreeDelete = (path) => {
    try {
      const parsed = JSON.parse(aiMockData);
      const updated = deleteAtPath(parsed, path);
      setAiMockData(JSON.stringify(updated, null, 2));
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  // Handle update action from tree (value or key change)
  const handleTreeUpdate = (path, newValue, newKey) => {
    try {
      const parsed = JSON.parse(aiMockData);

      if (newKey !== undefined) {
        // Key was renamed - need to delete old key and add new key
        const parentPath = path.slice(0, -1);
        const oldKey = path[path.length - 1];
        const parent =
          parentPath.length > 0 ? getValueAtPath(parsed, parentPath) : parsed;

        if (typeof parent === 'object' && !Array.isArray(parent)) {
          // Create new object with renamed key (preserving order)
          const newParent = {};
          for (const key of Object.keys(parent)) {
            if (key === oldKey) {
              newParent[newKey] = parent[key];
            } else {
              newParent[key] = parent[key];
            }
          }
          const updated =
            parentPath.length > 0
              ? setValueAtPath(parsed, parentPath, newParent)
              : newParent;
          setAiMockData(JSON.stringify(updated, null, 2));
        }
      } else {
        // Value was changed
        const updated = setValueAtPath(parsed, path, newValue);
        setAiMockData(JSON.stringify(updated, null, 2));
      }
    } catch (error) {
      console.error('Error updating:', error);
    }
  };

  const handleClose = () => {
    setAiError('');
    onClose();
  };

  const handleSaveMockData = async () => {
    onSuccess(aiMockData);
    handleClose();
  };

  const handleSubmit = async () => {
    if (!aiInstructions.trim()) {
      setAiError('Please provide instructions for the AI');
      return;
    }

    setAiLoading(true);
    setAiError('');

    try {
      const response = await fetch('/api/v1/ai/editMockData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          mockData: aiMockData,
          instructions: aiInstructions,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const updatedContent =
          typeof result.mockData === 'string'
            ? result.mockData
            : FtJSON.stringify(result.mockData, null, 2);

        onSuccess(updatedContent);
        handleClose();
      } else {
        setAiError(result.error || 'Failed to edit mock data with AI');
      }
    } catch (error) {
      console.error('Error calling AI API:', error);
      setAiError('Error connecting to AI service');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <AutoFixHighIcon color="primary" />
          Edit Mock Data with AI
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="Mock Data Edit Tabs"
            >
              <Tab label="Preview" value="Preview" />
              <Tab label="Text" value="Text" />
            </Tabs>
          </Box>
          {tabValue === 'Preview' ? (
            <Box
              sx={{
                borderRadius: 1,
                border: '1px solid #eee',
                p: 2,
                mb: 2,
                minHeight: 240,
                maxHeight: 400,
                overflow: 'auto',
              }}
            >
              {isValidJSON(aiMockData) ? (
                <JsonTreeNode
                  keyName={null}
                  value={JSON.parse(aiMockData)}
                  path={[]}
                  onDuplicate={handleTreeDuplicate}
                  onDelete={handleTreeDelete}
                  onUpdate={handleTreeUpdate}
                  isLast
                />
              ) : (
                <Box color="error.main">Invalid JSON</Box>
              )}
            </Box>
          ) : null}
          {tabValue === 'Text' && (
            <TextField
              label="Mock Data"
              fullWidth
              multiline
              rows={10}
              margin="normal"
              value={aiMockData}
              onChange={(e) => setAiMockData(e.target.value)}
              error={!isValidJSON(aiMockData)}
              helperText={
                !isValidJSON(aiMockData) ? 'Invalid JSON' : 'Valid JSON'
              }
            />
          )}
        </Box>
        <TextField
          label="Instructions"
          fullWidth
          multiline
          rows={3}
          margin="normal"
          value={aiInstructions}
          onChange={(e) => setAiInstructions(e.target.value)}
          placeholder="Describe how you want to modify the mock data (e.g., 'Change the user name to John Doe', 'Add a new field called email')"
        />
        {aiError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {aiError}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={aiLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={
            aiLoading || !isValidJSON(aiMockData) || !aiInstructions.trim()
          }
          startIcon={
            aiLoading ? <CircularProgress size={20} /> : <AutoFixHighIcon />
          }
        >
          {aiLoading ? 'Processing...' : 'Submit'}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveMockData}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AiEditDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  mockData: PropTypes.string,
  onSuccess: PropTypes.func.isRequired,
};

AiEditDialog.defaultProps = {
  mockData: '',
};

export default AiEditDialog;
