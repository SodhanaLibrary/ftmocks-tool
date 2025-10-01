import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import SimpleJsonTable from './EnvTable';
import ServerStatus from './ServerStatus';
import EnvTable from './EnvTable';
import ProjectTable from './ProjectTable';
import UpdateChecker from './UpdateChecker';

export default function TestSummary({ envDetails, fetchEnvDetails }) {
  const [testCases, setTestCases] = useState([]);
  const [projects, setProjects] = useState([]);
  const [defaultMocks, setDefaultMocks] = useState([]);
  const navigate = useNavigate();
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

  const onClickProject = async (envFile) => {
    try {
      const response = await fetch('/api/v1/projects', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ env_file: envFile }),
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
    <Box
      sx={{ width: '100%', columnCount: 2, columnGap: 2, pl: 3, pr: 3, pt: 1 }}
    >
      <Paper sx={{ p: 2, display: 'flex', gap: 2 }}>
        <Box
          sx={{
            p: 3,
            cursor: 'pointer',
            border: '1px solid #ccc',
            borderRadius: 2,
            width: '50%',
          }}
        >
          <Box
            onClick={() => {
              navigate('/tests');
            }}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              '&:hover': {
                color: 'primary.main',
              },
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
          onClick={() => {
            navigate('/default-mock-data');
          }}
          sx={{
            p: 3,
            cursor: 'pointer',
            border: '1px solid #ccc',
            borderRadius: 2,
            width: '50%',
            '&:hover': {
              color: 'primary.main',
            },
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
      </Paper>

      {serverStatus.testName && (
        <Paper sx={{ mt: 2, p: 2 }}>
          <ServerStatus
            testName={serverStatus.testName}
            port={serverStatus.port}
            onClick={() => {
              navigate('/mock-server');
            }}
          />
        </Paper>
      )}

      <UpdateChecker />
      {envDetails && (
        <Paper sx={{ mt: 2, p: 2 }}>
          <EnvTable data={envDetails} />
        </Paper>
      )}
      <Paper sx={{ mt: 2, p: 2 }}>
        <ProjectTable
          envDetails={envDetails}
          data={projects}
          onClickProject={onClickProject}
          refetchProjects={fetchProjects}
        />
      </Paper>
    </Box>
  );
}
