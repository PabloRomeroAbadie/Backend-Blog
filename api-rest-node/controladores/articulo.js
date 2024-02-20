const fs = require("fs");
const path = require("path");
const { validarArticulo } = require("../helpers/validar");
const Articulo = require("../modelos/Articulo");

const prueba = (req, res) => {
    return res.status(200).json({
        mensaje: "soy una accion de prueba en mi controlador de articulos"
    })
}

const curso = (req, res) => {
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
}

const crear = (req, res) => {

    // Recoger los parametros por post a guardar
    let parametros = req.body;

    // Validar los datos
    try {
        validarArticulo(parametros)

    } catch (error) {
        return res.status(400).json({
            status: "error",
            mensaje: "Faltan datos por enviar"
        })
    }

    // Crear el objeto a guardar
    const articulo = new Articulo(parametros);

    // Asignar valores a objeto basado en el modelo (manual o automatico)
    // articulo.titulo = parametros.titulo; esta seria la forma manual, la de arriba la automatica, pasando parametros al objeto    

    // Guardar el articulo en la base de datos
    articulo.save((error, articuloGuardado) => {

        if (error || !articuloGuardado) {
            return res.status(400).json({
                status: "error",
                mensaje: "No se ha guardado el articulo"
            })
        }

        // Devolver resultado
        return res.status(200).json({
            status: "success",
            articulo: articuloGuardado,
            mensaje: "Articulo creado con exito"
        })
    })
}

const listar = (req, res) => {

    let consulta = Articulo.find({})

    if (req.params.ultimos) {
        consulta.limit(2);
    }

    consulta.sort({ fecha: -1 })
        .exec((error, articulos) => {

            if (error || !articulos) {
                return res.status(404).json({
                    status: "error",
                    mensaje: "No se han encontrado articulos!"
                });
            }

            return res.status(200).send({
                status: "success",
                parametro: req.params.ultimos,
                contador: articulos.length,
                articulos
            })
        })
}

const uno = (req, res) => {
    // Recoger un id por la url
    let id = req.params.id;
    // Buscar el articulo 
    Articulo.findById(id, (error, articulo) => {

        // Si no existe devolver error
        if (error || !articulo) {
            return res.status(404).json({
                status: "error",
                mensaje: "No se han encontrado articulos!"
            });
        }

        // Devolver resultado
        res.status(200).json({
            status: "success",
            articulo
        })
    });
}

const borrar = (req, res) => {

    let articuloId = req.params.id;

    Articulo.findOneAndDelete({ _id: articuloId }, (error, articuloBorrado) => {

        //en caso que se produzca un error
        if (error || !articuloBorrado) {
            return res.status(500).json({
                status: "error",
                mensaje: "Error al borrar el articulo"
            })
        }

        // en caso de que todo vaya bien
        return res.status(200).json({
            status: "success",
            articulo: articuloBorrado,
            mensaje: "Metodo de borrar"
        })
    })
}

const editar = (req, res) => {
    //recoger el id del articulo a editar
    let articuloId = req.params.id;

    //recoger datos del body
    let parametros = req.body;

    //validar datos 
    try {
        validarArticulo(parametros);

    } catch (error) {
        return res.status(400).json({
            status: "error",
            mensaje: "Faltan datos por enviar"
        })
    }

    //buscar y actualizar articulo
    Articulo.findOneAndUpdate({ _id: articuloId }, req.body, { new: true }, (error, articuloActualizado) => {

        if (error || !articuloActualizado) {
            return res.status(500).json({
                status: "error",
                mensaje: "Error al actualizar"
            })
        }

        //devolver respuesta
        return res.status(200).json({
            status: "success",
            articulo: articuloActualizado
        })
    })
}

const subir = (req, res) => {
    // configurar multer

    // recoger el fichero de imagen subido 
    if (!req.file && !req.files) {
        return res.status(404).json({
            status: "error",
            mensaje: "Peticion invalida"
        })
    }

    // nombre del archivo 
    let archivo = req.file.originalname;

    // conseguir la extension 
    let archivo_split = archivo.split("\.");
    let extension = archivo_split[1];

    // comprobar la extension correcta 
    if (extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif") {

        // borra archivo y dar respuesta 
        fs.unlink(req.file.path, (error) => {
            return res.status(400).json({
                status: "error",
                mensaje: "imagen invalida"
            })
        })
    } else {

        //recoger el id del articulo a editar
        let articuloId = req.params.id;

        //buscar y actualizar articulo
        Articulo.findOneAndUpdate({ _id: articuloId }, {imagen: req.file.filename}, { new: true }, (error, articuloActualizado) => {

            if (error || !articuloActualizado) {
                return res.status(500).json({
                    status: "error",
                    mensaje: "Error al actualizar"
                })
            }

            //devolver respuesta
            return res.status(200).json({
                status: "success",
                articulo: articuloActualizado,
                fichero: req.file
            })
        })
    }
}

const imagen = (req,res ) => {
    let fichero =  req.params.fichero;
    let ruta_fisica = "./imagenes/articulos/"+fichero;

    fs.stat(ruta_fisica,(error, existe)=>{
        if(existe){
             return res.sendFile(path.resolve(ruta_fisica));
        }else{
            return res.status(404).json({
                status: "error",
                mensaje: "La imagen no existe",
                existe,
                fichero,
                ruta_fisica
            })
        }
    })
}

const buscador = (req,res)=>{
    // Sacar el string de busqueda
    let busqueda =  req.params.busqueda
        
    // Find OR 
    Articulo.find({ "$or": [
        {"titulo": {"$regex": busqueda, "$options": "i"}},
        {"contenido": {"$regex": busqueda, "$options": "i"}},
    ]})
    .sort({fecha: -1})
    .exec((error, articulosEncontrados) => {
        if(error || !articulosEncontrados || articulosEncontrados.length <= 0){
            return res.status(404).json({
                status:"error",
                mensaje:"No se han encontrado articulos"
            })
        }

        // Devolver resultado
        return res.status(200).json({
            status:"success",
            articulos: articulosEncontrados
        })
    })
}

module.exports = {
    prueba,
    curso,
    crear,
    listar,
    uno,
    borrar,
    editar,
    subir,
    imagen, 
    buscador
}