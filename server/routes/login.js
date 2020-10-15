const express = require("express");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

//estas son de google auth
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.CLIENT_ID);

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

//Configuraciones de google
async function verify(token) {
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
		// Or, if multiple clients access the backend:
		//[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
	});
	const payload = ticket.getPayload();
	//const userid = payload["sub"];

	return {
		nombre: payload.name,
		email: payload.email,
		img: payload.picture,
		google: true,
	};
}

app.post("/google", async (req, res) => {
	let token = req.body.idtoken;

	let googleUser = await verify(token).catch(e => {
		return res.status(403).json({
			ok: false,
			err: e,
		});
	});

	Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				err,
			});
		}

		if (usuarioDB) {
			if (usuarioDB.google === false) {
				return res.status(400).json({
					ok: false,
					err: {
						message: "Debe usar su autenticación normal",
					},
				});
			} else {
				let token = jwt.sign(
					{
						usuario: usuarioDB,
					},
					process.env.SEED, //VERIFY SIGNATURE
					{ expiresIn: process.env.CADUCIDAD_TOKEN } //Este token expira en una hora
				);

				return res.json({
					ok: true,
					usuario: usuarioDB,
					token,
				});
			}
		} else {
			//Si el usuario no existe en la base de datos
			let usuario = new Usuario();
			usuario._id = googleUser._id;
			usuario.nombre = googleUser.nombre;
			usuario.email = googleUser.email;
			usuario.img = googleUser.img;
			usuario.google = true;
			/*hay que poner contraseña porque la base de datos lo requiere,
			esta carita se va a encriptar con 10 vueltas  */
			usuario.password = ":)";

			usuario.save((err, usuarioDB) => {
				if (err) {
					return res.status(500).json({
						ok: false,
						err,
					});
				}

				let token = jwt.sign(
					{
						usuario: usuarioDB,
					},
					process.env.SEED, //VERIFY SIGNATURE
					{ expiresIn: process.env.CADUCIDAD_TOKEN } //Este token expira en una hora
				);

				return res.json({
					ok: true,
					usuario: usuarioDB,
					token,
				});
			});
		}
	});
});
module.exports = app;
