import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectarDB from "./config/db.js";

import usuarioRoutes from "./routes/usuarioRoutes.js";
import proyectoRoutes from "./routes/proyectoRoutes.js";
import tareaRoutes from "./routes/tareaRoutes.js";

const app = express();
app.use(express.json());
dotenv.config();
connectarDB();

//Configuar CORS

const whitelist = [process.env.FRONTEND_URL, process.env.FRONTEND_URL2];

const corsOptions = {
  origin: function (origin, collback) {
    console.log(origin);
    if (whitelist.includes(origin)) {
      // Puede consultar la API
      collback(null, true);
    } else {
      // NO esta perimito
      collback(new Error("Error de CORS"));
    }
  },
};

app.use(cors(corsOptions));
// Routing
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/proyectos", proyectoRoutes);
app.use("/api/tareas", tareaRoutes);

const PORT = process.env.PORT || 4000;
const servidor = app.listen(PORT, () => {
  console.log(`Corriendo servidor en el puerto ${PORT}`);
});

//socket.io

import { Server } from "socket.io";

const io = new Server(servidor, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

io.on("connection", (socket) => {
  console.log("====================================");
  console.log("Conectado a Socket.io");
  console.log("====================================");

  //Definir los eventos
  socket.on("abrir proyecto", (proyecto) => {
    socket.join(proyecto);
  });
  socket.on("nueva tarea", (tarea) => {
    const proyecto = tarea.proyecto;
    socket.to(proyecto).emit("tarea agregada", tarea);
  });
  socket.on("eliminar tarea", (tarea) => {
    const proyecto = tarea.proyecto;
    socket.to(proyecto).emit("tarea eliminada", tarea);
  });
  socket.on("editar tarea", (tarea) => {
    const proyecto = tarea.proyecto._id;
    socket.to(proyecto).emit("tarea editada", tarea);
  });
  socket.on("completando tarea", (tarea) => {
    const proyecto = tarea.proyecto._id;
    socket.to(proyecto).emit("tarea completada", tarea);
  });
});
