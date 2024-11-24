import * as React from 'react';
import SvgIcon from '@mui/material/SvgIcon';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function SitemarkIcon() {
  const navigate = useNavigate();
  const onClick = () => {
    navigate('/');
  };
  return (
    <Box
      onClick={onClick}
      sx={{ cursor: 'pointer' }}
      display="flex"
      alignItems="center"
    >
      <SvgIcon sx={{ height: 21, width: 21, mr: 2 }}>
        <svg
          width="80"
          height="100"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="#f0f0f0"
            stroke="#000"
            stroke-width="2"
          />
          <rect x="20" y="20" width="10" height="60" fill="#000" />
          <rect x="30" y="20" width="30" height="10" fill="#000" />
          <rect x="30" y="45" width="20" height="10" fill="#000" />
          <polygon points="60,80 70,20 80,80 90,20 100,80" fill="#000" />
        </svg>
      </SvgIcon>
      <Typography color="primary" variant="h6">
        FtMocks
      </Typography>
    </Box>
  );
}
