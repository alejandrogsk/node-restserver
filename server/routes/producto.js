const express = require("express");

const { verificarToken } = require("../middlewares/autenticacion");

let app = express();
let Producto = require("../models/producto");

// =============================
// Obtener productos
// =============================
app.get("/productos", verificarToken, (req, res) => {
	let desde = req.query.desde || 0;
	desde = Number(desde);

	let limite = req.query.limite || 5;
	limite = Number(limite);

	Producto.find({ disponible: true })
		.skip(desde)
		.limit(limite)
		.populate("usuario", "nombre email")
		.populate("categoria", "descripcion _id")
		.exec((err, productos) => {
			if (err) {
				return res.status(500).json({
					ok: false,
					err,
				});
			}

			res.json({
				ok: true,
				productos,
			});
		});
});

// =============================
// Obtener producto por id
// =============================
app.get("/productos/:id", verificarToken, (req, res) => {
	let id = req.params.id;

	Producto.findById(id)
		.populate("usuario", "nombre email")
		.populate("categoria", "descripcion _id")
		.exec((err, productoDB) => {
			if (err) {
				return res.status(500).json({
					ok: false,
					err,
				});
			}

			if (!productoDB) {
				return res.status(400).json({
					ok: false,
					err: {
						message: "El ID no es correcto",
					},
				});
			}

			res.json({
				ok: true,
				productoDB,
			});
		});
});

// =============================
// Buscar producto
// =============================
app.get("/productos/buscar/:termino", verificarToken, (req, res) => {
	let termino = req.params.termino;
	let regex = new RegExp(termino, "i");

	Producto.find({ nombre: regex })
		.populate("categoria", "nombre")
		.exec((err, productos) => {
			if (err) {
				return res.status(500).json({
					ok: false,
					err,
				});
			}

			if (!productos) {
				return res.status(400).json({
					ok: false,
					err: {
						message: "Producto no encotrado",
					},
				});
			}

			res.json({
				ok: true,
				productos,
			});
		});
});

// =============================
// Crear un productos
// =============================
app.post("/productos", verificarToken, (req, res) => {
	let body = req.body;

	let producto = new Producto({
		nombre: body.nombre,
		precioUni: body.precioUni,
		descripcion: body.descripcion,
		disponible: body.disponible,
		categoria: body.categoria,
		usuario: req.usuario._id,
	});

	producto.save((err, productoDB) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				err,
			});
		}

		if (!productoDB) {
			return res.status(400).json({
				ok: false,
				err,
			});
		}

		res.json({
			ok: true,
			producto: productoDB,
		});
	});
});

// =============================
// Actualizar producto
// =============================
app.put("/productos/:id", (req, res) => {
	let id = req.params.id;
	let body = req.body;

	Producto.findById(id, (err, productoDB) => {
		if (err) {
			return res.status(400).json({
				ok: false,
				err,
			});
		}

		if (!productoDB) {
			return res.status(400).json({
				ok: false,
				err: {
					message: "El ID no existe",
				},
			});
		}

		productoDB.nombre = body.nombre;
		productoDB.precioUni = body.precioUni;
		productoDB.descripcion = body.descripcion;
		productoDB.disponible = body.disponible;
		productoDB.categoria = body.categoria;

		productoDB.save((err, productoGuardado) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					err,
				});
			}

			res.json({
				ok: true,
				productoGuardado,
			});
		});
	});
});

// =============================
// Borrar producto
// =============================
app.delete("/productos/:id", (req, res) => {
	let id = req.params.id;

	Producto.findById(id, (err, productoDB) => {
		if (err) {
			return res.status(400).json({
				ok: false,
				err,
			});
		}

		if (!productoDB) {
			return res.status(400).json({
				ok: false,
				err: {
					message: "El ID no existe",
				},
			});
		}

		/*Los productos con disponible = dalse no aparecen en el GET */
		productoDB.disponible = false;

		productoDB.save((err, productoBorrado) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					err,
				});
			}

			res.json({
				ok: true,
				productoBorrado,
				message: "Producto borrado",
			});
		});
	});
});

module.exports = app;
