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
const db = firebase.firestore();

const courseForm = document.getElementById("courseForm");
const successMessage = document.getElementById("successMessage");

courseForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Obtener valores del formulario
    const name = document.getElementById("name").value.trim();
    const addedDate = document.getElementById("addedDate").value;
    const duration = document.getElementById("duration").value.trim();
    const posterUrl = document.getElementById("posterUrl").value.trim();
    const videoUrl = document.getElementById("videoUrl").value.trim();

    try {
        if (!name) {
            alert("El nombre del curso es obligatorio.");
            return;
        }

        // Convertir fecha a Timestamp
        const timestamp = addedDate ? firebase.firestore.Timestamp.fromDate(new Date(addedDate)) : null;

        if (!timestamp) {
            alert("La fecha de adición es obligatoria.");
            return;
        }

        // Agregar documento con ID personalizado
        await db.collection("cursos").doc(name).set({
            addedDate: timestamp,
            duration: duration,
            name: name,
            posterUrl: posterUrl,
            videoUrl: videoUrl
        });

        // Mostrar mensaje de éxito
        successMessage.textContent = "Curso agregado con éxito!";
        successMessage.classList.remove("hidden");
        setTimeout(() => successMessage.classList.add("hidden"), 3000);

        // Limpiar el formulario
        courseForm.reset();
    } catch (error) {
        console.error("Error al agregar el curso: ", error);
        alert("Ocurrió un error al agregar el curso. Verifica la consola para más detalles.");
    }
});
