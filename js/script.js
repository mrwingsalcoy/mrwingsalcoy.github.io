// =========================================
// MRWINGSALCOY - JAVASCRIPT
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    // ELEMENTOS QUE TENDRÁN ANIMACIÓN
    const elementos = document.querySelectorAll(
        ".flavor-card, .presentation, .combos-section, .combo-card, footer"
    );

    // COMPROBAR COMPATIBILIDAD
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

        // MOSTRAR TODO SI EL NAVEGADOR NO SOPORTA LA ANIMACIÓN

        elementos.forEach((elemento) => {
            elemento.classList.add("visible");
        });

    }

});