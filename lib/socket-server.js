const { Server: SocketIOServer } = require('socket.io');

class SocketServer {
  constructor() {
    this.io = null;
    this.conversations = new Map();
  }

  initialize(server) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Join a conversation session
      socket.on('join-session', (sessionId) => {
        // Leave any previous sessions
        socket.rooms.forEach(room => {
          if (room !== socket.id) {
            socket.leave(room);
          }
        });
        
        socket.join(sessionId);
        console.log(`Client ${socket.id} joined session: ${sessionId}`);
        
        // Initialize session if it doesn't exist
        if (!this.conversations.has(sessionId)) {
          this.conversations.set(sessionId, {
            messages: [],
            sessionId
          });
        }

        // Send current conversation state to the new client
        const conversation = this.conversations.get(sessionId);
        if (conversation) {
          socket.emit('conversation-state', conversation);
        }
      });

      // Handle new messages
      socket.on('send-message', (data) => {
        console.log('Received send-message:', data);
        const { sessionId, message } = data;
        const conversation = this.conversations.get(sessionId);
        
        if (conversation) {
          conversation.messages.push(message);
          console.log(`Broadcasting message to session ${sessionId} to ${this.io.sockets.adapter.rooms.get(sessionId)?.size || 0} clients`);
          // Broadcast to all clients in the session
          this.io.to(sessionId).emit('new-message', message);
        } else {
          console.log(`No conversation found for session ${sessionId}`);
        }
      });

      // Handle conversation updates
      socket.on('update-conversation', (data) => {
        const { sessionId, messages } = data;
        const conversation = this.conversations.get(sessionId);
        
        if (conversation) {
          conversation.messages = messages;
          // Broadcast to all clients in the session
          this.io.to(sessionId).emit('conversation-updated', messages);
        }
      });

      // Handle typing indicators
      socket.on('typing', (data) => {
        const { sessionId, isTyping, role } = data;
        socket.to(sessionId).emit('user-typing', { isTyping, role });
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  getIO() {
    return this.io;
  }
}

const socketServer = new SocketServer();
module.exports = { socketServer };
