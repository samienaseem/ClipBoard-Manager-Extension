import DeleteIcon from '@mui/icons-material/Delete';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import React from 'react';

const Header = ({ onClear }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mb: 2,
    }}
  >
    <Typography variant="h6" component="h1">
      Clipboard History
    </Typography>
    <Tooltip title="Clear History">
      <IconButton onClick={onClear} color="error">
        <DeleteIcon />
      </IconButton>
    </Tooltip>
  </Box>
);

export default Header;
