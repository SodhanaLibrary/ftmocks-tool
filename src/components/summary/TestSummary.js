import React, { useState, useEffect } from 'react';
import { Box, Typography, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SimpleJsonTable from './EnvTable';
import ServerStatus from './ServerStatus';
import EnvTable from './EnvTable';
import ProjectTable from './ProjectTable';
import UpdateChecker from './UpdateChecker';

export default function TestSummary({ envDetails, fetchEnvDetails }) {
  const [testCases, setTestCases] = useState([]);
  const [projects, setProjects] = useState([]);
  const [defaultMocks, setDefaultMocks] = useState([]);
  const [serverStatus, setServerStatus] = useState({});

  const fetchMockServerStatus = async (testsTemp) => {
    try {
      const response = await fetch('/api/v1/mockServer');
      if (!response?.ok) {
        throw new Error('Failed to fetch mock server status');
      }
      const data = await response.json();
      if (data.port) {
        setServerStatus(data);
      } else {
        setServerStatus({
          port: null,
          testName: null,
        });
      }

      return data;
    } catch (error) {
      console.error('Error fetching tests:', error);
      // Handle the error appropriately, e.g., show an error message to the user
    }
  };

  const fetchTestData = async () => {
    try {
      const response = await fetch('/api/v1/tests');
      if (!response.ok) {
        throw new Error('Failed to fetch test data');
      }
      const data = await response.json();
      setTestCases(data);
    } catch (error) {
      console.error('Error fetching test data:', error);
      // Handle the error appropriately, e.g., show an error message to the user
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/v1/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Handle the error appropriately, e.g., show an error message to the user
    }
  };

  const fetchDefaultMocks = async () => {
    try {
      const response = await fetch('/api/v1/defaultmocks');
      if (!response.ok) {
        throw new Error('Failed to fetch test data');
      }
      const data = await response.json();
      setDefaultMocks(data);
    } catch (error) {
      console.error('Error fetching test data:', error);
      // Handle the error appropriately, e.g., show an error message to the user
    }
  };

  const loadAllData = () => {
    fetchTestData();
    fetchDefaultMocks();
    fetchMockServerStatus();
    fetchProjects();
  };

  const onClickProject = async envFile => {
    try {
      const response = await fetch('/api/v1/projects', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({env_file: envFile}),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      loadAllData();
      fetchEnvDetails();
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Handle the error appropriately, e.g., show an error message to the user
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  return (
    <Container>
      <Box
        sx={{
          flexGrow: 1,
          p: 3,
          pt: 0,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 5,
          margin: 'auto',
          mt: 15,
          justifyContent: 'center',
        }}
      >
        <Box
          component={RouterLink}
          to="/tests"
          sx={{
            p: 3,
            cursor: 'pointer',
            border: '1px solid #ccc',
            borderRadius: 2,
            width: '30%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Typography variant="h5" gutterBottom>
              Test Cases
            </Typography>
            <Typography variant="h5" gutterBottom>
              {testCases.length}
            </Typography>
          </Box>
        </Box>
        <Box
          component={RouterLink}
          to="/default-mock-data"
          sx={{
            p: 3,
            cursor: 'pointer',
            border: '1px solid #ccc',
            borderRadius: 2,
            width: '30%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Typography variant="h5" gutterBottom>
              Default Mock Data
            </Typography>
            <Typography variant="h5" gutterBottom>
              {defaultMocks.length}
            </Typography>
          </Box>
        </Box>
      </Box>

      {serverStatus.testName && (
        <Box sx={{ mb: 4 }}>
          <ServerStatus
            testName={serverStatus.testName}
            port={serverStatus.port}
          />
        </Box>
      )}

     <UpdateChecker />
     {envDetails && <Box>
        <Box sx={{ margin: 'auto' }}>
          <EnvTable data={envDetails} />
        </Box>
      </Box>}
      <Box mt={2}>
        <Box sx={{ margin: 'auto' }}>
          <ProjectTable data={projects} onClickProject={onClickProject} />
        </Box>
      </Box>
    </Container>
  );
}
