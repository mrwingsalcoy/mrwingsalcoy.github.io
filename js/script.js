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

        // CALCULAR SUBTOTAL
const subtotalOriginal = carrito.reduce(
    (suma, item) => suma + item.precio * item.unidades,
    0
);

// COMPROBAR BLACK FRIDAY
const fechaActual = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
}).format(new Date());

const blackFridayActivo =
    fechaActual >= "2026-11-27" &&
    fechaActual <= "2026-11-29";

// CALCULAR DESCUENTO
const descuento = blackFridayActivo
    ? Math.round(subtotalOriginal * 10) / 100
    : 0;

const totalFinal = Math.round(
    (subtotalOriginal - descuento) * 100
) / 100;

// MOSTRAR RESUMEN
cartTotal.innerHTML = `
    <div>Subtotal: ${euros(subtotalOriginal)}</div>

    ${descuento > 0 ? `
        <div style="color:#ff5a00; font-weight:bold;">
            🔥 BLACK FRIDAY -10 %: -${euros(descuento)}
        </div>
    ` : ""}

    <div style="font-size:1.2em; font-weight:bold;">
        TOTAL: ${euros(totalFinal)}
    </div>
`;

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

    if (carrito.length === 0) {
        alert("Tu carrito está vacío. Añade productos para continuar.");
        return;
    }

    localStorage.setItem(
        "mrwingsCarrito",
        JSON.stringify(carrito)
    );

    window.location.href = "finalizar-pedido.html";

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

// PRUEBA DE REPRODUCCIÓN AUTOMÁTICA
window.addEventListener("load", function () {

    const video = document.querySelector(".hero-video");

    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    video.play()
        .then(function () {
            console.log("Vídeo iniciado correctamente");
        })
        .catch(function (error) {
            console.log("Autoplay bloqueado:", error.name, error.message);
        });

});

// =========================================
// MRWINGSALCOY - ABRIR Y CERRAR MODAL BBQ
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    const bbqImage = document.querySelector('.flavor-card img[src="img/bbq.jpg"]');
    const bbqModal = document.getElementById("bbq-modal");
    const closeBbqModal = document.getElementById("close-bbq-modal");

    if (!bbqImage || !bbqModal || !closeBbqModal) return;

    // Abrir ventana al tocar la fotografía
    bbqImage.style.cursor = "pointer";

    bbqImage.addEventListener("click", function () {
        bbqModal.style.display = "flex";
        document.body.style.overflow = "hidden";
    });

    // Cerrar con la X
    closeBbqModal.addEventListener("click", function () {
        bbqModal.style.display = "none";
        document.body.style.overflow = "";
    });

    // Cerrar al tocar fuera de la ventana
    bbqModal.addEventListener("click", function (event) {
        if (event.target === bbqModal) {
            bbqModal.style.display = "none";
            document.body.style.overflow = "";
        }
    });

    // Cerrar con la tecla Escape
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            bbqModal.style.display = "none";
            document.body.style.overflow = "";
        }
    });

});
// =========================================
// MRWINGSALCOY - VENTANA EMERGENTE BRAVAS
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    const bravasImage = document.querySelector('.flavor-card img[src="img/bravas.jpg"]');
    const bravasModal = document.getElementById("bravas-modal");
    const closeBravasModal = document.getElementById("close-bravas-modal");

    if (!bravasImage || !bravasModal || !closeBravasModal) return;

    // Abrir ventana
    bravasImage.style.cursor = "pointer";

    bravasImage.addEventListener("click", function () {
        bravasModal.style.display = "flex";
        document.body.style.overflow = "hidden";
    });

    // Cerrar con la X
    closeBravasModal.addEventListener("click", function () {
        bravasModal.style.display = "none";
        document.body.style.overflow = "";
    });

    // Cerrar al tocar fuera
    bravasModal.addEventListener("click", function (event) {
        if (event.target === bravasModal) {
            bravasModal.style.display = "none";
            document.body.style.overflow = "";
        }
    });

    // Cerrar con Escape
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            bravasModal.style.display = "none";
            document.body.style.overflow = "";
        }
    });

});
// =========================================
// MRWINGSALCOY - VENTANA EMERGENTE ACEVICHADAS
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    const acevichadasImage = document.querySelector('.flavor-card img[src="img/acevichadas.jpg"]');
    const acevichadasModal = document.getElementById("acevichadas-modal");
    const closeAcevichadasModal = document.getElementById("close-acevichadas-modal");

    if (!acevichadasImage || !acevichadasModal || !closeAcevichadasModal) return;

    // Abrir ventana
    acevichadasImage.style.cursor = "pointer";

    acevichadasImage.addEventListener("click", function () {
        acevichadasModal.style.display = "flex";
        document.body.style.overflow = "hidden";
    });

    // Cerrar con la X
    closeAcevichadasModal.addEventListener("click", function () {
        acevichadasModal.style.display = "none";
        document.body.style.overflow = "";
    });

    // Cerrar al tocar fuera
    acevichadasModal.addEventListener("click", function (event) {
        if (event.target === acevichadasModal) {
            acevichadasModal.style.display = "none";
            document.body.style.overflow = "";
        }
    });

    // Cerrar con Escape
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            acevichadasModal.style.display = "none";
            document.body.style.overflow = "";
        }
    });

});
// =========================================
// MRWINGSALCOY - VENTANA EMERGENTE MARACUYÁ
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    const maracuyaImage = document.querySelector('.flavor-card img[src="img/maracuya.jpg"]');
    const maracuyaModal = document.getElementById("maracuya-modal");
    const closeMaracuyaModal = document.getElementById("close-maracuya-modal");

    if (!maracuyaImage || !maracuyaModal || !closeMaracuyaModal) return;

    // Abrir ventana
    maracuyaImage.style.cursor = "pointer";

    maracuyaImage.addEventListener("click", function () {
        maracuyaModal.style.display = "flex";
        document.body.style.overflow = "hidden";
    });

    // Cerrar con la X
    closeMaracuyaModal.addEventListener("click", function () {
        maracuyaModal.style.display = "none";
        document.body.style.overflow = "";
    });

    // Cerrar al tocar fuera
    maracuyaModal.addEventListener("click", function (event) {
        if (event.target === maracuyaModal) {
            maracuyaModal.style.display = "none";
            document.body.style.overflow = "";
        }
    });

    // Cerrar con Escape
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            maracuyaModal.style.display = "none";
            document.body.style.overflow = "";
        }
    });

});
// =========================================
// MRWINGSALCOY - VENTANA EMERGENTE TRUFADAS
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    const trufadasImage = document.querySelector('.flavor-card img[src="img/trufadas.jpg"]');
    const trufadasModal = document.getElementById("trufadas-modal");
    const closeTrufadasModal = document.getElementById("close-trufadas-modal");

    if (!trufadasImage || !trufadasModal || !closeTrufadasModal) return;

    // ABRIR VENTANA
    trufadasImage.style.cursor = "pointer";

    trufadasImage.addEventListener("click", function () {
        trufadasModal.style.display = "flex";
        document.body.style.overflow = "hidden";
    });

    // CERRAR CON LA X
    closeTrufadasModal.addEventListener("click", function () {
        trufadasModal.style.display = "none";
        document.body.style.overflow = "";
    });

    // CERRAR AL TOCAR FUERA
    trufadasModal.addEventListener("click", function (event) {
        if (event.target === trufadasModal) {
            trufadasModal.style.display = "none";
            document.body.style.overflow = "";
        }
    });

    // CERRAR CON ESCAPE
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            trufadasModal.style.display = "none";
            document.body.style.overflow = "";
        }
    });

});
// =========================================
// MRWINGSALCOY - VENTANA EMERGENTE SALSA BBQ
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    const salsaBbqImage = document.querySelector('.flavor-card img[src="img/salsabbq.jpg"]');
    const salsaBbqModal = document.getElementById("salsa-bbq-modal");
    const closeSalsaBbqModal = document.getElementById("close-salsa-bbq-modal");

    if (!salsaBbqImage || !salsaBbqModal || !closeSalsaBbqModal) return;

    // ABRIR VENTANA
    salsaBbqImage.style.cursor = "pointer";

    salsaBbqImage.addEventListener("click", function () {
        salsaBbqModal.style.display = "flex";
        document.body.style.overflow = "hidden";
    });

    // CERRAR CON LA X
    closeSalsaBbqModal.addEventListener("click", function () {
        salsaBbqModal.style.display = "none";
        document.body.style.overflow = "";
    });

    // CERRAR AL TOCAR FUERA
    salsaBbqModal.addEventListener("click", function (event) {
        if (event.target === salsaBbqModal) {
            salsaBbqModal.style.display = "none";
            document.body.style.overflow = "";
        }
    });

    // CERRAR CON ESCAPE
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            salsaBbqModal.style.display = "none";
            document.body.style.overflow = "";
        }
    });

});
// =========================================
// MRWINGSALCOY - VENTANA EMERGENTE SALSA MARACUYÁ
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    const salsaMaracuyaImage = document.querySelector(
        '.flavor-card img[src="img/salsamaracuya.jpg"]'
    );

    const salsaMaracuyaModal = document.getElementById(
        "salsa-maracuya-modal"
    );

    const closeSalsaMaracuyaModal = document.getElementById(
        "close-salsa-maracuya-modal"
    );

    if (!salsaMaracuyaImage || !salsaMaracuyaModal || !closeSalsaMaracuyaModal) return;

    // ABRIR VENTANA
    salsaMaracuyaImage.style.cursor = "pointer";

    salsaMaracuyaImage.addEventListener("click", function () {
        salsaMaracuyaModal.style.display = "flex";
        document.body.style.overflow = "hidden";
    });

    // CERRAR CON LA X
    closeSalsaMaracuyaModal.addEventListener("click", function () {
        salsaMaracuyaModal.style.display = "none";
        document.body.style.overflow = "";
    });

    // CERRAR AL TOCAR FUERA
    salsaMaracuyaModal.addEventListener("click", function (event) {
        if (event.target === salsaMaracuyaModal) {
            salsaMaracuyaModal.style.display = "none";
            document.body.style.overflow = "";
        }
    });

    // CERRAR CON ESCAPE
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            salsaMaracuyaModal.style.display = "none";
            document.body.style.overflow = "";
        }
    });

});
// =========================================
// MODAL SALSA ACEVICHADA
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    const salsaAcevichadaImg = document.querySelector(
        '.flavor-card img[src="img/salsaacevichada.jpg"]'
    );

    const salsaAcevichadaModal = document.getElementById(
        "salsa-acevichada-modal"
    );

    const closeSalsaAcevichadaModal = document.getElementById(
        "close-salsa-acevichada-modal"
    );

    if (salsaAcevichadaImg && salsaAcevichadaModal && closeSalsaAcevichadaModal) {

        salsaAcevichadaImg.style.cursor = "pointer";

        salsaAcevichadaImg.addEventListener("click", function () {
            salsaAcevichadaModal.style.display = "flex";
        });

        closeSalsaAcevichadaModal.addEventListener("click", function () {
            salsaAcevichadaModal.style.display = "none";
        });

        salsaAcevichadaModal.addEventListener("click", function (event) {
            if (event.target === salsaAcevichadaModal) {
                salsaAcevichadaModal.style.display = "none";
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                salsaAcevichadaModal.style.display = "none";
            }
        });

    }

});
// =========================================
// MODAL SALSA TRUFADA
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    const salsaTrufadaImg = document.querySelector(
        '.flavor-card img[src="img/salsatrufada.jpg"]'
    );

    const salsaTrufadaModal = document.getElementById(
        "salsa-trufada-modal"
    );

    const closeSalsaTrufadaModal = document.getElementById(
        "close-salsa-trufada-modal"
    );

    if (salsaTrufadaImg && salsaTrufadaModal && closeSalsaTrufadaModal) {

        salsaTrufadaImg.style.cursor = "pointer";

        salsaTrufadaImg.addEventListener("click", function () {
            salsaTrufadaModal.style.display = "flex";
        });

        closeSalsaTrufadaModal.addEventListener("click", function () {
            salsaTrufadaModal.style.display = "none";
        });

        salsaTrufadaModal.addEventListener("click", function (event) {
            if (event.target === salsaTrufadaModal) {
                salsaTrufadaModal.style.display = "none";
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                salsaTrufadaModal.style.display = "none";
            }
        });

    }

});
// =========================================
// MODAL SALSA BRAVA
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    const salsaBravaImg = document.querySelector(
        '.flavor-card img[src="img/salsabrava.jpg"]'
    );

    const salsaBravaModal = document.getElementById(
        "salsa-brava-modal"
    );

    const closeSalsaBravaModal = document.getElementById(
        "close-salsa-brava-modal"
    );

    if (salsaBravaImg && salsaBravaModal && closeSalsaBravaModal) {

        salsaBravaImg.style.cursor = "pointer";

        salsaBravaImg.addEventListener("click", function () {
            salsaBravaModal.style.display = "flex";
        });

        closeSalsaBravaModal.addEventListener("click", function () {
            salsaBravaModal.style.display = "none";
        });

        salsaBravaModal.addEventListener("click", function (event) {
            if (event.target === salsaBravaModal) {
                salsaBravaModal.style.display = "none";
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                salsaBravaModal.style.display = "none";
            }
        });

    }

});
// =========================================
// INTRO CINEMÁTICA MRWINGSALCOY
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    const intro = document.getElementById("mrwings-intro");
    const enterButton = document.getElementById("intro-enter");
    const particlesContainer = document.querySelector(".intro-particles");
    console.log("Contenedor de partículas:", particlesContainer);

    if (!intro || !enterButton) return;

    // CREAR PARTÍCULAS DE FUEGO

if (particlesContainer) {

    for (let i = 0; i < 45; i++) {

        const particle = document.createElement("span");

        particle.classList.add("fire-particle");

        particle.style.left = Math.random() * 100 + "%";

        const duration = 4 + Math.random() * 5;

        particle.style.animationDuration = duration + "s";

        // Distribuir las partículas desde el inicio
        particle.style.animationDelay =
            -(Math.random() * duration) + "s";

        particlesContainer.appendChild(particle);

    }

}
    // ENTRAR A LA WEB

    enterButton.addEventListener("click", function () {

        intro.classList.add("hidden");

        setTimeout(function () {
            intro.style.display = "none";
        }, 1000);

    });

});