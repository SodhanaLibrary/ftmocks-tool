import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box
} from "@mui/material";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const LogViewer = ({ selectedTest }) => {

  const [logs, setLogs] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [type, setType] = useState('all');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Format the timestamp into a readable date
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  useEffect(() => {
    if(type === 'all') {
      setLogs(allLogs);
    } else {
      setLogs(allLogs.filter(log => log.type === type));
    }
  }, [allLogs, type]);

  // Fetch mock data
  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/v1/recordedLogs?name=${selectedTest.name}`);
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      const data = await response.json();
      setAllLogs(data);
      setIsLoading(false);  
    } catch (err) {
      setLogs([]);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleChange = (event) => {
    setType(event.target.value);
  };

  return (
    <TableContainer component={Paper}>
      <Box display="flex" justifyContent="space-between">
        <Typography
          variant="h6"
          component="div"
          sx={{ padding: "16px" }}
          justifyContent="space-between"
        >
          Logs
        </Typography>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={type}
          label="Age"
          onChange={handleChange}
          variant="outlined"
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="log">Log</MenuItem>
          <MenuItem value="debug">Debug</MenuItem>
          <MenuItem value="info">Info</MenuItem>
          <MenuItem value="warn">Warning</MenuItem>
          <MenuItem value="error">Error</MenuItem>
        </Select>
      </Box>
      {!isLoading && logs.length === 0 && <Box p={4} textAlign="center">
          Logs not found
      </Box>}  
      {(isLoading || logs.length > 0) && <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Type</strong></TableCell>
            <TableCell><strong>Message</strong></TableCell>
            <TableCell><strong>Time</strong></TableCell>
          </TableRow>
        </TableHead>
        {isLoading && <Box p={4} textAlign="center">
          Loading...
        </Box>} 
        <TableBody>
          {logs.map((log, index) => (
            <TableRow key={index}>
              <TableCell>{log.type}</TableCell>
              <TableCell>
                <Box sx={{maxWidth: '800px', overflow: 'scroll'}}>
                    <pre>
                    {log.message}
                    </pre>
                </Box>
              </TableCell>
              <TableCell>{formatTimestamp(log.time)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>}
    </TableContainer>
  );
};

LogViewer.propTypes = {
  testName: PropTypes.object.isRequired,
};

export default LogViewer;