// =====================================
// CONFIGURACIÓN
// =====================================

const API_URL = "https://misty-tooth-6094.oquijandriagarcia.workers.dev/";

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

        mostrarPedidos(resultado.pedidos);

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

    const hoy = new Intl.DateTimeFormat("es-ES", {
        timeZone: "Europe/Madrid"
    }).format(new Date());

    const pedidosHoy = pedidos.filter(pedido => {

        const fecha = String(pedido.fecha || "").split(",")[0].trim();

        return fecha === hoy;

    });

    const ventasHoy = pedidosHoy.reduce(
        (total, pedido) => total + Number(pedido.total || 0),
        0
    );

    document.getElementById("total-pedidos").textContent =
        pedidosHoy.length;

    document.getElementById("ventas-hoy").textContent =
        euros(ventasHoy);

    ordersContainer.innerHTML = "";

    if (pedidos.length === 0) {

        ordersContainer.innerHTML = "<p>Todavía no hay pedidos registrados.</p>";

        return;

    }

    pedidos.forEach(pedido => {

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

        ordersContainer.appendChild(tarjeta);

    });

    activarBotonesEstado();

}

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