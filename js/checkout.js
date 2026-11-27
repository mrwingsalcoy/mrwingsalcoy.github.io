// =========================================
// MRWINGSALCOY - FINALIZAR PEDIDO
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    // DETECTAR REGRESO DE WHATSAPP
document.addEventListener("visibilitychange", function () {

    if (
        document.visibilityState === "visible" &&
        sessionStorage.getItem("mrwingsPedidoPendiente") === "true"
    ) {

        sessionStorage.removeItem("mrwingsPedidoPendiente");

        localStorage.setItem("mrwingsCarrito", JSON.stringify([]));

        alert(
            "🍗 ¡Gracias por elegir MrWingsAlcoy!\n\n" +
            "Esperamos que disfrutes de tu pedido."
        );

        window.location.href = "/";

    }

});
    // RECUPERAR CARRITO
    const carrito = JSON.parse(
        localStorage.getItem("mrwingsCarrito")
    ) || [];

    const productosContainer = document.getElementById("checkout-products");
    const totalContainer = document.getElementById("checkout-total");
    const formularioContainer = document.getElementById("checkout-form-container");

    // FORMATO DE PRECIOS
    function euros(cantidad) {
        return cantidad.toLocaleString("es-ES", {
            style: "currency",
            currency: "EUR"
        });
    }
// BLACK FRIDAY: DEL 27 AL 29 DE NOVIEMBRE DE 2026
function blackFridayActivo() {
    const fecha = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Madrid",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());

    return fecha >= "2026-11-27" && fecha <= "2026-11-29";
}
    // COMPROBAR CARRITO
    if (carrito.length === 0) {

        productosContainer.innerHTML = `
            <p class="cart-empty">
                🛒 Tu carrito está vacío.
            </p>
            <a href="/" class="btn-order">
                VOLVER A LA TIENDA
            </a>
        `;

        totalContainer.textContent = euros(0);
        formularioContainer.innerHTML = "";

        return;
    }

    // MOSTRAR PRODUCTOS
    let total = 0;

    carrito.forEach(function (item) {

        const subtotal = item.precio * item.unidades;
        total += subtotal;

        const fila = document.createElement("div");
        fila.className = "cart-item";

        let descripcion = "";

        if (item.tipo === "combo") {
            descripcion = item.descripcion +
                " | Sabores: " + item.sabores.join(", ");
        } else if (item.tipo === "bebida") {
            descripcion = item.cantidad + " bebida";
        } else if (item.sabor.startsWith("SALSA ")) {
            descripcion = item.cantidad + " salsa";
        } else if (
            item.sabor.startsWith("PASIÓN ") ||
            item.sabor.startsWith("OVERNIGHT ")
        ) {
            descripcion = item.cantidad + " postre";
        } else {
            descripcion = item.cantidad + " alitas";
        }

        const emoji = item.tipo === "bebida"
            ? "🥤"
            : item.sabor.startsWith("SALSA ")
                ? "🌶️"
                : item.sabor.startsWith("PASIÓN ") ||
                  item.sabor.startsWith("OVERNIGHT ")
                    ? "🍰"
                    : "🍗";

        fila.innerHTML = `
            <div>
                <strong>${emoji} ${item.sabor}</strong>
                <p>${descripcion} × ${item.unidades}</p>
            </div>

            <strong>${euros(subtotal)}</strong>
        `;

        productosContainer.appendChild(fila);

    });

    // CALCULAR DESCUENTO BLACK FRIDAY
const subtotalOriginal = total;

const descuento = blackFridayActivo()
    ? Math.round(subtotalOriginal * 10) / 100
    : 0;

const totalFinal = Math.round(
    (subtotalOriginal - descuento) * 100
) / 100;

// MOSTRAR RESUMEN DEL PEDIDO
totalContainer.innerHTML = `
    <div class="checkout-summary">

        <div class="summary-row">
            <span>Subtotal</span>
            <strong>${euros(subtotalOriginal)}</strong>
        </div>

        ${descuento > 0 ? `
            <div class="summary-discount">
                <span>🔥 BLACK FRIDAY -10 %</span>
                <strong>-${euros(descuento)}</strong>
            </div>
        ` : ""}

        <div class="summary-total">
            <span>TOTAL A PAGAR</span>
            <strong>${euros(totalFinal)}</strong>
        </div>

    </div>
`;
        // CREAR FORMULARIO DE ENTREGA

    formularioContainer.innerHTML = `
        <form id="checkout-form">

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
                    <input type="text" name="numero"
                           required placeholder="Ej. 25, 3 A">
                </div>

                <div class="address-field">
                    <label>Localidad</label>
                    <input type="text" name="localidad"
                           required value="Alcoy" readonly>
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

        </form>
    `;
    // AUTOCOMPLETADO DE DIRECCIONES DE ALCOY

    const campoDireccion = document.getElementById("direccion");
    const listaSugerencias = document.getElementById("sugerencias-direccion");

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
    // =========================================
// ENVIAR PEDIDO A WHATSAPP
// =========================================

const formularioPedido = document.getElementById("checkout-form");

const telefonoMrWings = "34611210874";

const URL_WORKER =
    "https://misty-tooth-6094.oquijandriagarcia.workers.dev/";

formularioPedido.addEventListener("submit", async function(event) {

    event.preventDefault();

    // RECUPERAR DATOS DEL FORMULARIO
    const datos = new FormData(formularioPedido);

    const nombre = datos.get("nombre").trim();
    const telefonoCliente = datos.get("telefono").trim();
    const telefonoLimpio = telefonoCliente.replace(/[\s-]/g, "");

    const direccion = datos.get("direccion").trim();
    const numero = datos.get("numero").trim();
    const localidad = datos.get("localidad").trim();
    const piso = datos.get("piso").trim();
    const observaciones = datos.get("observaciones").trim();

    // VALIDAR NOMBRE
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]{3,}$/.test(nombre)) {
        alert("Por favor, introduce un nombre válido.");
        return;
    }

    // VALIDAR TELÉFONO
    if (!/^\+?[0-9]{9,15}$/.test(telefonoLimpio)) {
        alert("Por favor, introduce un teléfono válido.");
        return;
    }

    // VALIDAR DIRECCIÓN
    if (direccion.length < 5 || !numero) {
        alert("Por favor, introduce una dirección y número de portal válidos.");
        return;
    }

    // COMPROBAR ZONA DE REPARTO
    const localidadNormalizada = localidad
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    if (
        localidadNormalizada !== "alcoy" &&
        localidadNormalizada !== "alcoi"
    ) {
        alert("Actualmente solo realizamos entregas en Alcoy (Alcoi).");
        return;
    }

    // COMPROBAR CARRITO
    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    // ABRIR PANTALLA DE ESPERA
    const ventanaWhatsApp = window.open("preparando.html", "_blank");

    if (!ventanaWhatsApp) {
        alert("Permite las ventanas emergentes para continuar con tu pedido.");
        return;
    }

    // FECHA Y HORA
    const fechaHoraPedido = new Intl.DateTimeFormat("es-ES", {
        timeZone: "Europe/Madrid",
        dateStyle: "short",
        timeStyle: "short"
    }).format(new Date());

    // SOLICITAR NÚMERO DE PEDIDO
    let numeroPedido;

    try {

        const respuestaPedido = await fetch(URL_WORKER, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "pedido"
            })
        });

        if (!respuestaPedido.ok) {
            throw new Error("No se pudo generar el pedido");
        }

        const resultadoPedido = await respuestaPedido.json();

        numeroPedido = resultadoPedido.numeroPedido;

        if (!numeroPedido) {
            throw new Error("Número de pedido no recibido");
        }

    } catch (error) {

        console.error("Error generando pedido:", error);

        ventanaWhatsApp.close();

        alert("No se pudo generar el número de pedido. Inténtalo nuevamente.");
        return;
    }

    // PREPARAR DIRECCIÓN Y GOOGLE MAPS
    const calleSinCodigoPostal = direccion
        .replace(/\b\d{5}\b/g, "")
        .trim();

    const direccionCompleta =
        `${direccion}, Nº ${numero}, ${localidad}`;

    const direccionMaps =
        `${numero} ${calleSinCodigoPostal}, ${localidad}, Alicante, España`;

    let enlaceMaps =
        `https://maps.google.com/?q=${encodeURIComponent(direccionMaps)}`;

    // INTENTAR ACORTAR ENLACE
    try {

        const respuestaMaps = await fetch(URL_WORKER, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: enlaceMaps
            })
        });

        const resultadoMaps = await respuestaMaps.json();

        if (respuestaMaps.ok && resultadoMaps.shortUrl) {
            enlaceMaps = resultadoMaps.shortUrl;
        }

    } catch (error) {

        console.error("Error acortando enlace:", error);

    }

    // TOTAL CON DESCUENTO BLACK FRIDAY
const total = totalFinal;

    // CONSTRUIR MENSAJE DE WHATSAPP
    let mensaje = "🍗 *MRWINGSALCOY*\n";
    mensaje += "━━━━━━━━━━━━━━━━\n";
    mensaje += "🛎️ *NUEVO PEDIDO RECIBIDO*\n";
    mensaje += "━━━━━━━━━━━━━━━━\n";
    mensaje += `🔢 Pedido: *${numeroPedido}*\n`;
    mensaje += `📅 Fecha y hora: ${fechaHoraPedido}\n\n`;

    mensaje += "👤 *DATOS DEL CLIENTE*\n";
    mensaje += `Nombre: ${nombre}\n`;
    mensaje += `Teléfono: ${telefonoCliente}\n\n`;

    mensaje += "📍 *DIRECCIÓN DE ENTREGA*\n";
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

            const saboresElegidos = (item.sabores || []).join(", ");

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

            } else if (item.tipo === "bebida") {
                tipoProducto = "bebida";
                emojiProducto = "🥤";
            }

            mensaje += `${emojiProducto} *${item.sabor}*\n`;
            mensaje += `   ${item.cantidad} ${tipoProducto} × ${item.unidades}\n`;
            mensaje += `   💶 Subtotal: ${euros(item.precio * item.unidades)}\n\n`;
        }

    });

    mensaje += "━━━━━━━━━━━━━━━━\n";
    mensaje += `Subtotal: ${euros(subtotalOriginal)}\n`;

if (descuento > 0) {
    mensaje += `🔥 BLACK FRIDAY -10 %: -${euros(descuento)}\n`;
}

mensaje += `💰 *TOTAL A PAGAR: ${euros(total)}*\n`;
    mensaje += "━━━━━━━━━━━━━━━━\n";

    if (observaciones) {
        mensaje += "\n📝 *OBSERVACIONES DEL CLIENTE*\n";
        mensaje += `${observaciones}\n`;
    }

    mensaje += "\n🙏 ¡Gracias por elegir MrWingsAlcoy!";

    // GUARDAR PEDIDO EN CLOUDFLARE
    try {

        const respuestaGuardar = await fetch(URL_WORKER, {
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
        });

        if (!respuestaGuardar.ok) {
            throw new Error("No se pudo guardar el pedido");
        }

    } catch (error) {

        console.error("Error guardando pedido:", error);

        ventanaWhatsApp.close();

        alert("No se pudo registrar tu pedido. Inténtalo nuevamente.");
        return;
    }

    // ABRIR WHATSAPP
    const urlWhatsApp =
        `https://wa.me/${telefonoMrWings}?text=${encodeURIComponent(mensaje)}`;

    sessionStorage.setItem("mrwingsPedidoPendiente", "true");

    ventanaWhatsApp.location.href = urlWhatsApp;

    console.log("Pedido registrado:", numeroPedido);

      // Aquí termina el código del envío del pedido
    
});
});