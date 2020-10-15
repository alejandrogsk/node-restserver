const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let categoriaSchema = new Schema({
	descripcion: {
		type: String,
		unique: true,
		required: [true, "Descripcion necesaria"],
	},
});

module.exports = mongoose.model("Categoria", categoriaSchema);
