const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();

// Habilitar CORS para todas las solicitudes
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let comments = [];

io.on('connection', (socket) => {
  console.log('A user connected');

  // Enviar comentarios actuales al nuevo cliente
  socket.emit('initialComments', comments);
  console.log('Sent initial comments:', comments);

  socket.on('newComment', (comment) => {
    console.log('New comment received:', comment);
    comments.push(comment);
    io.emit('newComment', comment); // Enviar el nuevo comentario a todos los clientes
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
