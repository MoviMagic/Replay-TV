import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, Timestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Verificar si el usuario está autenticado
let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    console.log("Usuario autenticado:", user.email);
  } else {
    alert("Debe iniciar sesión para poder agregar una película.");
    window.location.href = 'login.html'; // Cambia a la ruta de tu página de inicio de sesión
  }
});

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
  const movieForm = document.getElementById('movie-form');
  const verifyButton = document.getElementById('verify-movie-btn');
  const refreshButton = document.getElementById('refresh-page-btn');

  // Función para manejar la creación de la película
  movieForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Verificar si el usuario está autenticado antes de continuar
    if (!currentUser) {
      alert("Debe iniciar sesión para agregar una película.");
      return;
    }

    // Obtener los valores del formulario
    const documentIdInput = document.getElementById('documentId').value.trim();
    const title = document.getElementById('title').value.trim();
    const tmdbId = document.getElementById('tmdbId').value.trim();
    const videoUrl = document.getElementById('videoUrl').value.trim();
    const addedDateValue = document.getElementById('addedDate').value;

    // Convertir la fecha de adición a un objeto Timestamp
    const addedDate = Timestamp.fromDate(new Date(addedDateValue));

    // Obtener las categorías seleccionadas
    const categoriesSelect = document.getElementById('categories');
    const selectedCategories = Array.from(categoriesSelect.selectedOptions).map(option => option.value);

    try {
      // Crear el ID del documento usando el valor proporcionado o generarlo automáticamente
      const documentId = documentIdInput || `${tmdbId}-${title.replace(/\s+/g, '-').toLowerCase()}`;

      // Agregar o actualizar el documento a Firestore
      await setDoc(doc(db, 'movies', documentId), {
        title: title,
        tmdbId: tmdbId,
        videoUrl: videoUrl,
        categories: selectedCategories,
        addedDate: addedDate // Timestamp
      }, { merge: true });

      // Mostrar mensaje de éxito
      document.getElementById('message').innerText = "Película agregada o actualizada exitosamente";
    } catch (error) {
      document.getElementById('message').innerText = "Error al agregar la película: " + error.message;
    }
  });

  // Función para verificar si la película ya está en Firestore
  verifyButton.addEventListener('click', async () => {
    const documentId = document.getElementById('documentId').value.trim();
    if (!documentId) {
      alert("Por favor ingrese el ID del documento para verificar.");
      return;
    }

    try {
      const docRef = doc(db, 'movies', documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById('title').value = data.title || '';
        document.getElementById('tmdbId').value = data.tmdbId || '';
        document.getElementById('videoUrl').value = data.videoUrl || '';
        const addedDate = data.addedDate.toDate().toISOString().split('T')[0];
        document.getElementById('addedDate').value = addedDate;

        const categoriesSelect = document.getElementById('categories');
        Array.from(categoriesSelect.options).forEach(option => {
          option.selected = data.categories.includes(option.value);
        });

        document.getElementById('message').innerText = "La película ya está agregada. Puedes actualizarla.";
      } else {
        document.getElementById('message').innerText = "La película no está en Firestore. Puedes agregarla.";
      }
    } catch (error) {
      document.getElementById('message').innerText = "Error al verificar la película: " + error.message;
    }
  });

  // Botón para actualizar la página
  refreshButton.addEventListener('click', () => {
    location.reload();
  });
});
