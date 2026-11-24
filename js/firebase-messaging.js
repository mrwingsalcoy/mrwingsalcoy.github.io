// ======================================
// MRWINGSALCOY - CONEXIÓN FIREBASE PUSH
// ======================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";

import {
    getMessaging,
    getToken,
    isSupported
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-messaging.js";

// CONFIGURACIÓN FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyCCEjD96JKRvQNnZzaomTupTtZmzdEz6BU",
    authDomain: "mrwingsalcoy-e6318.firebaseapp.com",
    projectId: "mrwingsalcoy-e6318",
    storageBucket: "mrwingsalcoy-e6318.firebasestorage.app",
    messagingSenderId: "105595255559",
    appId: "1:105595255559:web:7bc561fa1e4971f4c9a3a2"
};

const VAPID_KEY = "BNHHrHrSnreRDIj3qgiPBAnzyFZJ2Ade9zpOzqESl6ZpaaTNuxakGVPJNIIwQ02643YGnVTuzK0Fn2PMjpK9BVI";

const API_URL = "https://misty-tooth-6094.oquijandriagarcia.workers.dev/";

const app = initializeApp(firebaseConfig);

// BOTÓN DE ACTIVACIÓN
const boton = document.getElementById("activar-notificaciones");
const estado = document.getElementById("estado-notificaciones");

if (boton) {

    boton.addEventListener("click", async function () {

        try {

            boton.disabled = true;
            estado.textContent = "Activando notificaciones...";

            if (!("Notification" in window)) {
                throw new Error("Este navegador no admite notificaciones.");
            }

            if (!("serviceWorker" in navigator)) {
                throw new Error("Service Worker no disponible.");
            }

            const compatible = await isSupported();

            if (!compatible) {
                throw new Error("Firebase no es compatible con este navegador.");
            }

            const permiso = await Notification.requestPermission();

            if (permiso !== "granted") {
                throw new Error("No has concedido permiso para las notificaciones.");
            }

            const registro = await navigator.serviceWorker.ready;

            const messaging = getMessaging(app);

            const pushToken = await getToken(messaging, {
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: registro
            });

            if (!pushToken) {
                throw new Error("No se pudo obtener el token del dispositivo.");
            }

            const tokenAdmin = sessionStorage.getItem("mrwings_admin_token");

            if (!tokenAdmin) {
                throw new Error("Debes iniciar sesión en administración.");
            }

            const respuesta = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    action: "push_register",
                    token: tokenAdmin,
                    pushToken: pushToken
                })
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok || !resultado.success) {
                throw new Error(resultado.error || "No se pudo registrar el dispositivo.");
            }

            estado.textContent = "✅ Notificaciones activadas correctamente.";

            boton.textContent = "🔔 Notificaciones activadas";

        } catch (error) {

            console.error("Error activando notificaciones:", error);

            estado.textContent = "⚠️ " + error.message;

            boton.disabled = false;
        }

    });

}