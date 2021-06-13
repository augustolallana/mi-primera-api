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
    constructor (id, name, price, photo) { 
        this.id = id
        this.name = name
        this.price = price
        this.photo = photo
    }
}

class Pedido {
    constructor (date, products, payment, adress, state) {
        this.date = date
        this.products = products
        this.payment = payment
        this.adress = adress
        this.state = state
    }
}

module.exports = {
    Usuario: Usuario,
    Producto: Producto,
    Pedido: Pedido
}