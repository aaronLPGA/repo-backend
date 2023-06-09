// index.js
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
// const bcrypt = require('bcryptjs'); 
// const jwt = require('jsonwebtoken');
require("dotenv").config();

const app = express();

// const corsOptions = {
// 	origin: 'http://localhost:3000',
// 	optionsSuccessStatus: 200,
// };

app.use(cors());
app.use(express.json());

const rutasVehiculos = require("./routes-clientes/routes-vehiculos");
app.use("/api/vehiculos", rutasVehiculos);

const rutasClientes = require("./routes-clientes/routes-clientes");
app.use("/api/clientes", rutasClientes);

app.use((req, res) => {
  // Middleware que se ejecuta cuando el servidor no tiene la ruta que se ha enviado desde el cliente
  res.status(404);
  res.json({
    mensaje: "Información no encontrada",
  });
});

mongoose
  .connect(process.env.MONGO_DB_URI)
  .then(() => {
    console.log("💯 Conectado con éxito a Atlas");
    app.listen(process.env.PORT || 7001, () =>
      console.log(`🧏‍♀️ Escuchando en puerto ${process.env.PORT}`)
    );
  })
  .catch((error) => console.log(error));