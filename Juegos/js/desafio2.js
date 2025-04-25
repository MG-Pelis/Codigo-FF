export async function ejecutarDesafio2(contenedor) {
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

        // Lista de preguntas
        const preguntasFF = [
            { pregunta: "¿Qué personaje tiene habilidad pasiva, pero muchos creen que es activa?", respuesta: "moco" },
            { pregunta: "¿Qué arma es más rápida en daño pero menos en ráfaga: MP40 o Thompson?", respuesta: "thompson" },
            { pregunta: "¿Cuál es el vehículo más lento pero más resistente?", respuesta: "camioneta" },
            { pregunta: "¿Cuál personaje fue eliminado y luego vuelto a agregar con otro nombre?", respuesta: "shani" },
            { pregunta: "¿Qué personaje cura más, pero solo si estás quieto?", respuesta: "kapella" },
            { pregunta: "¿Qué mapa tiene la zona de 'Clock Tower'?", respuesta: "bermuda" },
            { pregunta: "¿Qué pet tiene una habilidad que no afecta en solo?", respuesta: "robo" },
            { pregunta: "¿Cuál arma parece buena por su diseño pero es de las menos usadas?", respuesta: "p90" },
            { pregunta: "¿Qué personaje revive más rápido pero no se nota en dúo?", respuesta: "olivia" },
            { pregunta: "¿Qué skin de arma cambia la animación pero no mejora nada?", respuesta: "skin azul de ump" },
            { pregunta: "¿Qué habilidad pasiva solo sirve si te quedas en zona segura?", respuesta: "rafael" },
            { pregunta: "¿Qué personaje se nerfeó tanto que ya nadie usa?", respuesta: "alok" },
            { pregunta: "¿Cuál habilidad parece inútil pero sirve en clasificatoria si sabes usarla?", respuesta: "notora" },
            { pregunta: "¿Qué personaje tiene una habilidad de velocidad que no acumula con Kelly?", respuesta: "jota" },
            { pregunta: "¿Qué mapa fue retirado temporalmente por bugs?", respuesta: "kalahari" },
            { pregunta: "¿Qué skin de pase élite dio más polémica?", respuesta: "sakura" },
            { pregunta: "¿Qué personaje se desbloquea gratis en muchos eventos?", respuesta: "wukong" },
            { pregunta: "¿Qué personaje fue el primero en tener transformación?", respuesta: "wukong" },
            { pregunta: "¿Cuál personaje puede disparar mientras corre?", respuesta: "dimitri" },
            { pregunta: "¿Qué personaje se parece a Alok pero no cura a aliados?", respuesta: "kenta" }
        ];

        // Seleccionar una pregunta aleatoria
        const preguntaSeleccionada = preguntasFF[Math.floor(Math.random() * preguntasFF.length)];

        // Crear el contenedor de la pregunta
        const contenedorPregunta = document.createElement("div");
        contenedorPregunta.id = "contenedor-pregunta";

        // Crear el texto de la pregunta
        const textoPregunta = document.createElement("p");
        textoPregunta.id = "texto-pregunta";
        textoPregunta.textContent = preguntaSeleccionada.pregunta;

        // Crear el input para la respuesta
        const inputRespuesta = document.createElement("input");
        inputRespuesta.id = "input-respuesta";
        inputRespuesta.type = "text";
        inputRespuesta.placeholder = "Escribe tu respuesta aquí";

        // Agregar los elementos al contenedor
        contenedorPregunta.appendChild(textoPregunta);
        contenedorPregunta.appendChild(inputRespuesta);
        contenedor.appendChild(contenedorPregunta);

        // Temporizador de 10 segundos
        let tiempoRestante = 10;
        const temporizador = setInterval(() => {
            tiempoRestante--;
            const porcentaje = (tiempoRestante / 10) * 100;
            barraTiempo.style.width = `${porcentaje}%`; // Actualizar la barra de tiempo

            if (tiempoRestante <= 0) {
                clearInterval(temporizador); // Detener el temporizador
                barraTiempoContainer.classList.add("ocul"); // Ocultar la barra de tiempo
                resolve({ exito: false, motivo: "tiempo" }); // Fallo por tiempo agotado
            }
        }, 1000);

        // Manejar la respuesta del jugador
        inputRespuesta.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                clearInterval(temporizador); // Detener el temporizador
                barraTiempoContainer.classList.add("ocul"); // Ocultar la barra de tiempo
                const respuestaJugador = inputRespuesta.value.trim().toLowerCase();
                if (respuestaJugador === preguntaSeleccionada.respuesta) {
                    resolve({ exito: true, motivo: "exito" }); // Respuesta correcta
                } else {
                    resolve({ exito: false, motivo: "error" }); // Respuesta incorrecta
                }
            }
        });
    });
}
