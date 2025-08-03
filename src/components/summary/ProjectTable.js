import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';

const ProjectTable = ({ data, onClickProject, refetchProjects }) => {
  const [openModal, setOpenModal] = useState(false);
  const [envLocation, setEnvLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeleteProject = (project) => {
    fetch('/api/v1/projects', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ project }),
    });
    refetchProjects();
  };

  const handleAddProject = async () => {
    if (!envLocation.trim()) {
      alert('Please enter an environment location');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/v1/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project: envLocation.trim(),
        }),
      });

      if (response.ok) {
        setOpenModal(false);
        setEnvLocation('');
        refetchProjects();
      } else {
        const errorData = await response.json();
        alert(
          `Failed to create project: ${errorData.message || 'Unknown error'}`
        );
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEnvLocation('');
  };

  return (
    <>
      <div
        style={{
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
        >
          Add Project
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Project</strong>
              </TableCell>
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((key) => (
              <TableRow sx={{ cursor: 'pointer' }} key={key}>
                <TableCell onClick={() => onClickProject(key)}>
                  <Typography color="primary">{String(key)}</Typography>
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleDeleteProject(key)}
                    title="Delete project"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Project Modal */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Environment Location"
            type="text"
            fullWidth
            variant="outlined"
            value={envLocation}
            onChange={(e) => setEnvLocation(e.target.value)}
            placeholder="Enter environment location path"
            helperText="Enter the path to your environment configuration"
            disabled={isSubmitting}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleAddProject}
            variant="contained"
            disabled={isSubmitting || !envLocation.trim()}
          >
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProjectTable;
