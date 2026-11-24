// ======================================
// MRWINGSALCOY - NOTIFICACIONES PUSH
// ======================================

self.addEventListener("push", function (event) {

    let datos = {
        titulo: "🍗 Nuevo pedido - MrWingsAlcoy",
        mensaje: "Has recibido un nuevo pedido.",
        url: "/admin.html"
    };

    if (event.data) {
        try {
            const recibido = event.data.json();

            datos = {
                ...datos,
                ...recibido
            };

        } catch (error) {
            datos.mensaje = event.data.text();
        }
    }

    event.waitUntil(

        self.registration.showNotification(datos.titulo, {

            body: datos.mensaje,

            icon: "/img/icon-192.png",

            badge: "/img/icon-192.png",

            data: {
                url: datos.url
            },

            vibrate: [200, 100, 200],

            tag: "mrwings-nuevo-pedido",

            renotify: true

        })

    );

});


// ======================================
// ABRIR PANEL AL TOCAR LA NOTIFICACIÓN
// ======================================

self.addEventListener("notificationclick", function (event) {

    event.notification.close();

    const url = event.notification.data?.url || "/admin.html";

    event.waitUntil(

        clients.matchAll({
            type: "window",
            includeUncontrolled: true
        }).then(function (ventanas) {

            for (const ventana of ventanas) {

                if ("focus" in ventana) {
                    return ventana.focus();
                }

            }

            return clients.openWindow(url);

        })

    );

});