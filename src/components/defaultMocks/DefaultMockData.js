import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  TextField,
  Drawer,
  Chip,
} from '@mui/material';
import MockDataView from '../MockDataView';
import MockDataCreator from '../MockDataCreator';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import SpeedIcon from '@mui/icons-material/Speed';
import Tooltip from '@mui/material/Tooltip';
import DefaultRecorder from './DefaultRecorder';
import DefaultOptimizer from './DefaultOptimizer';
import { sortUrlsByMatch } from '../utils/SearchUtils';

export default function DefaultMockData() {
  const [mockSearchTerm, setMockSearchTerm] = React.useState('');
  const [selectedMockItem, setSelectedMockItem] = useState(null);
  const [filteredMockData, setFilteredMockData] = useState([]);
  const [mockData, setMockData] = useState([]);
  const [isNewMockDrawerOpen, setIsNewMockDrawerOpen] = useState(false);
  const [isRecordMockDrawerOpen, setIsRecordMockDrawerOpen] = useState(false);
  const [isOptimizerDrawerOpen, setIsOptimizerDrawerOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDefaultMocks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/v1/defaultmocks');
      if (!response.ok) {
        throw new Error('Failed to fetch default mocks');
      }
      const data = await response.json();
      setMockData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaultMocks();
  }, []);

  useEffect(() => {
    if (mockData?.length && mockSearchTerm?.length) {
      let fData = [];
      try {
        fData = sortUrlsByMatch(mockSearchTerm, mockData);
      } catch (error) {
        console.log(error);
        fData = mockData.filter((item) =>
          item.url.toLowerCase().includes(mockSearchTerm.toLowerCase())
        );
      }
      setFilteredMockData(fData);
      setSelectedMockItem(fData[0]);
    } else {
      setFilteredMockData(mockData);
      setSelectedMockItem(mockData[0]);
    }
  }, [mockData, mockSearchTerm]);

  const handleMockItemClick = (item) => {
    setSelectedMockItem(item);
  };

  const handleCloseMockDataDrawer = (refresh) => {
    if (refresh) {
      fetchDefaultMocks();
    }
  };

  const renderMockDataDrawer = () => {
    if (!selectedMockItem) return null;

    return (
      <MockDataView
        mockItem={selectedMockItem.mockData}
        onClose={handleCloseMockDataDrawer}
      />
    );
  };
  const handleOpenNewMockDrawer = () => {
    setIsNewMockDrawerOpen(true);
  };

  const handleCloseNewMockDrawer = () => {
    setIsNewMockDrawerOpen(false);
    fetchDefaultMocks();
  };

  const handleOpenRecordMockDrawer = () => {
    setIsRecordMockDrawerOpen(true);
  };

  const handleCloseRecordMockDrawer = () => {
    setIsRecordMockDrawerOpen(false);
    fetchDefaultMocks();
  };

  const handleOpenOptimizerDrawer = () => {
    setIsOptimizerDrawerOpen(true);
  };

  const handleCloseOptimizerDrawer = () => {
    setIsOptimizerDrawerOpen(false);
    fetchDefaultMocks();
  };
  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 3,
        pt: 0,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 0,
      }}
    >
      <Box
        sx={{
          p: 2,
          border: 1,
          borderColor: 'divider',
          boxShadow: 1,
          flexGrow: 0,
          width: '400px',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" gutterBottom>
            Mock Data
          </Typography>
          <Box>
            <Tooltip title="Add Mock Data">
              <IconButton
                color="primary"
                aria-label="add mock data"
                onClick={handleOpenNewMockDrawer}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Record mock data">
              <IconButton
                color="secondary"
                aria-label="record mock data"
                onClick={handleOpenRecordMockDrawer}
              >
                <FiberManualRecordIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Optimize mock data">
              <IconButton
                color="info"
                aria-label="optimize mock data"
                onClick={handleOpenOptimizerDrawer}
              >
                <SpeedIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <TextField
          hiddenLabel
          fullWidth
          variant="outlined"
          placeholder="Search mock data"
          margin="normal"
          value={mockSearchTerm}
          onChange={(e) => {
            setMockSearchTerm(e.target.value);
          }}
        />
        <List sx={{ height: 'calc(100vh - 200px)', overflowY: 'scroll' }}>
          {filteredMockData.map((mockItem, index) => (
            <ListItem
              button
              key={index}
              onClick={() => handleMockItemClick(mockItem)}
              selected={selectedMockItem === mockItem}
              sx={{
                color: mockItem.mockData.served ? 'success.main' : undefined,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                backgroundColor:
                  selectedMockItem === mockItem ? 'action.selected' : 'inherit',
                '&:hover': {
                  backgroundColor:
                    selectedMockItem === mockItem
                      ? 'action.selected'
                      : 'action.hover',
                },
              }}
            >
              <ListItemText primary={mockItem.url} />
              <Chip label={mockItem.method} />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box
        sx={{
          p: 2,
          border: 1,
          borderColor: 'divider',
          boxShadow: 1,
          flexGrow: 1,
        }}
      >
        {renderMockDataDrawer()}
      </Box>
      <Drawer
        anchor="right"
        open={isNewMockDrawerOpen}
        onClose={handleCloseNewMockDrawer}
      >
        <MockDataCreator onClose={handleCloseNewMockDrawer} />
      </Drawer>
      <Drawer
        anchor="right"
        open={isRecordMockDrawerOpen}
        onClose={handleCloseRecordMockDrawer}
      >
        <DefaultRecorder onClose={handleCloseRecordMockDrawer} />
      </Drawer>
      <Drawer
        anchor="right"
        open={isOptimizerDrawerOpen}
        onClose={handleCloseOptimizerDrawer}
      >
        <DefaultOptimizer
          onClose={handleCloseOptimizerDrawer}
          unusedMocks={mockData.filter((mock) => !mock?.mockData?.served)}
        />
      </Drawer>
    </Box>
  );
}
