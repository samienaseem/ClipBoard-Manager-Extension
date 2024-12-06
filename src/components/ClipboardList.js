import { List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';

const ClipboardList = ({ items }) => {
    
  const handleCopy = (html, plainText) => {
    if (html) {
      const textarea = document.createElement('textarea');
      textarea.innerHTML = html;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    } else {
      navigator.clipboard.writeText(plainText);
    }
  };

  return (
    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
      {items.map((item) => (
        <Paper
          key={item.id}
          elevation={1}
          sx={{
            mb: 1,
            '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' },
          }}
          onClick={() => handleCopy(item.html, item.content)}
        >
          <ListItem>
            <ListItemText
              primary={
                <div
                  dangerouslySetInnerHTML={{
                    __html: item.html || item.content,
                  }}
                />
              }
              secondary={
                <>
                  <Typography variant="caption" component="span" sx={{ mr: 1 }}>
                    {formatDistanceToNow(new Date(item.timestamp))} ago
                  </Typography>
                  <Typography
                    variant="caption"
                    component="span"
                    color="text.secondary"
                  >
                    from {new URL(item.url).hostname}
                  </Typography>
                </>
              }
            />
          </ListItem>
        </Paper>
      ))}
    </List>
  );
};

export default ClipboardList;
