import { auth, db } from "./Firebase.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

let intentosRestantes = 0;
let nivelActual = 0;
let desafioActual = 1;
let nombreUsuario = "";

// Frases personalizadas para éxito y fracaso
const frasesExito = [
    "¡Bien hecho, {nombre}! ¡Eres increíble!",
    "¡Perfecto, {nombre}! ¡Sigue así!",
    "¡Lo lograste, {nombre}! ¡Eres un crack!",
    "¡Excelente trabajo, {nombre}!",
    "¡Impresionante, {nombre}! ¡Sigue adelante!",
    "¡Eres un genio, {nombre}!",
    "¡Victoria, {nombre}! ¡Lo hiciste genial!",
    "¡Bravo, {nombre}! ¡Estás avanzando!",
    "¡Fantástico, {nombre}! ¡Qué habilidad!",
    "¡Asombroso, {nombre}! ¡Eres imparable!"
];

const frasesFracaso = [
    "¡Oh no, {nombre}! ¡Inténtalo de nuevo!",
    "¡Casi lo logras, {nombre}! ¡No te rindas!",
    "¡No te preocupes, {nombre}! ¡Puedes hacerlo!",
    "¡Sigue intentándolo, {nombre}!",
    "¡Vamos, {nombre}! ¡No te desanimes!",
    "¡No fue esta vez, {nombre}! ¡Pero puedes lograrlo!",
    "¡Ánimo, {nombre}! ¡El próximo será tuyo!",
    "¡No te rindas, {nombre}! ¡Tienes esto!",
    "¡Sigue adelante, {nombre}! ¡Eres capaz!",
    "¡No pasa nada, {nombre}! ¡A la próxima lo logras!"
];

// Verificar autenticación y cargar progreso
export async function cargarProgreso(nivelEsperado) {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                Swal.fire("No autenticado", "Debes iniciar sesión para continuar.", "error").then(() => {
                    window.location.href = "../index.html";
                });
                reject("Usuario no autenticado");
                return;
            }

            try {
                const progresoRef = doc(db, "Usuarios", user.uid, "Progreso", "desafio");
                const userDocRef = doc(db, "Usuarios", user.uid);

                // Obtener datos del usuario
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    nombreUsuario = userData.nombre || "Jugador";
                } else {
                    Swal.fire("Error", "No se encontraron tus datos. Redirigiendo al inicio.", "error").then(() => {
                        window.location.href = "../juego.html";
                    });
                    reject("Datos del usuario no encontrados");
                    return;
                }

                // Obtener progreso del usuario
                const progresoSnap = await getDoc(progresoRef);
                if (progresoSnap.exists()) {
                    const progreso = progresoSnap.data();
                    intentosRestantes = progreso.intentos;
                    nivelActual = progreso.nivel;
                    desafioActual = progreso.desafio;

                    document.getElementById("intentos").textContent = intentosRestantes;

                    // Si el usuario está en otro nivel, redirigirlo
                    if (nivelActual !== nivelEsperado) {
                        Swal.fire("Redirigiendo", `Estás en el nivel ${nivelActual}.`, "info").then(() => {
                            window.location.href = `nivel-${nivelActual}.html`;
                        });
                        reject(`Usuario en nivel ${nivelActual}`);
                        return;
                    }
                    resolve({ intentosRestantes, nivelActual, desafioActual, nombreUsuario });
                } else {
                    // Si no hay progreso, redirigir a juego.html
                    Swal.fire("Sin progreso", "No se encontró tu progreso. Redirigiendo al inicio.", "info").then(() => {
                        window.location.href = "../juego.html";
                    });
                    reject("Progreso no encontrado");
                }
            } catch (error) {
                console.error("Error al cargar el progreso:", error);
                reject(error);
            }
        });
    });
}

// Reducir intentos en la base de datos
export async function reducirIntentos() {
    const user = auth.currentUser;
    const progresoRef = doc(db, "Usuarios", user.uid, "Progreso", "desafio");

    if (intentosRestantes > 0) {
        intentosRestantes--;
        await updateDoc(progresoRef, { intentos: intentosRestantes });
        document.getElementById("intentos").textContent = intentosRestantes;
    }

    if (intentosRestantes === 0) {
        Swal.fire("Sin intentos", "Ya no tienes intentos. Regresando al inicio.", "error").then(() => {
            window.location.href = "../juego.html";
        });
    }
}

// Actualizar progreso en la base de datos
export async function actualizarProgreso() {
    const user = auth.currentUser;
    const progresoRef = doc(db, "Usuarios", user.uid, "Progreso", "desafio");

    desafioActual++;
    if (desafioActual > 4) {
        nivelActual++;
        desafioActual = 1;
    }

    await updateDoc(progresoRef, {
        nivel: nivelActual,
        desafio: desafioActual
    });
}

// Obtener frases personalizadas
export function obtenerFraseExito() {
    return frasesExito[Math.floor(Math.random() * frasesExito.length)].replace("{nombre}", nombreUsuario);
}

export function obtenerFraseFracaso() {
    return frasesFracaso[Math.floor(Math.random() * frasesFracaso.length)].replace("{nombre}", nombreUsuario);
}