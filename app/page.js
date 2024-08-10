'use client';
import Image from "next/image";
import { useState } from 'react';
import { Box, Stack, TextField, Button, Typography, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import './globals.css';
import Background from './components/background';
import ReactMarkdown from 'react-markdown';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

export default function Home() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hi! I'm the FinanceHelper Support Agent, how can I assist you today?`,
  }]);

  const [message, setMessage] = useState('');

  // send msg to backend and return response
  const sendMessage = async () => {
    setMessage('') // clear input field
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    // send message to server
    const response = fetch('/api/chat', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
      // once we get the response
    }).then(async (res) => {
      const reader = res.body.getReader(); // get reader to read response body
      const decoder = new TextDecoder(); // create decoder to decode response text

      let result = '';

      // process the text from the response
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }

        // decodes value, and if no value, we'll create new array?
        const text = decoder.decode(value || new Int8Array(), { stream: true })

        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          // gets all messages except last one
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ]
        });

        return reader.read().then(processText);

      })
    })
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box width="100vw" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center" sx={{position: 'relative'}}>
        <Typography variant="h3" align="center" gutterBottom sx={{ fontFamily: '"Open Sans", sans-serif' }}>
          FinanceHelper Chat Support
        </Typography>
        
        <Stack direction="column" width="95%" maxWidth="600px" height="85vh" borderRadius={4} boxShadow={3} bgcolor="white" p={2} spacing={2}
          sx={{ position: 'relative' }}>
          <Background />
          <Stack direction="column" spacing={2} flexGrow={1} overflow="auto" sx={{ maxHeight: 'calc(100% - 60px)', padding: '10px 0' }}>
            {
              messages.map((message, index) => (
                <Box
                  key={index} display="flex" justifyContent={
                    message.role === 'assistant' ? 'flex-start' : 'flex-end'
                  } sx={{ transition: '0.3s', transform: 'translateY(10px)', opacity: 0.9 }}
                >
                  <Box
                    bgcolor={message.role === 'assistant' ? 'primary.main' : 'secondary.main'}
                    color="white"
                    borderRadius={2}
                    boxShadow={1}
                    maxWidth="85%"
                    sx={{
                      paddingTop: 1,
                      paddingBottom: 1,
                      paddingLeft: message.role === 'assistant' ? 1.5 : 1,
                      paddingRight: message.role === 'assistant' ? 1 : 1.5,
                      overflowWrap: 'break-word',
                      overflow: 'auto',
                      'ul': {
                        paddingLeft: '1.5rem',
                        marginTop: 0,
                        marginBottom: 0,
                      },
                      'ol': {
                        paddingLeft: '1.5rem',
                        marginTop: 0,
                        marginBottom: 0,
                      },
                      'li': {
                        marginBottom: '0.5rem',
                      }
                    }}
                  >
                    {message.role === 'assistant' ? (
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    ) : (
                      message.content
                    )}
                  </Box>
                </Box>
              ))
            }
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Type your message"
              variant="outlined"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button variant="contained" color="primary" onClick={sendMessage}>Send</Button>
          </Stack>
        </Stack>
      </Box>
    </ThemeProvider>
  );
}
