const {conexion} = require("./basedatos/conexion");
const express = require("express");
const cors = require("cors");

//inicializar app
console.log("App de node arrancada");

//conectar a la base de datos 
conexion();

//crear servidor node 
const app = express();
const puerto = 3900;

//configurar cors
app.use(cors());

//convertir body a objeto js
app.use(express.json()); //recibir datos con content-type app/json
app.use(express.urlencoded({extended:true})) // form-urlencoded

//RUTAS
const rutas_articulo = require("./rutas/articulo")

//cargo las rutas
app.use("/api", rutas_articulo);

//rutas pruebas harcodeadas
app.get("/probando", (req, res) => {
    console.log("Se ha ejecutado el endpoint probando")

    return res.status(200).json([
        {
            curso: "Master en React",
            autor: "Pablo Romero",
            url: "pabloromero.es/masterreact"
        },
        {
            curso: "Master en React",
            autor: "Pablo Romero",
            url: "pabloromero.es/masterreact"
        }
])
})

app.get("/", (req, res) => {
    console.log("Se ha ejecutado el endpoint probando")

    return res.status(200).send(
        "<h1>Empezando a crear un api rest con node</h1>"
    )
})

//crear servidor y escuchar peticiones
app.listen(puerto, ()=> {
    console.log("Servidor corriendo en el puerto " + puerto)
})
