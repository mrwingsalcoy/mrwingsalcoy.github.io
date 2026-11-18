// =====================================
// CONFIGURACIÓN
// =====================================

const API_URL = "https://misty-tooth-6094.oquijandriagarcia.workers.dev/";
// PEDIDOS Y VISTA ACTUAL
let pedidosCargados = [];
let vistaActual = "activos";

const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");

const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");

const ordersContainer = document.getElementById("orders-container");

let token = sessionStorage.getItem("mrwings_admin_token");

// =====================================
// CONEXIÓN CON CLOUDFLARE
// =====================================

async function llamarAPI(datos) {

    const respuesta = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(resultado.error || "Error de conexión");
    }

    return resultado;
}

// =====================================
// INICIAR SESIÓN
// =====================================

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    loginError.textContent = "Comprobando acceso...";

    const password = document.getElementById("admin-password").value;

    try {

        const resultado = await llamarAPI({
            action: "admin_login",
            password: password
        });

        if (!resultado.success || !resultado.token) {
            throw new Error("No se pudo iniciar sesión");
        }

        token = resultado.token;

        sessionStorage.setItem("mrwings_admin_token", token);

        document.getElementById("admin-password").value = "";

        loginError.textContent = "";

        mostrarPanel();

        await cargarPedidos();

    } catch(error) {

        loginError.textContent = error.message;

    }

});

// =====================================
// MOSTRAR PANEL
// =====================================

function mostrarPanel() {

    loginSection.hidden = true;
    dashboardSection.hidden = false;

}

// =====================================
// CERRAR SESIÓN
// =====================================

document.getElementById("logout-button").addEventListener("click", function() {

    sessionStorage.removeItem("mrwings_admin_token");

    token = null;

    dashboardSection.hidden = true;
    loginSection.hidden = false;

    loginError.textContent = "";

});

// =====================================
// CARGAR PEDIDOS
// =====================================

async function cargarPedidos() {

    ordersContainer.innerHTML = "<p>Cargando pedidos...</p>";

    try {

        const resultado = await llamarAPI({
            action: "admin_list",
            token: token
        });

        if (!resultado.success) {
            throw new Error("No se pudieron cargar los pedidos");
        }

        // GUARDAR TODOS LOS PEDIDOS
        pedidosCargados = resultado.pedidos;

        // MOSTRAR LA VISTA ACTUAL
        mostrarPedidos(pedidosCargados);

    } catch(error) {

        ordersContainer.innerHTML = "";

        if (error.message.includes("Sesión")) {

            sessionStorage.removeItem("mrwings_admin_token");

            token = null;

            dashboardSection.hidden = true;
            loginSection.hidden = false;

            loginError.textContent = "Tu sesión ha caducado. Inicia sesión nuevamente.";

        } else {

            ordersContainer.textContent = error.message;

        }

    }

}
// =====================================
// MOSTRAR PEDIDOS Y ESTADÍSTICAS
// =====================================

function mostrarPedidos(pedidos) {

    // SELECCIONAR CONTENEDOR SEGÚN LA PESTAÑA
    const contenedor = vistaActual === "activos"
        ? ordersContainer
        : document.getElementById("history-container");

    contenedor.innerHTML = "";

const ahora = new Date();

const partesHoy = new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
}).formatToParts(ahora);

const diaHoy = partesHoy.find(p => p.type === "day").value;
const mesHoy = partesHoy.find(p => p.type === "month").value;
const anioHoy = partesHoy.find(p => p.type === "year").value;

const pedidosHoy = pedidos.filter(pedido => {

    const fechaPedido = String(pedido.fecha || "");

    const coincidencia = fechaPedido.match(
        /^(\d{2})\/(\d{2})\/(\d{2,4})/
    );

    if (!coincidencia) return false;

    return (
        coincidencia[1] === diaHoy &&
        coincidencia[2] === mesHoy &&
        coincidencia[3].slice(-2) === anioHoy
    );

});

    const ventasHoy = pedidosHoy.reduce(
        (total, pedido) => total + Number(pedido.total || 0),
        0
    );

    document.getElementById("total-pedidos").textContent =
        pedidosHoy.length;

    document.getElementById("ventas-hoy").textContent =
        euros(ventasHoy);

// FILTRAR PEDIDOS SEGÚN LA PESTAÑA
const pedidosVista = vistaActual === "activos"
    ? pedidos.filter(pedido => pedido.estado !== "Entregado")
    : pedidos.filter(pedido => pedido.estado === "Entregado");

// MENSAJE SI NO HAY PEDIDOS
if (pedidosVista.length === 0) {

    contenedor.innerHTML = vistaActual === "activos"
        ? "<p>No hay pedidos activos.</p>"
        : "<p>Todavía no hay pedidos entregados.</p>";

    return;

}

// MOSTRAR PEDIDOS
pedidosVista.forEach(pedido => {

        const tarjeta = document.createElement("div");

        tarjeta.className = "stat-card";

        let productos = {};

        try {

            productos = typeof pedido.productos === "string"
                ? JSON.parse(pedido.productos)
                : pedido.productos;

        } catch(error) {

            productos = {};

        }

        const items = productos.items || [];

        const detalle = items.map(item => {

            if (item.tipo === "combo") {

                return `
                    <p>
                        🍗 ${escapar(item.sabor)}
                        — ${escapar(item.descripcion || "")}
                        <br>
                        Sabores: ${escapar((item.sabores || []).join(", "))}
                        <br>
                        Cantidad: ${Number(item.unidades || 1)}
                    </p>
                `;

            }

            return `
                <p>
                    🍗 ${escapar(item.sabor)}
                    — ${Number(item.cantidad || 0)} alitas
                    <br>
                    Cantidad: ${Number(item.unidades || 1)}
                </p>
            `;

        }).join("");

        tarjeta.innerHTML = `
            <h3>${escapar(pedido.numero_pedido)}</h3>

            <p>📅 ${escapar(pedido.fecha)}</p>

            <p>👤 ${escapar(pedido.cliente)}</p>

            <p>📞 ${escapar(pedido.telefono)}</p>

            <p>📍 ${escapar(pedido.direccion)}</p>

            <hr>

            <strong>🍗 PRODUCTOS</strong>

            ${detalle}

            ${productos.observaciones
                ? `<p>📝 ${escapar(productos.observaciones)}</p>`
                : ""}

            <hr>

            <h4>💰 ${euros(Number(pedido.total))}</h4>

            <label>Estado del pedido:</label>

            <select class="form-select mt-2 estado-pedido"
                    data-id="${Number(pedido.id)}">

                ${["Pendiente", "Preparando", "En reparto", "Entregado"].map(estado => `
                    <option value="${estado}"
                        ${pedido.estado === estado ? "selected" : ""}>
                        ${estado}
                    </option>
                `).join("")}

            </select>

            <button class="btn-admin mt-3 guardar-estado"
                    data-id="${Number(pedido.id)}">
                Guardar estado
            </button>
        `;

        contenedor.appendChild(tarjeta);

    });

    activarBotonesEstado();

}
// =====================================
// CAMBIAR ENTRE PEDIDOS ACTIVOS E HISTORIAL
// =====================================

document.getElementById("tab-activos").addEventListener("click", function() {

    vistaActual = "activos";

    this.classList.add("active");
    document.getElementById("tab-historial").classList.remove("active");

    ordersContainer.hidden = false;
    document.getElementById("history-container").hidden = true;

    mostrarPedidos(pedidosCargados);

});

document.getElementById("tab-historial").addEventListener("click", function() {

    vistaActual = "historial";

    this.classList.add("active");
    document.getElementById("tab-activos").classList.remove("active");

    ordersContainer.hidden = true;
    document.getElementById("history-container").hidden = false;

    mostrarPedidos(pedidosCargados);

});

// =====================================
// ACTUALIZAR ESTADO
// =====================================

function activarBotonesEstado() {

    document.querySelectorAll(".guardar-estado").forEach(boton => {

        boton.addEventListener("click", async function() {

            const id = Number(this.dataset.id);

            const selector = document.querySelector(
                `.estado-pedido[data-id="${id}"]`
            );

            const estado = selector.value;

            this.disabled = true;
            this.textContent = "Guardando...";

            try {

                await llamarAPI({
                    action: "admin_update",
                    token: token,
                    id: id,
                    estado: estado
                });

                alert("Estado actualizado correctamente.");

                await cargarPedidos();

            } catch(error) {

                alert("No se pudo actualizar: " + error.message);

                this.disabled = false;
                this.textContent = "Guardar estado";

            }

        });

    });

}

// =====================================
// ACTUALIZAR LISTA
// =====================================

document.getElementById("refresh-button").addEventListener("click", cargarPedidos);

// =====================================
// FUNCIONES AUXILIARES
// =====================================

function euros(valor) {

    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR"
    }).format(valor);

}

function escapar(valor) {

    return String(valor ?? "").replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caracter]);

}

// =====================================
// RECUPERAR SESIÓN
// =====================================

if (token) {

    mostrarPanel();

    cargarPedidos();

}