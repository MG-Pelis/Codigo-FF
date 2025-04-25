import { auth, db } from "./Firebase.js"; // Asegúrate de que esta importación sea correcta
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
    const welcomeMessage = document.querySelector("#welcome-message");
    const numUsuariosElement = document.querySelector("#num-usuarios");

    // Contar los usuarios registrados
    async function contarUsuariosRegistrados() {
        try {
            const usuariosSnapshot = await getDocs(collection(db, "Usuarios"));
            const numUsuarios = usuariosSnapshot.size;
            numUsuariosElement.textContent = numUsuarios;  // Actualiza el número de usuarios registrados en el mensaje

            // Actualizar mensaje con el número de usuarios registrados
            welcomeMessage.textContent = `¡Gracias por unirte! Ahora eres parte de un grupo de valientes. Hasta ahora hay ${numUsuarios} participantes. ¡Demuestra tus habilidades en estos sencillos pero difíciles desafíos y podrías ganar una cuenta de Free Fire!`;
        } catch (error) {
            console.error("Error al contar usuarios registrados:", error);
        }
    }

    // Suponemos que ya tienes autenticación funcionando, aquí verificamos el estado de autenticación
    auth.onAuthStateChanged((user) => {
        if (user) {
            contarUsuariosRegistrados(); // Contar usuarios registrados
        } else {
            console.log("No hay usuario autenticado.");
        }
    });
});
