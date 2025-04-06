import React from 'react';
import { List, ListItem, ListItemText, Box, Button } from '@mui/material';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

const DraggableMockList = ({
  selectedTest,
  selectedMockItem,
  handleMockItemClick,
  setFilteredMockData,
  deleteAllMockData,
}) => {
  // Handle the drag end event
  const handleDragEnd = (result) => {
    const { source, destination } = result;

    // Exit if no destination (dropped outside)
    if (!destination) return;

    // Reorder the list
    const reorderedItems = Array.from(selectedTest.filteredMockData);
    const [removed] = reorderedItems.splice(source.index, 1);
    reorderedItems.splice(destination.index, 0, removed);

    // Update the reordered list (assuming setFilteredMockData is a function passed as a prop)
    setFilteredMockData(reorderedItems);
  };

  return (
    <Box>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable
          type="group"
          droppableId={`droppable-mock-list-${Math.random()}`}
        >
          {(provided) => (
            <List
              {...provided.droppableProps}
              ref={provided.innerRef}
              sx={{ width: '100%', margin: '0 auto', padding: 2 }}
            >
              {selectedTest.filteredMockData.map((mockItem, index) => (
                <Draggable
                  key={mockItem.id}
                  draggableId={mockItem.id}
                  index={index}
                >
                  {(provided) => (
                    <ListItem
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      button
                      onClick={() => handleMockItemClick(mockItem)}
                      selected={selectedMockItem === mockItem}
                      sx={{
                        backgroundColor:
                          selectedMockItem === mockItem
                            ? 'action.selected'
                            : 'inherit',
                        '&:hover': {
                          backgroundColor:
                            selectedMockItem === mockItem
                              ? 'action.selected'
                              : 'action.hover',
                        },
                      }}
                    >
                      <ListItemText
                        sx={{
                          '& .MuiTypography-root': {
                            color: mockItem.served ? 'success.main' : undefined, // Apply green color to both primary and secondary texts
                          },
                        }}
                        primary={mockItem.url}
                      />
                      <Chip label={mockItem.method} />
                    </ListItem>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>
      {selectedTest.filteredMockData.length > 10 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={deleteAllMockData}
          >
            Delete all mock data
          </Button>
        </Box>
      )}
      {selectedTest.filteredMockData.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', margin: 2 }}>
          <Typography variant="body1">
            No mock data found, Click on RECORD tab and start recording mock
            data
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DraggableMockList;
