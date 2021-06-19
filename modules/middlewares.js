const classes = require("./classes")
const Usuario = classes.Usuario
const Producto = classes.Producto
const Pedido = classes.Pedido
const MetodoPago = classes.MetodoPago

const arrays = require("./arrays")
const arrayUsuarios = arrays.arrayUsuarios  
const arrayProductos = arrays.arrayProductos 
const arrayPedidos = arrays.arrayPedidos 
const arrayMetodosPago = arrays.arrayMetodosPago 


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
const validarDatosLogin = (req, res, next) => {
    if (!req.body.username || !req.body.password) {
        res.status(400).json({ mensaje: "Debe completar todos los campos para ingresar" })
        return
    }
    
    let user = arrayUsuarios.findIndex((user) => {
        return (user.username === req.body.username) && (user.password === req.body.password)
    })

    if (user === -1) {
        res.status(401).json({ mensaje: "Credenciales inválidas" })
        return
    }

    valorHeader = user
    next()
}

const setHeader = (req, res, next) => {
    req.headers["user-index"] = valorHeader
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
    if ((arrayPedidos.findIndex((pedido) => {return (pedido.user === req.headers["user-index"]) && (pedido.state === "Pendiente")})) !== -1) {
        res.status(400).json({ mensaje: "No puedes crear un nuevo pedido porque tienes otro pendiente por confirmar!" })
        return
    }

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
   
    let pedido = new Pedido(productosPedido, req.body.quantities || Array.from({length: req.body.products.length}).map(x => 1), req.body.payment || arrayMetodosPago[0].name, req.body.adress || arrayUsuarios[req.headers["user-index"]].adress, req.headers["user-index"])
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
    // Evaluar si el usuario tiene 
    if (arrayUsuarios[req.headers["user-index"]].historialPedidos.length === 0) {
        res.status(200).json({ mensaje: "Aún no has concretado ningún pedido." })
        return
    }

    next()
}


const verEstadoPedido = (req, res, next) => {
    let pedidosUsers = arrayPedidos.map((pedido) => {
        return pedido.user
    })

    if (!pedidosUsers.includes(req.headers["user-index"])) {
        res.status(404).json({ mensaje: "Todavía no has realizado ningún pedido" })
        return
    }
    
    // Evaluar si el usuario tiene pedido pendiente
    if (arrayUsuarios[req.headers["user-index"]].historialPedidos.length === 0 || arrayPedidos.findIndex((pedido) => {return (pedido.user === req.headers["user-index"]) && (pedido.state === "Pendiente")}) !== -1) {
        res.status(200).json({ mensaje: "El estado de tu pedido es Pendiente"})
        return
    }

    next()
}

exports.valorHeader = valorHeader
exports.arrayUsuarios = arrayUsuarios
exports.arrayProductos = arrayProductos
exports.arrayPedidos = arrayPedidos
exports.arrayMetodosPago = arrayMetodosPago
exports.validarDatosRegistro = validarDatosRegistro
exports.setHeader = setHeader
exports.validarDatosLogin = validarDatosLogin
exports.estaLogueado = estaLogueado
exports.isAdmin = isAdmin
exports.crearPedido = crearPedido
exports.confirmarPedido = confirmarPedido
exports.verHistorialPedidos = verHistorialPedidos
exports.verEstadoPedido = verEstadoPedido