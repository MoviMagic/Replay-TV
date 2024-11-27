// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDnGHxXiUkm1Onblu3en-V2v5Yxk9OnFL8",
    authDomain: "replay-tv-33de1.firebaseapp.com",
    projectId: "replay-tv-33de1",
    storageBucket: "replay-tv-33de1.firebasestorage.app",
    messagingSenderId: "19557200212",
    appId: "1:19557200212:web:a9bb8b64cbd17be46758c1",
    measurementId: "G-JLFC3D8V9Y"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Manejar el evento de envío del formulario
const adVideoForm = document.getElementById("adVideoForm");

adVideoForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
        // Validar si el usuario está autenticado
        const user = auth.currentUser;
        if (!user) {
            alert("No estás autenticado. Por favor, inicia sesión.");
            return;
        }

        // Obtener los valores del formulario
        const title = document.getElementById("title").value.trim();
        const videoTitle = document.getElementById("videoTitle").value.trim();
        const videoUrl = document.getElementById("videoUrl").value.trim();
        const isActive = document.getElementById("isActive").value === "true";

        // Validar los campos
        if (!title || !videoTitle || !videoUrl) {
            alert("Por favor, completa todos los campos del formulario.");
            return;
        }

        // Agregar o actualizar el documento en la colección "featuredVideos"
        await db.collection("featuredVideos").doc(title).set({
            videoTitle: videoTitle,
            videoUrl: videoUrl,
            isActive: isActive
        }, { merge: true });

        alert("Video publicitario agregado o actualizado con éxito.");
        adVideoForm.reset(); // Limpiar el formulario
    } catch (error) {
        console.error("Error al agregar o actualizar el video publicitario:", error);
        alert("Error al procesar el video. Verifica la consola para más detalles.");
    }
});

// Escuchar cambios de autenticación
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("Usuario autenticado:", user.uid);
    } else {
        console.log("No hay un usuario autenticado. Por favor, inicia sesión.");
    }
});
