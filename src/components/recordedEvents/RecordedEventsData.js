import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';

import {
  generatePlaywrightCode,
  generatePlaywrightCodeForEventsMockMode,
  generatePlaywrightCodeForContinueEventsMockMode,
  generatePlaywrightCodeForRunEvents,
  generatePlaywrightCodeForRunEventsInPresentationMode,
  generatePlaywrightCodeForRunEventsInTrainingMode,
  generatePlaywrightCodeForRunEventsForScreenshots,
  generatePlaywrightCodeForRunEventsForHealingSelectors,
  generatePlaywrightCodeForMockMode,
  nameToFolder,
} from './CodeUtils';
import RecordedEventsListPanel from './RecordedEventsListPanel';
import GeneratedCodePanel from './GeneratedCodePanel';
import EditRecordedEventDrawer from './EditRecordedEventDrawer';
import { streamRunTestOutput } from './streamRunTestOutput';

export default function RecordedEventsData({
  testCases,
  selectedTest,
  recordingStatus,
  envDetails,
  recordEvents: _recordEvents,
  playwrightCodeGen,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [erroe, setError] = useState(null);
  const [recordedEvents, setRecordedEvents] = useState([]);
  const [testsSummary, setTestsSummary] = useState([]);
  const [genCode, setGenCode] = useState('');
  const [genCodeType, setGenCodeType] = useState(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [mockModeAnchorEl, setMockModeAnchorEl] = useState(null);
  const [showEvents, setShowEvents] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [testOutput, setTestOutput] = useState('');
  const [runningTest, setRunningTest] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const fetchRecordedEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/v1/recordedEvents?${selectedTest?.name ? `name=${selectedTest.name}` : ''}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch default mocks');
      }
      const data = await response.json();
      setRecordedEvents(data);

      if (data.length > 0) {
        const url = data.find((event) => event.type === 'url').target;
        setCurrentUrl(url);
      }

      const resp = await fetch('/api/v1/testsSummary');
      if (!resp.ok) {
        throw new Error('Failed to fetch tests summary');
      }
      const dataTestsSummary = await resp.json();
      setTestsSummary(dataTestsSummary);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTextAsFile = () => {
    const blob = new Blob([JSON.stringify(recordedEvents, null, 2)], {
      type: 'text/plain',
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'ftmocks-events.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  const deleteAll = async () => {
    try {
      if (
        !window.confirm(
          'Are you sure you want to delete all recorded events? This action cannot be undone.'
        )
      ) {
        return;
      }
      setIsLoading(true);
      const response = await fetch(
        `/api/v1/deleteAllEvents?${selectedTest?.name ? `name=${selectedTest.name}` : ''}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch default mocks');
      }
      await response.json();
      fetchRecordedEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  function copyToClipboard() {
    navigator.clipboard
      .writeText(genCode)
      .then(() => {
        console.log('Text copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  }

  const genPlayWriteCode = () => {
    setGenCode(
      generatePlaywrightCode(
        recordedEvents,
        testsSummary,
        selectedTest,
        envDetails
      )
    );
    setGenCodeType('playwright');
    setShowEvents(false);
  };

  useEffect(() => {
    fetchRecordedEvents();

    if (recordingStatus) {
      const interval = setInterval(() => {
        if (recordingStatus) {
          fetchRecordedEvents();
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [recordingStatus, selectedTest]);

  useEffect(() => {
    fetchRecordedEvents();
    setShowEvents(true);
  }, [selectedTest]);

  const handleMockModeClick = (event) => {
    setMockModeAnchorEl(event.currentTarget);
  };

  const getParentFolder = () => {
    const parents = [];
    let parentFolder = null;
    let currentParentId = selectedTest.parentId;
    while (currentParentId) {
      parentFolder = testCases.find(
        (testCase) => testCase.id === currentParentId
      );
      if (!parentFolder) break;
      parents.push(parentFolder.name);
      currentParentId = parentFolder.parentId;
    }
    return parents;
  };

  const handleMockModeClose = () => {
    setMockModeAnchorEl(null);
  };

  const deleteEvent = async (recordedEvent) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/v1/recordedEvents/${recordedEvent.id}?name=${selectedTest.name}`,
        { method: 'DELETE' }
      );
      if (!response.ok) {
        throw new Error('Failed to delete event');
      }
      await response.json();
      fetchRecordedEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const editEvent = (recordedEvent) => {
    setSelectedEvent(recordedEvent);
  };

  const saveFile = async () => {
    const saveData = {
      generatedCode: genCode,
      fileName: `${nameToFolder(selectedTest?.name).toLowerCase()}.${genCodeType === 'playwright' ? 'spec.js' : 'test.js'}`,
      parents: getParentFolder(),
    };

    try {
      const response = await fetch('/api/v1/code/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveData),
      });

      if (!response.ok) {
        throw new Error('Failed to save file');
      }

      const result = await response.json();
      console.log('File saved successfully:', result);
    } catch (error) {
      console.error('Error saving file:', error);
      setError(error.message);
    }
  };

  const playTest = async (withUI = false) => {
    setRunningTest(true);
    setTestOutput('');

    await streamRunTestOutput(
      {
        withUI,
        testName: selectedTest.name,
        generatedCode: genCode,
        fileName: `${nameToFolder(selectedTest?.name).toLowerCase()}.${genCodeType === 'playwright' ? 'spec.js' : 'test.js'}`,
        parents: getParentFolder(),
      },
      setTestOutput
    );
  };

  const onBackClick = () => {
    if (runningTest) {
      setRunningTest(false);
      setTestOutput('');
    } else {
      setShowEvents(true);
    }
  };

  const duplicateEvent = async (eventId) => {
    if (!selectedTest?.name || !eventId) return;
    try {
      const response = await fetch(
        `/api/v1/recordedEvents/${eventId}/duplicate?name=${encodeURIComponent(selectedTest.name)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to duplicate event');
      }
      const duplicatedEvent = await response.json();
      setRecordedEvents((prevEvents) => {
        const idx = prevEvents.findIndex((e) => e.id === eventId);
        if (idx === -1) return prevEvents;
        const newEvents = [...prevEvents];
        newEvents.splice(idx + 1, 0, duplicatedEvent);
        return newEvents;
      });
    } catch (error) {
      console.error('Error duplicating event:', error);
    }
  };

  const addEmptyEvent = async (eventId) => {
    if (!selectedTest?.name || !eventId) return;
    try {
      const response = await fetch(
        `/api/v1/recordedEvents/${eventId}/emptyEvent?name=${encodeURIComponent(selectedTest.name)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add empty event');
      }
      const newEvent = await response.json();
      setRecordedEvents((prevEvents) => {
        const idx = prevEvents.findIndex((e) => e.id === eventId);
        if (idx === -1) return prevEvents;
        const newEvents = [...prevEvents];
        newEvents.splice(idx + 1, 0, newEvent);
        return newEvents;
      });
    } catch (error) {
      console.error('Error adding empty event:', error);
    }
  };

  const handleDragStart = (e, event, index) => {
    setDraggedItem({ event, index });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.dataTransfer.setDragImage(e.target, 0, 0);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (!draggedItem || draggedItem.index === targetIndex) {
      setDraggedItem(null);
      return;
    }

    const sourceIndex = draggedItem.index;
    const newRecordedEvents = Array.from(recordedEvents);
    const [reorderedItem] = newRecordedEvents.splice(sourceIndex, 1);
    newRecordedEvents.splice(targetIndex, 0, reorderedItem);

    setRecordedEvents(newRecordedEvents);
    setDraggedItem(null);

    try {
      const response = await fetch(
        `/api/v1/reorderRecordedEvents?name=${encodeURIComponent(selectedTest.name)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventIds: newRecordedEvents.map((event) => event.id),
          }),
        }
      );

      if (!response.ok) {
        setRecordedEvents(recordedEvents);
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reorder events');
      }
    } catch (error) {
      console.error('Error reordering events:', error);
      setRecordedEvents(recordedEvents);
      setError('Failed to save new order. Changes have been reverted.');
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const runMockGeneratedCode = async (generatedCode) => {
    setMockModeAnchorEl(null);
    setRunningTest(true);
    setTestOutput('');

    await streamRunTestOutput(
      {
        withUI: false,
        testName: selectedTest.name,
        generatedCode,
        fileName: `__ftmocks-mock-mode-ignore-me.spec.js`,
      },
      setTestOutput
    );
  };

  const recordEventsAgainInMockMode = async () => {
    await runMockGeneratedCode(
      generatePlaywrightCodeForEventsMockMode(
        recordedEvents,
        testsSummary,
        selectedTest,
        envDetails
      )
    );
  };

  const recordContinueEventsFromLastEventInMockMode = async () => {
    await runMockGeneratedCode(
      generatePlaywrightCodeForContinueEventsMockMode(
        recordedEvents,
        testsSummary,
        selectedTest,
        envDetails
      )
    );
  };

  const runInMockMode = async () => {
    await runMockGeneratedCode(
      generatePlaywrightCodeForMockMode(
        recordedEvents,
        testsSummary,
        selectedTest,
        envDetails
      )
    );
  };

  const playAllEventsInMockMode = async () => {
    await runMockGeneratedCode(
      generatePlaywrightCodeForRunEvents(
        recordedEvents,
        testsSummary,
        selectedTest,
        envDetails
      )
    );
  };

  const runInPresentationMode = async () => {
    await runMockGeneratedCode(
      generatePlaywrightCodeForRunEventsInPresentationMode(
        recordedEvents,
        testsSummary,
        selectedTest,
        envDetails
      )
    );
  };

  const runInTrainingMode = async () => {
    await runMockGeneratedCode(
      generatePlaywrightCodeForRunEventsInTrainingMode(
        recordedEvents,
        testsSummary,
        selectedTest,
        envDetails
      )
    );
  };

  const runEventsForScreenshots = async () => {
    await runMockGeneratedCode(
      generatePlaywrightCodeForRunEventsForScreenshots(
        recordedEvents,
        testsSummary,
        selectedTest,
        envDetails
      )
    );
  };

  const runForHealingSelectors = async () => {
    await runMockGeneratedCode(
      generatePlaywrightCodeForRunEventsForHealingSelectors(
        recordedEvents,
        testsSummary,
        selectedTest,
        envDetails
      )
    );
  };

  const saveEditedEvent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/v1/recordedEvents/${selectedEvent.id}?name=${selectedTest.name}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...selectedEvent,
            type: selectedEvent.type,
            target: selectedEvent.target,
            value: selectedEvent.value,
          }),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to update event');
      }
      await response.json();
      fetchRecordedEvents();
      setSelectedEvent(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box width="100%">
      {showEvents && (
        <RecordedEventsListPanel
          recordedEvents={recordedEvents}
          mockModeAnchorEl={mockModeAnchorEl}
          onMockModeClick={handleMockModeClick}
          onMockModeClose={handleMockModeClose}
          runInMockMode={runInMockMode}
          recordEventsAgainInMockMode={recordEventsAgainInMockMode}
          recordContinueEventsFromLastEventInMockMode={
            recordContinueEventsFromLastEventInMockMode
          }
          playAllEventsInMockMode={playAllEventsInMockMode}
          runInPresentationMode={runInPresentationMode}
          runInTrainingMode={runInTrainingMode}
          runEventsForScreenshots={runEventsForScreenshots}
          runForHealingSelectors={runForHealingSelectors}
          onGenPlaywrightCode={genPlayWriteCode}
          onDownload={downloadTextAsFile}
          onDeleteAll={deleteAll}
          draggedItem={draggedItem}
          dragOverIndex={dragOverIndex}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          onEditEvent={editEvent}
          onDuplicateEvent={duplicateEvent}
          onAddEmptyEvent={addEmptyEvent}
          onDeleteEvent={deleteEvent}
        />
      )}
      {!showEvents && (
        <GeneratedCodePanel
          runningTest={runningTest}
          genCode={genCode}
          onGenCodeChange={setGenCode}
          genCodeType={genCodeType}
          playwrightCodeGen={playwrightCodeGen}
          onBack={onBackClick}
          onPlayTest={playTest}
          onSaveFile={saveFile}
          onCopy={copyToClipboard}
          testOutput={testOutput}
        />
      )}
      <EditRecordedEventDrawer
        selectedEvent={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEventChange={setSelectedEvent}
        onSave={saveEditedEvent}
      />
    </Box>
  );
}
