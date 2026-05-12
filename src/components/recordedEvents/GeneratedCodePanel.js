import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Divider,
  TextField,
  Tooltip,
  IconButton,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import GavelOutlined from '@mui/icons-material/GavelOutlined';
import SaveIcon from '@mui/icons-material/Save';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AnsiToHtml from 'ansi-to-html';

export default function GeneratedCodePanel({
  runningTest,
  genCode,
  onGenCodeChange,
  genCodeType,
  playwrightCodeGen,
  onBack,
  onPlayTest,
  onSaveFile,
  onCopy,
  testOutput,
}) {
  const htmlOutput = useMemo(() => {
    const convert = new AnsiToHtml();
    return convert.toHtml(testOutput).replace(/\n/g, '<br/>');
  }, [testOutput]);

  return (
    <Box
      width="100%"
      p={2}
      sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      <Box
        p={1}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton id="recorded-events-back-btn" color="primary" onClick={onBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">
            {runningTest ? 'Test Output' : 'Generated Code'}
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Save and Run Test">
            <IconButton
              id="recorded-events-play-test-btn"
              onClick={() => onPlayTest(false)}
              sx={{ mr: 1 }}
            >
              <PlayArrowIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Save and Run Test With Playwright UI">
            <IconButton
              id="recorded-events-play-ui-btn"
              onClick={() => onPlayTest(true)}
              sx={{ mr: 1 }}
            >
              <GavelOutlined />
            </IconButton>
          </Tooltip>
          <Tooltip title="Save File">
            <IconButton
              id="recorded-events-save-file-btn"
              onClick={onSaveFile}
              sx={{ mr: 1 }}
            >
              <SaveIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy to Clipboard">
            <IconButton id="recorded-events-copy-btn" onClick={onCopy}>
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Divider />
      {!runningTest && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            p={2}
            sx={{
              textAlign: 'left',
              width: '100%',
              overflowX: 'scroll',
            }}
          >
            <TextField
              id="recorded-events-gen-code-input"
              multiline
              fullWidth
              value={genCode}
              onChange={(e) => onGenCodeChange(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                },
                mb: 2,
              }}
              rows={25}
            />
          </Box>
          {genCodeType === 'playwright' && playwrightCodeGen && (
            <Box
              sx={{
                textAlign: 'center',
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                pl: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Find generated code above or you can Run playwright codegen to
                generate the code
              </Typography>
              <Button
                id="recorded-events-playwright-codegen-btn"
                sx={{ mt: 1 }}
                onClick={playwrightCodeGen}
                variant="outlined"
              >
                Run playwright codegen
              </Button>
            </Box>
          )}
        </Box>
      )}
      {runningTest && (
        <Box
          p={2}
          sx={{
            textAlign: 'left',
            width: 'calc(100vw - 500px)',
            overflowX: 'scroll',
          }}
        >
          <div
            style={{
              background: 'black',
              color: 'white',
              fontFamily: 'monospace',
              padding: '10px',
              borderRadius: '8px',
              overflowY: 'auto',
              height: '700px',
            }}
            dangerouslySetInnerHTML={{ __html: htmlOutput }}
          />
        </Box>
      )}
    </Box>
  );
}
