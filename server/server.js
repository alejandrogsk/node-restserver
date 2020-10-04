require("./config/config");

const express = require("express");
//mongoose
const mongoose = require("mongoose");
//express
const app = express();

const bodyParser = require("body-parser");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//Traemos los usuarios
app.use(require("./routes/usuario"));

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
