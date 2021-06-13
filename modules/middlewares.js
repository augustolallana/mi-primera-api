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

exports.arrayUsuarios = arrayUsuarios
