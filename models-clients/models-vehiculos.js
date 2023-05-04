const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const vehiculoSchema = new mongoose.Schema({

coche: {
type:String,
trim:true
},
    
cliente: {
type:String
 },
    
  
nombre: {
type:String,
trim:true,
 maxLength:20,
},
matricula: {
type: String,
trim: true,
unique: true,
},
hora: {
 type:String,
 trim:true,
}
// plaza: {
// type:String,
// trim:true,
// enum: ['A1', 'A2', 'B3', 'B4', 'B5'],
// }
});


vehiculoSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Vehiculo", vehiculoSchema);
