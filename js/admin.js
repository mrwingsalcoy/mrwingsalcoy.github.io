// =====================================
// CONFIGURACIÓN
// =====================================

const API_URL = "https://misty-tooth-6094.oquijandriagarcia.workers.dev/";
// PEDIDOS Y VISTA ACTUAL
let pedidosCargados = [];
let vistaActual = "activos";
let filtroBusqueda = "";
let graficoVentas = null;

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
// GRÁFICO DE VENTAS DE LOS ÚLTIMOS 7 DÍAS
// =====================================

function actualizarGraficoVentas(pedidos) {

    const ahora = new Date();

    const partes = new Intl.DateTimeFormat("es-ES", {
        timeZone: "Europe/Madrid",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).formatToParts(ahora);

    const dia = Number(partes.find(p => p.type === "day").value);
    const mes = Number(partes.find(p => p.type === "month").value);
    const anio = Number(partes.find(p => p.type === "year").value);

    const etiquetas = [];
    const ventas = [];

    for (let i = 6; i >= 0; i--) {

        const fecha = new Date(Date.UTC(anio, mes - 1, dia - i));

        const diaFecha = String(fecha.getUTCDate()).padStart(2, "0");
        const mesFecha = String(fecha.getUTCMonth() + 1).padStart(2, "0");
        const anioFecha = fecha.getUTCFullYear();

        const fechaTexto = `${diaFecha}/${mesFecha}/${String(anioFecha).slice(-2)}`;

        etiquetas.push(`${diaFecha}/${mesFecha}`);

        const totalDia = pedidos
            .filter(pedido => {
                const coincidencia = String(pedido.fecha || "").match(
                    /^(\d{2})\/(\d{2})\/(\d{2,4})/
                );

                if (!coincidencia) return false;

                const anioPedido = coincidencia[3].length === 2
                    ? "20" + coincidencia[3]
                    : coincidencia[3];

                return `${coincidencia[1]}/${coincidencia[2]}/${anioPedido}` ===
                    `${diaFecha}/${mesFecha}/${anioFecha}`;
            })
            .reduce((total, pedido) => total + Number(pedido.total || 0), 0);

        ventas.push(totalDia);
    }

    const contexto = document.getElementById("grafico-ventas");

    if (!contexto) return;

    if (graficoVentas) {
        graficoVentas.destroy();
    }

    graficoVentas = new Chart(contexto, {
        type: "bar",
        data: {
            labels: etiquetas,
            datasets: [{
                label: "Ventas (€)",
                data: ventas,
                backgroundColor: "#ff6b00",
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: "#ffffff"
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: "#ffffff" },
                    grid: { color: "#333333" }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: "#ffffff" },
                    grid: { color: "#333333" }
                }
            }
        }
    });
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
    year: "numeric"
}).formatToParts(ahora);

const diaHoy = Number(partesHoy.find(p => p.type === "day").value);
const mesHoy = Number(partesHoy.find(p => p.type === "month").value);
const anioHoy = Number(partesHoy.find(p => p.type === "year").value);

// FECHA DE HOY EN FORMATO YYYY-MM-DD
const fechaHoy = `${anioHoy}-${String(mesHoy).padStart(2, "0")}-${String(diaHoy).padStart(2, "0")}`;

// CALCULAR AYER
const fechaAyerDate = new Date(Date.UTC(anioHoy, mesHoy - 1, diaHoy - 1));
const fechaAyer = fechaAyerDate.toISOString().slice(0, 10);

// CALCULAR LOS ÚLTIMOS 7 DÍAS, INCLUYENDO HOY
const fechasSemana = [];

for (let i = 0; i < 7; i++) {
    const fecha = new Date(Date.UTC(anioHoy, mesHoy - 1, diaHoy - i));
    fechasSemana.push(fecha.toISOString().slice(0, 10));
}

// CONVERTIR FECHA DEL PEDIDO A YYYY-MM-DD
function obtenerFechaPedido(fechaTexto) {

    const coincidencia = String(fechaTexto || "").match(
        /^(\d{2})\/(\d{2})\/(\d{2,4})/
    );

    if (!coincidencia) return null;

    const dia = coincidencia[1];
    const mes = coincidencia[2];
    let anio = coincidencia[3];

    if (anio.length === 2) {
        anio = "20" + anio;
    }

    return `${anio}-${mes}-${dia}`;
}

// PEDIDOS DE HOY
const pedidosHoy = pedidos.filter(pedido =>
    obtenerFechaPedido(pedido.fecha) === fechaHoy
);

// VENTAS DE HOY
const ventasHoy = pedidosHoy.reduce(
    (total, pedido) => total + Number(pedido.total || 0),
    0
);

// VENTAS DE AYER
const ventasAyer = pedidos
    .filter(pedido => obtenerFechaPedido(pedido.fecha) === fechaAyer)
    .reduce((total, pedido) => total + Number(pedido.total || 0), 0);

// VENTAS DE LOS ÚLTIMOS 7 DÍAS
const ventasSemana = pedidos
    .filter(pedido => fechasSemana.includes(obtenerFechaPedido(pedido.fecha)))
    .reduce((total, pedido) => total + Number(pedido.total || 0), 0);

// PEDIDOS ENTREGADOS
const pedidosEntregados = pedidos.filter(
    pedido => pedido.estado === "Entregado"
);

// TICKET MEDIO DE PEDIDOS ENTREGADOS
const ventasEntregadas = pedidosEntregados.reduce(
    (total, pedido) => total + Number(pedido.total || 0),
    0
);

const ticketMedio = pedidosEntregados.length > 0
    ? ventasEntregadas / pedidosEntregados.length
    : 0;

// ACTUALIZAR ESTADÍSTICAS EN PANTALLA
document.getElementById("total-pedidos").textContent = pedidosHoy.length;

document.getElementById("ventas-hoy").textContent = euros(ventasHoy);

document.getElementById("ventas-ayer").textContent = euros(ventasAyer);

document.getElementById("ventas-semana").textContent = euros(ventasSemana);

document.getElementById("pedidos-entregados").textContent =
    pedidosEntregados.length;

document.getElementById("ticket-medio").textContent = euros(ticketMedio);
// ACTUALIZAR GRÁFICO DE VENTAS
actualizarGraficoVentas(pedidos);
// FILTRAR PEDIDOS SEGÚN LA PESTAÑA
let pedidosVista = vistaActual === "activos"
    ? pedidos.filter(pedido => pedido.estado !== "Entregado")
    : pedidos.filter(pedido => pedido.estado === "Entregado");

// APLICAR BUSCADOR
if (filtroBusqueda.trim() !== "") {

    const busqueda = filtroBusqueda.toLowerCase().trim();

    pedidosVista = pedidosVista.filter(pedido => {

        return (
            String(pedido.numero_pedido || "").toLowerCase().includes(busqueda) ||
            String(pedido.cliente || "").toLowerCase().includes(busqueda) ||
            String(pedido.telefono || "").toLowerCase().includes(busqueda) ||
            String(pedido.estado || "").toLowerCase().includes(busqueda)
        );

    });

}

// MENSAJE SI NO HAY PEDIDOS
if (pedidosVista.length === 0) {

    contenedor.innerHTML = filtroBusqueda.trim() !== ""
        ? "<p>No se encontraron pedidos con esa búsqueda.</p>"
        : vistaActual === "activos"
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

    // =====================================
    // HISTORIAL: PEDIDOS DESPLEGABLES
    // =====================================

    if (vistaActual === "historial") {

        tarjeta.style.padding = "0";
        tarjeta.style.overflow = "hidden";

        tarjeta.innerHTML = `
            <button class="historial-toggle"
                    type="button"
                    style="width:100%; padding:18px; background:#202020;
                    color:#ff6b00; border:none; text-align:left;
                    font-size:19px; font-weight:bold; cursor:pointer;">

                📋 ${escapar(pedido.numero_pedido)}
                <span style="float:right;">▼</span>

            </button>

            <div class="historial-detalle" hidden
                 style="padding:20px;">

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

                <p>Estado: <strong>Entregado</strong></p>

            </div>
        `;

    } else {

        // =====================================
        // PEDIDOS ACTIVOS: INFORMACIÓN COMPLETA
        // =====================================

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

    }

    contenedor.appendChild(tarjeta);

});

// =====================================
// ACTIVAR DESPLEGABLES DEL HISTORIAL
// =====================================

if (vistaActual === "historial") {

    document.querySelectorAll(".historial-toggle").forEach(boton => {

        boton.addEventListener("click", function() {

            const detalle = this.nextElementSibling;

            detalle.hidden = !detalle.hidden;

            this.querySelector("span").textContent =
                detalle.hidden ? "▼" : "▲";

        });

    });

}

activarBotonesEstado();

}
// =====================================
// BUSCADOR DE PEDIDOS
// =====================================

document.getElementById("buscar-pedido").addEventListener("input", function() {

    filtroBusqueda = this.value;

    mostrarPedidos(pedidosCargados);

});     
// =====================================
// CAMBIAR ENTRE PEDIDOS ACTIVOS E HISTORIAL
// =====================================

document.getElementById("tab-activos").addEventListener("click", function() {

    vistaActual = "activos";
    filtroBusqueda = "";
document.getElementById("buscar-pedido").value = "";
    this.classList.add("active");
    document.getElementById("tab-historial").classList.remove("active");

    ordersContainer.hidden = false;
    document.getElementById("history-container").hidden = true;

    mostrarPedidos(pedidosCargados);

});

document.getElementById("tab-historial").addEventListener("click", function() {

    vistaActual = "historial";
filtroBusqueda = "";
document.getElementById("buscar-pedido").value = "";
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
// FILTRAR VENTAS POR FECHAS
// =====================================

document.getElementById("filtrar-fechas").addEventListener("click", function() {

    const desde = document.getElementById("fecha-desde").value;
    const hasta = document.getElementById("fecha-hasta").value;
    const resultado = document.getElementById("resultado-fechas");

    if (!desde || !hasta) {
        resultado.textContent = "Selecciona las dos fechas.";
        return;
    }

    if (desde > hasta) {
        resultado.textContent = "La fecha inicial no puede ser posterior a la final.";
        return;
    }

    const pedidosFiltrados = pedidosCargados.filter(pedido => {

        const coincidencia = String(pedido.fecha || "").match(
            /^(\d{2})\/(\d{2})\/(\d{2,4})/
        );

        if (!coincidencia) return false;

        let anio = coincidencia[3];

        if (anio.length === 2) {
            anio = "20" + anio;
        }

        const fechaPedido =
            `${anio}-${coincidencia[2]}-${coincidencia[1]}`;

        return fechaPedido >= desde && fechaPedido <= hasta;

    });

    const totalVentas = pedidosFiltrados.reduce(
        (total, pedido) => total + Number(pedido.total || 0),
        0
    );

    const totalEntregados = pedidosFiltrados.filter(
        pedido => pedido.estado === "Entregado"
    ).length;

    resultado.innerHTML = `
        <p>📦 Pedidos encontrados: <strong>${pedidosFiltrados.length}</strong></p>
        <p>💰 Ventas totales: <strong>${euros(totalVentas)}</strong></p>
        <p>✅ Pedidos entregados: <strong>${totalEntregados}</strong></p>
    `;

});

// LIMPIAR FILTRO

document.getElementById("limpiar-fechas").addEventListener("click", function() {

    document.getElementById("fecha-desde").value = "";
    document.getElementById("fecha-hasta").value = "";
    document.getElementById("resultado-fechas").innerHTML = "";

});
// =====================================
// RECUPERAR SESIÓN
// =====================================

if (token) {

    mostrarPanel();

    cargarPedidos();

}