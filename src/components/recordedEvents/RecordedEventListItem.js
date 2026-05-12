import React from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

import { renderedTarget } from './recordedEventsUtils';

export default function RecordedEventListItem({
  re,
  index,
  draggedItem,
  dragOverIndex,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onEdit,
  onDuplicate,
  onAddEmpty,
  onDelete,
}) {
  return (
    <Box
      draggable
      onDragStart={(e) => onDragStart(e, re, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
        backgroundColor:
          draggedItem?.index === index
            ? 'action.selected'
            : dragOverIndex === index
              ? 'background.light'
              : 'transparent',
        gap: 1,
        '& .action-buttons': {
          display: 'none',
        },
        '&:hover .action-buttons': {
          display: 'flex',
        },
        transition: 'all 0.2s ease',
        transform:
          draggedItem?.index === index ? 'rotate(3deg) scale(1.02)' : 'none',
        opacity: draggedItem?.index === index ? 0.7 : 1,
        cursor: 'grab',
        border:
          dragOverIndex === index && draggedItem?.index !== index
            ? '1px dashed'
            : '0px solid transparent',
        borderColor: 'primary.main',
        borderRadius: 1,
        borderLeft: `4px solid ${re.executed ? '#4CAF50' : undefined}`,
      }}
      p={1}
      id={`recorded-events-item-${re.id}`}
      onClick={() => onEdit(re)}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'text.secondary',
            '&:hover': {
              color: 'primary.main',
            },
            cursor: 'grab',
            '&:active': {
              cursor: 'grabbing',
            },
          }}
        >
          <DragIndicatorIcon />
        </Box>
        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="body1">
            {re.type} ({renderedTarget(re)})
          </Typography>
          <Typography variant="body2">{re.time}</Typography>
        </Box>
      </Box>
      <Box className="action-buttons">
        <Tooltip title="Duplicate Event">
          <IconButton
            id={`recorded-events-duplicate-${re.id}`}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(re.id);
            }}
            aria-label="duplicate"
          >
            <ContentCopyIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Create New Event">
          <IconButton
            id={`recorded-events-add-empty-${re.id}`}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onAddEmpty(re.id);
            }}
            aria-label="create new event"
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit Event">
          <IconButton
            id={`recorded-events-edit-${re.id}`}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(re);
            }}
            aria-label="edit"
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Event">
          <IconButton
            id={`recorded-events-delete-${re.id}`}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(re);
            }}
            aria-label="delete"
            disabled={index === 0 && re.type === 'url'}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
