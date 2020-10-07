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
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

//====================
//SEED de autenticación (firma)
//====================
process.env.SEED = process.env.SEED || "ese-es-el-seed-desarrollo";
