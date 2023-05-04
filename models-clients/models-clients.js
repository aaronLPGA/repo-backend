const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const clienteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    // required: true,
    trim: true,
    minLength: 6,
    maxLength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    trim: true,
  },
  dni: {
    type: String,
    trim:true,
    maxLength:9,
    require:true
  },
  
  vehiculos: [
    {
      type: mongoose.Types.ObjectId,
     
      ref: "Vehiculo",
    },
  ],
  
});

clienteSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Cliente", clienteSchema);
