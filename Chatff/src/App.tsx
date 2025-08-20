import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import './App.css';

interface ChatMessage {
  sender?: string;
  text: string;
  createdAt?: string;
  system?: boolean;
}

interface ServerToClientEvents {
  userJoined: (data: { username: string }) => void;
  userLeft: (data: { username: string }) => void;
  previousMessage: (data: { sender: string; text: string; createdAt: string }[]) => void;
  message: (data: { sender: string; text: string; createdAt: string }) => void;
}

interface ClientToServerEvents {
  join: (username: string) => void;
  message: (text: string) => void;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('http://localhost:3000', {
  transports: ['websocket', 'polling'],
});

function App() {
  const [username, setUsername] = useState<string>('');
  const [joined, setJoined] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    socket.on('connect', () => console.log('Connected to server!'));
    socket.on('connect_error', (err) => console.error('Connection error:', err.message));

    socket.on('userJoined', (data) => {
      setMessages((prev) => [...prev, { system: true, text: `${data.username} joined` }]);
    });

    
    socket.on('previousMessage', (history) => {
      setMessages((prev) => [
        ...prev,
        ...history.map((msg) => ({
          sender: msg.sender,
          text: msg.text,
          createdAt: msg.createdAt,
        })),
      ]);
    });

    socket.on('userLeft', (data) => {
      setMessages((prev) => [...prev, { system: true, text: `${data.username} left` }]);
    });

    socket.on('message', (data) => {
      setMessages((prev) => [...prev, { sender: data.sender, text: data.text, createdAt: data.createdAt }]);
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('userJoined');
      socket.off('previousMessage');
      socket.off('userLeft');
      socket.off('message');
    };
  }, []);


  useEffect(() => {
    const chatBox = document.querySelector('.chat-box');
    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
  }, [messages]);

  const joinChat = () => {
    if (username.trim()) {
      socket.emit('join', username);
      setJoined(true);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('message', message);
      setMessage('');
    }
  };

  return (
    <div className='app-container'>
      {!joined ? (
        <div className='join-container'>
          <h2>Enter Username</h2>
          <input
            type='text'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder='Your name'
          />
          <button onClick={joinChat} disabled={!username.trim()}>
            Join
          </button>
        </div>
      ) : (
        <div className='chat-container'>
          <h2>Chat Room</h2>
          <div className='chat-box'>
            {messages.map((msg, i) => {
              if (msg.system) {
                return (
                  <p key={i} className='system-message'>
                    {msg.text}
                  </p>
                );
              }

              const isOwnMessage = msg.sender === username;
              return (
                <p
                  key={i}
                  className={`chat-message ${isOwnMessage ? 'own-message' : 'other-message'}`}
                >
                  {!isOwnMessage && <strong>{msg.sender}: </strong>}
                  {msg.text}<br></br>
                  {msg.createdAt && (
                    <span className="timestamp"> {new Date(msg.createdAt).toLocaleTimeString()} </span>
                  )}
                </p>
              );
            })}
          </div>
          <div className='input-container'>
            <input
              type='text'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Type message...'
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage} disabled={!message.trim()}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
