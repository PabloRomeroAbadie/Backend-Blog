const validator = require("validator");

const validarArticulo = (parametros) => {

    let validar_titulo = !validator.isEmpty(parametros.titulo) && 
                         validator.isLength(parametros.titulo, {min:5, max:undefined});

    let validarContenido = !validator.isEmpty(parametros.contenido);

    if(!validar_titulo || !validarContenido){
        throw new Error("No se ha validado la informacion !!");
    }
}

module.exports = {
    validarArticulo
}