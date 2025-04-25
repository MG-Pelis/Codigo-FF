// Importar las funciones necesarias del SDK de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Configuración de Firebase para la aplicación web
const firebaseConfig = {
    apiKey: "AIzaSyBsoCt0_XwYFEN_rNdB9XZlXDu0ZS_RYdQ",
    authDomain: "codigo-ff.firebaseapp.com",
    projectId: "codigo-ff",
    storageBucket: "codigo-ff.firebasestorage.app",
    messagingSenderId: "827663248408",
    appId: "1:827663248408:web:7ef57d884658459745e76d",
    measurementId: "G-GHVMSP3KV6"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Exportar servicios de Firebase
export const auth = getAuth(app); // Servicio de autenticación
export const db = getFirestore(app); // Servicio de base de datos Firestore