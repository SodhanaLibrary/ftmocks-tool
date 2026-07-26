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
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Typography from '@mui/material/Typography';
import EditEnvDialog from './EditEnvDialog';

const ProjectTable = ({ data, onClickProject, refetchProjects }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [editEnvFile, setEditEnvFile] = useState('');

  const openCreateDialog = () => {
    setDialogMode('create');
    setEditEnvFile('');
    setDialogOpen(true);
  };

  const openEditDialog = (project) => {
    setDialogMode('edit');
    setEditEnvFile(project.env_file);
    setDialogOpen(true);
  };

  const handleSaved = (envFile) => {
    refetchProjects();
    // Apply the saved env file so the changes take effect immediately
    onClickProject({ env_file: envFile });
  };

  const handleDeleteProject = async (project) => {
    try {
      const response = await fetch('/api/v1/projects', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project),
      });
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      refetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  return (
    <>
      <div
        style={{
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">Projects</Typography>
        <Button
          id="project-table-add-project-btn"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
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
              <TableCell align="right">
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((project) => (
              <TableRow sx={{ cursor: 'pointer' }} key={project.env_file}>
                <TableCell
                  id={`project-table-row-${project.env_file}`}
                  onClick={() => onClickProject(project)}
                  sx={{ '&:hover': { color: 'primary.main' } }}
                >
                  <Typography>{String(project.env_file)}</Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    id={`project-table-edit-${project.env_file}`}
                    onClick={() => openEditDialog(project)}
                    title="Edit env file"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    id={`project-table-delete-${project.env_file}`}
                    onClick={() => handleDeleteProject(project)}
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

      <EditEnvDialog
        open={dialogOpen}
        mode={dialogMode}
        envFile={editEnvFile}
        onClose={() => setDialogOpen(false)}
        onSaved={handleSaved}
      />
    </>
  );
};

export default ProjectTable;
