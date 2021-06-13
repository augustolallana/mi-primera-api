const express = require("express")
const swaggerJsDocs = require("swagger-jsdoc")
const swaggerUI = require("swagger-ui-express")

const mw = require("./modules/middlewares")
const arrayUsuarios = mw.arrayUsuarios

const server = express()
const PORT = 5000

server.use(express.json())

server.post("/signup", (req, res) => {
})

server.post("/login", (req, res) => {
})

server.get("/gestionar", (req, res) => {
})

server.get("/productos", (req, res) => {
})

server.post("/pedidos", (req, res) => {
})

server.put("/pedidos", (req, res) => {
})

server.get("pedidos/historial", (req, res) => {
})

server.get("pedidos/estado", (req, res) => {
})

server.listen(PORT, () => {
    console.log(`Servidor ejecutando en el puerto ${PORT}`)
})
