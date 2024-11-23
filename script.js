import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Temporizador de inactividad
let inactivityTimer;

// Reiniciar temporizador de inactividad
function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    alert("Sesión cerrada por inactividad.");
    cerrarSesion();
  }, 15 * 60 * 1000); // 15 minutos
}

// Escuchar eventos de interacción del usuario
["click", "mousemove", "keypress"].forEach((event) => {
  document.addEventListener(event, resetInactivityTimer);
});

// Función para cerrar sesión con confirmación
async function cerrarSesion() {
  const confirmLogout = confirm("¿Estás seguro de que deseas cerrar sesión?");
  if (confirmLogout) {
    try {
      await signOut(auth); // Cerrar sesión en Firebase
      localStorage.removeItem("isLoggedIn"); // Eliminar estado de sesión local
      location.reload(); // Recargar la página
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Error al cerrar sesión: " + error.message);
    }
  }
}

// Verificar autenticación al cargar la página
onAuthStateChanged(auth, async (user) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (user && isLoggedIn) {
    const adminRef = doc(db, "adminUsers", user.uid);
    const adminDoc = await getDoc(adminRef);

    if (adminDoc.exists() && adminDoc.data().role === "admin") {
      document.getElementById("login-modal").style.display = "none";
      document.getElementById("admin-panel").style.display = "block";
      document.getElementById("admin-email-display").innerText = `Administrador: ${user.email}`;
      resetInactivityTimer(); // Reiniciar temporizador de inactividad
    } else {
      alert("No tienes permisos para acceder al panel.");
      await cerrarSesion();
    }
  } else {
    document.getElementById("login-modal").style.display = "flex";
    document.getElementById("admin-panel").style.display = "none";
  }
});

// Manejar el formulario de inicio de sesión
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("admin-email").value.trim();
  const password = document.getElementById("admin-password").value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, password);
    localStorage.setItem("isLoggedIn", true); // Guardar estado de sesión
    location.reload(); // Recargar para inicializar el panel
  } catch (error) {
    alert("Error en el inicio de sesión: " + error.message);
  }
});

// Vincular el botón de cerrar sesión
document.getElementById("logout-btn").addEventListener("click", cerrarSesion);
