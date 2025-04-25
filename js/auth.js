// Importar los servicios necesarios desde Firebase.js
import { auth } from "./Firebase.js";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Detectar clic en el botón
document.getElementById("btn-google").addEventListener("click", async () => {
    // Verificar si el usuario ya está autenticado
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Usuario ya autenticado, redirigir directamente
            Swal.fire({
                title: "Iniciando sesión...",
                text: `Bienvenido de nuevo, ${user.displayName || "Usuario"}!`,
                icon: "info",
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false,
                allowOutsideClick: false
            }).then(() => {
                window.location.href = "juego.html";
            });
        } else {
            // Usuario no autenticado, iniciar sesión con Google
            await iniciarSesionConGoogle();
        }
    });
});

// Función para iniciar sesión con Google
async function iniciarSesionConGoogle() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Mostrar mensaje de espera
        Swal.fire({
            title: "Iniciando sesión...",
            text: "Por favor, espera unos segundos.",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
            timer: 5000,
            timerProgressBar: true,
            showConfirmButton: false
        }).then(() => {
            // Redirigir al inicio del juego
            window.location.href = "juego.html";
        });
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        Swal.fire("Error", "Hubo un problema al iniciar sesión. Inténtalo de nuevo.", "error");
    }
}