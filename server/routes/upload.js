const express = require("express");
const fileUpload = require("express-fileupload");
const app = express();

const Usuario = require("../models/usuario");
const Producto = require("../models/producto");

/*'fs' y 'path' sirven para acceder a las carpetas que estan
en el directorio del costado. Vienen por defecto en express*/
const fs = require("fs"); //File sistem
const path = require("path"); //Path

// hey distintas configuraciones, por defecto es fileUpload()
app.use(fileUpload({ useTempFiles: true }));

app.put("/upload/:tipo/:id", (req, res) => {
	let tipo = req.params.tipo;
	let id = req.params.id;

	if (!req.files || Object.keys(req.files).length === 0) {
		return res.status(400).json({
			ok: false,
			err: {
				message: "No se subió ningun archivo.",
			},
		});
	}

	// Validar tipo
	let tiposValidos = ["productos", "usuarios"];

	if (tiposValidos.indexOf(tipo) < 0) {
		return res.status(400).json({
			ok: false,
			err: {
				message: "Los tipos permitidos son " + tiposValidos.join(", "),
			},
		});
	}

	// The name of the input field (i.e. "archivo") is used to retrieve the uploaded file
	let archivo = req.files.archivo;
	let nombreCortado = archivo.name.split(".");
	let extension = nombreCortado[nombreCortado.length - 1];

	// Extensiones permitidas
	let extensionesValidas = ["png", "jpg", "gif", "jpeg"];

	if (extensionesValidas.indexOf(extension) < 0) {
		return res.status(400).json({
			ok: false,
			err: {
				message:
					"Las extensiones perimitidas son " + extensionesValidas.join(", "),
				ext: extension,
			},
		});
	}

	// Cambiar nombre al archivo
	// 183912kuasiduaso-123.jpg
	let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

	archivo.mv(`uploads/${tipo}/${nombreArchivo}`, err => {
		if (err) {
			return res.status(500).json({
				ok: false,
				err,
			});
		}

		/***
		 * Acá me decido a empezar
		 */

		// Acá ya se cargó la imagen
		if (tipo === "usuarios") {
			imagenUsuario(id, res, nombreArchivo);
		} else {
			imagenProducto(id, res, nombreArchivo);
		}
	});
});

function imagenUsuario(id, res, nombreArchivo) {
	Usuario.findById(id, (err, usuarioDB) => {
		if (err) {
			/*es necesaria esta funcion porque auque 
			aya un error la imagen igual se sube, 
			por eso hay que borrarla*/
			borraArchivo(usuarioDB.img, "usuarios");
			return res.status(500).json({
				ok: false,
				err,
			});
		}

		if (!usuarioDB) {
			/*es necesaria esta funcion porque auque 
			el usuario no exista la imagen igual se sube, 
			por eso hay que borrarla*/
			borraArchivo(usuarioDB.img, "usuarios");
			return res.status(400).json({
				ok: false,
				err: {
					message: "Usuario no existe",
				},
			});
		}

		borraArchivo(usuarioDB.img, "usuarios");

		usuarioDB.img = nombreArchivo;

		usuarioDB.save((err, usuarioGuardado) => {
			res.json({
				ok: true,
				usuario: usuarioGuardado,
				img: nombreArchivo,
			});
		});
	});
}

function imagenProducto(id, res, nombreArchivo) {
	Producto.findById(id, (err, productoDB) => {
		if (err) {
			borraArchivo(productoDB.img, "productos");
			return res.status(500).json({
				ok: false,
				err,
			});
		}

		if (!productoDB) {
			borraArchivo(productoDB.img, "productos");
			return res.status(400).json({
				ok: false,
				err: {
					message: "Producto no existe",
				},
			});
		}

		borraArchivo(productoDB.img, "productos");

		productoDB.img = nombreArchivo;

		productoDB.save((err, productoGuardado) => {
			res.json({
				ok: true,
				producto: productoGuardado,
				img: nombreArchivo,
			});
		});
	});
}

//tipo puede ser usuario o producto
function borraArchivo(nombreImagen, tipo) {
	let pathImagen = path.resolve(
		__dirname,
		`../../uploads/${tipo}/${nombreImagen}`
	);
	//El archivo existe?
	if (fs.existsSync(pathImagen)) {
		//entonces borralo
		fs.unlinkSync(pathImagen);
	}

	//si el archivo no existe se guarda normalmente
}

module.exports = app;
