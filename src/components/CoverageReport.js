import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
} from '@mui/material';

export default function CoverageReport() {
  const [coverageData, setCoverageData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    // Fetch the coverage report JSON
    fetch('/coverage/coverage-final.json')
      .then((response) => response.json())
      .then((data) => setCoverageData(data))
      .catch((error) => console.error('Error fetching coverage data:', error));
  }, []);

  const handleFileClick = (file) => {
    setSelectedFile(file);
  };

  const calculateFileCoverage = (fileData) => {
    const { statements, branches, functions, lines } = fileData;
    const total =
      statements.total + branches.total + functions.total + lines.total;
    const covered =
      statements.covered + branches.covered + functions.covered + lines.covered;
    return ((covered / total) * 100).toFixed(2);
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 3,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Files
          </Typography>
          {coverageData && (
            <List>
              {Object.keys(coverageData).map((file, index) => (
                <ListItem
                  button
                  key={index}
                  onClick={() => handleFileClick(file)}
                  selected={selectedFile === file}
                >
                  <ListItemText primary={file} />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Coverage Details
          </Typography>
          {selectedFile && coverageData ? (
            <Box>
              <Typography variant="h6">{selectedFile}</Typography>
              <Typography>
                Total Coverage:{' '}
                {calculateFileCoverage(coverageData[selectedFile])}%
              </Typography>
              <Typography>
                Statements: {coverageData[selectedFile].statements.pct}%
              </Typography>
              <Typography>
                Branches: {coverageData[selectedFile].branches.pct}%
              </Typography>
              <Typography>
                Functions: {coverageData[selectedFile].functions.pct}%
              </Typography>
              <Typography>
                Lines: {coverageData[selectedFile].lines.pct}%
              </Typography>
            </Box>
          ) : (
            <Typography>Select a file to view coverage details</Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
