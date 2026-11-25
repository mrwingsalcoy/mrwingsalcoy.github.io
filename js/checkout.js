// =========================================
// MRWINGSALCOY - FINALIZAR PEDIDO
// =========================================

document.addEventListener("DOMContentLoaded", function () {

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

    // MOSTRAR TOTAL
    totalContainer.textContent = euros(total);
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
});