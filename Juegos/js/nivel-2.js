import { auth, db } from "./Firebase.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const palabrasRapidas = ["Booyah", "Granada", "Rush", "Sniper", "Clasico", "Pared", "Botiquin", "Zona", "Cargador", "Rafaga"];
const frasesRapidas = [
    "Cubrete, granada en camino",
    "Rush a la casa azul",
    "Recoge el botiquin rapido.",
    "Esta en la garita, cuidado",
    "Activa la habilidad",
    "Zona final, quédate dentro.",
    "Usa la pared gloo"
];
const palabrasMezcladas = [
    { palabra: "Booyah", mezcla: "AJOOYHB" },
    { palabra: "Granada", mezcla: "RNADAGA" },
    { palabra: "Botiquin", mezcla: "TQOBIIUN" },
    { palabra: "Rush", mezcla: "USRH" },
    { palabra: "Clasico", mezcla: "OCILASC" },
    { palabra: "Sniper", mezcla: "PISNRE" },
    { palabra: "Kalahari", mezcla: "AKLAIRAH" },
    { palabra: "Diamantes", mezcla: "IMADSETNA" },
    { palabra: "Escuadra", mezcla: "UCQSEADR" }
];

let intentosRestantes = 0;
let nivelActual = 2;
let desafioActual = 1;
let nombreUsuario = "";
let desafioEnCurso = false; // Variable para evitar duplicar desafíos

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

// Actualizar título dinámico
function actualizarTitulo() {
    const titulo = document.getElementById("nivel-titulo");
    const tituloDesafio = document.getElementById("desafio-titulo");

    // Actualizar el título principal del nivel
    titulo.textContent = `Nivel 2 - Desafío ${desafioActual}`;

    // Actualizar el título del desafío según el desafío actual
    const desafiosTitulos = [
        "Reacción Booyah: Escribe una palabra en menos de 5 segundos.",
        "Escribe y corre: Escribe una frase completa sin errores en menos de 10 segundos.",
        "Pulso preciso: Haz clic en el objetivo cuando pase por el centro.",
        "Letras mezcladas: Escribe la palabra correcta a partir de las letras mezcladas."
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
                    if (nivelActual !== 2) {
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

// Función para limpiar texto (eliminar caracteres especiales excepto comas y tildes)
function limpiarTexto(texto) {
    return texto
        .toLowerCase()
        .replace(/[^a-záéíóúüñ, ]/gi, ""); // Permitir solo letras, tildes, comas y espacios
}

// Desafíos
const desafios = [
    {
        descripcion: "Escribe una palabra en menos de 5 segundos.",
        ejecutar: async () => {
            const palabra = palabrasRapidas[Math.floor(Math.random() * palabrasRapidas.length)];
            const respuesta = await Swal.fire({
                title: "Escribe esta palabra",
                text: palabra,
                input: "text",
                inputPlaceholder: "Escribe aquí...",
                timer: 5000,
                timerProgressBar: true,
                showCancelButton: false,
                showConfirmButton: false
            });

            if (limpiarTexto(respuesta.value) !== limpiarTexto(palabra)) {
                return false;
            }
            return true;
        }
    },
    {
        descripcion: "Escribe una frase completa sin errores en menos de 10 segundos.",
        ejecutar: async () => {
            const frase = frasesRapidas[Math.floor(Math.random() * frasesRapidas.length)];
            const respuesta = await Swal.fire({
                title: "Escribe esta frase",
                text: frase,
                input: "text",
                inputPlaceholder: "Escribe aquí...",
                timer: 10000,
                timerProgressBar: true,
                showCancelButton: false,
                showConfirmButton: false
            });

            if (limpiarTexto(respuesta.value) !== limpiarTexto(frase)) {
                return false;
            }
            return true;
        }
    },
    {
        descripcion: "Haz clic en el objetivo cuando pase por el centro.",
        ejecutar: async () => {
            return new Promise((resolve) => {
                // Crear la zona móvil
                const zonaMovil = document.createElement("div");
                zonaMovil.id = "zona-movil";
    
                // Crear el objetivo (la bola)
                const objetivo = document.createElement("div");
                objetivo.id = "objetivo";
    
                // Crear el indicador gráfico del centro
                const centroIndicador = document.createElement("div");
                centroIndicador.id = "centro-indicador";
    
                // Agregar elementos a la zona móvil
                zonaMovil.appendChild(centroIndicador);
                zonaMovil.appendChild(objetivo);
                document.getElementById("desafio-contenido").appendChild(zonaMovil);
    
                // Escuchar clics en la zona móvil
                zonaMovil.addEventListener("click", (event) => {
                    const rect = zonaMovil.getBoundingClientRect();
                    const centro = rect.width / 2; // Centro de la zona móvil
                    const clicX = event.clientX - rect.left;
    
                    if (Math.abs(clicX - centro) <= 1) { // Aumentar tolerancia a 10px
                        resolve(true);
                    } else {
                        resolve(false);
                    }
    
                    // Limpiar el desafío
                    zonaMovil.remove();
                });
            });
        }
    },
    {
        descripcion: "Escribe la palabra correcta a partir de las letras mezcladas.",
        ejecutar: async () => {
            const mezcla = palabrasMezcladas[Math.floor(Math.random() * palabrasMezcladas.length)];
            const respuesta = await Swal.fire({
                title: "Ordena las letras",
                text: mezcla.mezcla,
                input: "text",
                inputPlaceholder: "Escribe aquí...",
                timer: 20000, // Tiempo límite de 30 segundos
                timerProgressBar: true,
                showCancelButton: false,
                showConfirmButton: true
            });

            if (limpiarTexto(respuesta.value) !== limpiarTexto(mezcla.palabra)) {
                return false;
            }
            return true;
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