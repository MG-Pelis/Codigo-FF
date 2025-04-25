import { auth, db } from "./Firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Variable global para controlar si el evento ha comenzado
let eventoComenzado = false;

// Verificar autenticación y cargar datos del usuario
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const progresoRef = doc(db, "Usuarios", user.uid, "Progreso", "desafio");
        const progresoSnap = await getDoc(progresoRef);

        if (!progresoSnap.exists()) {
            // Si no tiene progreso, crear el documento del usuario
            await crearDocumentoUsuario(user);
        } else {
            // Usuario existente: cargar progreso
            const progreso = progresoSnap.data();
            document.getElementById("nivel").textContent = progreso.nivel;
            document.getElementById("desafio").textContent = progreso.desafio;
            document.getElementById("intentos").textContent = progreso.intentos;

            // Verificar y recargar intentos si es necesario
            await verificarYRecargarIntentos(user);
        }

        // Cargar datos básicos del usuario
        const userDocRef = doc(db, "Usuarios", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            document.getElementById("user-name").textContent = userData.nombre || "Usuario";
            document.getElementById("profile-pic").src = userData.fotoPerfil || "../img/default-profile.png";
        }
    } else {
        Swal.fire({
            icon: "warning",
            title: "Inicia sesión",
            text: "Debes iniciar sesión para acceder al juego.",
            confirmButtonText: "Aceptar",
        }).then(() => {
            window.location.href = "index.html";
        });
    }
});

// Función para crear el documento del usuario
async function crearDocumentoUsuario(user) {
    try {
        const userDocRef = doc(db, "Usuarios", user.uid);
        const progresoRef = doc(db, "Usuarios", user.uid, "Progreso", "desafio");

        // Datos básicos del usuario
        const userData = {
            nombre: user.displayName,
            fotoPerfil: user.photoURL,
            correo: user.email,
            uid: user.uid,
            rol: "usuario",
            ultimaRecarga: new Date().toISOString(),
        };

        // Inicializar progreso del usuario
        const progresoData = {
            nivel: 1,
            desafio: 1,
            intentos: 10, // Inicializar con 10 intentos
            ultimaRecarga: new Date().toISOString(),
        };

        // Crear documento del usuario
        await setDoc(userDocRef, userData);

        // Crear documento de progreso
        await setDoc(progresoRef, progresoData);

        // Actualizar la interfaz con los datos iniciales
        document.getElementById("nivel").textContent = "1";
        document.getElementById("desafio").textContent = "1";
        document.getElementById("intentos").textContent = "10";

        Swal.fire("¡Bienvenido!", "Tu cuenta ha sido creada con éxito. ¡Buena suerte!", "success");
    } catch (error) {
        console.error("Error al crear el documento del usuario:", error);
        Swal.fire("Error", "Hubo un problema al crear tu cuenta. Inténtalo de nuevo.", "error");
    }
}

// Función para verificar y recargar intentos
async function verificarYRecargarIntentos(user) {
    const progresoRef = doc(db, "Usuarios", user.uid, "Progreso", "desafio");
    const progresoSnap = await getDoc(progresoRef);

    if (progresoSnap.exists()) {
        const progreso = progresoSnap.data();
        const ultimaRecarga = new Date(progreso.ultimaRecarga);
        const ahora = new Date();

        // Verificar si es un nuevo día
        const esNuevoDia = ultimaRecarga.toDateString() !== ahora.toDateString();

        if (esNuevoDia) {
            // Recargar intentos y actualizar la última recarga
            const nuevosIntentos = progreso.intentos + 10;
            await updateDoc(progresoRef, {
                intentos: nuevosIntentos,
                ultimaRecarga: ahora.toISOString(),
            });

            Swal.fire("Intentos recargados", "¡Se han agregado 10 intentos a tu cuenta!", "success");
            document.getElementById("intentos").textContent = nuevosIntentos;
        }
    } else {
        console.error("No se encontró el progreso del usuario.");
    }
}

// Mostrar menú desplegable
document.getElementById("profile-menu").addEventListener("click", () => {
    const menu = document.getElementById("dropdown-menu");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
});

// Cambiar nombre
document.getElementById("btn-cambiar-nombre").addEventListener("click", async () => {
    const { value: nuevoNombre } = await Swal.fire({
        title: "Cambiar nombre",
        input: "text",
        inputLabel: "Nuevo nombre",
        inputPlaceholder: "Ingresa tu nuevo nombre",
        showCancelButton: true,
    });

    if (nuevoNombre) {
        const user = auth.currentUser;
        const userDocRef = doc(db, "Usuarios", user.uid);
        await setDoc(userDocRef, { nombre: nuevoNombre }, { merge: true });
        Swal.fire("Nombre actualizado", "Tu nombre ha sido cambiado con éxito.", "success");
        document.getElementById("user-name").textContent = nuevoNombre;
    }
});

// Eliminar cuenta
document.getElementById("btn-eliminar-cuenta").addEventListener("click", async () => {
    const confirm = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Eliminar tu cuenta borrará todo tu progreso. Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
        const user = auth.currentUser;
        const userDocRef = doc(db, "Usuarios", user.uid);
        const progresoRef = doc(db, "Usuarios", user.uid, "Progreso", "desafio");

        try {
            // Eliminar la subcolección "Progreso"
            const progresoSnap = await getDoc(progresoRef);
            if (progresoSnap.exists()) {
                await deleteDoc(progresoRef);
            }

            // Eliminar el documento principal del usuario
            await deleteDoc(userDocRef);

            // Eliminar la cuenta del usuario
            await user.delete();

            // Mostrar mensaje de espera
        Swal.fire({
            title: "Cuenta eliminada",
            text: "Tu cuenta ha sido eliminada con éxito.",
            icon: "success",
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
            if (error.code === "auth/requires-recent-login") {
                // Mostrar mensaje si se requiere un inicio de sesión reciente
                Swal.fire({
                    title: "Inicio de sesión requerido",
                    text: "Para eliminar tu cuenta, debes cerrar sesión e iniciar sesión nuevamente para confirmar que eres el propietario.",
                    icon: "info",
                    confirmButtonText: "Aceptar",
                });
            } else {
                // Manejar otros errores
                console.error("Error al eliminar la cuenta:", error);
                Swal.fire("Error", "Hubo un problema al eliminar tu cuenta. Inténtalo de nuevo más tarde.", "error");
            }
        }
    }
});

// Cerrar sesión
document.getElementById("btn-cerrar-sesion").addEventListener("click", async () => {
    const confirm = await Swal.fire({
        title: "Cerrar sesión",
        text: "¿Estás seguro de que deseas cerrar sesión?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cerrar sesión",
        cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
        try {
            await auth.signOut();
            Swal.fire("Sesión cerrada", "Has cerrado sesión con éxito.", "success").then(() => {
                window.location.href = "../index.html";
            });
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            Swal.fire("Error", "Hubo un problema al cerrar sesión. Inténtalo de nuevo.", "error");
        }
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const countdownElement = document.getElementById("countdown");
    const continuarButton = document.getElementById("btn-continuar");

    function actualizarCountdown() {
        const fechaObjetivo = new Date("2025-04-25T11:00:00-05:00"); // 25 de abril, 11:00 AM hora Colombia
        const ahora = new Date();
        const diferencia = fechaObjetivo - ahora;

        if (diferencia <= 0) {
            countdownElement.textContent = "¡El evento ha comenzado!";
            eventoComenzado = true; // Marcar que el evento ha comenzado
            clearInterval(intervaloCountdown); // Detener el contador
            return;
        }

        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

        countdownElement.textContent = `Tiempo restante: ${dias}d ${horas}h ${minutos}m ${segundos}s`;
    }

    // Actualizar el contador cada segundo
    const intervaloCountdown = setInterval(actualizarCountdown, 1000);
    actualizarCountdown(); // Llamar inmediatamente para mostrar el tiempo inicial

    // Manejar clic en el botón "Continuar"
    continuarButton.addEventListener("click", async () => {
        if (!eventoComenzado) {
            Swal.fire({
                icon: "warning",
                title: "Aún no puedes comenzar",
                text: "El evento todavía no ha iniciado. Espera a que finalice la cuenta regresiva para poder participar.",
                confirmButtonText: "Entendido",
            });
            return;            
        }

        const user = auth.currentUser;
        const progresoRef = doc(db, "Usuarios", user.uid, "Progreso", "desafio");
        const progresoSnap = await getDoc(progresoRef);

        if (progresoSnap.exists()) {
            const progreso = progresoSnap.data();
            if (progreso.intentos > 0) {
                // Reducir intentos y actualizar Firestore
                await updateDoc(progresoRef, {
                    intentos: progreso.intentos - 1,
                });
                Swal.fire("¡Buena suerte!", "¡Continúa con el desafío!", "success").then(() => {
                    window.location.href = `Juegos/nivel-${progreso.nivel}.html`;
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Sin intentos",
                    text: "Ya no tienes intentos por hoy. Regresa mañana a las 7:00 AM.",
                    confirmButtonText: "Aceptar",
                });
            }
        }
    });
});