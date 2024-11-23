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
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);

const courseForm = document.getElementById("courseForm");
const successMessage = document.getElementById("successMessage");

courseForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const addedDate = document.getElementById("addedDate").value;
    const duration = document.getElementById("duration").value;
    const posterUrl = document.getElementById("posterUrl").value;
    const videoUrl = document.getElementById("videoUrl").value;

    try {
        // Convertir la fecha seleccionada en un Timestamp de Firestore
        const timestamp = addedDate ? firebase.firestore.Timestamp.fromDate(new Date(addedDate)) : null;

        // Agregar curso a Firestore
        await db.collection("cursos").add({
            name: name,
            addedDate: timestamp,
            duration: duration,
            posterUrl: posterUrl,
            videoUrl: videoUrl
        });

        // Mostrar mensaje de éxito
        successMessage.classList.remove("hidden");
        setTimeout(() => successMessage.classList.add("hidden"), 3000);

        // Limpiar el formulario
        courseForm.reset();
    } catch (error) {
        console.error("Error al agregar el curso: ", error);
    }
});
