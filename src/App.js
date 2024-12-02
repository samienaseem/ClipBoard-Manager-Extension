import { Alert, Container, CssBaseline, Snackbar } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import ClipboardList from './components/ClipboardList';
import Header from './components/Header';
import SearchBar from './components/SearchBar';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

function App() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    if (chrome.storage) {
      chrome.storage.local.get("clipboardHistory", (data) => {
        setItems(data.clipboardHistory || []);
      });
    }
  };

  const clearHistory = () => {
    if (chrome.storage) {
      chrome.storage.local.set({ clipboardHistory: [] }, () => {
        setItems([]);
      });
    }
  };

  const filteredItems = items.filter(item =>
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container 
        sx={{ 
          width: '400px', 
          height: '500px', 
          padding: '16px',
          overflow: 'hidden'
        }}
      >
        <Header onClear={clearHistory} />
        <SearchBar 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <ClipboardList items={filteredItems} />
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}

export default App;
