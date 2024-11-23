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

// Función para verificar si el usuario autenticado es administrador
async function isAdmin(user) {
  try {
    const userDoc = await db.collection("adminUsers").doc(user.uid).get();
    return userDoc.exists && userDoc.data().role === "admin";
  } catch (error) {
    console.error("Error al verificar el rol de administrador:", error);
    return false;
  }
}

// Manejar el evento de envío del formulario
const tutorialForm = document.getElementById("courseForm");

tutorialForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    // Validar si el usuario está autenticado
    const user = auth.currentUser;
    if (!user) {
      alert("No estás autenticado. Por favor, inicia sesión.");
      return;
    }

    // Verificar si el usuario es administrador
    const isUserAdmin = await isAdmin(user);
    if (!isUserAdmin) {
      alert("No tienes permisos para agregar tutoriales.");
      return;
    }

    // Obtener los valores del formulario
    const name = document.getElementById("name").value.trim();
    const addedDate = document.getElementById("addedDate").value.trim();
    const duration = document.getElementById("duration").value.trim();
    const posterUrl = document.getElementById("posterUrl").value.trim();
    const videoUrl = document.getElementById("videoUrl").value.trim();

    // Validar los campos
    if (!name || !addedDate || !duration || !posterUrl || !videoUrl) {
      alert("Por favor, completa todos los campos del formulario.");
      return;
    }

    // Convertir la fecha a Timestamp
    const timestamp = firebase.firestore.Timestamp.fromDate(new Date(addedDate));

    // Agregar o actualizar documento en la colección "cursos"
    await db.collection("cursos").doc(name).set(
      {
        addedDate: timestamp,
        duration: duration,
        name: name,
        posterUrl: posterUrl,
        videoUrl: videoUrl,
      },
      { merge: true } // Actualiza si el documento ya existe
    );

    // Mostrar mensaje de éxito
    alert("Curso agregado con éxito.");
    tutorialForm.reset(); // Limpiar el formulario
  } catch (error) {
    console.error("Error al agregar el tutorial:", error);
    alert("Error al agregar el curso. Verifica la consola para más detalles.");
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
