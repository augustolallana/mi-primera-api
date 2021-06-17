const classes = require("./classes")
const Producto = classes.Producto
const MetodoPago = classes.MetodoPago

const admin = {
    username:"admin",
    password: "todopoderoso",
    isAdmin: true
}

let productoTest0 = new Producto("pizza grande", 500, "https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_960_720.jpg")
let productoTest1 = new Producto("bebida saborizada", 85, "https://cdn.pixabay.com/photo/2019/09/19/14/30/frutichela-4489415_960_720.jpg")
let productoTest2 = new Producto("ensalada cesar", 450, "https://cdn.pixabay.com/photo/2017/08/11/00/32/salad-2629262__480.jpg")

let paymentMethod1 = new MetodoPago("Tarjeta de crédito")
let paymentMethod2 = new MetodoPago("Efectivo")

let arrayUsuarios = [admin]
let arrayProductos = [productoTest0, productoTest1, productoTest2]
let arrayMetodosPago = [paymentMethod1, paymentMethod2]
let arrayPedidos = []

exports.arrayUsuarios = arrayUsuarios
exports.arrayProductos = arrayProductos
exports.arrayMetodosPago = arrayMetodosPago
exports.arrayPedidos = arrayPedidos