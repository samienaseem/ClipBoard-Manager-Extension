import { TextField } from '@mui/material';
import React from 'react';

const SearchBar = ({ value, onChange }) => (
  <TextField
    fullWidth
    variant="outlined"
    placeholder="Search clipboard history..."
    size="small"
    value={value}
    onChange={onChange}
    sx={{ mb: 2 }}
  />
);

export default SearchBar;
