import { auth, db } from "./Firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const chatButton = document.querySelector(".chat-button");
    const chatContainer = document.getElementById("chat-container");
    const closeChat = document.getElementById("close-chat");
    const sendMessage = document.getElementById("send-message");
    const chatInput = document.getElementById("chat-input");
    const chatMessages = document.getElementById("chat-messages");

    let currentUserUID = null;
    let currentUserName = null;

    // Detectar usuario autenticado
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUserUID = user.uid; // Guardar UID del usuario autenticado
            currentUserName = user.displayName || "Usuario"; // Guardar nombre del usuario autenticado
            escucharMensajes(); // Iniciar escucha de mensajes en tiempo real
        } else {
            currentUserUID = null;
            currentUserName = null;
        }
    });

    // Mostrar el chat con animación y ocultar el botón
    chatButton.addEventListener("click", () => {
        chatContainer.style.bottom = "20px"; // Subir el chat
        chatButton.classList.add("hidden"); // Ocultar el botón
    });

    // Ocultar el chat y mostrar el botón
    closeChat.addEventListener("click", () => {
        chatContainer.style.bottom = "-100%"; // Bajar el chat
        setTimeout(() => {
            chatButton.classList.remove("hidden"); // Mostrar el botón después de la animación
        }, 500); // Coincidir con la duración de la animación del chat
    });

    // Enviar mensaje
    sendMessage.addEventListener("click", async () => {
        const message = chatInput.value.trim();
        if (!message) return; // No enviar mensajes vacíos

        if (!currentUserUID || !currentUserName) {
            alert("Debes iniciar sesión para enviar mensajes.");
            return;
        }

        try {
            // Guardar mensaje en Firestore
            await addDoc(collection(db, "chats"), {
                uid: currentUserUID,
                nombre: currentUserName, // Incluir el nombre del usuario
                mensaje: message,
                timestamp: serverTimestamp(),
            });

            chatInput.value = ""; // Limpiar el campo de entrada
        } catch (error) {
            console.error("Error al enviar el mensaje:", error);
        }
    });

    // Enviar mensaje con Enter
    chatInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            sendMessage.click();
        }
    });

    // Escuchar mensajes en tiempo real
    function escucharMensajes() {
        const mensajesQuery = query(collection(db, "chats"), orderBy("timestamp", "asc"));

        onSnapshot(mensajesQuery, (snapshot) => {
            chatMessages.innerHTML = ""; // Limpiar mensajes previos

            snapshot.forEach((doc) => {
                const data = doc.data();
                const isOwnMessage = data.uid === currentUserUID;

                // Crear elemento de mensaje
                const messageElement = document.createElement("div");
                messageElement.classList.add("chat-message", isOwnMessage ? "chat-message-sent" : "chat-message-received");

                // Agregar el nombre del remitente si no es tu mensaje
                if (!isOwnMessage) {
                    const nameElement = document.createElement("div");
                    nameElement.classList.add("chat-name");
                    nameElement.textContent = data.nombre || "Desconocido"; // Mostrar el nombre del remitente
                    messageElement.appendChild(nameElement);
                }

                // Agregar el globo de mensaje
                const bubbleElement = document.createElement("div");
                bubbleElement.classList.add("chat-bubble");
                bubbleElement.textContent = data.mensaje;

                messageElement.appendChild(bubbleElement);
                chatMessages.appendChild(messageElement);
            });

            // Desplazar hacia abajo para mostrar el último mensaje
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }
});