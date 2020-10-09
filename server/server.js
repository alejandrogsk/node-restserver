require("./config/config");

const express = require("express");
const mongoose = require("mongoose");
const path = require("path"); // para poder mostrar la carpeta public

//express
const app = express();

const bodyParser = require("body-parser");

// habilitar la carpeta public
app.use(express.static(path.resolve(__dirname, "../public")));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//Configuración global de rutas
app.use(require("./routes/index"));

//mongoose
//"mongodb://localhost:27017"
//mongodb+srv://ale:123@cluster0.sbrwx.mongodb.net/rest_db   process.env.DB_CNN

mongoose.connect(
	process.env.URLDB,
	{
		useNewUrlParser: true,
		useFindAndModify: false,
		useCreateIndex: true,
		useUnifiedTopology: true,
	},
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
	}
);

app.listen(process.env.PORT, () => {
	console.log("Escuchando puerto: ", process.env.PORT);
});
