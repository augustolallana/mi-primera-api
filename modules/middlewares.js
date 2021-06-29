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

const validarDatosRegistro = (req, res, next) => {
    if (!req.body.username || !req.body.password || !req.body.email || !req.body.address) {
        res.status(400).json({ mensaje: "Faltan datos para el registro." })
        return
    }
    
    if (arrayUsuarios.find((usuario) => usuario.username === req.body.username)) {
        res.status(400).json({ mensaje: "El nombre de usuario colocado ya está registrado." })
        return
    }
    
    if (arrayUsuarios.find((usuario) => usuario.email === req.body.email)) {
        res.status(400).json({ mensaje: "El mail colocado ya está registrado." })
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
    
    let userIndex = arrayUsuarios.findIndex((user) => {
        return (user.username === req.body.username) && (user.password === req.body.password)
    })

    if (userIndex === -1) {
        res.status(401).json({ mensaje: "Credenciales inválidas" })
        return
    }

    valorHeader = userIndex
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

    if (req.body.quantities) {
        if (req.body.products.length !== req.body.quantities.length) {
            res.status(400).json({ mensaje: "Las cantidades especificadas no coinciden con la cantidad de productos seleccionados. Realice el pedido nuevamente" })
            return
        }
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
    
    let pedido = new Pedido(productosPedido, req.body.quantities || Array.from({length: req.body.products.length}).map(p => 1), req.body.payment || arrayMetodosPago[0].name, req.body.address || arrayUsuarios[req.headers["user-index"]].address, req.headers["user-index"])
    pedido.id = arrayPedidos.length
    arrayPedidos.push(pedido)
    
    next()
}

const calcularPrecioPedido = (pedido) => {
    let precio = 0
    for (let i = 0; i < pedido.products.length; i++) {
        precio += pedido.products[i].price * pedido.quantities[i]
    }

    return precio
}

const confirmarPedido = (req, res, next) => {
    if (!tienePedidoPendiente(req)) {
        res.status(404).json({ mensaje: "No tienes pedidos por confirmar" })
        return

    } else {
        let indexPedido = arrayPedidos.findIndex((pedido) => {return (pedido.user === req.headers["user-index"]) && (pedido.state === "Pendiente")})
        arrayPedidos[indexPedido].state = "Confirmado"
        arrayPedidos[indexPedido].price = calcularPrecioPedido(arrayPedidos[indexPedido])
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
    
    let pedidoOriginal = arrayPedidos[arrayPedidos.findIndex((pedido) => {return (pedido.user === req.headers["user-index"]) && (pedido.state === "Pendiente")})]
    let actualizacionKeys = Object.keys(req.body)
    
    if (req.body.products) {
        let nombresProductos = arrayProductos.map((producto) => {
            return producto.name
        })

        let productosPedido = []
        for (let i = 0; i < req.body.products.length; i++) {
            if (!nombresProductos.includes(req.body.products[i])) {
                res.status(400).json({ mensaje: `Actualmente no tenemos ${req.body.products[i]} en el menú. No se pudo actualizar el pedido.` })
                return
            }
            
            productosPedido.push(arrayProductos[nombresProductos.indexOf(req.body.products[i])])
        }

        arrayPedidos[arrayPedidos.findIndex((pedido) => {return pedido.user === req.headers["user-index"] && pedido.state === "Pendiente"})].products = productosPedido
        actualizacionKeys.splice(actualizacionKeys.indexOf((key) => key === "products"), 1)
    }

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
        return
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

const verPedidosPorUser = (req, res, next) => {
    if (!arrayUsuarios[req.params.user]) {
        res.status(400).json({ mensaje: "El id de usuario no es un id válido" })
        return
    }

    next()
}

const editarEstadoPedidos = (req, res, next) => {
    if (!req.body.state) {
        res.status(400).json({ mensaje: "Debes indicar el nuevo estado" })
        return
    }
    
    let pedido = arrayPedidos[req.params.id]

    if (!pedido) {
        res.status(400).json({ mensaje: "El id del pedido ingresado es inválido." })
        return
    }

    if (pedido.state === "Pendiente") {
        res.status(400).json({ mensaje: "No puedes modificar el estado de este pedido porque el usuario todavía no lo confirmó" })
        return
    }

    let estadosValidos = ["En preparacion", "Enviado", "Entregado", "Cancelado"]

    if (!estadosValidos.includes(req.body.state)) {
        res.status(400).json({ mensaje: "El estado indicado no es válido." })
        return
    }

    pedido.state = req.body.state

    next()
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
exports.verPedidosPorUser = verPedidosPorUser
exports.editarEstadoPedidos = editarEstadoPedidos
exports.crearMedioPago = crearMedioPago
exports.editarMedioPago = editarMedioPago
exports.eliminarMedioPago = eliminarMedioPago