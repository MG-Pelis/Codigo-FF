import { auth, db } from "./Firebase.js";
import { doc, getDoc, collection, deleteDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Verificar si el usuario es administrador
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = doc(db, "Usuarios", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().rol === "Admin") {
            document.getElementById("welcome-message").textContent = `Bienvenido, ${userSnap.data().nombre}`;
            document.getElementById("admin-content").style.display = "block";
        } else {
            Swal.fire({
                title: "Acceso Denegado",
                text: "Esta web es solo para administradores.",
                icon: "error",
                confirmButtonText: "Ir al Juego"
            }).then(() => {
                window.location.href = "juego.html";
            });
        }
    } else {
        Swal.fire({
            title: "No Autenticado",
            text: "Debes iniciar sesión para acceder a esta página.",
            icon: "warning",
            confirmButtonText: "Ir al Juego"
        }).then(() => {
            window.location.href = "juego.html";
        });
    }
});

// Manejar el botón de "Comprobar"
document.getElementById("comprobar-btn").addEventListener("click", comprobarCodigo);

// Comprobar la validez del código
async function comprobarCodigo() {
    const codigoIngresado = document.getElementById("codigo-input").value.trim();
    const resultadoDiv = document.getElementById("resultado");
    resultadoDiv.innerHTML = "";

    if (!codigoIngresado) {
        Swal.fire({
            title: "Código Vacío",
            text: "Por favor, ingresa un código.",
            icon: "warning",
            confirmButtonText: "Entendido"
        });
        return;
    }

    try {
        // Obtener el único documento dentro de la colección CodeFF
        const codeCollection = collection(db, "CodeFF");
        const codeDocs = await getDocs(codeCollection);

        if (codeDocs.empty) {
            Swal.fire({
                title: "Sin Códigos",
                text: "No hay códigos registrados en la base de datos.",
                icon: "info",
                confirmButtonText: "Entendido"
            });
            return;
        }

        let codigoValido = false;
        let codigoData = null;
        let codigoDocId = null;

        // Iterar sobre los documentos (aunque solo debería haber uno)
        codeDocs.forEach((docSnap) => {
            codigoData = docSnap.data();
            codigoDocId = docSnap.id;

            if (codigoData.codigo === codigoIngresado) {
                codigoValido = true;
            }
        });

        if (!codigoValido) {
            Swal.fire({
                title: "Código Inválido",
                text: "El código ingresado no coincide con el registrado.",
                icon: "error",
                confirmButtonText: "Entendido"
            });
            return;
        }

        const fechaCreacion = new Date(codigoData.fecha);
        const ahora = new Date();
        const diferenciaHoras = (ahora - fechaCreacion) / (1000 * 60 * 60); // Diferencia en horas

        if (diferenciaHoras > 24) {
            Swal.fire({
                title: "Código Expirado",
                text: "El código ya ha expirado. ¿Deseas eliminarlo?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Eliminar Código",
                cancelButtonText: "Cancelar"
            }).then(async (result) => {
                if (result.isConfirmed) {
                    // Eliminar el código expirado
                    await deleteDoc(doc(db, "CodeFF", codigoDocId));
                    Swal.fire({
                        title: "Código Eliminado",
                        text: "El código expirado ha sido eliminado correctamente.",
                        icon: "success",
                        confirmButtonText: "Entendido"
                    });
                }
            });
            return;
        }

        // Código válido y no expirado, mostrar datos
        const userRef = doc(db, "Usuarios", codigoData.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            resultadoDiv.innerHTML = `
                <div class="profile">
                    <img src="${userData.fotoPerfil || 'https://via.placeholder.com/100'}" alt="Foto de perfil">
                    <p><strong>Nombre:</strong> ${userData.nombre}</p>
                    <p><strong>Correo:</strong> ${userData.correo}</p>
                    <p><strong>Código:</strong> ${codigoIngresado}</p>
                    <p><strong>Fecha de Generación:</strong> ${fechaCreacion.toLocaleString()}</p>
                </div>
            `;
            Swal.fire({
                title: "Código Válido",
                text: "El código es válido y pertenece al usuario mostrado abajo.",
                icon: "success",
                confirmButtonText: "Entendido"
            });
        } else {
            Swal.fire({
                title: "Usuario No Encontrado",
                text: "No se encontraron datos del usuario asociado al código.",
                icon: "error",
                confirmButtonText: "Entendido"
            });
        }
    } catch (error) {
        console.error("Error al comprobar el código:", error);
        Swal.fire({
            title: "Error",
            text: "Hubo un error al comprobar el código. Intenta nuevamente.",
            icon: "error",
            confirmButtonText: "Entendido"
        });
    }
}