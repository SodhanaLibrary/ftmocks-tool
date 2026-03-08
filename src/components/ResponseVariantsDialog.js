import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  CircularProgress,
  Alert,
  TextField,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PropTypes from 'prop-types';
import { FtJSON } from './utils/FtJSON';

const ResponseVariantsDialog = ({
  open,
  onClose,
  mockItem,
  selectedTest,
  variants,
  loading,
  error,
  onSelectVariant,
  onRefresh,
  onEnableVariants,
  onAddVariant,
  onUpdateVariant,
  onDeleteVariant,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [editVariantName, setEditVariantName] = useState('');
  const [editVariantResponse, setEditVariantResponse] = useState('');
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantResponse, setNewVariantResponse] = useState('');
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const currentVariantId = mockItem?.current_variant_id;

  const openAddForm = () => {
    const content = mockItem?.response?.content;
    setNewVariantResponse(
      typeof content === 'string' ? content : FtJSON.stringify(content ?? '', null, 2)
    );
    setNewVariantName('');
    setEditingVariant(null);
    setShowAddForm(true);
  };

  const openEditForm = (variant) => {
    setEditingVariant(variant);
    setEditVariantName(variant.name || variant.id || '');
    setEditVariantResponse(
      typeof variant.response === 'string'
        ? variant.response
        : FtJSON.stringify(variant.response ?? '', null, 2)
    );
    setShowAddForm(false);
  };

  const closeAddForm = () => {
    setShowAddForm(false);
    setNewVariantName('');
    setNewVariantResponse('');
  };

  const closeEditForm = () => {
    setEditingVariant(null);
    setEditVariantName('');
    setEditVariantResponse('');
  };

  const handleSelect = (variant) => {
    onSelectVariant(variant);
    onClose();
  };

  const handleAddVariant = async () => {
    const name = newVariantName.trim();
    if (!name || !onAddVariant) return;
    setAdding(true);
    try {
      await onAddVariant(name, newVariantResponse);
      closeAddForm();
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateVariant = async () => {
    if (!editingVariant || !onUpdateVariant) return;
    const name = editVariantName.trim();
    if (!name) return;
    setUpdating(true);
    try {
      await onUpdateVariant({
        ...editingVariant,
        name,
        response: editVariantResponse,
      });
      closeEditForm();
    } finally {
      setUpdating(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Response Variants</DialogTitle>
      <DialogContent>
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {!loading && !error && (!variants || variants.length === 0) && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
            <Typography color="text.secondary">
              No variants found. Enable variants to save the current response as
              the first variant.
            </Typography>
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                color="primary"
                onClick={onEnableVariants}
                disabled={!onEnableVariants}
              >
                Enable Variants
              </Button>
            </Box>
          </Box>
        )}
        {!loading && variants && variants.length > 0 && !showAddForm && !editingVariant && (
          <>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<AddIcon />}
                onClick={openAddForm}
              >
                Add Variant
              </Button>
            </Box>
            <List>
            {variants.map((variant) => (
              <Box key={variant.id}>
                <ListItemButton
                  selected={currentVariantId === variant.id}
                  onClick={() => handleSelect(variant)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    bgcolor:
                      currentVariantId === variant.id
                        ? 'action.selected'
                        : 'transparent',
                  }}
                >
                  <CheckCircleIcon
                    color={
                      currentVariantId === variant.id ? 'primary' : 'disabled'
                    }
                    sx={{ mr: 1 }}
                    fontSize="small"
                  />
                  <ListItemText
                    primary={variant.name || variant.id}
                    secondary={
                      typeof variant.response === 'string'
                        ? variant.response.substring(0, 80) +
                          (variant.response.length > 80 ? '...' : '')
                        : 'Response content'
                    }
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditForm(variant);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        window.confirm(
                          `Delete variant "${variant.name || variant.id}"?`
                        )
                      ) {
                        onDeleteVariant?.(variant);
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </Button>
                </ListItemButton>
              </Box>
            ))}
          </List>
          </>
        )}
        {!loading && variants && variants.length > 0 && showAddForm && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
            <TextField
              label="Variant name"
              fullWidth
              value={newVariantName}
              onChange={(e) => setNewVariantName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') closeAddForm();
              }}
              autoFocus
            />
            <TextField
              label="Response"
              fullWidth
              multiline
              rows={12}
              value={newVariantResponse}
              onChange={(e) => setNewVariantResponse(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') closeAddForm();
              }}
              sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
            />
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddVariant}
                disabled={!newVariantName.trim() || adding}
              >
                Add
              </Button>
              <Button variant="outlined" onClick={closeAddForm}>
                Cancel
              </Button>
            </Box>
          </Box>
        )}
        {!loading && variants && variants.length > 0 && editingVariant && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
            <TextField
              label="Variant name"
              fullWidth
              value={editVariantName}
              onChange={(e) => setEditVariantName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') closeEditForm();
              }}
              autoFocus
            />
            <TextField
              label="Response"
              fullWidth
              multiline
              rows={12}
              value={editVariantResponse}
              onChange={(e) => setEditVariantResponse(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') closeEditForm();
              }}
              sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
            />
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdateVariant}
                disabled={!editVariantName.trim() || updating}
              >
                Update
              </Button>
              <Button variant="outlined" onClick={closeEditForm}>
                Cancel
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {variants?.length > 0 && (
          <Button onClick={onRefresh} disabled={loading}>
            Refresh
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

ResponseVariantsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  mockItem: PropTypes.object,
  selectedTest: PropTypes.object,
  variants: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onSelectVariant: PropTypes.func.isRequired,
  onRefresh: PropTypes.func,
  onEnableVariants: PropTypes.func,
  onAddVariant: PropTypes.func,
  onUpdateVariant: PropTypes.func,
  onDeleteVariant: PropTypes.func,
};

ResponseVariantsDialog.defaultProps = {
  mockItem: null,
  selectedTest: null,
  variants: [],
  loading: false,
  error: '',
  onRefresh: () => {},
  onEnableVariants: null,
  onAddVariant: null,
  onUpdateVariant: null,
  onDeleteVariant: null,
};

export default ResponseVariantsDialog;
