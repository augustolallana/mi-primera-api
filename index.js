// Poner comentarios

const express = require("express")
const swaggerJsDocs = require("swagger-jsdoc")
const swaggerUI = require("swagger-ui-express")

const mw = require("./modules/middlewares")
const arrayUsuarios = mw.arrayUsuarios
const arrayProductos = mw.arrayProductos
const arrayPedidos = mw.arrayPedidos
const arrayMetodosPago = mw.arrayMetodosPago

const server = express()
const PORT = 5000

const logger = (req, res, next) => {
    console.log(`Path: ${req.path} - Method: ${req.method} - Headers: ${JSON.stringify(req.headers["user-index"])} - Query: ${JSON.stringify(req.query)}`);
    next();
}

server.use(express.json())
server.use(mw.setHeader)
server.use(logger)


server.post("/signup", mw.validarDatosRegistro, (req, res) => {
    res.status(201).json({ mensaje: "Usuario creado con éxito" })
})

server.post("/login", mw.validarDatosLogin, (req, res) => {
    res.status(200).json({ mensaje: `Usuario logueado con éxito. Id: ${arrayUsuarios.findIndex((usuario) => {return usuario.username === req.body.username})}`})
})

// Endpoints: Admin / Usuario
server.get("/productos", mw.estaLogueado, (req, res) => {
    res.status(200).json(arrayProductos)
})


// Endpoints: Usuario
server.post("/pedidos/crear", mw.estaLogueado, mw.crearPedido, (req, res) => {
    res.status(200).json({ mensaje: "Operación realizada con éxito" })
})

server.post("/pedidos/confirmar", mw.estaLogueado, mw.confirmarPedido, (req, res) => {
    res.status(200).json({ mensaje: "Operación realizada con éxito" })
})

server.put("/pedidos/editar", mw.estaLogueado, mw.editarPedido, (req, res) => {
    res.status(200).json({ mensaje: "Pedido actualizado con éxito!" })
})

server.get("/pedidos/historial", mw.estaLogueado, mw.verHistorialPedidos, (req, res) => {
    res.status(200).json(arrayUsuarios[req.headers["user-index"]].historialPedidos)
})

server.get("/pedidos/estado", mw.estaLogueado, mw.verEstadoPedido, (req, res) => {
    res.status(200).json({ mensaje: `El estado de tu pedido es ${arrayUsuarios[req.headers["user-index"]].historialPedidos[arrayUsuarios[req.headers["user-index"]].historialPedidos.length - 1].state}`})
})


// Endpoints: Admin
server.post("/productos", mw.estaLogueado, mw.isAdmin, (req, res) => {
})

server.put("/productos", mw.estaLogueado, mw.isAdmin, (req, res) => {
})

server.delete("/productos", mw.estaLogueado, mw.isAdmin, (req, res) => {
})

server.get("/pedidos", mw.estaLogueado, mw.isAdmin, (req, res) => {
    res.status(200).json(arrayPedidos)
})

server.put("/pedidos", mw.estaLogueado, mw.isAdmin, (req, res) => {
})

server.get("/medios-pago", mw.estaLogueado, mw.isAdmin, (req, res) => {
    res.status(200).json(arrayMetodosPago)
})

server.post("/medios-pago", mw.estaLogueado, mw.isAdmin, (req, res) => {
})

server.put("/medios-pago", mw.estaLogueado, mw.isAdmin, (req, res) => {
})

server.delete("/medios-pago", mw.estaLogueado, mw.isAdmin, (req, res) => {
})


// Listen server
server.listen(PORT, () => {
    console.log(`Servidor ejecutando en el puerto ${PORT}`)
})
