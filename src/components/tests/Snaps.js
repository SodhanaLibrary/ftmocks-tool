/* eslint-disable jsx-a11y/iframe-has-title */
import React, { useEffect, useState } from 'react';
import {
  Autocomplete,
  Button,
  CircularProgress,
  TextField,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Snackbar from '@mui/material/Snackbar';

const Snaps = ({ selectedTest }) => {
  const [snaps, setSnaps] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch mock data
  const fetchTestSnaps = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/v1/testSnaps?name=${selectedTest.name}`);
      if (!response.ok) {
        throw new Error('Failed to fetch default mocks');
      }
      const data = await response.json();
      setSnaps(data);
      if(data.length) {
        setSelected(data[0]);
      }
      setIsLoading(false);  
    } catch (err) {
      setSnaps([]);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchTestSnaps();
  }, [selectedTest]);

  useEffect(() => {
    if(selected) {
        const iframe = document.getElementById('myIframe');
        const iframeDoc = iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(selected.content);
        iframeDoc.close();
    }
  }, [selected])
  if(isLoading) {
    return (<Box p={5} width="100%" textAlign="center">Loading....</Box>)
  }
  if(snaps.length === 0) {
    return (<Box p={5} width="100%" textAlign="center">No Snaps Found</Box>)
  }
  return (
    <Box display="flex" sx={{ width: '100%', margin: '0 auto', textAlign: 'left', mt: 4 }}>
      <Box style={{width: '200px'}}>
        <MenuList>
            {snaps.map(snap => (<MenuItem selected={selected === snap.fileName} onClick={() => setSelected(snap)}>
            <ListItemText>{snap.fileName}</ListItemText>
            </MenuItem>))}
        </MenuList>
      </Box>
      <iframe id="myIframe" style={{width: '100%', height: 'calc(100vh - 300px)'}} />
    </Box>
  );
};

export default Snaps;
