export async function ejecutarDesafio1(contenedor) {
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

        // Configuración del desafío
        const combinaciones = [
            { base: "😄", distinto: "🙂" },
            { base: "😺", distinto: "🙀" },
            { base: "❤️", distinto: "💔" },
            { base: "🪖", distinto: "👮‍♂️" },
            { base: "✨", distinto: "🌠" }
        ];
        const seleccion = combinaciones[Math.floor(Math.random() * combinaciones.length)];
        const emojis = Array(64).fill(seleccion.base); // 64 emojis (8x8)
        const posicionDistinto = Math.floor(Math.random() * emojis.length);
        emojis[posicionDistinto] = seleccion.distinto;

        // Crear cuadrícula de emojis
        const grid = document.createElement("div");
        grid.id = "emoji-grid";
        emojis.forEach((emoji, index) => {
            const span = document.createElement("span");
            span.textContent = emoji;
            span.classList.add("emoji");
            span.addEventListener("click", () => {
                clearInterval(temporizador); // Detener el temporizador
                barraTiempoContainer.classList.add("ocul"); // Ocultar la barra de tiempo
                resolve({ exito: index === posicionDistinto, motivo: index === posicionDistinto ? "exito" : "error" });
            });
            grid.appendChild(span);
        });

        // Mostrar cuadrícula en el contenedor
        contenedor.appendChild(grid);

        // Temporizador de 10 segundos
        let tiempoRestante = 10;
        const temporizador = setInterval(() => {
            tiempoRestante--;
            const porcentaje = (tiempoRestante / 10) * 100;
            barraTiempo.style.width = `${porcentaje}%`; // Actualizar la barra de tiempo

            if (tiempoRestante <= 0) {
                clearInterval(temporizador); // Detener el temporizador
                barraTiempoContainer.classList.add("ocul"); // Ocultar la barra de tiempo
                resolve({ exito: false, motivo: "error" }); // Fallo por tiempo agotado
            }
        }, 1000);
    });
}