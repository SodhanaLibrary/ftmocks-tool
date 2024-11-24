import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ServerIcon from '@mui/icons-material/Dns'; // Server icon from MUI Icons

const ServerStatus = ({ testName, port, onClick }) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      border="1px solid #ccc"
      p={2}
      borderRadius={2}
      boxShadow={3}
      width="fit-content"
      margin="auto"
      onClick={onClick}
      sx={{ cursor: 'pointer' }}
    >
      <ServerIcon fontSize="large" style={{ marginRight: 8, fontSize: 70 }} />
      <Box>
        <Typography variant="h6">Server running on: {port}</Typography>
        <Typography variant="h6">Test name: {testName}</Typography>
      </Box>
    </Box>
  );
};

export default ServerStatus;
