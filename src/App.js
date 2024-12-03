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
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const checkConnection = () => {
      if (chrome?.runtime) {
        const port = chrome.runtime.connect();
        port.onDisconnect.addListener(() => {
          console.log('Lost connection to extension');
          setIsConnected(false);
          // Attempt to reconnect
          setTimeout(checkConnection, 1000);
        });
        setIsConnected(true);
      }
    };

    checkConnection();
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      chrome.storage.local.get('clipboardHistory', (data) => {
        if (chrome.runtime.lastError) {
          setError('Failed to load clipboard history');
          console.error(chrome.runtime.lastError);
        } else {
          setItems(data.clipboardHistory || []);
        }
      });
    } catch (error) {
      console.error('Error loading history:', error);
      setError('Failed to connect to extension');
    }
  };

  if (!isConnected) {
    return (
      <div>
        <Alert severity="warning">
          Lost connection to extension. Attempting to reconnect...
        </Alert>
      </div>
    );
  }

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
