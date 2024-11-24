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

// Función para verificar si el usuario es administrador
async function isAdmin(user) {
    const userDoc = await db.collection("adminUsers").doc(user.uid).get();
    return userDoc.exists && userDoc.data().role === "admin";
}

// Manejar el evento de envío del formulario de agregar video
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

        // Verificar permisos de administrador
        const isUserAdmin = await isAdmin(user);
        if (!isUserAdmin) {
            alert("No tienes permisos para agregar videos publicitarios.");
            return;
        }

        // Obtener los valores del formulario
        const title = document.getElementById("title").value.trim();
        const videoTitle = document.getElementById("videoTitle").value.trim();
        const description = document.getElementById("description").value.trim();
        const videoUrl = document.getElementById("videoUrl").value.trim();
        const isActive = document.getElementById("isActive").value === "true";

        // Validar los campos
        if (!title || !videoTitle || !description || !videoUrl) {
            alert("Por favor, completa todos los campos del formulario.");
            return;
        }

        // Agregar documento a la colección "featuredVideos"
        await db.collection("featuredVideos").doc(title).set({
            title: title,
            videoTitle: videoTitle,
            description: description,
            videoUrl: videoUrl,
            isActive: isActive
        });

        alert("Video publicitario agregado con éxito.");
        adVideoForm.reset(); // Limpiar el formulario
    } catch (error) {
        console.error("Error al agregar el video publicitario:", error);
        alert("Error al agregar el video. Verifica la consola para más detalles.");
    }
});

// Manejar el evento de envío del formulario de eliminar video
const deleteVideoForm = document.getElementById("deleteVideoForm");

deleteVideoForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
        // Validar si el usuario está autenticado
        const user = auth.currentUser;
        if (!user) {
            alert("No estás autenticado. Por favor, inicia sesión.");
            return;
        }

        // Verificar permisos de administrador
        const isUserAdmin = await isAdmin(user);
        if (!isUserAdmin) {
            alert("No tienes permisos para eliminar videos publicitarios.");
            return;
        }

        // Obtener el título del video a eliminar
        const deleteTitle = document.getElementById("deleteTitle").value.trim();

        if (!deleteTitle) {
            alert("Por favor, ingresa el título del video publicitario.");
            return;
        }

        // Eliminar documento de la colección "featuredVideos"
        await db.collection("featuredVideos").doc(deleteTitle).delete();

        alert("Video publicitario eliminado con éxito.");
        deleteVideoForm.reset(); // Limpiar el formulario
    } catch (error) {
        console.error("Error al eliminar el video publicitario:", error);
        alert("Error al eliminar el video. Verifica la consola para más detalles.");
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
