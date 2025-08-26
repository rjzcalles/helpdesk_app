require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io"); 
const { sequelize } = require('./models');

const app = express();
const server = http.createServer(app); 
const io = new Server(server, { 
  cors: {
    origin: "http://localhost:5001", 
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

const userRoutes = require('./routes/userRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
app.use('/api/users', userRoutes);
app.use('/api/incidents', incidentRoutes);

io.on('connection', (socket) => {
  console.log('Un cliente se ha conectado:', socket.id);
  socket.on('disconnect', () => {
    console.log('Un cliente se ha desconectado:', socket.id);
  });
});

server.listen(PORT, async () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
});