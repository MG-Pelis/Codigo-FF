export async function ejecutarDesafio4(contenedor) {
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

        // Lista de palabras
        const palabrasEliteFF = [
            "ALOK", "KELLY", "HAYATO", "M1887", "MP40", "SKS", "KLA", "CAROLINE", "DJALOK",
            "JOTA", "CHRONO", "LUQUETA", "THIVA", "M14", "AWM", "SCAR", "FAMAS", "RAFAEL",
            "DIMITRI", "STEFFIE"
        ];

        // Valores alfabéticos predefinidos
        const alphabetValues = {
            A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9, J: 10,
            K: 11, L: 12, M: 13, N: 14, O: 15, P: 16, Q: 17, R: 18, S: 19,
            T: 20, U: 21, V: 22, W: 23, X: 24, Y: 25, Z: 26
        };

        // Seleccionar una palabra aleatoria
        const palabraSeleccionada = palabrasEliteFF[Math.floor(Math.random() * palabrasEliteFF.length)];

        // Mostrar la palabra clave durante 1 segundo
        const contenedorPalabra = document.createElement("div");
        contenedorPalabra.id = "contenedor-palabra";
        contenedorPalabra.textContent = palabraSeleccionada;
        contenedor.appendChild(contenedorPalabra);

        setTimeout(() => {
            contenedorPalabra.remove(); // Ocultar la palabra después de 1 segundo

            // Fase 2: Preguntar por cada letra
            let sumaTotal = 0;
            let letraActual = 0;

            function preguntarPorLetra() {
                if (letraActual >= palabraSeleccionada.length) {
                    preguntarSumaTotal(); // Pasar a la siguiente fase
                    return;
                }

                const letra = palabraSeleccionada[letraActual].toUpperCase();
                const valorLetra = alphabetValues[letra] || 0; // Obtener el valor de la letra
                sumaTotal += valorLetra;

                const contenedorPregunta = document.createElement("div");
                contenedorPregunta.id = "contenedor-pregunta";
                contenedorPregunta.textContent = `¿Qué número representa la letra #${letraActual + 1}?`;
                contenedor.appendChild(contenedorPregunta);

                const inputRespuesta = document.createElement("input");
                inputRespuesta.id = "input-respuesta";
                inputRespuesta.type = "text";
                inputRespuesta.placeholder = "Escribe el número aquí";
                contenedorPregunta.appendChild(inputRespuesta);

                let tiempoRestante = 15; // Tiempo ajustado a 15 segundos por letra
                barraTiempo.style.width = "100%";

                const temporizador = setInterval(() => {
                    tiempoRestante--;
                    const porcentaje = (tiempoRestante / 15) * 100;
                    barraTiempo.style.width = `${porcentaje}%`;

                    if (tiempoRestante <= 0) {
                        clearInterval(temporizador);
                        barraTiempoContainer.classList.add("ocul");
                        limpiarDesafio(contenedor);
                        resolve({ exito: false, motivo: `Letra incorrecta en la posición ${letraActual + 1}` });
                    }
                }, 1000);

                inputRespuesta.addEventListener("keydown", (event) => {
                    if (event.key === "Enter") {
                        clearInterval(temporizador);
                        const respuestaJugador = parseInt(inputRespuesta.value.trim(), 10);
                        if (respuestaJugador === valorLetra) {
                            letraActual++;
                            contenedorPregunta.remove();
                            preguntarPorLetra();
                        } else {
                            barraTiempoContainer.classList.add("ocul");
                            limpiarDesafio(contenedor);
                            resolve({ exito: false, motivo: `Letra incorrecta en la posición ${letraActual + 1}` });
                        }
                    }
                });
            }

            preguntarPorLetra();

            // Fase 3: Preguntar la suma total
            function preguntarSumaTotal() {
                const contenedorPregunta = document.createElement("div");
                contenedorPregunta.id = "contenedor-pregunta";
                contenedorPregunta.textContent = "¿Cuál es la suma total de todos los valores alfabéticos?";
                contenedor.appendChild(contenedorPregunta);

                const inputRespuesta = document.createElement("input");
                inputRespuesta.id = "input-respuesta";
                inputRespuesta.type = "text";
                inputRespuesta.placeholder = "Escribe la suma aquí";
                contenedorPregunta.appendChild(inputRespuesta);

                let tiempoRestante = 20; // Tiempo ajustado a 20 segundos para la suma total
                barraTiempo.style.width = "100%";

                const temporizador = setInterval(() => {
                    tiempoRestante--;
                    const porcentaje = (tiempoRestante / 20) * 100;
                    barraTiempo.style.width = `${porcentaje}%`;

                    if (tiempoRestante <= 0) {
                        clearInterval(temporizador);
                        barraTiempoContainer.classList.add("ocul");
                        limpiarDesafio(contenedor);
                        resolve({ exito: false, motivo: "La suma total fue incorrecta" });
                    }
                }, 1000);

                inputRespuesta.addEventListener("keydown", (event) => {
                    if (event.key === "Enter") {
                        clearInterval(temporizador);
                        const respuestaJugador = parseInt(inputRespuesta.value.trim(), 10);
                        if (respuestaJugador === sumaTotal) {
                            contenedorPregunta.remove();
                            preguntarPalabraClave();
                        } else {
                            barraTiempoContainer.classList.add("ocul");
                            limpiarDesafio(contenedor);
                            resolve({ exito: false, motivo: "La suma total fue incorrecta" });
                        }
                    }
                });
            }

            // Fase 4: Preguntar la palabra clave
            function preguntarPalabraClave() {
                const contenedorPregunta = document.createElement("div");
                contenedorPregunta.id = "contenedor-pregunta";
                contenedorPregunta.textContent = "¿Cuál fue la palabra que se mostró al inicio?";
                contenedor.appendChild(contenedorPregunta);

                const inputRespuesta = document.createElement("input");
                inputRespuesta.id = "input-respuesta";
                inputRespuesta.type = "text";
                inputRespuesta.placeholder = "Escribe la palabra aquí";
                contenedorPregunta.appendChild(inputRespuesta);

                let tiempoRestante = 10; // Tiempo ajustado a 10 segundos para la palabra clave
                barraTiempo.style.width = "100%";

                const temporizador = setInterval(() => {
                    tiempoRestante--;
                    const porcentaje = (tiempoRestante / 10) * 100;
                    barraTiempo.style.width = `${porcentaje}%`;

                    if (tiempoRestante <= 0) {
                        clearInterval(temporizador);
                        barraTiempoContainer.classList.add("ocul");
                        limpiarDesafio(contenedor);
                        resolve({ exito: false, motivo: "La palabra recordada no coincide" });
                    }
                }, 1000);

                inputRespuesta.addEventListener("keydown", (event) => {
                    if (event.key === "Enter") {
                        clearInterval(temporizador);
                        const respuestaJugador = inputRespuesta.value.trim().toUpperCase();
                        if (respuestaJugador === palabraSeleccionada) {
                            barraTiempoContainer.classList.add("ocul");
                            limpiarDesafio(contenedor);
                            resolve({ exito: true, motivo: "exito" });
                        } else {
                            barraTiempoContainer.classList.add("ocul");
                            limpiarDesafio(contenedor);
                            resolve({ exito: false, motivo: "La palabra recordada no coincide" });
                        }
                    }
                });
            }
        }, 1000);
    });
}

// Función para limpiar el contenedor del desafío
function limpiarDesafio(contenedor) {
    contenedor.innerHTML = ""; // Limpiar el contenido del contenedor
}