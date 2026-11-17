// MRWINGSALCOY - JAVASCRIPT

document.addEventListener("DOMContentLoaded", function () {

    // Animaciones al desplazarse por la página
    const elementos = document.querySelectorAll(
        ".flavor-card, .presentation, .combos-section"
    );

    const observador = new IntersectionObserver((entradas) => {

        entradas.forEach((entrada) => {

            if (entrada.isIntersecting) {
                entrada.target.classList.add("visible");
                observador.unobserve(entrada.target);
            }

        });

    }, {
        threshold: 0.15
    });

    elementos.forEach((elemento) => {
        elemento.classList.add("reveal");
        observador.observe(elemento);
    });

});