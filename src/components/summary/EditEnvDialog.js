import React, { useEffect, useMemo, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import CircularProgress from '@mui/material/CircularProgress';

// Read the value of KEY=value from raw .env text (last occurrence wins).
export const getEnvValue = (content, key) => {
  const re = new RegExp(`^\\s*${key}\\s*=(.*)$`, 'gm');
  let match;
  let value = '';
  while ((match = re.exec(content || '')) !== null) {
    value = match[1].trim();
  }
  return value;
};

// Insert or replace KEY=value in raw .env text, preserving other lines.
export const upsertEnvValue = (content, key, value) => {
  const line = `${key}=${value}`;
  const re = new RegExp(`^\\s*${key}\\s*=.*$`, 'm');
  if (re.test(content || '')) {
    return content.replace(re, line);
  }
  const trimmed = (content || '').replace(/\s*$/, '');
  return (trimmed ? `${trimmed}\n` : '') + `${line}\n`;
};

const CREATE_TEMPLATE = [
  'MOCK_DIR=./',
  'PORT=5000',
  'PROJECT_TYPE=playwright',
  'PLAYWRIGHT_DIR=../playwright/',
  '',
].join('\n');

const EditEnvDialog = ({ open, mode = 'edit', envFile, onClose, onSaved }) => {
  const isCreate = mode === 'create';
  const [filePath, setFilePath] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (isCreate) {
      setFilePath('');
      setContent(CREATE_TEMPLATE);
      return;
    }
    setFilePath(envFile || '');
    // Load existing env file contents
    (async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/v1/env/file?env_file=${encodeURIComponent(envFile)}`
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load env file');
        }
        setContent(data.content || '');
      } catch (e) {
        setError(e.message);
        setContent('');
      } finally {
        setLoading(false);
      }
    })();
  }, [open, isCreate, envFile]);

  const projectType = useMemo(
    () => getEnvValue(content, 'PROJECT_TYPE') || 'playwright',
    [content]
  );
  const isReact = projectType === 'react';

  const setVar = (key, value) => setContent(upsertEnvValue(content, key, value));

  const handleSave = async () => {
    const targetFile = (isCreate ? filePath : envFile || '').trim();
    if (!targetFile) {
      setError('Please enter an environment file path');
      return;
    }
    if (!targetFile.endsWith('.env')) {
      setError('Environment file path must end with .env');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (isCreate) {
        // Register the project first so the save endpoint accepts the path
        const addResp = await fetch('/api/v1/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project: targetFile }),
        });
        if (!addResp.ok) {
          const err = await addResp.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to create project');
        }
      }
      const response = await fetch('/api/v1/env/file', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ env_file: targetFile, content }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save env file');
      }
      onSaved?.(targetFile);
      onClose?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const busy = loading || saving;

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isCreate ? 'Add New Project' : 'Edit Environment File'}
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              id="edit-env-file-path"
              label="Environment file path"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              placeholder="/absolute/path/to/ftmocks.env"
              helperText={
                isCreate
                  ? 'Path to the .env file to create for this project'
                  : 'This project’s env file'
              }
              fullWidth
              disabled={!isCreate || saving}
            />

            <FormControl>
              <FormLabel id="edit-env-project-type-label">Project type</FormLabel>
              <RadioGroup
                row
                aria-labelledby="edit-env-project-type-label"
                value={projectType}
                onChange={(e) => setVar('PROJECT_TYPE', e.target.value)}
              >
                <FormControlLabel
                  value="playwright"
                  control={<Radio id="edit-env-type-playwright" />}
                  label="Playwright"
                />
                <FormControlLabel
                  value="react"
                  control={<Radio id="edit-env-type-react" />}
                  label="React"
                />
              </RadioGroup>
            </FormControl>

            <Divider />
            <Typography variant="subtitle2" color="text.secondary">
              {isReact ? 'React' : 'Playwright'} variables
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                id="edit-env-mock-dir"
                label="MOCK_DIR"
                value={getEnvValue(content, 'MOCK_DIR')}
                onChange={(e) => setVar('MOCK_DIR', e.target.value)}
                sx={{ flex: '1 1 260px' }}
                disabled={saving}
              />
              <TextField
                id="edit-env-port"
                label="PORT"
                value={getEnvValue(content, 'PORT')}
                onChange={(e) => setVar('PORT', e.target.value)}
                sx={{ flex: '1 1 120px' }}
                disabled={saving}
              />
            </Box>

            {isReact ? (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  id="edit-env-react-tests-dir"
                  label="REACT_TESTS_DIR"
                  value={getEnvValue(content, 'REACT_TESTS_DIR')}
                  onChange={(e) => setVar('REACT_TESTS_DIR', e.target.value)}
                  helperText="Directory where generated *.test.js files are saved"
                  sx={{ flex: '1 1 260px' }}
                  disabled={saving}
                />
                <TextField
                  id="edit-env-react-test-command"
                  label="REACT_TEST_COMMAND"
                  value={getEnvValue(content, 'REACT_TEST_COMMAND')}
                  onChange={(e) => setVar('REACT_TEST_COMMAND', e.target.value)}
                  placeholder="npx jest"
                  helperText="Command used to run a React test (default: npx jest)"
                  sx={{ flex: '1 1 260px' }}
                  disabled={saving}
                />
              </Box>
            ) : (
              <TextField
                id="edit-env-playwright-dir"
                label="PLAYWRIGHT_DIR"
                value={getEnvValue(content, 'PLAYWRIGHT_DIR')}
                onChange={(e) => setVar('PLAYWRIGHT_DIR', e.target.value)}
                helperText="Playwright project directory (contains tests/)"
                fullWidth
                disabled={saving}
              />
            )}

            <Divider />
            <Typography variant="subtitle2" color="text.secondary">
              Full env file
            </Typography>
            <TextField
              id="edit-env-raw-content"
              multiline
              minRows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              fullWidth
              disabled={saving}
              InputProps={{
                sx: { fontFamily: 'monospace', fontSize: '0.85rem' },
              }}
            />

            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button id="edit-env-cancel-btn" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button
          id="edit-env-save-btn"
          onClick={handleSave}
          variant="contained"
          disabled={busy}
        >
          {saving ? 'Saving…' : isCreate ? 'Create Project' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditEnvDialog;
