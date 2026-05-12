/* eslint-disable jsx-a11y/iframe-has-title */
import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import CircularProgress from '@mui/material/CircularProgress';
import RecordedEventsData from '../recordedEvents/RecordedEventsData';
import GeneratedCodePanel from '../recordedEvents/GeneratedCodePanel';
import { streamRunTestOutput } from '../recordedEvents/streamRunTestOutput';
import { nameToFolder } from '../recordedEvents/CodeUtils';

const RecordMockOrTest = ({
  testCases,
  selectedTest,
  fetchMockData,
  envDetails,
  resetMockData,
}) => {
  const [isRecordingMockData, setIsRecordingMockData] = useState(false);
  const [isPlaywrightCodegenRunning, setIsPlaywrightCodegenRunning] =
    useState(false);
  const [error, setError] = useState(null);
  const [detailTab, setDetailTab] = useState('events');
  const [diskSpecCode, setDiskSpecCode] = useState('');
  const [specFetchLoading, setSpecFetchLoading] = useState(false);
  const [specFetchNotice, setSpecFetchNotice] = useState(null);
  const [codeTabRunningTest, setCodeTabRunningTest] = useState(false);
  const [codeTabTestOutput, setCodeTabTestOutput] = useState('');
  const [config, setConfig] = useState({
    url: envDetails?.MetaData?.urls?.[0] || '',
    patterns: envDetails?.MetaData?.patterns || ['^/api/.*'],
    avoidDuplicatesWithDefaultMocks: false,
    stopMockServer: true,
    startMockServer: true,
    recordEvents: true,
    testName: selectedTest.name,
    avoidDuplicatesInTheTest: false,
  });

  const recordMockData = async () => {
    try {
      setIsRecordingMockData(true);
      await resetMockData();
      const response = await fetch(`/api/v1/record/mocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      if (!response.ok) {
        throw new Error('Failed to record mock data');
      }
    } catch (err) {
      setError(err.message);
      setIsRecordingMockData(false);
    }
  };

  const recordPlaywrightCodegenWithMocks = async () => {
    try {
      setIsPlaywrightCodegenRunning(true);
      setError(null);
      await resetMockData();
      const response = await fetch(`/api/v1/record/playwright/mocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      if (!response.ok) {
        throw new Error('Playwright codegen with mock recording failed');
      }
      fetchMockData(selectedTest, {
        stopRecording: true,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsPlaywrightCodegenRunning(false);
    }
  };

  const recordTest = async (url) => {
    try {
      setIsRecordingMockData(true);
      await resetMockData();
      const response = await fetch(`/api/v1/record/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(url ? { ...config, url } : config),
      });
      if (!response.ok) {
        throw new Error('Failed to record test');
      }
    } catch (err) {
      setError(err.message);
      setIsRecordingMockData(false);
    }
  };

  const onCheckboxChange = (event) => {
    setConfig({
      ...config,
      [event.target.name]: event.target.checked,
    });
  };

  const onUrlChange = (event) => {
    setConfig({
      ...config,
      url: event.target.value,
    });
  };

  const onPatternsChange = (event, newPatterns) => {
    setConfig({
      ...config,
      patterns: newPatterns,
    });
  };

  const stopRecordingMockData = async () => {
    try {
      setIsRecordingMockData(false);
      const response = await fetch(`/api/v1/record`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to stop recording mock data');
      }
      fetchMockData(selectedTest, {
        stopRecording: true,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const generatePlaywrightCode = async () => {
    const response = await fetch(`/api/v1/record/playwright`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
    if (!response.ok) {
      throw new Error('Failed to generate playwright code');
    }
    const data = await response.json();
    console.log(data);
  };

  const fetchRecordingStatus = async () => {
    const response = await fetch(`/api/v1/record/status`);
    const data = await response.json();
    setIsRecordingMockData(data.status === 'running');
  };

  const getParentFolder = () => {
    const parents = [];
    let currentParentId = selectedTest.parentId;
    while (currentParentId) {
      const parentIdForLookup = currentParentId;
      const parentFolder = testCases.find(
        (testCase) => testCase.id === parentIdForLookup
      );
      if (!parentFolder) break;
      parents.push(parentFolder.name);
      currentParentId = parentFolder.parentId;
    }
    return parents;
  };

  useEffect(() => {
    setConfig((prev) => ({ ...prev, testName: selectedTest.name }));
    fetchRecordingStatus();
    // Call fetchRecordingStatus on interval and cleanup on unmount
    const intervalId = setInterval(fetchRecordingStatus, 10000);
    return () => clearInterval(intervalId);
  }, [selectedTest]);

  useEffect(() => {
    if (detailTab !== 'code' || !selectedTest?.name) return undefined;
    let cancelled = false;
    (async () => {
      setSpecFetchLoading(true);
      setSpecFetchNotice(null);
      try {
        const response = await fetch(
          `/api/v1/code/spec?name=${encodeURIComponent(selectedTest.name)}`
        );
        if (cancelled) return;
        if (response.ok) {
          const data = await response.json();
          setDiskSpecCode(data.content ?? '');
          setSpecFetchNotice(null);
        } else if (response.status === 404) {
          setDiskSpecCode('');
          setSpecFetchNotice(
            'No saved Playwright spec found for this test yet. Save from the Events tab or record codegen output.'
          );
        } else {
          const errBody = await response.json().catch(() => ({}));
          setDiskSpecCode('');
          setSpecFetchNotice(
            errBody.error || `Could not load spec (HTTP ${response.status}).`
          );
        }
      } catch (e) {
        if (!cancelled) {
          setDiskSpecCode('');
          setSpecFetchNotice(e.message || 'Failed to load spec from server.');
        }
      } finally {
        if (!cancelled) setSpecFetchLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [detailTab, selectedTest?.name]);

  useEffect(() => {
    setDetailTab('events');
    setCodeTabRunningTest(false);
    setCodeTabTestOutput('');
  }, [selectedTest?.id]);

  const saveDiskSpecFile = async () => {
    const saveData = {
      generatedCode: diskSpecCode,
      fileName: `${nameToFolder(selectedTest?.name).toLowerCase()}.spec.js`,
      parents: getParentFolder(),
    };
    try {
      const response = await fetch('/api/v1/code/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData),
      });
      if (!response.ok) {
        throw new Error('Failed to save file');
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const playDiskSpecTest = async (withUI = false) => {
    setCodeTabRunningTest(true);
    setCodeTabTestOutput('');
    await streamRunTestOutput(
      {
        withUI,
        testName: selectedTest.name,
        generatedCode: diskSpecCode,
        fileName: `${nameToFolder(selectedTest?.name).toLowerCase()}.spec.js`,
        parents: getParentFolder(),
      },
      setCodeTabTestOutput
    );
  };

  const copyDiskSpecToClipboard = () => {
    navigator.clipboard.writeText(diskSpecCode).catch(() => {});
  };

  const onCodePanelBack = () => {
    if (codeTabRunningTest) {
      setCodeTabRunningTest(false);
      setCodeTabTestOutput('');
    } else {
      setDetailTab('events');
    }
  };

  return (
    <Box
      gap={1}
      display="flex"
      flexDirection="column"
      sx={{ width: '100%', margin: '0 auto', textAlign: 'left', mt: 4 }}
    >
      <Box width="100%" display="flex" flexDirection="row" gap={1}>
        {!isRecordingMockData && !isPlaywrightCodegenRunning && (
          <Box
            p={3}
            sx={{ textAlign: 'center', border: '1px solid #333' }}
            width="100%"
            display="flex"
            flexDirection="column"
            gap={1}
          >
            <Autocomplete
              freeSolo
              options={envDetails?.MetaData?.urls || []}
              value={config.url}
              onChange={(event, newValue) => {
                if (typeof newValue === 'string') {
                  onUrlChange({ target: { value: newValue } });
                } else if (newValue && newValue.inputValue) {
                  onUrlChange({ target: { value: newValue.inputValue } });
                } else {
                  onUrlChange({ target: { value: newValue || '' } });
                }
              }}
              onInputChange={(event, newInputValue) => {
                onUrlChange({ target: { value: newInputValue } });
              }}
              renderInput={(params) => (
                <TextField {...params} label="URL" fullWidth margin="normal" />
              )}
            />
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={config.patterns}
              onChange={onPatternsChange}
              onInputChange={(event, newInputValue, reason) => {
                if (reason === 'input' && newInputValue.includes(',')) {
                  const patterns = newInputValue
                    .split(',')
                    .map((p) => p.trim())
                    .filter((p) => p.length > 0);
                  const existingPatterns = config.patterns;
                  const newPatterns = [...existingPatterns, ...patterns];
                  onPatternsChange(event, newPatterns);
                }
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                    key={index}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Patterns"
                  placeholder="Enter patterns separated by commas (e.g., ^/api/.*, ^/v1/.*)"
                  margin="normal"
                  fullWidth
                />
              )}
            />
            {/* <FormControlLabel
              control={
                <Checkbox
                  checked={config.avoidDuplicatesWithDefaultMocks}
                  name="avoidDuplicatesWithDefaultMocks"
                  onChange={onCheckboxChange}
                />
              }
              label="Avoid duplicates with default mocks"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={config.avoidDuplicatesInTheTest}
                  name="avoidDuplicatesInTheTest"
                  onChange={onCheckboxChange}
                />
              }
              label="Avoid duplicates in the test"
            /> */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={config.stopMockServer}
                  name="stopMockServer"
                  onChange={onCheckboxChange}
                />
              }
              label="Stop mock server"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={config.recordEvents}
                  name="recordEvents"
                  onChange={onCheckboxChange}
                />
              }
              label="Record events"
            />
            <Box
              display="flex"
              flexDirection="row"
              gap={1}
              flexWrap="wrap"
              justifyContent="center"
              sx={{ mt: 1 }}
            >
              <Button
                id="record-mock-or-test-record-btn"
                color="primary"
                onClick={recordMockData}
                variant="contained"
              >
                Record Mock Data
              </Button>
              <Button
                id="record-mock-or-test-playwright-codegen-mocks-btn"
                color="secondary"
                onClick={recordPlaywrightCodegenWithMocks}
                variant="outlined"
              >
                Playwright codegen + mocks
              </Button>
            </Box>
          </Box>
        )}
        {isPlaywrightCodegenRunning && (
          <Box
            p={3}
            minWidth="100%"
            sx={{ textAlign: 'center', border: '1px solid #333' }}
            display="flex"
            flexDirection="column"
            gap={1}
          >
            <Typography>
              Playwright codegen with mock and event recording is running. Close
              the browser and inspector when you are done—this panel updates
              when the session finishes.
            </Typography>
          </Box>
        )}
        {isRecordingMockData && (
          <Box
            p={3}
            minWidth="100%"
            sx={{ textAlign: 'center', border: '1px solid #333' }}
            display="flex"
            flexDirection="column"
            gap={1}
          >
            <Typography>Recording in progress...</Typography>
            <Button
              id="record-mock-or-test-stop-btn"
              color="primary"
              onClick={stopRecordingMockData}
              variant="contained"
            >
              Stop recording
            </Button>
          </Box>
        )}
      </Box>
      {error && <Typography color="error">{error}</Typography>}
      <Box
        width="100%"
        sx={{
          border: '1px solid #333',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <Tabs
          value={detailTab}
          onChange={(_, next) => setDetailTab(next)}
          sx={{
            px: 1,
            pt: 1,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tab label="Events" value="events" id="record-mock-or-test-tab-events" />
          <Tab label="Code" value="code" id="record-mock-or-test-tab-code" />
        </Tabs>

        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          {detailTab === 'events' && (
            <RecordedEventsData
              testCases={testCases}
              recordingStatus={isRecordingMockData}
              selectedTest={selectedTest}
              envDetails={envDetails}
              recordEvents={recordTest}
              playwrightCodeGen={
                envDetails?.PLAYWRIGHT_DIR ? generatePlaywrightCode : null
              }
            />
          )}
          {detailTab === 'code' && (
            <Box sx={{ position: 'relative' }}>
              {specFetchLoading && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    py: 2,
                  }}
                >
                  <CircularProgress size={22} />
                  <Typography variant="body2" color="text.secondary">
                    Loading spec from disk…
                  </Typography>
                </Box>
              )}
              {specFetchNotice && !specFetchLoading && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ px: 2, py: 1 }}
                >
                  {specFetchNotice}
                </Typography>
              )}
              <Box
                sx={{
                  '& > div': { height: 'auto !important', minHeight: 520 },
                }}
              >
                <GeneratedCodePanel
                  runningTest={codeTabRunningTest}
                  genCode={diskSpecCode}
                  onGenCodeChange={setDiskSpecCode}
                  genCodeType="playwright"
                  playwrightCodeGen={
                    envDetails?.PLAYWRIGHT_DIR ? generatePlaywrightCode : null
                  }
                  onBack={onCodePanelBack}
                  onPlayTest={playDiskSpecTest}
                  onSaveFile={saveDiskSpecFile}
                  onCopy={copyDiskSpecToClipboard}
                  testOutput={codeTabTestOutput}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default RecordMockOrTest;
