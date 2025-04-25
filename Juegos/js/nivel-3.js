import { auth, db } from "./Firebase.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

let intentosRestantes = 0;
let nivelActual = 3;
let desafioActual = 1;
let nombreUsuario = "";
let desafioEnCurso = false;

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

function actualizarTitulo() {
    const titulo = document.getElementById("nivel-titulo");
    const tituloDesafio = document.getElementById("desafio-titulo");

    // Actualizar el título principal del nivel
    titulo.textContent = `Nivel 3 - Desafío ${desafioActual}`;

    // Actualizar el título del desafío según el desafío actual
    const desafiosTitulos = [
        "Repite la carta: Selecciona la opción correcta.",
        "Código confuso: Memoriza y escribe el código.",
        "Números en batalla: Recuerda y selecciona el número correcto.",
        "Secuencia FF: Memoriza y repite la secuencia de íconos."
    ];
    tituloDesafio.textContent = desafiosTitulos[desafioActual - 1];
}

// Verificar autenticación y cargar progreso
async function cargarProgreso() {
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

                    // Reflejar intentos en la página
                    document.getElementById("intentos").textContent = intentosRestantes;
                    actualizarTitulo();

                    // Si el usuario está en otro nivel, redirigirlo
                    if (nivelActual !== 3) {
                        Swal.fire("Redirigiendo", `Estás en el nivel ${nivelActual}.`, "info").then(() => {
                            window.location.href = `nivel-${nivelActual}.html`;
                        });
                    }
                    resolve();
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
async function reducirIntentos() {
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
async function actualizarProgreso() {
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

// Mostrar descripción del desafío
function mostrarDescripcion(desafio) {
    return Swal.fire({
        title: `Desafío ${desafioActual}`,
        text: desafio.descripcion,
        icon: "info",
        confirmButtonText: "¡Entendido!"
    });
}

// Desafíos
const desafios = [
    
    {
        descripcion: "Repite la carta: Selecciona la opción correcta.",
        ejecutar: async () => {const personajes = [
            "Moco", "Kelly", "Alok", "Crono", "Miguel", "Kapella", "Shirou", "Andrew", "Olivia", 
            "Wukong", "Jai", "Clu", "Dasha", "Petra", "A124", "Kla", "Skyler", "Wolfrahh", "Maxim", 
            "Jota", "Xayne", "Misha", "Antonio", "Dimitri", "K", "Laura"
        ];
        
        const armas = [
            "MP40", "Groza", "AK47", "M4A1", "SCAR", "FAMAS", "P90", "UMP", "M1014", "Spas-12", 
            "SKS", "Kar98k", "AWM", "VSS", "G18", "Desert Eagle", "Parafal", "Mosin Nagant", 
            "FAL", "RPD", "MAG-7", "KSG", "Pistol", "Uzi", "ScarL", "Lança-foguetes", "RPG", "MGL",
            "MP5", "Fennec", "Groza", "AUG"
        ];
        
        const opciones = personajes.concat(armas);
            const correcta = opciones[Math.floor(Math.random() * opciones.length)];
            document.getElementById("desafio-contenido").textContent = `Carta: ${correcta}`;
            await new Promise((resolve) => setTimeout(resolve, 500));
            document.getElementById("desafio-contenido").textContent = "";

            const respuesta = await Swal.fire({
                title: "¿Cuál era la carta?",
                input: "select",
                inputOptions: opciones.reduce((acc, opcion) => {
                    acc[opcion] = opcion;
                    return acc;
                }, {}),
                showCancelButton: false,
                showConfirmButton: true
            });

            if (respuesta.value !== correcta) {
                return false;
            }
            return true;
        }
    },
    {
        descripcion: "Código confuso: Memoriza y escribe el código.",
        ejecutar: async () => {
            const codigo = `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 10)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 10)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 10)}`;
            document.getElementById("desafio-contenido").textContent = `Código: ${codigo}`;
            await new Promise((resolve) => setTimeout(resolve, 2000));
            document.getElementById("desafio-contenido").textContent = "";

            const respuesta = await Swal.fire({
                title: "Escribe el código",
                input: "text",
                inputPlaceholder: "Escribe el código aquí",
                showCancelButton: false,
                showConfirmButton: true
            });

            if (respuesta.value !== codigo) {
                return false;
            }
            return true;
        }
    },
    {
        descripcion: "Números en batalla: Recuerda y selecciona el número correcto.",
        ejecutar: async () => {
            const numeros = Array.from({ length: 4 }, () => Math.floor(Math.random() * (356 - 20 + 1)) + 20);
            document.getElementById("desafio-contenido").textContent = `Números: ${numeros.join(", ")}`;
            await new Promise((resolve) => setTimeout(resolve, 1500));
            document.getElementById("desafio-contenido").textContent = "";

            const indice = Math.floor(Math.random() * 4);
            const respuesta = await Swal.fire({
                title: `¿Cuál fue el número #${indice + 1}?`,
                input: "text",
                inputPlaceholder: "Escribe el número aquí",
                showCancelButton: false,
                showConfirmButton: true
            });

            if (parseInt(respuesta.value) !== numeros[indice]) {
                return false;
            }
            return true;
        }
    },
    {
        descripcion: "Secuencia FF: Memoriza y selecciona los íconos en orden.",
        ejecutar: async () => {
            const iconos = ["💣", "🔫", "🛡️", "🩹", "📦"];
            const secuencia = [];
            const opcionesSeleccionadas = [];
    
            // Generar secuencia aleatoria de 4 íconos
            for (let i = 0; i < 4; i++) {
                const icono = iconos[Math.floor(Math.random() * iconos.length)];
                secuencia.push(icono);
            }
    
            // Mostrar los íconos uno por uno
            for (let i = 0; i < secuencia.length; i++) {
                document.getElementById("desafio-contenido").textContent = secuencia[i];
                await new Promise((resolve) => setTimeout(resolve, 500));
            }
            document.getElementById("desafio-contenido").textContent = "";
    
            // Mostrar opciones para que el jugador seleccione
            for (let i = 0; i < secuencia.length; i++) {
                const respuesta = await Swal.fire({
                    title: `Selecciona el ícono #${i + 1}`,
                    input: "select",
                    inputOptions: iconos.reduce((acc, icono) => {
                        acc[icono] = icono;
                        return acc;
                    }, {}),
                    inputPlaceholder: "Selecciona un ícono",
                    showCancelButton: false,
                    confirmButtonText: "Seleccionar",
                });
    
                if (respuesta.value) {
                    opcionesSeleccionadas.push(respuesta.value);
                }
            }
    
            // Validar si la secuencia seleccionada coincide con la original
            if (JSON.stringify(opcionesSeleccionadas) === JSON.stringify(secuencia)) {
                return true; // Éxito
            } else {
                return false; // Fallo
            }
        }
    }
];

// Iniciar desafío
document.getElementById("btn-iniciar").addEventListener("click", async () => {
    if (desafioEnCurso) {
        Swal.fire("Desafío en curso", "Ya hay un desafío en ejecución. Completa el actual antes de iniciar otro.", "warning");
        return;
    }

    try {
        desafioEnCurso = true; // Marcar que un desafío está en curso
        await cargarProgreso();

        if (intentosRestantes > 0) {
            actualizarTitulo();

            const desafioActualObj = desafios[(desafioActual - 1) % desafios.length];
            await mostrarDescripcion(desafioActualObj);

            const exito = await desafioActualObj.ejecutar();
            if (exito) {
                if (desafioActual === 4) {
                    // Si es el desafío 4, mostrar mensaje de éxito y redirigir al siguiente nivel
                    await actualizarProgreso();
                    Swal.fire({
                        title: "¡Nivel completado!",
                        text: `¡Felicidades, ${nombreUsuario}! Has completado todos los desafíos de este nivel y serás enviado al siguiente.`,
                        icon: "success",
                        timer: 5000,
                        timerProgressBar: true,
                        showConfirmButton: false
                    }).then(() => {
                        window.location.href = `nivel-${nivelActual}.html`;
                    });
                } else {
                    // Mostrar mensaje de éxito estándar para otros desafíos
                    await actualizarProgreso();
                    actualizarTitulo();
                    const fraseExito = frasesExito[Math.floor(Math.random() * frasesExito.length)].replace("{nombre}", nombreUsuario);
                    Swal.fire("¡Correcto!", fraseExito, "success");
                }
            } else {
                // Mostrar mensaje de fallo
                await reducirIntentos();
                const fraseFracaso = frasesFracaso[Math.floor(Math.random() * frasesFracaso.length)].replace("{nombre}", nombreUsuario);
                Swal.fire("Fallaste", fraseFracaso, "error");
            }
        } else {
            Swal.fire("Sin intentos", "Ya no tienes intentos. Regresando al inicio.", "error").then(() => {
                window.location.href = "../juego.html";
            });
        }
    } catch (error) {
        console.error("Error al iniciar el desafío:", error);
    } finally {
        desafioEnCurso = false; // Liberar el estado del desafío
    }
});

// Cargar progreso al iniciar la página
window.addEventListener("load", async () => {
    try {
        await cargarProgreso();
    } catch (error) {
        console.error("Error al cargar la página:", error);
    }
});