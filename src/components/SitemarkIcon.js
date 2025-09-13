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
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 120 120"
          width="120"
          height="120"
          role="img"
          aria-label="Monoline FM"
        >
          <rect width="120" height="120" fill="black" />
          <path
            d="M18 96 L18 20 L56 20 M18 54 L48 54
           M56 20 L72 96 L84 40 L96 96"
            fill="black"
            stroke="white"
            stroke-width="8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </SvgIcon>
      <Typography color="primary" variant="h6">
        FtMocks
      </Typography>
    </Box>
  );
}
