const classes = require("./classes")
const Usuario = classes.Usuario
const Producto = classes.Producto
const Pedido = classes.Pedido

const admin = {
    username:"admin",
    password: "todopoderoso",
    isAdmin: true
}

let arrayUsuarios = [admin]

const paramRegistradoRepetido = (param, req) => {
    let paramsRegistrados = arrayUsuarios.map((user) => {
        return user[param]
    })

    if (paramsRegistrados.includes(req.body[param])) {
        return true
    }

    return false
}

const validarDatosRegistro = (req, res, next) => {
    if (!req.body.username || !req.body.password || !req.body.email || !req.body.adress) {
        res.status(400).json({ mensaje: "Faltan datos para el registro." })
        return
    }
    
    if (paramRegistradoRepetido("email", req)) {
        res.status(400).json({ mensaje: "El mail colocado ya está registrado." })
        return
    }
    
    if (paramRegistradoRepetido("username", req)) {
        res.status(400).json({ mensaje: "El nombre de usuario colocado ya está registrado." })
        return
    }
    
    let nuevoUsuario = new Usuario(req.body.username, req.body.completeName, req.body.email, req.body.phoneNumber, req.body.adress, req.body.password)
    arrayUsuarios.push(nuevoUsuario)
    
    next()
}

const validarDatosLogin = (req, res, next) => {
    if (!req.body.username || !req.body.password) {
        res.status(400).json({ mensaje: "Debe completar todos los campos para ingresar" })
        return
    }
    
    let usernames = arrayUsuarios.map((user) => {
        return user.username
    })

    let passwords = arrayUsuarios.map((user) => {
        return user.password
    })

    if (!usernames.includes(req.body.username) || !passwords.includes(req.body.password)) {
        res.status(401).json({ mensaje: "Credenciales inválidas" })
        return
    }

    if (usernames.indexOf(req.body.username) !== passwords.indexOf(req.body.password)) {
        res.status(401).json({ mensaje: "Credenciales inválidas" })
        return
    }
    
    req.headers["user-index"] = usernames.indexOf(req.body.username)
    
    next()
}

exports.arrayUsuarios = arrayUsuarios
exports.validarDatosRegistro = validarDatosRegistro
exports.validarDatosLogin = validarDatosLogin
