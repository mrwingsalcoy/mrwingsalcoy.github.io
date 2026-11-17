// =========================================
// MRWINGSALCOY - CARRITO Y ANIMACIONES
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    // PRECIOS DE LOS PRODUCTOS
    const precios = {
        "BBQ": { 6: 6.50, 12: 12, 18: 17.50 },
        "BRAVAS": { 6: 6.50, 12: 12, 18: 17.50 },
        "ACEVICHADAS": { 6: 7, 12: 13, 18: 19 },
        "MARACUYÁ": { 6: 7, 12: 13, 18: 19 },
        "TRUFADAS": { 6: 7.50, 12: 14, 18: 20 }
    };

    const telefono = "34611210874";
    let carrito = JSON.parse(localStorage.getItem("mrwingsCarrito")) || [];

    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const checkoutButton = document.getElementById("checkout-button");
    const clearCartButton = document.getElementById("clear-cart");
    const cartNotification = document.getElementById("cart-notification");
let notificationTimer;
// ABRIR Y CERRAR CARRITO LATERAL
const openCart = document.getElementById("open-cart");
const closeCart = document.getElementById("close-cart");
const cartDrawer = document.getElementById("cart-drawer");
const cartOverlay = document.getElementById("cart-overlay");

function abrirCarrito() {
    cartDrawer.classList.add("active");
    cartOverlay.classList.add("active");
    document.body.classList.add("cart-open");
}

function cerrarCarrito() {
    cartDrawer.classList.remove("active");
    cartOverlay.classList.remove("active");
    document.body.classList.remove("cart-open");
}

openCart.addEventListener("click", function(event) {
    event.preventDefault();
    abrirCarrito();
});

closeCart.addEventListener("click", cerrarCarrito);
cartOverlay.addEventListener("click", cerrarCarrito);

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        cerrarCarrito();
    }
});
    // FORMATO DE EUROS
    function euros(valor) {
        return valor.toLocaleString("es-ES", {
            style: "currency",
            currency: "EUR"
        });
    }

    // AÑADIR PRODUCTOS
    document.querySelectorAll(".add-to-cart").forEach(boton => {

        boton.addEventListener("click", function () {

            const sabor = this.dataset.name;
            const selector = this.parentElement.querySelector(".quantity-select");
            const cantidad = Number(selector.value);

            const precio = precios[sabor][cantidad];

            const existente = carrito.find(item =>
                item.sabor === sabor && item.cantidad === cantidad
            );

            if (existente) {
                existente.unidades += 1;
            } else {
                carrito.push({
                    sabor: sabor,
                    cantidad: cantidad,
                    precio: precio,
                    unidades: 1
                });
            }
// AÑADIR COMBOS AL CARRITO

document.querySelectorAll(".add-combo").forEach(boton => {

    boton.addEventListener("click", function() {

        const nombre = this.dataset.name;
        const precio = Number(this.dataset.price);
        const descripcion = this.dataset.description;

        const existente = carrito.find(item =>
            item.sabor === nombre
        );

        if (existente) {
            existente.unidades++;
        } else {
            carrito.push({
                sabor: nombre,
                descripcion: descripcion,
                precio: precio,
                unidades: 1,
                tipo: "combo"
            });
        }

        actualizarCarrito();

        cartNotification.textContent = `✓ ¡${nombre} añadido al carrito!`;
        cartNotification.classList.add("show");

        clearTimeout(notificationTimer);

        notificationTimer = setTimeout(() => {
            cartNotification.classList.remove("show");
        }, 2500);

        this.textContent = "✓ COMBO AÑADIDO";

    });

});
            actualizarCarrito();
// MOSTRAR NOTIFICACIÓN
cartNotification.textContent = `✓ ¡${sabor} añadido al carrito!`;
cartNotification.classList.add("show");

clearTimeout(notificationTimer);

notificationTimer = setTimeout(() => {
    cartNotification.classList.remove("show");
}, 2500);
            this.textContent = "✓ AÑADIDO";

            setTimeout(() => {
                this.textContent = "🛒 AÑADIR AL CARRITO";
            }, 1200);

        });

    });

    // MOSTRAR CARRITO
    function actualizarCarrito() {
localStorage.setItem("mrwingsCarrito", JSON.stringify(carrito));
        cartItems.innerHTML = "";
// ACTUALIZAR CONTADOR DEL CARRITO
const cartCount = document.getElementById("cart-count");

const cantidadTotal = carrito.reduce(
    (suma, item) => suma + item.unidades,
    0
);

if (cartCount) {
    cartCount.textContent = cantidadTotal;
}
        if (carrito.length === 0) {

            cartItems.innerHTML = `
                <p class="cart-empty">
                    🛒 Tu carrito está vacío.
                    ¡Añade tus alitas favoritas!
                </p>
            `;

            cartTotal.textContent = euros(0);
            checkoutButton.disabled = true;
            return;
        }

        checkoutButton.disabled = false;

        carrito.forEach((item, indice) => {

            const subtotal = item.precio * item.unidades;

            const fila = document.createElement("div");
            fila.className = "cart-item";

            fila.innerHTML=`
    <div>
        <strong>${item.sabor}</strong>
        <p>${item.tipo === "combo" ? item.descripcion : item.cantidad + " alitas"}</p>
        <p>Precio: ${euros(item.precio)}</p>

        <div class="cart-quantity">
            <button type="button" class="quantity-minus" data-index="${indice}">−</button>
            <span>${item.unidades}</span>
            <button type="button" class="quantity-plus" data-index="${indice}">+</button>
        </div>
    </div>

    <div>
        <strong>${euros(subtotal)}</strong>
        <button type="button" class="remove-item" data-index="${indice}">✕</button>
    </div>`

            cartItems.appendChild(fila);

        });

        const total = carrito.reduce(
            (suma, item) => suma + item.precio * item.unidades,
            0
        );

        cartTotal.textContent = euros(total);

    }

    // ELIMINAR PRODUCTOS
    cartItems.addEventListener("click", function(event) {

    const indice = Number(event.target.dataset.index);

    // AUMENTAR CANTIDAD
    if(event.target.classList.contains("quantity-plus")) {
        carrito[indice].unidades++;
        actualizarCarrito();
    }

    // DISMINUIR CANTIDAD
    if(event.target.classList.contains("quantity-minus")) {
        carrito[indice].unidades--;

        if(carrito[indice].unidades <= 0) {
            carrito.splice(indice, 1);
        }

        actualizarCarrito();
    }

    // ELIMINAR PRODUCTO
    if(event.target.classList.contains("remove-item")) {
        carrito.splice(indice, 1);
        actualizarCarrito();
    }

});
// VACIAR TODO EL CARRITO
clearCartButton.addEventListener("click", function() {

    if (carrito.length === 0) {
        alert("El carrito ya está vacío.");
        return;
    }

    const confirmar = confirm("¿Estás seguro de que quieres vaciar todo el carrito?");

    if (confirmar) {
        carrito = [];
        actualizarCarrito();

        const formulario = document.getElementById("checkout-form");

        if (formulario) {
            formulario.remove();
        }

        alert("Tu carrito se ha vaciado correctamente.");
    }

});
    // CONTINUAR CON EL PEDIDO
    checkoutButton.addEventListener("click", function() {

        if (carrito.length === 0) return;

        const formulario = document.getElementById("checkout-form");

        if (formulario) {
            formulario.scrollIntoView({behavior:"smooth", block:"nearest"});
            return;
        }

        const caja = document.getElementById("cart-drawer");

        const nuevoFormulario = document.createElement("form");

        nuevoFormulario.id = "checkout-form";
        nuevoFormulario.innerHTML = `
            <h3>DATOS DE ENTREGA</h3>

            <label>Nombre y apellidos</label>
            <input type="text" name="nombre" required
                   placeholder="Tu nombre">

            <label>Teléfono de contacto</label>
            <input type="tel" name="telefono" required
                   placeholder="Tu teléfono">

            <label>Dirección de entrega</label>

<input
    type="text"
    name="direccion"
    required
    placeholder="Calle y número en Alcoy"
>
<label>Localidad</label>

<input
    type="text"
    name="localidad"
    required
    placeholder="Escribe Alcoy o Alcoi"
>

<small class="delivery-notice">
    📍 Actualmente realizamos entregas únicamente en Alcoy.
</small>

            <label>Piso y puerta</label>
            <input type="text" name="piso"
                   placeholder="Ej. 2.º B">

            <label>Observaciones del pedido</label>
            <textarea name="observaciones"
                      placeholder="Indicaciones para la entrega"></textarea>

            <button type="submit" class="btn-order">
                ENVIAR PEDIDO POR WHATSAPP
            </button>
        `;

        caja.appendChild(nuevoFormulario);

        nuevoFormulario.scrollIntoView({ behavior: "smooth" });

        // ENVIAR PEDIDO A WHATSAPP
        nuevoFormulario.addEventListener("submit", function(event) {

            event.preventDefault();

            const datos = new FormData(nuevoFormulario);

            const nombre = datos.get("nombre");
            const telefonoCliente = datos.get("telefono");
            const direccion = datos.get("direccion");
            const localidad = datos.get("localidad").trim();
            const piso = datos.get("piso");
            const observaciones = datos.get("observaciones");
// COMPROBAR ZONA DE REPARTO
const localidadNormalizada = localidad
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

if (localidadNormalizada !== "alcoy" &&
    localidadNormalizada !== "alcoi") {

    alert("Lo sentimos. Actualmente solo realizamos entregas en Alcoy (Alcoi).");

    return;
}
            let mensaje = "🍗 *NUEVO PEDIDO - MRWINGSALCOY*\n\n";

            mensaje += `👤 Cliente: ${nombre}\n`;
            mensaje += `📱 Teléfono: ${telefonoCliente}\n`;
            mensaje += `📍 Dirección: ${direccion}\n`;

            if (piso) {
                mensaje += `🏠 Piso y puerta: ${piso}\n`;
            }

            mensaje += "\n*PRODUCTOS:*\n";

            carrito.forEach(item => {

    if (item.tipo === "combo") {

        mensaje += `• ${item.sabor} (${item.descripcion}) × ${item.unidades} = ${euros(item.precio * item.unidades)}\n`;

    } else {

        mensaje += `• ${item.sabor}: ${item.cantidad} alitas × ${item.unidades} = ${euros(item.precio * item.unidades)}\n`;

    }

});

            const total = carrito.reduce(
                (suma, item) => suma + item.precio * item.unidades,
                0
            );

            mensaje += `\n💰 *TOTAL: ${euros(total)}*\n`;

            if (observaciones) {
                mensaje += `\n📝 Observaciones: ${observaciones}`;
            }

            const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

            window.open(url, "_blank");

        });

    });

    actualizarCarrito();
// =========================================
// ESTADO DEL NEGOCIO - HORARIO DE ATENCIÓN
// =========================================

const indicador = document.getElementById("business-status");

function comprobarHorario() {

    const ahora = new Date();

    const datosHora = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Madrid",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
    }).formatToParts(ahora);

    const obtener = tipo =>
        datosHora.find(parte => parte.type === tipo).value;

    const dia = obtener("weekday");
    const hora = Number(obtener("hour"));
    const minuto = Number(obtener("minute"));

    const minutosActuales = hora * 60 + minuto;

    const diasAbiertos = ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const estaAbierto =
        diasAbiertos.includes(dia) &&
        minutosActuales >= 1110 &&
        minutosActuales < 1410;

    if (estaAbierto) {
        indicador.textContent = "● ESTAMOS ATENDIENDO";
        indicador.classList.add("status-open");
        indicador.classList.remove("status-closed");
    } else {
        indicador.textContent = "● AHORA ESTAMOS CERRADOS";
        indicador.classList.add("status-closed");
        indicador.classList.remove("status-open");
    }
}

comprobarHorario();
setInterval(comprobarHorario, 60000);
    // =========================================
    // ANIMACIONES AL DESPLAZARSE
    // =========================================

    const elementos = document.querySelectorAll(
        ".flavor-card, .presentation, .combos-section, .combo-card, footer"
    );

    if ("IntersectionObserver" in window) {

        const observador = new IntersectionObserver((entradas) => {

            entradas.forEach((entrada) => {

                if (entrada.isIntersecting) {

                    entrada.target.classList.add("visible");
                    observador.unobserve(entrada.target);

                }

            });

        }, {
            threshold: 0.10
        });

        elementos.forEach((elemento) => {

            elemento.classList.add("reveal");
            observador.observe(elemento);

        });

    } else {

        elementos.forEach((elemento) => {
            elemento.classList.add("visible");
        });

    }

});