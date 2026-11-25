// ======================================
// MRWINGSALCOY - FIREBASE PUSH
// ======================================

importScripts("https://www.gstatic.com/firebasejs/13.4.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/13.4.0/firebase-messaging-compat.js");

// CONFIGURACIÓN FIREBASE
firebase.initializeApp({
    apiKey: "AIzaSyCCEjD96JKRvQNnZzaomTupTtZmzdEz6BU",
    authDomain: "mrwingsalcoy-e6318.firebaseapp.com",
    projectId: "mrwingsalcoy-e6318",
    storageBucket: "mrwingsalcoy-e6318.firebasestorage.app",
    messagingSenderId: "105595255559",
    appId: "1:105595255559:web:7bc561fa1e4971f4c9a3a2"
});

const messaging = firebase.messaging();

// RECIBIR NOTIFICACIONES EN SEGUNDO PLANO
messaging.onBackgroundMessage(function (payload) {

    const datos = payload.data || {};

    const titulo = datos.title || "🍗 Nuevo pedido - MrWingsAlcoy";

   const opciones = {
    body: datos.body || "Has recibido un nuevo pedido.",
    silent: false,
    data: {
        url: datos.url || "/admin.html"
    },
    tag: "mrwings-nuevo-pedido",
    renotify: true
};

    return self.registration.showNotification(titulo, opciones);
});

// ABRIR EL PANEL AL TOCAR LA NOTIFICACIÓN
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
                    ventana.navigate(url);
                    return ventana.focus();
                }
            }

            return clients.openWindow(url);
        })
    );
});