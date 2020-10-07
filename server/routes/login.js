const express = require("express");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const Usuario = require("../models/usuario");

//const { verificarAdmin_Role } = require("../middlewares/autenticacion");

const app = express();

app.post("/login", (req, res) => {
	let body = req.body;

	//El email del usuario debe coincidir con el que viene en el body
	Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				err,
			});
		}

		if (!usuarioDB) {
			return res.status(400).json({
				ok: false,
				err: {
					message: "(Usuario) o contraseña incorrectos",
				},
			});
		}
		/*bcrypt toma la contraseña la encripta y ve si hacen match */
		if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
			return res.status(400).json({
				ok: false,
				err: {
					message: "Usuario o (contraseña) incorrectos",
				},
			});
		}

		//Generar Token
		let token = jwt.sign(
			{
				usuario: usuarioDB,
			},
			process.env.SEED, //VERIFY SIGNATURE
			{ expiresIn: process.env.CADUCIDAD_TOKEN } //Este token expira en una hora
		);

		res.json({
			ok: true,
			usuarioDB,
			token,
		});
	});
});

module.exports = app;
