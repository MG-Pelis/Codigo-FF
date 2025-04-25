// Importar los servicios necesarios desde Firebase.js
import { auth } from "./Firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Función para verificar si el usuario está autenticado
function verificarAutenticacion() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            // Mostrar alerta con SweetAlert
            Swal.fire({
                icon: "warning",
                title: "Inicia sesión",
                text: "Debes iniciar sesión para acceder y superar este nivel.",
                confirmButtonText: "Aceptar",
                allowOutsideClick: false,
            }).then(() => {
                // Redirigir al inicio de la página
                window.location.href = "../index.html";
            });
        }
    });
}

// Ejecutar la función al cargar el script
verificarAutenticacion();