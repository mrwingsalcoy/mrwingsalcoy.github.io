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
        "TRUFADAS": { 6: 7.50, 12: 14, 18: 20 },

        // SALSAS ADICIONALES
    "SALSA BBQ": { 1: 0.30 },
    "SALSA BRAVA": { 1: 0.30 },
    "SALSA ACEVICHADA": { 1: 0.50 },
    "SALSA TRUFADA": { 1: 0.50},
    "SALSA MARACUYÁ": { 1: 0.50 },

    // POSTRES
    "PASIÓN DE CHOCOLATE": { 1: 5.00 },
    "OVERNIGHT DE MARACUYÁ": { 1: 5.00 },
    "OVERNIGHT DE FRUTOS DEL BOSQUE": { 1: 5.00 },
    "PASIÓN DE MARACUYÁ": { 1: 5.00 },

     // BEBIDAS
    "COCA-COLA": { 1: 1.50, 2: 3.00, 3: 4.50 },
    "FANTA NARANJA": { 1: 1.50, 2: 3.00, 3: 4.50 },
    "SPRITE": { 1: 1.50, 2: 3.00, 3: 4.50 }

    };

    // CAMBIAR ENTRE CATEGORÍAS
    const categoryTabs = document.querySelectorAll(".category-tab");
    const categoryContents = document.querySelectorAll(".category-content");

    categoryTabs.forEach(tab => {
        tab.addEventListener("click", function () {
            const category = this.dataset.category;

            categoryTabs.forEach(button => {
                button.classList.remove("active");
            });

            categoryContents.forEach(section => {
                section.classList.remove("active");
                section.hidden = true;
            });

            this.classList.add("active");

            const selectedContent = document.getElementById("category-" + category);

            if (selectedContent) {
                selectedContent.hidden = false;
                selectedContent.classList.add("active");
            }
        });
    });

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

// EJECUTAR EL SISTEMA DEL CARRITO SOLO SI EXISTE
if (
    cartItems &&
    cartTotal &&
    checkoutButton &&
    clearCartButton &&
    cartNotification &&
    openCart &&
    closeCart &&
    cartDrawer &&
    cartOverlay
) {
// =====================================
// FUNCIONAMIENTO DEL CARRITO
// =====================================

if (cartDrawer && cartOverlay && openCart && closeCart) {

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

}
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
    unidades: 1,
    tipo: ["COCA-COLA", "FANTA NARANJA", "SPRITE"].includes(sabor)
        ? "bebida"
        : "producto"
});
            }

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

    // SELECCIONAR SABORES Y PERMITIR REPETICIONES

document.querySelectorAll(".combo-flavor-group").forEach(grupo => {

    grupo.querySelectorAll(".flavor-option").forEach(boton => {

        boton.dataset.count = "0";

        boton.addEventListener("click", function() {

            const tarjeta = this.closest(".combo-card");
            const grupos = tarjeta.querySelectorAll(".combo-flavor-group");
            const titulo = tarjeta.querySelector(".combo-selection-title");
            const limite = Number(titulo.textContent.match(/\d+/)[0]);

            const seleccionados = Array.from(
                tarjeta.querySelectorAll(".flavor-option")
            ).reduce((total, opcion) => total + Number(opcion.dataset.count), 0);

            if (seleccionados >= limite) return;

            this.dataset.count = Number(this.dataset.count) + 1;

            this.textContent = Number(this.dataset.count) > 0
                ? `${this.dataset.flavor} × ${this.dataset.count}`
                : this.dataset.flavor;

            this.classList.add("selected");

            const nuevoTotal = seleccionados + 1;
            const contador = tarjeta.querySelector(".selection-counter");
            const barra = tarjeta.querySelector(".selection-progress-fill");

            contador.textContent = `${nuevoTotal} de ${limite} sabores seleccionados`;
            barra.style.width = `${(nuevoTotal / limite) * 100}%`;
            // DESBLOQUEAR BOTÓN CUANDO EL COMBO ESTÉ COMPLETO
const botonAñadir = tarjeta.querySelector(".add-combo");

if (botonAñadir) {
    botonAñadir.disabled = nuevoTotal !== limite;
}

            // INDICAR CUANDO EL COMBO ESTÁ COMPLETO
if (nuevoTotal === limite) {
    tarjeta.classList.add("combo-complete");
    contador.textContent = `✓ ¡COMBO COMPLETO! ${nuevoTotal} de ${limite}`;
} else {
    tarjeta.classList.remove("combo-complete");
}

        });

    });

});

// LIMPIAR SABORES DEL COMBO

document.querySelectorAll(".clear-flavors").forEach(boton => {

    boton.addEventListener("click", function() {

        const tarjeta = this.closest(".combo-card");
        const titulo = tarjeta.querySelector(".combo-selection-title");
        const limite = Number(titulo.textContent.match(/\d+/)[0]);

        tarjeta.querySelectorAll(".flavor-option").forEach(opcion => {
            opcion.dataset.count = "0";
            opcion.textContent = opcion.dataset.flavor;
            opcion.classList.remove("selected");
        });

        const contador = tarjeta.querySelector(".selection-counter");
        const barra = tarjeta.querySelector(".selection-progress-fill");
        const botonAñadir = tarjeta.querySelector(".add-combo");

        contador.textContent = `0 de ${limite} sabores seleccionados`;
        barra.style.width = "0%";

        tarjeta.classList.remove("combo-complete");

        if (botonAñadir) {
            botonAñadir.disabled = true;
        }

    });

});
// AÑADIR COMBOS AL CARRITO

document.querySelectorAll(".add-combo").forEach(boton => {

    boton.addEventListener("click", function() {

        const nombre = this.dataset.name;
        const precio = Number(this.dataset.price);
        const descripcion = this.dataset.description;

// RECUPERAR LOS SABORES Y SUS REPETICIONES
const tarjeta = this.closest(".combo-card");
const titulo = tarjeta.querySelector(".combo-selection-title");
const limite = Number(titulo.textContent.match(/\d+/)[0]);

const sabores = Array.from(
tarjeta.querySelectorAll(".flavor-option")
).flatMap(opcion =>
Array(Number(opcion.dataset.count || 0)).fill(opcion.dataset.flavor)
);

// COMPROBAR QUE SE HAYAN ELEGIDO TODOS LOS SABORES
if (sabores.length !== limite) {
alert("Por favor, selecciona todos los sabores del combo.");
return;
}

        // BUSCAR SI YA EXISTE EL MISMO COMBO CON LOS MISMOS SABORES
        const existente = carrito.find(item =>
            item.sabor === nombre &&
            JSON.stringify(item.sabores) === JSON.stringify(sabores)
        );

        if (existente) {

            existente.unidades++;

        } else {

            carrito.push({
                sabor: nombre,
                descripcion: descripcion,
                sabores: sabores,
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
//MOSTRAR CARRITO
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
        <strong>${item.tipo === "bebida"
    ? "🥤 "
    : item.sabor.startsWith("SALSA ")
        ? "🌶️ "
        : item.sabor.startsWith("PASIÓN ") || item.sabor.startsWith("OVERNIGHT ")
            ? "🍰 "
            : "🍗 "
}${item.sabor}</strong>
       <p>${item.tipo === "combo"
    ? item.descripcion + " | Sabores: " + item.sabores.join(", ")
    : item.tipo === "bebida"
        ? item.cantidad + " bebida"
        : item.sabor.startsWith("SALSA ")
        ? item.cantidad + " salsa"
        : item.sabor.startsWith("PASIÓN ") ||
          item.sabor.startsWith("OVERNIGHT ")
            ? item.cantidad + " postre"
            : item.cantidad + " alitas"
}</p>

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

<div class="address-autocomplete">

    <input
        type="text"
        id="direccion"
        name="direccion"
        required
        autocomplete="off"
        placeholder="Empieza a escribir tu calle en Alcoy"
    >

    <div id="sugerencias-direccion"></div>

</div>

<div class="address-details-row">

    <div class="address-field">
        <label>Número de portal</label>
        <input
            type="text"
            name="numero"
            required
            placeholder="Ej. 25, 3 A"
        >
    </div>

<div class="address-field">
    <label>Localidad</label>
    <input
        type="text"
        name="localidad"
        required
        value="Alcoy"
        placeholder="Alcoy"
        readonly
    >
</div>

</div>

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
// AUTOCOMPLETADO DE DIRECCIONES DE ALCOY
const campoDireccion = nuevoFormulario.querySelector("#direccion");
const listaSugerencias = nuevoFormulario.querySelector("#sugerencias-direccion");

let temporizadorDireccion;

campoDireccion.addEventListener("input", function () {

    clearTimeout(temporizadorDireccion);

    const busqueda = this.value.trim();

    listaSugerencias.innerHTML = "";

    if (busqueda.length < 3) return;

    temporizadorDireccion = setTimeout(async function () {

        try {

            const parametros = new URLSearchParams({
                q: busqueda,
                limit: 10,
lang: "default",
bbox: "-0.55,38.65,-0.40,38.78",
suggest_addresses: true
            });

            const respuesta = await fetch(
                `https://photon.komoot.io/api/?${parametros}`
            );

            const datos = await respuesta.json();

            listaSugerencias.innerHTML = "";

            datos.features.forEach(function (lugar) {

                const p = lugar.properties;

                const calle = p.street || p.name;

                if (!calle) return;

                const direccionCompleta = [
    calle,
    p.postcode
].filter(Boolean).join(", ");

                const opcion = document.createElement("button");

                opcion.type = "button";
                opcion.textContent = "📍 " + direccionCompleta;

                opcion.addEventListener("click", function () {
                    campoDireccion.value = direccionCompleta;
                    listaSugerencias.innerHTML = "";
                });

                listaSugerencias.appendChild(opcion);

            });

        } catch (error) {
            console.error("Error buscando direcciones:", error);
        }

    }, 400);

});
        nuevoFormulario.scrollIntoView({ behavior: "smooth" });

        // ENVIAR PEDIDO A WHATSAPP
        nuevoFormulario.addEventListener("submit", async function(event) {

            event.preventDefault();
        // DETECTAR LA SALIDA DE LA PÁGINA DESDE EL PRINCIPIO
window.mrwingsSalioDeLaWeb = false;

document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === "hidden") {
        window.mrwingsSalioDeLaWeb = true;
    }
});

// ABRIR PANTALLA DE ESPERA
const ventanaWhatsApp = window.open("preparando.html", "_blank");


            const datos = new FormData(nuevoFormulario);

            const nombre = datos.get("nombre");
            // VALIDAR NOMBRE
if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]{3,}$/.test(nombre.trim())) {
    alert("Por favor, introduce un nombre válido.");
    return;
}
            const telefonoCliente = datos.get("telefono");
            // VALIDAR TELÉFONO
const telefonoLimpio = telefonoCliente.replace(/[\s-]/g, "");

if (!/^\+?[0-9]{9,15}$/.test(telefonoLimpio)) {
    alert("Por favor, introduce un número de teléfono válido (entre 9 y 15 dígitos).");
    return;
}
            const direccion = datos.get("direccion");
            const numero = datos.get("numero");
            // VALIDAR DIRECCIÓN
if (direccion.trim().length < 5) {
    alert("Por favor, introduce una dirección de entrega válida.");
    return;
}
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
// FECHA Y HORA DEL PEDIDO
const fechaHoraPedido = new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid",
    dateStyle: "short",
    timeStyle: "short"
}).format(new Date());

// SOLICITAR NÚMERO CONSECUTIVO A CLOUDFLARE
let numeroPedido;

try {
    const respuestaPedido = await fetch(
        "https://misty-tooth-6094.oquijandriagarcia.workers.dev/",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "pedido"
            })
        }
    );

    if (!respuestaPedido.ok) {
        throw new Error("No se pudo generar el pedido");
    }

    const resultadoPedido = await respuestaPedido.json();

    numeroPedido = resultadoPedido.numeroPedido;

    if (!numeroPedido) {
        throw new Error("Número de pedido no recibido");
    }

} catch (error) {
    alert("No se pudo generar el número de pedido. Inténtalo nuevamente.");
    return;
}
let mensaje = "🍗 *MRWINGSALCOY*\n";
mensaje += "━━━━━━━━━━━━━━━━\n";
mensaje += "🛎️ *NUEVO PEDIDO RECIBIDO*\n";
mensaje += "━━━━━━━━━━━━━━━━\n";
mensaje += `🔢 Pedido: *${numeroPedido}*\n`;
mensaje += `📅 Fecha y hora: ${fechaHoraPedido}\n`;
mensaje += "━━━━━━━━━━━━━━━━\n\n";

            mensaje += "👤 *DATOS DEL CLIENTE*\n";
mensaje += `Nombre: ${nombre}\n`;
mensaje += `Teléfono: ${telefonoCliente}\n\n`;

mensaje += "📍 *DIRECCIÓN DE ENTREGA*\n";
const calleSinCodigoPostal = direccion
    .replace(/\b\d{5}\b/g, "")
    .replace(/,\s*,/g, ",")
    .replace(/,\s*$/, "")
    .replace(/^\s*,/, "")
    .trim();

const direccionCompleta = `${direccion}, Nº ${numero}, ${localidad}`;

const direccionMaps = `${numero} ${calleSinCodigoPostal}, ${localidad}, Alicante, España`;

let enlaceMaps = `https://maps.google.com/?q=${encodeURIComponent(direccionMaps)}`;

try {
    const respuestaMaps = await fetch(
        "https://misty-tooth-6094.oquijandriagarcia.workers.dev/",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: enlaceMaps
            })
        }
    );

    const resultadoMaps = await respuestaMaps.json();

    if (respuestaMaps.ok && resultadoMaps.shortUrl) {
        enlaceMaps = resultadoMaps.shortUrl;
    }

} catch (error) {
    console.error("Error al acortar el enlace:", error);
}

mensaje += `${direccionCompleta}\n`;
mensaje += `📍 Ubicación: ${enlaceMaps}\n`;
            if (piso) {
                mensaje += `🏠 Piso y puerta: ${piso}\n`;
            }

            mensaje += "\n━━━━━━━━━━━━━━━━\n";
mensaje += "🍗 *DETALLE DEL PEDIDO*\n";
mensaje += "━━━━━━━━━━━━━━━━\n\n";

            carrito.forEach(item => {

    if (item.tipo === "combo") {

        const saboresElegidos = item.sabores.join(", ");

        mensaje += `🍗 *${item.sabor}*\n`;
        mensaje += `   ${item.descripcion}\n`;
        mensaje += `   🌶️ Sabores: ${saboresElegidos}\n`;
        mensaje += `   🔢 Cantidad: ${item.unidades}\n`;
        mensaje += `   💶 Subtotal: ${euros(item.precio * item.unidades)}\n\n`;

      } else {

        let tipoProducto = "alitas";
        let emojiProducto = "🍗";

        if (item.sabor.startsWith("SALSA ")) {
            tipoProducto = "salsa";
            emojiProducto = "🌶️";
        } else if (
            item.sabor.startsWith("PASIÓN ") ||
            item.sabor.startsWith("OVERNIGHT ")
        ) {
            tipoProducto = "postre";
            emojiProducto = "🍰";
        }

        mensaje += `${emojiProducto} *${item.sabor}*\n`;
        mensaje += `   ${item.cantidad} ${tipoProducto} × ${item.unidades}\n`;
        mensaje += `   💶 Subtotal: ${euros(item.precio * item.unidades)}\n\n`;

    }
});

            const total = carrito.reduce(
                (suma, item) => suma + item.precio * item.unidades,
                0
            );
            mensaje += "\n━━━━━━━━━━━━━━━━\n";
mensaje += `💰 *TOTAL DEL PEDIDO: ${euros(total)}*\n`;
mensaje += "━━━━━━━━━━━━━━━━\n";

            if (observaciones) {
    mensaje += "\n📝 *OBSERVACIONES DEL CLIENTE*\n";
    mensaje += `${observaciones}\n`;
}

mensaje += "\n🙏 ¡Gracias por elegir MrWingsAlcoy!";

            // ABRIR WHATSAPP CON EL PEDIDO
const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
// GUARDAR PEDIDO EN CLOUDFLARE
try {

    const respuestaGuardar = await fetch(
        "https://misty-tooth-6094.oquijandriagarcia.workers.dev/",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "guardar",
                pedido: {
                    numeroPedido: numeroPedido,
                    fecha: fechaHoraPedido,
                    cliente: nombre,
                    telefono: telefonoCliente,
                    direccion: piso
                        ? `${direccionCompleta}, Piso/Puerta: ${piso}`
                        : direccionCompleta,
                    productos: {
                        items: carrito,
                        observaciones: observaciones
                    },
                    total: total
                }
            })
        }
    );

    if (!respuestaGuardar.ok) {
        throw new Error("No se pudo guardar el pedido");
    }

} catch (error) {

    console.error("Error al guardar el pedido:", error);

    ventanaWhatsApp.close();

    alert("No se pudo registrar tu pedido. Inténtalo nuevamente.");
    return;
}
ventanaWhatsApp.location.href = url;
console.log("URL de WhatsApp:", url);
console.log("Ventana WhatsApp:", ventanaWhatsApp);
// DETECTAR CUANDO EL CLIENTE REGRESA DE WHATSAPP
let salioDeLaWeb = window.mrwingsSalioDeLaWeb || false;

function detectarRegresoWhatsApp() {

    if (document.visibilityState === "hidden") {
        salioDeLaWeb = true;
    }

    if (document.visibilityState === "visible" && salioDeLaWeb) {

        document.removeEventListener(
            "visibilitychange",
            detectarRegresoWhatsApp
        );

        // VACIAR CARRITO
        carrito = [];

        actualizarCarrito();

        // ELIMINAR FORMULARIO
        nuevoFormulario.reset();
        nuevoFormulario.remove();

        // MENSAJE DE AGRADECIMIENTO
        alert(
            "🍗 ¡PEDIDO ENVIADO!\n\nGracias por confiar en MrWingsAlcoy."
        );
    }
}

document.addEventListener(
    "visibilitychange",
    detectarRegresoWhatsApp
);
        });

    });

actualizarCarrito();

}

// =====================================
// SISTEMA DE OPINIONES MRWINGSALCOY

const URL_WORKER =
    "https://misty-tooth-6094.oquijandriagarcia.workers.dev/";

// SELECCIÓN DE ESTRELLAS
const estrellas = document.querySelectorAll(
    ".selector-estrellas button"
);

const valoracionInput = document.getElementById(
    "opinion-valoracion"
);

estrellas.forEach(boton => {

    boton.addEventListener("click", function() {

        const valor = Number(this.dataset.valor);

        valoracionInput.value = valor;

        estrellas.forEach(estrella => {
            estrella.classList.toggle(
                "activa",
                Number(estrella.dataset.valor) <= valor
            );
        });

    });

});

// ENVIAR OPINIÓN
const formularioOpinion = document.getElementById("form-opinion");
if (formularioOpinion) {
formularioOpinion.addEventListener("submit", async function(event) {

    event.preventDefault();

    const nombre = document.getElementById("opinion-nombre").value.trim();
    const comentario = document.getElementById("opinion-comentario").value.trim();
    const valoracion = Number(valoracionInput.value);
    const mensaje = document.getElementById("mensaje-opinion");
    const botonEnviar = formularioOpinion.querySelector(
        'button[type="submit"]'
    );

    botonEnviar.disabled = true;
    mensaje.textContent = "Enviando tu opinión...";

    try {

        const respuesta = await fetch(URL_WORKER, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "opinion_guardar",
                nombre: nombre,
                comentario: comentario,
                valoracion: valoracion
            })
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok || !resultado.success) {
            throw new Error(
                resultado.error || "No se pudo enviar la opinión."
            );
        }

        mensaje.textContent =
            "⭐ ¡Gracias! Tu opinión está pendiente de aprobación.";

        formularioOpinion.reset();
        valoracionInput.value = 5;

        estrellas.forEach(estrella => {
            estrella.classList.toggle(
                "activa",
                Number(estrella.dataset.valor) <= 5
            );
        });

    } catch (error) {

        console.error("Error al enviar opinión:", error);

        mensaje.textContent =
            "No se pudo enviar tu opinión. Inténtalo nuevamente.";

    } finally {

        botonEnviar.disabled = false;

    }

});
}
// =====================================
// CARGAR OPINIONES APROBADAS
// =====================================

async function cargarOpiniones() {

    const contenedor = document.getElementById("lista-opiniones");

    try {

        const respuesta = await fetch(URL_WORKER, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "opiniones_publicas"
            })
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok || !resultado.success) {
            throw new Error("No se pudieron cargar las opiniones.");
        }

        contenedor.replaceChildren();

        resultado.opiniones.forEach(opinion => {

            const columna = document.createElement("div");
            columna.className = "col-md-6 col-lg-4";

            const tarjeta = document.createElement("div");
            tarjeta.className = "opinion-card";

            const nombre = document.createElement("h4");
            nombre.textContent = opinion.nombre;

            const estrellas = document.createElement("div");
            estrellas.className = "opinion-estrellas";
            estrellas.textContent =
                "★".repeat(Number(opinion.valoracion)) +
                "☆".repeat(5 - Number(opinion.valoracion));

            const comentario = document.createElement("p");
            comentario.textContent = opinion.comentario;

            tarjeta.append(nombre, estrellas, comentario);
            columna.appendChild(tarjeta);
            contenedor.appendChild(columna);

        });

    } catch (error) {

        console.error("Error al cargar opiniones:", error);

    }

}

if (document.getElementById("lista-opiniones")) {
    cargarOpiniones();
}
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

if (indicador) {
    comprobarHorario();
    setInterval(comprobarHorario, 60000);
}
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

// REPRODUCCIÓN AUTOMÁTICA DEL VIDEO
document.addEventListener("DOMContentLoaded", function () {

    const video = document.querySelector(".hero-video");

    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    video.play().catch(function (error) {
        console.log("No se pudo iniciar automáticamente:", error);
    });

});
