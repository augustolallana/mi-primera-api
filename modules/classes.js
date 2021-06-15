class Usuario {
    constructor (username, completeName, email, phoneNumber, adress, password) {
        this.username = username
        this.password = password
        this.completeName = completeName
        this.email = email
        this.phoneNumber = phoneNumber
        this.adress = adress
        this.historialPedidos = []
    }
}

class Producto {
    constructor (name, price, photo) { 
        this.name = toLowerCase(name)
        this.price = price
        this.photo = photo
    }
}

class Pedido {
    constructor (products, payment, adress, user) {
        this.products = products
        this.payment = payment
        this.adress = adress
        this.user = user
        this.date = Date.now()
        this.state = "Pendiente"
    }
}

class MetodoPago {
    constructor (name) {
        this.name = name
    }
}

module.exports = {
    Usuario: Usuario,
    Producto: Producto,
    Pedido: Pedido,
    MetodoPago: MetodoPago
}