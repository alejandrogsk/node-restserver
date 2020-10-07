const jwt = require("jsonwebtoken");

// ===============
// Verificar Token
// ===============

//el next hace que el programa se siga ejecutando
//(esta funcion es un middleware para get - post - put - delete)
let verificarToken = (req, res, next) => {
	//obtengo el token del heder
	let token = req.get("token");

	//decoded es igual al payload osea la informacion que voy a recibir cuando una la peticion
	jwt.verify(token, process.env.SEED, (err, decoded) => {
		if (err) {
			return res.status(401).json({
				ok: false,
				err: {
					name: "Json Web Token Herror",
					message: "Token invalido",
				},
			});
		}

		req.usuario = decoded.usuario;

		//seguir ejecutando el restp
		next();
	});
};

// ===============
// Verificar Admin Role
// ===============
let verificarAdmin_Role = (req, res, next) => {
	//req.usuario porque previamente verificamos el token y lo establecimos así
	let usuario = req.usuario;

	if (usuario.role === "ADMIN_ROLE") {
		next();
	} else {
		return res.status(401).json({
			ok: false,
			err: {
				message: "El usuario no es administraor",
			},
		});
	}
};

module.exports = { verificarToken, verificarAdmin_Role };
