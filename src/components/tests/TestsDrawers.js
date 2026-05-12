import React from 'react';
import { Drawer } from '@mui/material';

import MockDataView from '../MockDataView';
import MockDataCreator from '../MockDataCreator';
import TestCaseCreator from './TestCaseCreator';

export default function TestsDrawers({
  envDetails,
  selectedTest,
  defaultMocks,
  selectedMockItem,
  drawerOpen,
  onCloseMockDrawer,
  testCaseCreatorOpen,
  testCaseEditorOpen,
  currentTestCaseType,
  currentParentId,
  testCases,
  onCloseTestCaseCreator,
  mockDataCreatorOpen,
  onCloseMockDataCreator,
}) {
  return (
    <>
      {selectedMockItem ? (
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={onCloseMockDrawer}
          sx={{ width: 300 }}
        >
          <MockDataView
            envDetails={envDetails}
            selectedTest={selectedTest}
            onClose={onCloseMockDrawer}
            mockItem={selectedMockItem}
            defaultMocks={defaultMocks}
          />
        </Drawer>
      ) : null}

      <Drawer
        anchor="right"
        open={testCaseCreatorOpen || testCaseEditorOpen}
        onClose={onCloseTestCaseCreator}
        sx={{ width: 300 }}
      >
        <TestCaseCreator
          type={currentTestCaseType}
          parentId={currentParentId}
          testCases={testCases}
          onClose={onCloseTestCaseCreator}
          selectedTest={testCaseEditorOpen ? selectedTest : null}
        />
      </Drawer>

      <Drawer
        anchor="right"
        open={mockDataCreatorOpen}
        onClose={onCloseMockDataCreator}
        sx={{ width: 300 }}
      >
        <MockDataCreator
          selectedTest={selectedTest}
          onClose={onCloseMockDataCreator}
        />
      </Drawer>
    </>
  );
}
