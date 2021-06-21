 classes = require("./classes")
const Usuario = classes.Usuario
const Producto = classes.Producto
const Pedido = classes.Pedido
const MetodoPago = classes.MetodoPago

const arrays = require("./arrays")
const arrayUsuarios = arrays.arrayUsuarios  
const arrayProductos = arrays.arrayProductos 
const arrayPedidos = arrays.arrayPedidos 
const arrayMetodosPago = arrays.arrayMetodosPago 

// Middlewares de endpoints de usuario

// Validar si algún valor x de un parametro param que pase el usuario para el registro ya existe en los registrados 
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
    if (!req.body.username || !req.body.password || !req.body.email || !req.body.address) {
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
    
    let nuevoUsuario = new Usuario(req.body.username, req.body.completeName, req.body.email, req.body.phoneNumber, req.body.address, req.body.password)
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

// Fijar un header: "user-index" en toda petición al servidor 
const setHeader = (req, res, next) => {
    req.headers["user-index"] = valorHeader
    next()
}

const estaLogueado = (req, res, next) => {
    if (!req.headers["user-index"]) {
        if (req.headers["user-index"] !== 0) {
            res.status(401).json({ mensaje: "Debe estar logueado para realizar esta operacion" })
            return
        }
    }
    
    next()
}

const isAdmin = (req, res, next) => {
    if (!arrayUsuarios[req.headers["user-index"]].isAdmin) {
        res.status(401).json({ mensaje: "Necesita permisos de administrador para realizar esta tarea" })
        return
    }
    
    next()
}

const tienePedidoPendiente = (req) => {
    return (arrayPedidos.findIndex((pedido) => {return (pedido.user === req.headers["user-index"]) && (pedido.state === "Pendiente")}) !== -1)
}

const crearPedido = (req, res, next) => {
    if (tienePedidoPendiente(req)) {
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
            res.status(400).json({ mensaje: `Actualmente no tenemos ${req.body.products[i]} en el menú. Debes realizar el pedido nuevamente.` })
            return
        }
        
        productosPedido.push(arrayProductos[nombresProductos.indexOf(req.body.products[i])])
    }
    //                      array,          cantidades especificadas o array con todos 1s,                             metodo de pago especificado o el primmero registrado,  dirección especificada o la del registro
    let pedido = new Pedido(productosPedido, req.body.quantities || Array.from({length: req.body.products.length}).map(x => 1), req.body.payment || arrayMetodosPago[0].name, req.body.address || arrayUsuarios[req.headers["user-index"]].address, req.headers["user-index"])
    arrayPedidos.push(pedido)
    
    next()
}

const confirmarPedido = (req, res, next) => {
    if (!tienePedidoPendiente(req)) {
        res.status(404).json({ mensaje: "No tienes pedidos por confirmar" })
        return

    } else {
        let indexPedido = arrayPedidos.findIndex((pedido) => {return (pedido.user === req.headers["user-index"]) && (pedido.state === "Pendiente")})
        arrayPedidos[indexPedido].state = "Confirmado"
        arrayUsuarios[req.headers["user-index"]].historialPedidos.push(arrayPedidos[indexPedido])

        next()
    }
}

const verHistorialPedidos = (req, res, next) => {
    // Evaluar si el usuario tiene pedidos concretados
    if (arrayUsuarios[req.headers["user-index"]].historialPedidos.length === 0) {
        res.status(200).json({ mensaje: "Aún no has concretado ningún pedido." })
        return
    }

    next()
}


const verEstadoPedido = (req, res, next) => {
    if (arrayPedidos.findIndex((pedido) => {return pedido.user === req.headers["user-index"]}) === -1) {
        res.status(404).json({ mensaje: "Todavía no has realizado ningún pedido" })
        return
    } 
    
    if (tienePedidoPendiente(req)) {
        res.status(200).json({ mensaje: "El estado de tu pedido es Pendiente" })
        return
    }
    
    next()
}

const editarPedido = (req, res, next) => {
    if (!tienePedidoPendiente(req)) {
        res.status(400).json({ mensaje: "Sólo puedes editar los pedidos pendientes!" })
        return
    }

    // Se sobreentiende que no se va a intentar pasar keys que no existan en el pedido y por tanto no se puedan modificar los valores
    let pedidoOriginal = arrayPedidos[arrayPedidos.findIndex((pedido) => {return (pedido.user === req.headers["user-index"]) && (pedido.state === "Pendiente")})]
    let actualizacionKeys = Object.keys(req.body)

    for (let i = 0; i < actualizacionKeys.length; i++) {
        let cambio = actualizacionKeys[i]
        pedidoOriginal[cambio] = req.body[cambio]
    }

    next()
}


// Middlewares de endpoints de admin

const agregarProducto = (req, res, next) => {
    if (!req.body.name || !req.body.price) {
        res.status(400).json({ mensaje: "Faltan datos para crear el producto" })
        return
    }
    if (arrayProductos.findIndex((producto) => producto.name === req.body.name) !== -1) {
        res.status(400).json({ mensaje: `El producto ${req.body.name} ya se encuentra registrado` })
    }

    let producto = new Producto(req.body.name, req.body.price, req.body.photo)
    arrayProductos.push(producto)
    
    next()
}

const editarProducto = (req, res, next) => {
    let indexProducto = arrayProductos.findIndex((producto) => producto.name === req.params.name) 
    if (indexProducto === -1) {
        res.status(400).json({ mensaje: `${req.params.name} no corresponde con ningún producto registrado` })
        return
    }
    
    let productoOriginal = arrayProductos[indexProducto]
    let actualizacionKeys = Object.keys(req.body)

    for (let i = 0; i < actualizacionKeys.length; i++) {
        let cambio = actualizacionKeys[i]
        productoOriginal[cambio] = req.body[cambio]
    }

    next()
}

const eliminarProducto = (req, res, next) => {
    let indexProducto = arrayProductos.findIndex((producto) => producto.name === req.params.name) 
    if (indexProducto === -1) {
        res.status(400).json({ mensaje: `${req.params.name} no corresponde con ningún producto registrado` })
        return
    }

    arrayProductos.splice(indexProducto, 1)
    
    next()
}

const cambiarEstadoPedidos = (req, res, next) => {
    
}

const crearMedioPago = (req, res, next) => {
    if (!req.body.name) {
        res.status(400).json({ mensaje: "Falta el nombre para crear el medio de pago" })
        return
    }

    if (arrayMetodosPago.findIndex((metodo) => metodo.name === req.body.name) !== -1) {
        res.status(400).json({ mensaje: `El metodo de pago ${req.body.name} ya se encuentra registrado`})
        return
    }

    let metodoPago = new MetodoPago(req.body.name)
    arrayMetodosPago.push(metodoPago)

    next()
}

const editarMedioPago = (req, res, next) => {
    let indexMetodo = arrayMetodosPago.findIndex((metodo) => metodo.name === req.params.name) 
    if (indexMetodo === -1) {
        res.status(400).json({ mensaje: `${req.params.name} no corresponde con ningún medio de pago registrado` })
        return
    }
    
    let metodoOriginal = arrayMetodosPago[indexMetodo]
    let actualizacionKeys = Object.keys(req.body)

    for (let i = 0; i < actualizacionKeys.length; i++) {
        let cambio = actualizacionKeys[i]
        metodoOriginal[cambio] = req.body[cambio]
    }

    next()
}

const eliminarMedioPago = (req, res, next) => {
    let indexMetodo = arrayMetodosPago.findIndex((metodo) => metodo.name === req.params.name) 
    if (indexMetodo === -1) {
        res.status(400).json({ mensaje: `${req.params.name} no corresponde con ningún medio de pago registrado` })
        return
    }

    arrayMetodosPago.splice(indexMetodo, 1)
    
    next()
}



// Exports
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
exports.editarPedido = editarPedido
exports.agregarProducto = agregarProducto
exports.editarProducto = editarProducto
exports.eliminarProducto = eliminarProducto
exports.crearMedioPago = crearMedioPago
exports.editarMedioPago = editarMedioPago
exports.eliminarMedioPago = eliminarMedioPago