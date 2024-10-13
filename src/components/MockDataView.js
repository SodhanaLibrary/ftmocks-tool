import React from 'react';
import { Box, Typography, TextField, IconButton, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PropTypes from 'prop-types';

const MockDataView = ({ mockItem, onClose }) => {
  if (!mockItem) return null;

  return (
    <Box sx={{ minWidth: 700, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Mock Item Details
        </Typography>
        {onClose && (<IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>)}
      </Box>
      <Divider />
      <TextField
        label="URL"
        fullWidth
        margin="normal"
        value={mockItem.url}
        inputProps={{
          readOnly: true,
        }}
      />
      <TextField
        label="Method"
        fullWidth
        margin="normal"
        value={mockItem.method}
        inputProps={{
          readOnly: true,
        }}
      />
      <TextField
        label="Response Type"
        fullWidth
        margin="normal"
        value={mockItem.response.headers['content-type']}
        inputProps={{
          readOnly: true,
        }}
      />
      <TextField
        label="Mock Data"
        fullWidth
        multiline
        rows={8}
        margin="normal"
        value={JSON.stringify(JSON.parse(mockItem.response.content), null, 2)}
      />
      <TextField
        label="Full Mock Data"
        fullWidth
        multiline
        rows={8}
        margin="normal"
        value={JSON.stringify(mockItem, null, 2)}
      />
    </Box>
  );
};

MockDataView.propTypes = {
  onClose: PropTypes.func,
  mockItem: PropTypes.shape({
    url: PropTypes.string.isRequired,
    method: PropTypes.string.isRequired,
    response: PropTypes.shape({
      headers: PropTypes.shape({
        'content-type': PropTypes.string.isRequired
      }).isRequired,
      content: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

MockDataView.defaultProps = {
  onClose: null,
  mockItem: {
    url: '',
    method: '',
    response: {
      headers: {
        'content-type': ''
      },
      content: '{}'
    }
  }
};




export default MockDataView;
