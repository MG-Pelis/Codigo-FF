export async function ejecutarDesafio3(contenedor) {
    return new Promise((resolve) => {
        contenedor.innerHTML = ""; // Limpiar contenido previo

        // Ocultar la descripción del desafío
        const descripcionElemento = document.getElementById("desafio-descripcion");
        descripcionElemento.classList.add("ocul"); // Agregar la clase 'ocul' para ocultar

        // Mostrar la barra de tiempo
        const barraTiempoContainer = document.getElementById("barra-tiempo-container");
        const barraTiempo = document.getElementById("barra-tiempo");
        barraTiempoContainer.classList.remove("ocul"); // Mostrar la barra de tiempo
        barraTiempo.style.width = "100%"; // Reiniciar la barra de tiempo

        // Lista de frases
        const frasesFF = [
            "Booyah es la meta",
            "La MP40 revienta",
            "Usa pared gloo rápido",
            "Free Fire no perdona",
            "Kelly es velocidad pura",
            "El M1887 no tiene compasión",
            "Sin mochila no hay loot",
            "Cae en Clock si te atreves",
            "Zona azul, zona de muerte",
            "Cúrate antes del rush",
            "Doble vector, doble dolor",
            "Shani arregla todo",
            "No corras, dispara",
            "El UAV revela tu alma",
            "Un camper, mil problemas",
            "Clasificatoria no es casual",
            "Granada en mano, victoria cercana",
            "Usa a Wukong con cabeza fría",
            "El ping decide partidas",
            "Zona segura es solo un mito"
        ];

        // Seleccionar 5 frases aleatorias
        const frasesSeleccionadas = frasesFF.sort(() => Math.random() - 0.5).slice(0, 5);

        // Crear el contenedor de la frase
        const contenedorFrase = document.createElement("div");
        contenedorFrase.id = "contenedor-frase";

        // Crear el texto de la frase
        const textoFrase = document.createElement("p");
        textoFrase.id = "texto-frase";

        // Crear el input para la respuesta
        const inputRespuesta = document.createElement("input");
        inputRespuesta.id = "input-respuesta";
        inputRespuesta.type = "text";
        inputRespuesta.placeholder = "Escribe la frase exacta aquí";

        // Agregar los elementos al contenedor
        contenedorFrase.appendChild(textoFrase);
        contenedorFrase.appendChild(inputRespuesta);
        contenedor.appendChild(contenedorFrase);

        let fraseActual = 0; // Índice de la frase actual
        let tiempoRestante = 8; // Tiempo por frase
        let temporizador;

        // Función para normalizar texto (eliminar tildes)
        function normalizarTexto(texto) {
            return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Elimina tildes
        }

        // Función para mostrar la siguiente frase
        function mostrarSiguienteFrase() {
            if (fraseActual >= frasesSeleccionadas.length) {
                clearInterval(temporizador); // Detener el temporizador
                barraTiempoContainer.classList.add("ocul"); // Ocultar la barra de tiempo
                limpiarDesafio(contenedor); // Limpiar el contenedor
                resolve({ exito: true, motivo: "exito" }); // Éxito al completar todas las frases
                return;
            }

            // Mostrar la frase actual
            textoFrase.textContent = frasesSeleccionadas[fraseActual];
            inputRespuesta.value = ""; // Limpiar el input
            tiempoRestante = 8; // Reiniciar el tiempo
            barraTiempo.style.width = "100%"; // Reiniciar la barra de tiempo
        }

        // Manejar la respuesta del jugador
        inputRespuesta.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                const respuestaJugador = normalizarTexto(inputRespuesta.value.trim());
                const fraseCorrecta = normalizarTexto(frasesSeleccionadas[fraseActual]);
                if (respuestaJugador === fraseCorrecta) {
                    fraseActual++; // Pasar a la siguiente frase
                    mostrarSiguienteFrase();
                } else {
                    clearInterval(temporizador); // Detener el temporizador
                    barraTiempoContainer.classList.add("ocul"); // Ocultar la barra de tiempo
                    limpiarDesafio(contenedor); // Limpiar el contenedor
                    resolve({ exito: false, motivo: "error" }); // Fallo por respuesta incorrecta
                }
            }
        });

        // Temporizador para cada frase
        temporizador = setInterval(() => {
            tiempoRestante--;
            const porcentaje = (tiempoRestante / 8) * 100;
            barraTiempo.style.width = `${porcentaje}%`; // Actualizar la barra de tiempo

            if (tiempoRestante <= 0) {
                clearInterval(temporizador); // Detener el temporizador
                barraTiempoContainer.classList.add("ocul"); // Ocultar la barra de tiempo
                limpiarDesafio(contenedor); // Limpiar el contenedor
                resolve({ exito: false, motivo: "tiempo" }); // Fallo por tiempo agotado
            }
        }, 1000);

        // Mostrar la primera frase
        mostrarSiguienteFrase();
    });
}

// Función para limpiar el contenedor del desafío
function limpiarDesafio(contenedor) {
    contenedor.innerHTML = ""; // Limpiar el contenido del contenedor
}