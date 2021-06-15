const classes = require("./classes")
const Usuario = classes.Usuario
const Producto = classes.Producto
const Pedido = classes.Pedido
const MetodoPago = classes.MetodoPago


const admin = {
    username:"admin",
    password: "todopoderoso",
    isAdmin: true
}

let arrayUsuarios = [admin]


let productoTest0 = {
    name: "pizza grande",
    price: 500,
    photo: "https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_960_720.jpg"
}

let productoTest1 = {
    name: "bebida saborizada 500ml",
    price: 85,
    photo: "https://cdn.pixabay.com/photo/2019/09/19/14/30/frutichela-4489415_960_720.jpg"
}

let productoTest2 = {
    name: "ensalada cesar",
    price: 450,
    photo: "https://cdn.pixabay.com/photo/2017/08/11/00/32/salad-2629262__480.jpg"
}

let arrayProductos = [productoTest0, productoTest1, productoTest2]


let paymentMethod1 = {
    name: "Tarjeta de crédito"
}

let paymentMethod2 = { 
    name: "Efectivo"
}

let arrayMetodosPago = [paymentMethod1, paymentMethod2]


let arrayPedidos = []


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

let valorHeader = false

const setHeader = (req, res, next) => {
    req.headers["user-index"] = valorHeader
    next()
}

const validarDatosLogin = (req, res, next) => {
    delete req.headers["user-index"]
    
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
    
    if (req.body.password !== passwords[usernames.indexOf(req.body.username)]) {
        res.status(401).json({ mensaje: "Credenciales inválidas" })
        return
    }

    valorHeader = usernames.indexOf(req.body.username)

    next()
}

const estaLogueado = (req, res, next) => {
    
    if (!req.headers["user-index"]) {
        if (req.headers["user-index"] !== 0) {
            res.status(401).json({ mensaje: "Debe estar logueado para realizar esta operacion"})
            return
        }
    }
    
    next()
}

const isAdmin = (req, res, next) => {
    if (!arrayUsuarios[req.headers["user-index"]].isAdmin) {
        res.status(401).json({ mensaje: "Necesita permisos de administrador para realizar esta tarea"})
        return
    }
    
    next()
}

const crearPedido = (req, res, next) => {
    if (!req.body.products) {
        res.status(400).json({ mensaje: "Debe agregar al menos un producto para realizar un pedido" })
        return
    }

    let productosPedido = []
    let nombresProductos = arrayProductos.map((producto) => {
        return producto.name
    })

    for (let i = 0; i < req.body.products.length; i++) {
        if (!nombresProductos.includes(req.body.products[i])) {
            res.status(400).json({ mensaje: `Actualmente no tenemos ${req.body.products[i]} en el menú. Debes realizar el pedido nuevamente.`})
            return
        }
        
        productosPedido.push(arrayProductos[nombresProductos.indexOf(req.body.products[i])])
    }
   
    let pedido = new Pedido(productosPedido, req.body.payment || arrayMetodosPago[0].name, req.body.adress || arrayUsuarios[req.headers["user-index"]].adress, req.headers["user-index"])
    arrayPedidos.push(pedido)
    
    next()
}

const confirmarPedido = (req, res, next) => {
    let pedidosUsers = arrayPedidos.map((pedido) => {
        return pedido.user
    })

    if (!pedidosUsers.includes(req.headers["user-index"])) {
        res.status(404).json({ mensaje: "Todavía no has realizado ningún pedido" })
        return
    }

    if (arrayPedidos[pedidosUsers.lastIndexOf(req.headers["user-index"])].state !== "Pendiente") {
        res.status(404).json({ mensaje: "No tienes pedidos por confirmar" })
        return
    }
    
    arrayPedidos[pedidosUsers.lastIndexOf(req.headers["user-index"])].state = "Confirmado"
    arrayUsuarios[req.headers["user-index"]].historialPedidos.push(arrayPedidos[pedidosUsers.lastIndexOf(req.headers["user-index"])])

    next()
}

const verHistorialPedidos = (req, res, next) => {
    if (arrayUsuarios[req.headers["user-index"]].historialPedidos.length === 0) {
        res.status(200).json({ mensaje: "Aún no has concretado ningún pedido." })
        return
    }

    next()
}

exports.arrayUsuarios = arrayUsuarios
exports.arrayProductos = arrayProductos
exports.validarDatosRegistro = validarDatosRegistro
exports.setHeader = setHeader
exports.validarDatosLogin = validarDatosLogin
exports.estaLogueado = estaLogueado
exports.isAdmin = isAdmin
exports.crearPedido = crearPedido
exports.confirmarPedido = confirmarPedido
exports.verHistorialPedidos = verHistorialPedidos