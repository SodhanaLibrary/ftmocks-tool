import React, { useState, useEffect } from 'react';
import { Box, List, ListItem, ListItemText, Typography, TextField, Drawer, Button } from '@mui/material';
import MockDataView from '../MockDataView';
import MockDataCreator from './MockDataCreator';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import Tooltip from '@mui/material/Tooltip';


export default function DefaultMockData() {
  const [mockSearchTerm, setMockSearchTerm] = React.useState('');
  const [selectedMockItem, setSelectedMockItem] = useState(null);
  const [filteredMockData, setFilteredMockData] = useState([]);
  const [mockData, setMockData] = useState([]);
  const [isNewMockDrawerOpen, setIsNewMockDrawerOpen] = useState(false);
  
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
      setFilteredMockData(data);
      setSelectedMockItem(data[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaultMocks();
  }, []);

  const handleMockItemClick = (item) => {
    setSelectedMockItem(item);
  };

  const renderMockDataDrawer = () => {
    if (!selectedMockItem) return null;

    return (
        <MockDataView mockItem={selectedMockItem.mockData} />
    );
  };
  const handleOpenNewMockDrawer = () => {
    setIsNewMockDrawerOpen(true);
  };

  const handleCloseNewMockDrawer = () => {
    setIsNewMockDrawerOpen(false);
  };
  return (
    <Box sx={{ flexGrow: 1, p: 3, pt: 0, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 0 }}>
        <Box sx={{ p: 2, border: 1, borderColor: 'divider', boxShadow: 1, flexGrow: 0, width: '400px' }}>
          <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
          <Typography variant="h6" gutterBottom>
            Mock Data
          </Typography>
          <Tooltip title="Add Mock Data">
            <IconButton
              color="primary"
              aria-label="add mock data"
              onClick={handleOpenNewMockDrawer}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
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
              const searchTerm = e.target.value.toLowerCase();
                const filteredMockData = mockData.filter(item =>
                  item.url.toLowerCase().includes(searchTerm)
                );
                setFilteredMockData(filteredMockData);
            }}
          />
            <List>
              {filteredMockData.map((mockItem, index) => (
                <ListItem
                  button
                  key={index}
                  onClick={() => handleMockItemClick(mockItem)}
                  selected={selectedMockItem === mockItem}
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    backgroundColor: selectedMockItem === mockItem ? 'action.selected' : 'inherit',
                    '&:hover': {
                      backgroundColor: selectedMockItem === mockItem ? 'action.selected' : 'action.hover',
                    },
                  }}
                >
                  <ListItemText primary={mockItem.url} />
                </ListItem>
              ))}
            </List>
        </Box>
        <Box sx={{ p: 2, border: 1, borderColor: 'divider', boxShadow: 1, flexGrow: 1 }}>
          {renderMockDataDrawer()}
        </Box>
        <Drawer
          anchor="right"
          open={isNewMockDrawerOpen}
          onClose={handleCloseNewMockDrawer}
        >
          <MockDataCreator onClose={handleCloseNewMockDrawer} />
        </Drawer>
    </Box>
  );

}
