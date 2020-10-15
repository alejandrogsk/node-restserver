const express = require("express");

const Categoria = require("../models/categoria");
const {
	verificarToken,
	verificarAdmin_Role,
} = require("../middlewares/autenticacion");

const app = express();

// =============================
// Mostrar todas las categorias
// =============================
app.get("/categoria", verificarToken, (req, res) => {
	Categoria.find({})
		.sort("descripcion")
		.populate("usuarios", "nombre email")
		.exec((err, categorias) => {
			if (err) {
				return res.status(500).json({
					ok: false,
					err,
				});
			}

			res.json({
				ok: true,
				categorias,
			});
		});
});

// =============================
// Mostrar una categorias por id
// =============================
app.get("/categoria/:id", verificarToken, (req, res) => {
	let id = req.params.id;

	Categoria.findById(id, (err, categoriaDB) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				err,
			});
		}

		if (!categoriaDB) {
			return res.status(400).json({
				ok: false,
				err: {
					message: "El ID no es correcto",
				},
			});
		}

		res.json({
			ok: true,
			categoriaDB,
		});
	});
});

// =============================
// Crear nueva categoria
// =============================
app.post("/categoria", verificarToken, (req, res) => {
	let body = req.body;

	//con "req.usuario._id" obtengo el id del usuario
	let categoria = new Categoria({
		descripcion: body.descripcion,
		usuario: req.usuario._id,
	});

	//Guardar en base de datos
	categoria.save((err, categoriaDB) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				err,
			});
		}

		if (!categoriaDB) {
			return res.status(400).json({
				ok: false,
				err,
			});
		}

		res.json({
			ok: true,
			usuario: categoriaDB,
		});
	});
});

// =============================
// Actualizar categoria
// =============================
app.put("/categoria/:id", verificarToken, (req, res) => {
	//req.params.id lee el id del URL
	let id = req.params.id;

	let body = req.body;

	//descripción de la categoría
	let descCategoria = {
		descripcion: body.descripcion,
	};

	Categoria.findByIdAndUpdate(
		id,
		descCategoria,
		{ new: true, runValidators: true },
		(err, categoriaDB) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					err,
				});
			}

			res.json({
				ok: true,
				usuario: categoriaDB,
			});
		}
	);
});

// =============================
// Crear nueva categoria
// =============================
app.delete("/categoria/:id", (req, res) => {
	//solo un admin puede borrar la categoría
	//Category.findByIdAndRemove

	let id = req.params.id;

	Categoria.findByIdAndRemove(
		id,
		[verificarToken, verificarAdmin_Role],
		(err, categoriaDB) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					err,
				});
			}

			if (!categoriaDB) {
				return res.status(400).json({
					ok: false,
					err: {
						message: "EL id no existe",
					},
				});
			}

			res.json({
				ok: true,
				message: "Categoria borrada",
			});
		}
	);
});

module.exports = app;
