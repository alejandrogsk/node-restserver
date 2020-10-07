const express = require("express");
const bcrypt = require("bcrypt");
const _ = require("underscore");

const Usuario = require("../models/usuario");
const {
	verificarToken,
	verificarAdmin_Role,
} = require("../middlewares/autenticacion");

const app = express();

app.get("/usuario", verificarToken, (req, res) => {
	let desde = req.query.desde || 0;
	desde = Number(desde);

	let limite = req.query.limite || 5;
	limite = Number(limite);

	Usuario.find({ estado: true }, "nombre email role estado google img") //Que queremos mostrar?
		.skip(desde) //Se salta los antreriores
		.limit(limite) //Devuelve solo 5 registros
		.exec((err, usuarios) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					err,
				});
			}

			Usuario.count({ estado: true }, (err, conteo) => {
				res.json({
					ok: true,
					usuarios,
					cuantos: conteo,
				});
			});
		});
});

app.post("/usuario", [verificarToken, verificarAdmin_Role], (req, res) => {
	let body = req.body;

	//Usuario es un schema de mongoose
	let usuario = new Usuario({
		nombre: body.nombre,
		email: body.email,
		password: bcrypt.hashSync(body.password, 10),
		role: body.role,
	});

	//save es una palabra reservada de mongoose
	usuario.save((err, usuarioDB) => {
		if (err) {
			return res.status(400).json({
				ok: false,
				err,
			});
		}

		res.json({
			ok: true,
			usuario: usuarioDB,
		});
	});
});

app.put("/usuario/:id", [verificarToken, verificarAdmin_Role], function (
	req,
	res
) {
	let id = req.params.id;
	//pick es de underscore.js
	let body = _.pick(req.body, ["nombre", "email", "img", "role", "estado"]);

	//findByIdAndUpdate, runValidators mongoose documentation
	Usuario.findByIdAndUpdate(
		id,
		body,
		{ new: true, runValidators: true },
		(err, usuarioDB) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					err,
				});
			}

			res.json({
				ok: true,
				usuario: usuarioDB,
			});
		}
	);
});

app.delete(
	"/usuario/:id",
	[verificarToken, verificarAdmin_Role],
	(req, res) => {
		let id = req.params.id;

		let cambiaEstado = {
			estado: false,
		};

		Usuario.findByIdAndUpdate(
			id,
			cambiaEstado,
			{ new: true, runValidators: true },
			(err, usuarioBorrado) => {
				if (err) {
					return res.status(400).json({
						ok: false,
						err,
					});
				}

				//!usuarioBorrado o usuarioBorrado === null
				if (!usuarioBorrado) {
					return res.status(400).json({
						ok: false,
						err: {
							message: "Usuario no encontrado",
						},
					});
				}

				res.json({
					ok: true,
					usuario: usuarioBorrado,
				});
			}
		);
	}
);

module.exports = app;
