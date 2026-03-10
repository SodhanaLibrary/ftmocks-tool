import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const API_SPECS_BASE = '/api/v1/apiSpecs';

export default function ApiSpecs() {
  const [specs, setSpecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formName, setFormName] = useState('');
  const [formJson, setFormJson] = useState('');
  const [editingName, setEditingName] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchSpecs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API_SPECS_BASE);
      if (!res.ok) throw new Error('Failed to fetch API specs');
      const data = await res.json();
      setSpecs(data);
    } catch (err) {
      setError(err.message);
      setSpecs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecs();
  }, []);

  const clearForm = () => {
    setFormName('');
    setFormJson('');
    setEditingName(null);
    setFormError('');
  };

  const validateJson = (str) => {
    if (!str || !str.trim()) return null;
    try {
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  };

  const handleUpload = async () => {
    setFormError('');
    setSuccess(null);
    const name = (formName || '').trim();
    if (!name) {
      setFormError('Name is required');
      return;
    }
    const parsed = validateJson(formJson);
    if (parsed === null && formJson.trim()) {
      setFormError('Invalid JSON');
      return;
    }
    if (!formJson.trim()) {
      setFormError('API spec JSON is required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(API_SPECS_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, spec: parsed ?? {} }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setSuccess('API spec saved');
      clearForm();
      fetchSpecs();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingName) return;
    setFormError('');
    setSuccess(null);
    const parsed = validateJson(formJson);
    if (parsed === null && formJson.trim()) {
      setFormError('Invalid JSON');
      return;
    }
    if (!formJson.trim()) {
      setFormError('API spec JSON is required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_SPECS_BASE}/${encodeURIComponent(editingName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spec: parsed ?? {} }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setSuccess('API spec updated');
      clearForm();
      fetchSpecs();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (name) => {
    setFormError('');
    setSuccess(null);
    try {
      const res = await fetch(`${API_SPECS_BASE}/${encodeURIComponent(name)}`);
      if (!res.ok) throw new Error('Failed to load spec');
      const { spec } = await res.json();
      setFormName(name);
      setFormJson(JSON.stringify(spec, null, 2));
      setEditingName(name);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDelete = async (name) => {
    if (!window.confirm(`Delete API spec "${name}"?`)) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${API_SPECS_BASE}/${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Delete failed');
      }
      setSuccess('API spec deleted');
      if (editingName === name) clearForm();
      fetchSpecs();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result;
        if (typeof text !== 'string') return;
        JSON.parse(text);
        setFormJson(text);
        if (!formName && file.name.endsWith('.json')) {
          setFormName(file.name.replace(/\.json$/i, ''));
        }
        setFormError('');
      } catch {
        setFormError('File is not valid JSON');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <Box sx={{ width: '100%', p: 3, pt: 0 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        API Specs (JSON)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Upload, update, or delete API specifications. All specs are stored in{' '}
        <code>{'{MOCK_DIR}'}/api_specs</code> as JSON files.
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          {editingName ? 'Update API spec' : 'Upload new API spec'}
        </Typography>
        {!editingName && (
          <TextField
            fullWidth
            label="Spec name"
            placeholder="e.g. openapi-v1"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            sx={{ mb: 2 }}
            helperText="Alphanumeric, underscore, hyphen only. Saved as name.json"
          />
        )}
        {editingName && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Editing: {editingName}
          </Typography>
        )}
        <TextField
          fullWidth
          multiline
          minRows={8}
          maxRows={20}
          label="API spec (JSON)"
          placeholder='{ "openapi": "3.0.0", ... }'
          value={formJson}
          onChange={(e) => setFormJson(e.target.value)}
          sx={{ mb: 2 }}
          error={!!formError}
          helperText={formError}
        />
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={editingName ? <SaveIcon /> : <AddIcon />}
            onClick={editingName ? handleUpdate : handleUpload}
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} /> : editingName ? 'Update' : 'Upload'}
          </Button>
          {editingName && (
            <Button variant="outlined" onClick={clearForm} disabled={saving}>
              Cancel
            </Button>
          )}
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadFileIcon />}
            disabled={saving}
          >
            Load from file
            <input type="file" accept=".json,application/json" hidden onChange={handleFileSelect} />
          </Button>
        </Box>
      </Paper>

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Saved API specs
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>File</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {specs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    No API specs yet. Upload one above.
                  </TableCell>
                </TableRow>
              ) : (
                specs.map(({ name, filename }) => (
                  <TableRow key={name}>
                    <TableCell>{name}</TableCell>
                    <TableCell>{filename}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        aria-label="Edit"
                        onClick={() => handleEdit(name)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label="Delete"
                        onClick={() => handleDelete(name)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
