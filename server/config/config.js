//====================
//Puerto
//====================
process.env.PORT = process.env.PORT || 3000;

//====================
//Entorno
//====================
let URLDB = "mongodb+srv://ale:123@cluster0.sbrwx.mongodb.net/cafe";

process.env.URLDB = URLDB;

//====================
//Vencimiento del token
//60 segundos, 60 minutos, 24 horas, 30 días
//====================
process.env.CADUCIDAD_TOKEN = "48h";

//====================
//SEED de autenticación (firma)
//====================
process.env.SEED = process.env.SEED || "ese-es-el-seed-desarrollo";

//====================
//Google
//====================
process.env.CLIENT_ID =
	process.env.CLIENT_ID ||
	"299156781275-rubj0fm90ff29h05ar6oug6j1v7pniqd.apps.googleusercontent.com";
