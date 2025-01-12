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

const LogViewer = ({ selectedTest }) => {

  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Format the timestamp into a readable date
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Fetch mock data
  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/v1/recordedLogs?name=${selectedTest.name}`);
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      const data = await response.json();
      setLogs(data);
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

  return (
    <TableContainer component={Paper}>
      <Typography
        variant="h6"
        component="div"
        sx={{ padding: "16px", textAlign: "center" }}
      >
        Logs
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Type</strong></TableCell>
            <TableCell><strong>Message</strong></TableCell>
            <TableCell><strong>Time</strong></TableCell>
          </TableRow>
        </TableHead>
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
      </Table>
    </TableContainer>
  );
};

LogViewer.propTypes = {
  testName: PropTypes.object.isRequired,
};

export default LogViewer;