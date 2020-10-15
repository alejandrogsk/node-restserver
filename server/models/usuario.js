const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

//Podria pasar el objeto directamente en el campo de role
let rolesValidos = {
	values: ["ADMIN_ROLE", "USER_ROLE"],
	message: "{VALUE} no es un rol valido",
};

let Schema = mongoose.Schema;

let usuarioSchema = new Schema({
	nombre: {
		type: String,
		required: [true, "El nombre es necesario"],
	},
	email: {
		type: String,
		unique: true,
		required: [true, "El correo es necesario"],
	},
	password: {
		type: String,
		required: [true, "La constraseña es obligatoria"],
	},
	img: {
		type: String,
		required: false,
	},
	role: {
		type: String,
		default: "USER_ROLE",
		enum: rolesValidos,
	},
	estado: {
		type: Boolean,
		default: true,
	},
	google: {
		type: Boolean,
		default: false,
	},
});

//no se devuelve el valor de la contraseña,
//pero si se registra en base de datos

usuarioSchema.methods.toJSON = function () {
	let user = this;
	let userObject = user.toObject();
	delete userObject.password;

	return userObject;
};

//Acá se le dice al schema que use un pluguin especifico
//"uniqueValidator" y un mensage de error
usuarioSchema.plugin(uniqueValidator, { message: "{PATH} debe de ser unico" });

module.exports = mongoose.model("Usuario", usuarioSchema);
