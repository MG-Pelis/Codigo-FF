import { 
    cargarProgreso, 
    reducirIntentos, 
    obtenerFraseExito, 
    obtenerFraseFracaso 
} from "./authUtils.js";
import { ejecutarDesafio1 } from "./desafio1.js";
import { ejecutarDesafio2 } from "./desafio2.js";
import { ejecutarDesafio3 } from "./desafio3.js";
import { ejecutarDesafio4 } from "./desafio4.js";
import { generarCodigoUnico } from "./codigoUnico.js";
import { doc, getDoc, setDoc, collection } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { auth, db } from "./Firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

let desafioActual = 1;
let nombreJugador = ""; // Nombre del jugador
let uidJugador = ""; // UID del jugador

// Contenedor con los títulos y descripciones de cada desafío
const desafiosInfo = {
    1: {
        titulo: "Desafío 1: Emoji Camuflado",
        descripcion: "Encuentra el emoji diferente antes de que se acabe el tiempo 5 segundos."
    },
    2: {
        titulo: "Desafío 2: Pregunta Confusa",
        descripcion: "Responde correctamente las preguntas sobre Free fire en menos de 10 segundos."
    },
    3: {
        titulo: "Desafío 3: Combo Reactivo",
        descripcion: "Escribe 5 frases seguidas correctamente antes de que se acabe el tiempo 8 segundos por frase."
    },
    4: {
        titulo: "Desafío 4: Suma del Élite",
        descripcion: "Calcula la suma alfabética de las letras de la palabra."
    }
};

// Mostrar el título y la descripción del desafío
function mostrarDesafio(titulo, descripcion) {
    const tituloElemento = document.getElementById("desafio-titulo");
    const descripcionElemento = document.getElementById("desafio-descripcion");
    tituloElemento.textContent = titulo;
    descripcionElemento.textContent = descripcion;
    descripcionElemento.classList.remove("ocul"); // Mostrar la descripción
}

// Limpiar el contenedor de los desafíos y mostrar el botón de inicio
function reiniciarNivel() {
    const contenedor = document.getElementById("desafio-contenido");
    contenedor.innerHTML = ""; // Limpiar el contenido del desafío
    const botonInicio = document.getElementById("boton-inicio");
    botonInicio.classList.remove("ocul"); // Mostrar el botón de inicio
    const descripcionElemento = document.getElementById("desafio-descripcion");
    descripcionElemento.classList.remove("ocul"); // Mostrar la descripción
}

// Ocultar el botón de inicio
function ocultarBotonInicio() {
    const botonInicio = document.getElementById("boton-inicio");
    botonInicio.classList.add("ocul"); // Ocultar el botón de inicio
}

// Mostrar mensaje de éxito o fracaso sin botón
function mostrarMensajeTemporal(titulo, mensaje, tipo) {
    Swal.fire({
        title: titulo,
        text: mensaje,
        icon: tipo,
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true
    });
}

// Ejecutar el desafío actual
async function ejecutarDesafio() {
    try {
        const contenedor = document.getElementById("desafio-contenido");
        contenedor.innerHTML = ""; // Limpiar el contenedor antes de cargar el desafío

        let resultado;
        switch (desafioActual) {
            case 1:
                resultado = await ejecutarDesafio1(contenedor);
                break;
            case 2:
                resultado = await ejecutarDesafio2(contenedor);
                break;
            case 3:
                resultado = await ejecutarDesafio3(contenedor);
                break;
            case 4:
                resultado = await ejecutarDesafio4(contenedor);
                break;
            default:
                console.error("Desafío no válido");
                return;
        }

                // Procesar el resultado del desafío
        if (resultado.exito) {
            if (desafioActual === 4) {
                // Lógica especial para el desafío 4
                const mgValor = await verificarYActualizarMG(); // Verificar y actualizar el valor MG
        
                if (mgValor === 1) {
                    // Es el primero en superar el nivel
                    Swal.fire({
                        title: "¡Felicidades!",
                        text: "¡Eres el primero en superar este nivel!",
                        icon: "success",
                        confirmButtonText: "Generar Código"
                    }).then(async () => {
                        // Obtener el UID del usuario actual
                        const user = auth.currentUser;
                        if (user) {
                            const uid = user.uid;
                            generarCodigoUnico(uid, mgValor); // Generar el código único
                        } else {
                            console.error("No se encontró un usuario autenticado.");
                        }
                    });
                } else {
                    // No es el primero, mostrar su posición
                    Swal.fire({
                        title: "¡Bien hecho!",
                        text: `No fuiste el primero, pero ¡felicidades! Eres el número ${mgValor} en superar este nivel.`,
                        icon: "info",
                        confirmButtonText: "Aceptar"
                    });
                }
            } else {
                mostrarMensajeTemporal("¡Correcto!", obtenerFraseExito(), "success");
                desafioActual++;
                reiniciarNivel();
            }
        } else {
            if (desafioActual === 4) {
                mostrarMensajeTemporal(
                    `¡Incorrecto, ${nombreJugador}! Fallaste en: ${resultado.motivo}`,
                    "error"
                );
                reiniciarNivel();
            } else {
                mostrarMensajeTemporal("¡Incorrecto!", obtenerFraseFracaso(), "error");
                reiniciarNivel();
            }
            await reducirIntentos();
        }
    } catch (error) {
        console.error("Error al ejecutar el desafío:", error);
        mostrarMensajeTemporal("Ocurrió un error inesperado. Intenta nuevamente.", "error");
        reiniciarNivel();
    }
}

async function verificarYActualizarMG() {
    return new Promise((resolve, reject) => {
        // Asegurarse de obtener el usuario autenticado
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                reject("No se encontró un usuario autenticado.");
                return;
            }

            try {
                // Ruta a la subcolección Progreso/Desafio
                const progresoRef = doc(db, "Usuarios", user.uid, "Progreso", "desafio");

                // Obtener el documento actual
                const docSnap = await getDoc(progresoRef);

                let mgValor = 1; // Por defecto, el jugador es el primero
                if (docSnap.exists() && docSnap.data().MG) {
                    mgValor = docSnap.data().MG + 1; // Incrementar el valor MG
                }

                // Actualizar el documento con el nuevo valor de MG y la fecha de superación
                await setDoc(
                    progresoRef,
                    {
                        MG: mgValor,
                        fechaSuperacion: new Date().toISOString()
                    },
                    { merge: true } // Combinar con los datos existentes
                );

                resolve(mgValor); // Devolver el valor actualizado
            } catch (error) {
                console.error("Error al verificar y actualizar el valor MG en Firebase:", error);
                reject("No se pudo verificar y actualizar el progreso.");
            }
        });
    });
}

// Función para detectar en tiempo real si el usuario está en el nivel 4, desafío 4
async function detectarProgresoEnTiempoReal() {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            console.error("No se encontró un usuario autenticado.");
            return;
        }

        try {
            // Ruta a la subcolección Progreso/Desafio
            const progresoRef = doc(db, "Usuarios", user.uid, "Progreso", "desafio");
            const docSnap = await getDoc(progresoRef);

            if (docSnap.exists()) {
                const progreso = docSnap.data();

                // Verificar si está en el nivel 4, desafío 4 y tiene MG igual a 1
                if (progreso.nivel === 4 && progreso.desafio === 4 && progreso.MG === 1) {
                    const botonContinuar = document.getElementById("boton-inicio");
                    if (botonContinuar) {
                        // Cambiar el texto del botón a "Generar Código"
                        botonContinuar.textContent = "Generar Código";

                        // Agregar evento para generar el código
                        botonContinuar.addEventListener("click", async () => {
                            generarCodigoUnico(user.uid, progreso.MG);
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Error al verificar el progreso en tiempo real:", error);
        }
    });
}

// Inicializar el nivel
async function iniciarNivel() {
    try {
        const { intentosRestantes, nivelActual, desafioActual: desafioInicial, nombreUsuario, uid } = await cargarProgreso(4);
        desafioActual = desafioInicial;
        nombreJugador = nombreUsuario; // Guardar el nombre del jugador
        uidJugador = uid; // Guardar el UID del jugador

        document.getElementById("boton-inicio").addEventListener("click", () => {
            const { titulo, descripcion } = desafiosInfo[desafioActual];

            if (desafioActual === 4) {
                // Mostrar mensaje introductorio para el desafío 4
                Swal.fire({
                    title: "Desafío Final",
                    html: `
                        <p>Aquí se pone a prueba tu memoria, lógica y velocidad.</p>
                        <p>Primero verás una palabra durante 1 segundo. Luego, tendrás que:</p>
                        <ul style="text-align: left;">
                            <li>Decir qué número representa cada letra, según su posición en el abecedario (A=1, B=2, ..., Z=26).</li>
                            <li>Sumar todos los valores.</li>
                            <li>Recordar la palabra exacta que viste al inicio.</li>
                        </ul>
                        <p>Todo se evalúa al final. No sabrás si vas bien hasta terminar.</p>
                        <p>¿Listo para demostrar que eres Élite de verdad?</p>
                    `,
                    icon: "info",
                    showCancelButton: true,
                    confirmButtonText: "Continuar",
                    cancelButtonText: "Cancelar"
                }).then((result) => {
                    if (result.isConfirmed) {
                        ocultarBotonInicio(); // Ocultar el botón de inicio
                        mostrarDesafio(titulo, descripcion);
                        ejecutarDesafio();
                    }
                });
            } else {
                Swal.fire({
                    title: titulo,
                    text: descripcion,
                    icon: "info",
                    showCancelButton: true,
                    confirmButtonText: "Continuar",
                    cancelButtonText: "Cancelar"
                }).then((result) => {
                    if (result.isConfirmed) {
                        ocultarBotonInicio(); // Ocultar el botón de inicio
                        mostrarDesafio(titulo, descripcion);
                        ejecutarDesafio();
                    }
                });
            }
        });

        const { titulo, descripcion } = desafiosInfo[desafioActual];
        mostrarDesafio(titulo, descripcion);

        // Llamar a la función para detectar el progreso en tiempo real
        detectarProgresoEnTiempoReal();
    } catch (error) {
        console.error("Error al iniciar el nivel:", error);
        mostrarMensajeTemporal("No se pudo cargar el nivel. Intenta nuevamente.", "error");
    }
}

// Ejecutar el nivel al cargar la página
document.addEventListener("DOMContentLoaded", iniciarNivel);