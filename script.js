import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut, 
  createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDocs, 
  collection, 
  query, 
  updateDoc, 
  getDoc, 
  setDoc, 
  deleteDoc 
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

let inactivityTimer;

// Función para reiniciar el temporizador de inactividad
function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    alert("Sesión cerrada por inactividad.");
    cerrarSesion();
  }, 15 * 60 * 1000); // 15 minutos
}

// Escuchar eventos de interacción del usuario para reiniciar el temporizador
["click", "mousemove", "keypress"].forEach((event) => {
  document.addEventListener(event, resetInactivityTimer);
});

// Cerrar sesión del administrador con confirmación
async function cerrarSesion() {
  const confirmLogout = confirm("¿Estás seguro de que deseas cerrar sesión?");
  if (confirmLogout) {
    await signOut(auth);
    localStorage.removeItem("isLoggedIn");
    location.reload();
  }
}

// Verificar el estado de autenticación al cargar la página
onAuthStateChanged(auth, async (user) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (user && isLoggedIn) {
    const adminRef = doc(db, "adminUsers", user.uid);
    const adminDoc = await getDoc(adminRef);

    if (adminDoc.exists() && adminDoc.data().role === "admin") {
      document.getElementById("login-modal").style.display = "none";
      document.getElementById("admin-panel").style.display = "block";
      document.getElementById("admin-email-display").innerText = `Administrador: ${user.email}`;
      listarUsuarios();
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

// Manejar el formulario de creación de usuarios
document.getElementById("user-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const expirationDateInput = document.getElementById("expirationDate").value;

  if (!username || !email || !password || !expirationDateInput) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const expirationDate = new Date(expirationDateInput);

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      username: username,
      email: email,
      password: password,
      expirationDate: expirationDate,
    });

    alert("Usuario creado exitosamente.");
    location.reload(); // Recargar la página
  } catch (error) {
    console.error("Error al crear usuario:", error);
    alert("Error al crear usuario: " + error.message);
  }
});

// Función para listar todos los usuarios
async function listarUsuarios(filter = "") {
  const usersContainer = document.getElementById("users-list");
  usersContainer.innerHTML = "";

  try {
    const q = query(collection(db, "users"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      usersContainer.innerHTML = "<p>No hay usuarios creados.</p>";
    } else {
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (filter && !userData.username.toLowerCase().includes(filter.toLowerCase()) &&
            !userData.email.toLowerCase().includes(filter.toLowerCase())) {
          return;
        }
        const userElement = document.createElement("div");
        userElement.classList.add("user-item");
        userElement.innerHTML = `
          <p><strong>Nombre:</strong> ${userData.username}</p>
          <p><strong>Email:</strong> ${userData.email}</p>
          <p><strong>Contraseña:</strong> ${userData.password || "No disponible"}</p>
          <p><strong>Fecha de Expiración:</strong> ${userData.expirationDate.toDate().toLocaleDateString()}</p>
          <div class="user-actions">
            <button onclick="renovarUsuario('${doc.id}', 1)">Renovar 1 mes</button>
            <button onclick="renovarUsuario('${doc.id}', 3)">Renovar 3 meses</button>
            <button onclick="renovarUsuario('${doc.id}', 6)">Renovar 6 meses</button>
            <button onclick="renovarUsuario('${doc.id}', 12)">Renovar 12 meses</button>
          </div>
          <button class="delete-button" onclick="eliminarUsuario('${doc.id}')">Eliminar Usuario</button>
        `;
        usersContainer.appendChild(userElement);
      });
    }
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    usersContainer.innerHTML = `<p>Error al cargar usuarios: ${error.message}</p>`;
  }
}

// Función para renovar la cuenta del usuario
window.renovarUsuario = async function (userId, months) {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      let expirationDate = userData.expirationDate.toDate();
      const now = new Date();

      if (expirationDate < now) {
        expirationDate = now;
      }

      expirationDate.setMonth(expirationDate.getMonth() + months);

      await updateDoc(userRef, { expirationDate: expirationDate });
      alert(`Usuario renovado exitosamente por ${months} mes(es).`);
      location.reload(); // Recargar la página
    }
  } catch (error) {
    console.error("Error al renovar usuario:", error);
    alert("Error al renovar usuario: " + error.message);
  }
};

// Función para eliminar un usuario
window.eliminarUsuario = async function (userId) {
  try {
    const userRef = doc(db, "users", userId);
    await deleteDoc(userRef);

    alert("Usuario eliminado exitosamente.");
    location.reload(); // Recargar la página
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    alert("Error al eliminar usuario: " + error.message);
  }
};
