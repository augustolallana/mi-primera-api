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

// Swagger configuration
const swaggerOptions = {
    swaggerDefinition: {
        swagger: "2.0",
        info: {
            title: "Mi Primera Api: Deliah-Resto",
            version: "0.0.1",
            description:    
                        "Esta es la API correspondiente al Primer Sprint del curso de Programación Web Backend de Acámica." +
                        "Se trata de una API diseñada para gestionar un restaurante: Deliah-Resto." +
                        "Fue programada en Nodejs utilizando Express para configurar el servidor y Swagger para realizar la" +
                        "documentación."
        }
    },
    apis: ["./index.js"]
}

const swaggerDocs = swaggerJsDocs(swaggerOptions)
server.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs))

/**
 * @swagger
 *  definitions:
 *    Usuario:
 *      type : object
 *      properties:
 *        username:
 *          type : string
 *          description: nombre de usuario 
 *        completeName:
 *          type : string
 *          description: nombre completo real del usuario (opcional)   
 *        email:
 *          type : string
 *          description: email del usuario         
 *        phoneNumber:
 *          type : integer
 *          description: numero de telefono del usuario (opcional) 
 *        address:
 *          type : string
 *          description: dirección del usuario 
 *        password:
 *          type : string
 *          description: contraseña del usuario
 * 
 *    Producto:
 *      type : object
 *      properties:
 *        name:
 *          type : string
 *          description: nombre del producto 
 *        price:
 *          type : integer
 *          description: precio del producto
 *        photo:
 *          type : string
 *          description: url de la foto del producto (opcional)
 * 
 *    Pedido:
 *      type : object
 *      properties:
 *        products:
 *          type : array
 *          items:
 *            type: string
 *          description: array con los nombres de los productos del pedido 
 *        quantities:
 *          type : array
 *          items:
 *            type: integer
 *          description: array con las cantidades de cada producto en el mismo orden que los productos
 *        payment:
 *          type : string
 *          description: nombre del método de pago seleccionado (opcional, por defecto se selecciona el primer método de pago del array de métodos de pago)    
 *        address:
 *          type : string
 *          description: dirección a la cual enviar el pedido (opcional, por defecto se selecciona la dirección indicada en el registro del usuario)
 * 
 *    MetodoPago:
 *      type : object
 *      properties:
 *        name:
 *          type : string
 *          description: nombre del método de pago 
 */

// Global middlewares
server.use(express.json())
server.use(mw.setHeader)


// Signup - Login
/**
 * @swagger
 * /usuarios:
 *  post:
 *   tags:
 *    - "Signup - Login"   
 *   summary: Crea un usuario
 *   description: Crea un usuario con los datos indicados
 *   parameters:
 *    - in: "body"
 *      name: "body"
 *      required: true
 *      schema:
 *       $ref: "#/definitions/Usuario"
 *   responses:
 *    201:
 *     description: usuario creado con éxito
 *    400:
 *     description: faltan datos importantes para el registro
 *    403:
 *     description: datos ingresados no válidos por ya haber usuarios registrados con los mismos
 */
server.post("/usuarios", mw.validarDatosRegistro, (req, res) => {
    res.status(201).json({ mensaje: "Usuario creado con éxito" })
})

/**
 * @swagger
 * /login:
 *  post:
 *   tags:
 *    - "Signup - Login"   
 *   summary: Loguea un usuario en la aplicación
 *   description: Accede al sistema con los datos de un usuario registrado
 *   parameters:
 *    - in: "body"
 *      name: "body"
 *      required: true
 *      schema:
 *       type : object
 *       properties:
 *        username:
 *         type: string
 *         description: nombre de usuario registrado
 *        password:
 *         type: string
 *         description: contraseña del usuario regitrado 
 *   responses:
 *    201:
 *     description: usuario logueado con éxito
 *    400:
 *     description: faltan datos para el login
 *    403:
 *     description: los datos ingresados no son válidos
 */
server.post("/login", mw.validarDatosLogin, (req, res) => {
    res.status(201).json({ mensaje: `Usuario logueado con éxito. Id: ${arrayUsuarios.findIndex((usuario) => {return usuario.username === req.body.username})}`})
})


// Endpoints: Admin / Usuario

/**
 * @swagger
 * /productos:
 *  get:
 *   tags:
 *    - "Operaciones de usuario"
 *    - "Operaciones de admin"   
 *   summary: Obtiene array de productos
 *   description: Muestra los productos registrados en el sistema
 *   responses:
 *    200:
 *     description: muestra array de productos
 *    401:
 *     description: el usuario no esta logueado
 */
server.get("/productos", mw.estaLogueado, (req, res) => {
    res.status(200).json(arrayProductos)
})


// Endpoints: Usuario

/**
 * @swagger
 * /pedidos/crear:
 *  post:
 *   tags:
 *    - "Operaciones de usuario"   
 *   summary: Crea un pedido
 *   description: Permite a un usuario registrado crear un pedido
 *   parameters:
 *    - in: "body"
 *      name: "body"
 *      required: true
 *      schema:
 *       $ref: "#/definitions/Pedido"
 *   responses:
 *    201:
 *     description: pedido creado con éxito
 *    400:
 *     description: datos ingresados no válidos o insuficientes para crear el pedido 
 *    401:
 *     description: el usuario no está logueado
 *    409:
 *     description: ya hay un pedido creado por el usuario en curso (sin confirmar)
 */
server.post("/pedidos/crear", mw.estaLogueado, mw.crearPedido, (req, res) => {
    res.status(200).json({ mensaje: "Pedido creado con éxito" })
})

/**
 * @swagger
 * /pedidos/confirmar:
 *  post:
 *   tags:
 *    - "Operaciones de usuario"   
 *   summary: Confirma un pedido
 *   description: Permite a un usuario registrado y con un pedido previamente creado confirmarlo
 *   responses:
 *    201:
 *     description: pedido confirmado con éxito
 *    401:
 *     description: el usuario no está logueado
 *    404:
 *     description: el usuario no tiene un pedido pendiente a confirmar
 */
server.post("/pedidos/confirmar", mw.estaLogueado, mw.confirmarPedido, (req, res) => {
    res.status(201).json({ mensaje: "Pedido confirmado con éxito" })
})

/**
 * @swagger
 * /pedidos/editar:
 *  put:
 *   tags:
 *    - "Operaciones de usuario"   
 *   summary: Edita un pedido
 *   description: Permite a un usuario registrado y con un pedido pendiente sin confirmar, editar su contenido
 *   parameters:
 *    - in: "body"
 *      name: "body"
 *      required: true
 *      schema:
 *       $ref: "#/definitions/Pedido"
 *   responses:
 *    202:
 *     description: pedido editado con éxito
 *    401:
 *     description: el usuario no está logueado
 *    404:
 *     description: el usuario no tiene un pedido pendiente activo
 */
server.put("/pedidos/editar", mw.estaLogueado, mw.editarPedido, (req, res) => {
    res.status(202).json({ mensaje: "Pedido actualizado con éxito!" })
})

/**
 * @swagger
 * /pedidos/historial:
 *  get:
 *   tags:
 *    - "Operaciones de usuario"   
 *   summary: Obtiene el historial de pedidos
 *   description: Muestra los pedidos de un usuario (notar que para que un pedido aparezca en el historial ya debe haber sido confirmado)
 *   responses:
 *    200:
 *     description: muestra historial de pedidos del usuario
 *    401:
 *     description: el usuario no está logueado
 *    404:
 *     description: no hay pedidos para mostrar
 */
server.get("/pedidos/historial", mw.estaLogueado, mw.verHistorialPedidos, (req, res) => {
    res.status(200).json(arrayUsuarios[req.headers["user-index"]].historialPedidos)
})

/**
 * @swagger
 * /pedidos/estado:
 *  get:
 *   tags:
 *    - "Operaciones de usuario"   
 *   summary: Obtiene el estado del pedido
 *   description: Muestra el estado del último pedido del usuario
 *   responses:
 *    200:
 *     description: muestra historial de pedidos del usuario
 *    401:
 *     description: el usuario no está logueado
 *    404:
 *     description: no hay pedidos para mostrar
 */
server.get("/pedidos/estado", mw.estaLogueado, mw.verEstadoPedido, (req, res) => {
    res.status(200).json({ mensaje: `El estado de tu pedido es ${arrayUsuarios[req.headers["user-index"]].historialPedidos[arrayUsuarios[req.headers["user-index"]].historialPedidos.length - 1].state}`})
})


// Endpoints: Admin

/**
 * @swagger
 * /productos:
 *  post:
 *   tags:
 *    - "Operaciones de admin"   
 *   summary: crea un producto
 *   description: Permite al admin crear un producto
 *   parameters:
 *    - in: "body"
 *      name: "body"
 *      required: true
 *      schema:
 *       $ref: "#/definitions/Producto"
 *   responses:
 *    201:
 *     description: producto creado con éxito
 *    400:
 *     description: faltaron datos importates para crear el producto o el mismo ya está regitrado
 *    401:
 *     description: el usuario no está logueado o no tiene permisos de administrador
 */

/**
 * @swagger
 * /productos/{:name}:
 *  put:
 *   tags:
 *    - "Operaciones de admin"   
 *   summary: edita un producto
 *   description: Permite al admin editar un producto
 *   parameters:
 *    - in: "body"
 *      name: "body"
 *      required: true
 *      schema:
 *       $ref: "#/definitions/Producto"
 *    - in: "path"
 *      name: "nombre del producto"
 *      required: true
 *      schema:
 *       type: string
 *   responses:
 *    202:
 *     description: producto editado con éxito
 *    401:
 *     description: el usuario no está logueado o no tiene permisos de administrador
 *    404:
 *     description: producto no encontrado
 *  
 *  delete:
 *   tags:
 *    - "Operaciones de admin"   
 *   summary: elimina un producto
 *   description: Permite al admin eliminar un producto
 *   parameters:
 *    - in: "path"
 *      name: "nombre del producto"
 *      required: true
 *      schema:
 *       type: string
 *   responses:
 *    204:
 *     description: producto eliminado con éxito
 *    401:
 *     description: el usuario no está logueado o no tiene permisos de administrador
 *    404:
 *     description: producto no encontrado
 */

server.post("/productos", mw.estaLogueado, mw.isAdmin, mw.agregarProducto, (req, res) => {
    res.status(201).json({ mensaje: "Producto agregado con éxito" })
})

server.put("/productos/:name", mw.estaLogueado, mw.isAdmin, mw.editarProducto, (req, res) => {
    res.status(202).json({ mensaje: "Producto editado con éxito" })
})

server.delete("/productos/:name", mw.estaLogueado, mw.isAdmin, mw.eliminarProducto, (req, res) => {
    res.status(204).json({ mensaje: "Producto eliminado con éxito" })
})

/**
 * @swagger
 * /pedidos:
 *  get:
 *   tags:
 *    - "Operaciones de admin"   
 *   summary: Obtiene array de todos los pedidos
 *   description: Permite al admin obtener un array de todos los pedidos
 *   responses:
 *    200:
 *     description: muestra array de pedidos
 *    401:
 *     description: el usuario no está logueado o no tiene permisos de administrador
 */
server.get("/pedidos", mw.estaLogueado, mw.isAdmin, (req, res) => {
    res.status(200).json(arrayPedidos.sort((a, b) => a.user - b.user))
})

/**
 * @swagger
 * /pedidos/{:userID}:
 *  get:
 *   tags:
 *    - "Operaciones de admin"   
 *   summary: Obtiene array de los pedidos de un usuario
 *   description: Permite al admin obtener un array de todos los pedidos de un usuario específico
 *   parameters:
 *    - in: "path"
 *      name: "id del usuario"
 *      required: true
 *      schema:
 *       type: integer
 *   responses:
 *    200:
 *     description: muestra array de pedidos del usuario seleccionado
 *    400:
 *     description: el id del usuario indicado no es válido
 *    401:
 *     description: el usuario no está logueado o no tiene permisos de administrador
 */
server.get("/pedidos/:user", mw.estaLogueado, mw.isAdmin, mw.verPedidosPorUser, (req, res) => {
    res.status(200).json(arrayPedidos.filter((pedido) => String(pedido.user) === req.params.user))
})

/**
 * @swagger
 * /pedidos/{:id}:
 *  put:
 *   tags:
 *    - "Operaciones de admin"   
 *   summary: Modifica estado de un pedido
 *   description: Permite al admin modificar el estado de un pedido específico
 *   parameters:
 *    - in: "body"
 *      name: "body"
 *      required: true
 *      schema:
 *       type : object
 *       properties:
 *        state:       
 *         type : string
 *         description: nuevo estado del pedido       
 *    - in: "path"
 *      name: "id del pedido"
 *      required: true
 *      schema:
 *       type: integer
 *   responses:
 *    202:
 *     description: muestra array de pedidos del usuario seleccionado
 *    400:
 *     description: el id del pedido indicado no es válido o el body está incompleto o incorrecto
 *    401:
 *     description: el usuario no está logueado o no tiene permisos de administrador
 */
server.put("/pedidos/:id", mw.estaLogueado, mw.isAdmin, mw.editarEstadoPedidos, (req, res) => {
    res.status(202).json({ mensaje: "Estado del pedido actualizado con éxito" })
})

/**
 * @swagger
 * /metodos-pago:
 *  get:
 *   tags:
 *    - "Operaciones de admin"   
 *   summary: Obtiene array de los métodos de pago
 *   description: Permite al admin ver los métodos de pago registrados
 *   responses:
 *    200:
 *     description: muestra array de métodos de pago
 *    401:
 *     description: el usuario no tiene permisos de administrador
 * 
 *  post:
 *   tags:
 *    - "Operaciones de admin"   
 *   summary: crea un método de pago
 *   description: Permite al admin crear un método de pago
 *   parameters:
 *    - in: "body"
 *      name: "body"
 *      required: true
 *      schema:
 *       $ref: "#/definitions/MetodoPago"
 *   responses:
 *    201:
 *     description: método de pago creado con éxito
 *    400:
 *     description: faltaron datos importates para crear el método de pago o el mismo ya está regitrado
 *    401:
 *     description: el usuario no está logueado o no tiene permisos de administrador
 */

/**
 * @swagger
 * /metodos-pago/{:name}:
 *  put:
 *   tags:
 *    - "Operaciones de admin"   
 *   summary: edita un método de pago
 *   description: Permite al admin editar un método de pago
 *   parameters:
 *    - in: "body"
 *      name: "body"
 *      required: true
 *      schema:
 *       $ref: "#/definitions/MetodoPago"
 *    - in: "path"
 *      name: "nombre del método de pago"
 *      required: true
 *      schema:
 *       type: string
 *   responses:
 *    202:
 *     description: método de pago editado con éxito
 *    401:
 *     description: el usuario no está logueado o no tiene permisos de administrador
 *    404:
 *     description: método de pago no encontrado
 *  
 *  delete:
 *   tags:
 *    - "Operaciones de admin"   
 *   summary: elimina un método de pago
 *   description: Permite al admin eliminar un método de pago
 *   parameters:
 *    - in: "path"
 *      name: "nombre del método de pago"
 *      required: true
 *      schema:
 *       type: string
 *   responses:
 *    204:
 *     description: método de pago eliminado con éxito
 *    401:
 *     description: el usuario no está logueado o no tiene permisos de administrador
 *    404:
 *     description: método de pago no encontrado
 */

server.get("/medios-pago", mw.estaLogueado, mw.isAdmin, (req, res) => {
    res.status(200).json(arrayMetodosPago)
})

server.post("/medios-pago", mw.estaLogueado, mw.isAdmin, mw.crearMedioPago, (req, res) => {
    res.status(201).json({ mensaje: "Medio creado con éxito" })
})

server.put("/medios-pago/:name", mw.estaLogueado, mw.isAdmin, mw.editarMedioPago, (req, res) => {
    res.status(202).json({ mensaje: "Medio editado con éxito" })
})

server.delete("/medios-pago/:name", mw.estaLogueado, mw.isAdmin, mw.eliminarMedioPago, (req, res) => {
    res.status(204).json({ mensaje: "Medio eliminado con éxito" })
})


// Listen server
server.listen(PORT, () => {
    console.log(`Servidor ejecutando en el puerto ${PORT}`)
})