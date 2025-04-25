import { db } from "./Firebase.js"; // Importar la configuración de Firebase
import { doc, getDoc, setDoc, deleteDoc, collection } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

export async function generarCodigoUnico(uid, mgValor) {
    try {
        // Verificar si el usuario ya tiene un código existente
        const codeRef = doc(collection(db, "CodeFF"), uid);
        const codeSnap = await getDoc(codeRef);

        if (codeSnap.exists()) {
            const codigoExistente = codeSnap.data();
            const fechaCreacion = new Date(codigoExistente.fecha);
            const ahora = new Date();
            const diferenciaHoras = (ahora - fechaCreacion) / (1000 * 60 * 60); // Diferencia en horas

            if (diferenciaHoras < 24) {
                // Código no expirado
                Swal.fire({
                    title: "Código Activo",
                    html: `
                        <p>Ya tienes un código activo:</p>
                        <p><strong>${codigoExistente.codigo}</strong></p>
                        <p>No puedes generar un nuevo código hasta que expire el actual.</p>
                    `,
                    icon: "info",
                    showCancelButton: false,
                    confirmButtonText: "Abrir WhatsApp"
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Abrir WhatsApp con el mensaje predefinido
                        const numero = "573168060939"; // Número de WhatsApp en formato internacional
                        const mensaje = `Wenas, he logrado superar la web y aquí está el código que me dio para reclamar la cuenta de Free Fire: ${codigoExistente.codigo}`;
                        const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
                        window.open(url, "_blank"); // Abrir en una nueva pestaña
                    }
                });
                return;
            } else {
                // Código expirado
                Swal.fire({
                    title: "Código Expirado",
                    text: "El código ha expirado. No puedes reclamar la cuenta con este código.",
                    icon: "error",
                    confirmButtonText: "Entendido"
                });

                // Eliminar el código expirado
                await deleteDoc(codeRef);

                // Verificar si el usuario puede generar un nuevo código
                const progresoRef = doc(db, "Usuarios", uid, "Progreso", "desafio");
                const progresoSnap = await getDoc(progresoRef);

                if (progresoSnap.exists() && progresoSnap.data().MG === mgValor) {
                    // Permitir generar un nuevo código
                    Swal.fire({
                        title: "Generar Nuevo Código",
                        text: "Tu progreso te permite generar un nuevo código. ¿Deseas continuar?",
                        icon: "question",
                        showCancelButton: true,
                        confirmButtonText: "Sí, generar",
                        cancelButtonText: "Cancelar"
                    }).then((result) => {
                        if (result.isConfirmed) {
                            mostrarOpcionesDeCodigo(uid, mgValor);
                        }
                    });
                } else {
                    Swal.fire({
                        title: "Progreso Insuficiente",
                        text: "No cumples con los requisitos para generar un nuevo código.",
                        icon: "error",
                        confirmButtonText: "Entendido"
                    });
                }
                return;
            }
        }

        // Si no existe un código previo, permitir generar uno nuevo
        mostrarOpcionesDeCodigo(uid, mgValor);
    } catch (error) {
        console.error("Error al verificar o generar el código:", error);
        Swal.fire({
            title: "Error",
            text: "Hubo un problema al verificar o generar tu código. Intenta nuevamente.",
            icon: "error",
            confirmButtonText: "Entendido"
        });
    }
}

// Mostrar opciones para generar un código
async function mostrarOpcionesDeCodigo(uid, mgValor) {
    Swal.fire({
        title: "Generar Código Único",
        text: "¿Cómo deseas generar tu código?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Código Personalizado",
        cancelButtonText: "Código Automático"
    }).then(async (result) => {
        if (result.isConfirmed) {
            // Código Personalizado
            generarCodigoPersonalizado(uid);
        } else {
            // Código Automático
            generarCodigoAutomatico(uid);
        }
    });
}

// Función para generar un código personalizado
async function generarCodigoPersonalizado(uid) {
    Swal.fire({
        title: "Código Personalizado",
        input: "text",
        inputPlaceholder: "Ingresa un código de hasta 16 caracteres",
        inputAttributes: {
            maxlength: 16,
            autocapitalize: "characters",
            autocorrect: "off"
        },
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
        preConfirm: (codigo) => {
            if (!codigo || codigo.length > 16) {
                Swal.showValidationMessage("El código debe tener un máximo de 16 caracteres.");
                return false;
            }
            return codigo.toUpperCase();
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            const codigo = result.value;
            await subirCodigoABaseDeDatos(uid, codigo);
        }
    });
}

// Función para generar un código automático
async function generarCodigoAutomatico(uid) {
    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let codigo = "";
    for (let i = 0; i < 16; i++) {
        if (i > 0 && i % 4 === 0) {
            codigo += "-"; // Agregar guión cada 4 caracteres
        }
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }

    Swal.fire({
        title: "Código Generado",
        text: `Tu código es: ${codigo}`,
        icon: "success",
        confirmButtonText: "Subir Código"
    }).then(async () => {
        await subirCodigoABaseDeDatos(uid, codigo);
    });
}

// Función para subir el código a la base de datos
async function subirCodigoABaseDeDatos(uid, codigo) {
    try {
        Swal.fire({
            title: "Cargando...",
            text: "Subiendo tu código a la base de datos.",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Crear o actualizar el documento en la colección "CodeFF"
        const codeRef = doc(collection(db, "CodeFF"), uid);
        await setDoc(codeRef, {
            uid: uid,
            codigo: codigo,
            fecha: new Date().toISOString()
        });

        // Mostrar mensaje de éxito con opciones para ir a inicio o WhatsApp
        Swal.fire({
            title: "¡Éxito!",
            html: `
                <p>¡Código subido exitosamente! Tu código es:</p>
                <p><strong>${codigo}</strong></p>
                <p>Envíalo a WhatsApp al número +57 316 8060939 para reclamar tu cuenta.</p>
            `,
            icon: "success",
            showCancelButton: false,
            confirmButtonText: "Abrir WhatsApp"
        }).then((result) => {
            if (result.isConfirmed) {
                // Abrir WhatsApp con el mensaje predefinido
                const numero = "573168060939"; // Número de WhatsApp en formato internacional
                const mensaje = `Wenas, he logrado superar la web y aquí está el código que me dio para reclamar la cuenta de Free Fire: ${codigo}`;
                const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
                window.open(url, "_blank"); // Abrir en una nueva pestaña
            }
        });
    } catch (error) {
        console.error("Error al subir el código:", error);
        Swal.fire({
            title: "Error",
            text: "Hubo un problema al subir tu código. Intenta nuevamente.",
            icon: "error",
            confirmButtonText: "Entendido"
        });
    }
}