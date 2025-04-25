import { auth, db } from "./Firebase.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

let intentosRestantes = 0;
let nivelActual = 1;
let desafioActual = 1;
let nombreUsuario = "";
let desafioEnCurso = false;

// Frases personalizadas para éxito y fracaso
const frasesExito = [
    "¡Bien hecho, {nombre}! Pasaste el desafío como todo un pro.",
    "{nombre}, ¡eres un crack! Aprobaste sin despeinarte.",
    "¡Victoria total, {nombre}! Vas directo al top 1.",
    "Lo lograste, {nombre}! ¡Free Fire es tu terreno!"
];

const frasesFracaso = [
    "Ouch, {nombre}, esta no fue... inténtalo otra vez.",
    "{nombre}, no fue la mejor decisión. Sigue intentando.",
    "Nada que hacer, {nombre}. Se te fue la cabeza al rush.",
    "Fallaste, {nombre}, pero los cracks nunca se rinden."
];

// Actualizar título dinámico
function actualizarTitulo() {
    const titulo = document.getElementById("nivel-titulo");
    const tituloDesafio = document.getElementById("desafio-titulo");

    // Actualizar el título principal del nivel
    titulo.textContent = `Nivel 1 - Desafío ${desafioActual}`;

    // Actualizar el título del desafío según el desafío actual
    const desafiosTitulos = [
        "Preguntas de trivia: Responde preguntas sobre Free Fire.",
        "Situaciones y decisiones: Elige qué harías en el juego.",
        "Identificar armas y personajes: Adivina con nombres incompletos.",
        "Orden de prioridad: Escoge lo más útil según el momento."
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
                    if (nivelActual !== 1) {
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
        descripcion: "Preguntas de trivia",
        ejecutar: async () => {
            const preguntas = [
                {
                    pregunta: "¿Cuál es el nombre del mapa original de Free Fire?",
                    opciones: ["Bermuda", "Kalahari", "Purgatorio", "Alpine"],
                    correcta: "Bermuda"
                },
                {
                    pregunta: "¿Qué habilidad tiene el personaje Alok?",
                    opciones: ["Escudo explosivo", "Aumento de velocidad", "Cura y velocidad de movimiento", "Invisibilidad"],
                    correcta: "Cura y velocidad de movimiento"
                },
                {
                    pregunta: "¿Cuántos jugadores pueden entrar en una partida clásica de escuadra?",
                    opciones: ["2", "3", "4", "5"],
                    correcta: "4"
                },
                {
                    pregunta: "¿Cuál de estos no es un tipo de granada en Free Fire?",
                    opciones: ["Granada cegadora", "Granada gloo", "Granada de humo", "Granada de fragmentación"],
                    correcta: "Granada gloo"
                },
                {
                    pregunta: "¿Cuál fue el primer pase élite de Free Fire?",
                    opciones: ["El Escuadrón Cobra", "La Fiebre del Oro", "Sakura", "Ragnarok"],
                    correcta: "Sakura"
                }
            ];

            const preguntaSeleccionada = preguntas[Math.floor(Math.random() * preguntas.length)];
            const respuesta = await Swal.fire({
                title: preguntaSeleccionada.pregunta,
                input: "radio",
                inputOptions: preguntaSeleccionada.opciones.reduce((acc, opcion, index) => {
                    acc[index] = opcion;
                    return acc;
                }, {}),
                inputValidator: (value) => {
                    if (!value) {
                        return "Debes seleccionar una opción.";
                    }
                }
            });

            if (preguntaSeleccionada.opciones[respuesta.value] === preguntaSeleccionada.correcta) {
                return true;
            } else {
                return false;
            }
        }
    },
    {
        descripcion: "Situaciones y decisiones",
        ejecutar: async () => {
            const situaciones = [
                {
                    situacion: "Estás en la última zona y te quedan dos enemigos. Tienes una MP40 y una AWM.",
                    opciones: ["Usar la AWM a larga distancia", "Esperar escondido en una casa", "Ir al rush con la MP40", "Tirarte al piso y no hacer nada"],
                    correcta: "Ir al rush con la MP40"
                },
                {
                    situacion: "Estás jugando dúo y tu compañero cae. ¿Qué haces?",
                    opciones: ["Vas al rush solo", "Lo revives en cuanto puedas", "Esperas a que se desconecte", "Lo ignoras"],
                    correcta: "Lo revives en cuanto puedas"
                },
                {
                    situacion: "Estás en el centro de zona, ¿qué haces?",
                    opciones: ["Te quedas quieto en campo abierto", "Construyes paredes gloo estratégicas", "Corres sin parar", "Llamas la atención con disparos"],
                    correcta: "Construyes paredes gloo estratégicas"
                },
                {
                    situacion: "Estás cayendo en zona caliente y escuchas disparos cerca. ¿Qué haces primero?",
                    opciones: ["Buscar paredes gloo", "Coger cualquier arma disponible, aunque sea mala", "Esconderte y esperar a que terminen", "Buscar chaleco nivel 3"],
                    correcta: "Coger cualquier arma disponible, aunque sea mala"
                },
                {
                    situacion: "Te atacan por la espalda y solo tienes una pared.",
                    opciones: ["Usas la pared, curas y contraatacas", "Te lanzas sin protección", "Sigues corriendo en línea recta", "Gritas en el micrófono"],
                    correcta: "Usas la pared, curas y contraatacas"
                }
            ];

            const situacionSeleccionada = situaciones[Math.floor(Math.random() * situaciones.length)];
            const respuesta = await Swal.fire({
                title: situacionSeleccionada.situacion,
                input: "radio",
                inputOptions: situacionSeleccionada.opciones.reduce((acc, opcion, index) => {
                    acc[index] = opcion;
                    return acc;
                }, {}),
                inputValidator: (value) => {
                    if (!value) {
                        return "Debes seleccionar una opción.";
                    }
                }
            });

            if (situacionSeleccionada.opciones[respuesta.value] === situacionSeleccionada.correcta) {
                return true;
            } else {
                return false;
            }
        }
    },
    {
        descripcion: "Identificar armas y eventos",
        ejecutar: async () => {
            const armas = [
                {
                    incompleta: "M18...",
                    opciones: ["M18C4", "M1887", "M1811", "M1896"],
                    correcta: "M1887"
                },
                {
                    incompleta: "XM...",
                    opciones: ["XM1000", "XM35", "XM8", "XM70"],
                    correcta: "XM8"
                },
                {
                    incompleta: "SPAS...",
                    opciones: ["SPAS-9", "SPAS-12", "SPAS-11", "SPAS-14"],
                    correcta: "SPAS-12"
                },
                {
                    incompleta: "AK...",
                    opciones: ["AK74", "AK98", "AK47", "AKS9"],
                    correcta: "AK47"
                },
                {
                    incompleta: "SCAR...",
                    opciones: ["SCAR-M", "SCAR-H", "SCAR-R", "SCAR-V"],
                    correcta: "SCAR-H"
                }
            ];

            const armaSeleccionada = armas[Math.floor(Math.random() * armas.length)];
            const respuesta = await Swal.fire({
                title: `Completa: ${armaSeleccionada.incompleta}`,
                input: "radio",
                inputOptions: armaSeleccionada.opciones.reduce((acc, opcion, index) => {
                    acc[index] = opcion;
                    return acc;
                }, {}),
                inputValidator: (value) => {
                    if (!value) {
                        return "Debes seleccionar una opción.";
                    }
                }
            });

            if (armaSeleccionada.opciones[respuesta.value] === armaSeleccionada.correcta) {
                return true;
            } else {
                return false;
            }
        }
    },
    {
        descripcion: "Orden de prioridad",
        ejecutar: async () => {
            const situaciones = [
                {
                    situacion: "Tienes poca vida, enemigo cerca, y una pared gloo en el inventario.",
                    opciones: ["Correr sin parar", "Disparar a ciegas", "Colocar pared y curarte", "Agacharte y esperar"],
                    correcta: "Colocar pared y curarte"
                },
                {
                    situacion: "Acabas de matar a un escuadrón y estás en campo abierto.",
                    opciones: ["Lootear todo de inmediato", "Revisar que no haya más enemigos primero", "Llamar a tu dúo", "Bailar y gritar 'BOOYAH'"],
                    correcta: "Revisar que no haya más enemigos primero"
                },
                {
                    situacion: "Encuentras una mochila nivel 3, pero ya tienes una mochila nivel 2 con muchos recursos.",
                    opciones: ["Cambiarla", "Dejarla", "Destruirla", "Cambiarla solo si está llena"],
                    correcta: "Cambiarla"
                },
                {
                    situacion: "Quedan 10 vivos, estás en buena zona y tienes francotirador.",
                    opciones: ["Esperar en zona y cubrirte", "Buscar enemigos sin pensar", "Cambiar a SMG", "Tirarte granadas por diversión"],
                    correcta: "Esperar en zona y cubrirte"
                },
                {
                    situacion: "Te caes de una montaña y tu vida queda en rojo.",
                    opciones: ["Usar botiquín rápido", "Seguir corriendo", "Buscar enemigos", "Lanzarte a morir"],
                    correcta: "Usar botiquín rápido"
                }
            ];

            // Seleccionar una situación aleatoria
            const situacionSeleccionada = situaciones[Math.floor(Math.random() * situaciones.length)];

            // Mostrar la situación y opciones al usuario
            const respuesta = await Swal.fire({
                title: situacionSeleccionada.situacion,
                input: "radio",
                inputOptions: situacionSeleccionada.opciones.reduce((acc, opcion, index) => {
                    acc[index] = opcion;
                    return acc;
                }, {}),
                inputValidator: (value) => {
                    if (!value) {
                        return "Debes seleccionar una opción.";
                    }
                }
            });

            // Verificar si la respuesta es correcta
            if (situacionSeleccionada.opciones[respuesta.value] === situacionSeleccionada.correcta) {
                return true; // Respuesta correcta
            } else {
                return false; // Respuesta incorrecta
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
                    // Si es el último desafío, mostrar mensaje de éxito y redirigir al siguiente nivel
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