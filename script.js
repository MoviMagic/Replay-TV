import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDocs, collection, query, where, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Configuración de Firebase para Replay TV
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
const auth = getAuth(app);
const db = getFirestore(app);

// Verificar el estado de autenticación al cargar la página
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("login-modal").style.display = "none";
    document.getElementById("admin-panel").style.display = "block";
    document.getElementById("admin-email-display").innerText = `Administrador: ${user.email}`;
    listarUsuarios(); // Mostrar usuarios al iniciar sesión
  } else {
    document.getElementById("login-modal").style.display = "flex";
    document.getElementById("admin-panel").style.display = "none";
  }
});

// Manejar el formulario de inicio de sesión
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("admin-email").value;
  const password = document.getElementById("admin-password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert("Error en el inicio de sesión: " + error.message);
  }
});

// Manejar el formulario para crear usuarios nuevos
document.getElementById("user-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const expirationDate = new Date(document.getElementById("expirationDate").value);

  if (!auth.currentUser) {
    alert("Debes iniciar sesión como administrador para crear usuarios.");
    return;
  }

  try {
    const userRef = doc(collection(db, "users")); // Crear un nuevo documento en la colección "users"
    await setDoc(userRef, {
      username,
      email,
      expirationDate: expirationDate, // Guardar como una fecha de Firestore
      adminId: auth.currentUser.uid // Vincular al administrador actual
    });

    alert("Usuario creado exitosamente.");
    document.getElementById("user-form").reset(); // Limpiar el formulario
    listarUsuarios(); // Actualizar la lista de usuarios
  } catch (error) {
    console.error("Error al crear usuario:", error);
    alert("Error al crear usuario: " + error.message);
  }
});

// Listar usuarios creados
async function listarUsuarios(filter = "") {
  const usersContainer = document.getElementById("users-list");
  usersContainer.innerHTML = ""; // Limpiar contenido previo

  try {
    const q = query(collection(db, "users"), where("adminId", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      usersContainer.innerHTML = "<p>No hay usuarios creados.</p>";
    } else {
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        // Filtrar usuarios si el nombre o email no coincide con el filtro
        if (
          filter &&
          !userData.username.toLowerCase().includes(filter.toLowerCase()) &&
          !userData.email.toLowerCase().includes(filter.toLowerCase())
        ) {
          return;
        }
        const userElement = document.createElement("div");
        userElement.classList.add("user-item");
        userElement.innerHTML = `
          <p><strong>Nombre:</strong> ${userData.username}</p>
          <p><strong>Email:</strong> ${userData.email}</p>
          <p><strong>Fecha de Expiración:</strong> ${userData.expirationDate.toDate().toLocaleDateString()}</p>
          <div class="user-actions">
            <button onclick="renovarUsuario('${doc.id}', 1)">Renovar 1 mes</button>
            <button onclick="renovarUsuario('${doc.id}', 3)">Renovar 3 meses</button>
            <button onclick="renovarUsuario('${doc.id}', 6)">Renovar 6 meses</button>
            <button onclick="renovarUsuario('${doc.id}', 12)">Renovar 12 meses</button>
            <button onclick="eliminarUsuario('${doc.id}')">Eliminar Usuario</button>
          </div>
        `;
        usersContainer.appendChild(userElement);
      });
    }
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    usersContainer.innerHTML = `<p>Error al cargar usuarios: ${error.message}</p>`;
  }
}

// Renovar usuario por meses
window.renovarUsuario = async function (userId, months) {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      let expirationDate = userData.expirationDate.toDate(); // Fecha de vencimiento actual del usuario
      const now = new Date();

      // Si la fecha de vencimiento ya pasó, comienza la renovación desde hoy
      if (expirationDate < now) {
        expirationDate = now;
      }

      // Sumar meses a la fecha de vencimiento
      expirationDate.setMonth(expirationDate.getMonth() + months);

      await updateDoc(userRef, { expirationDate });
      alert(`Usuario renovado exitosamente por ${months} mes(es).`);
      listarUsuarios(); // Actualizar la lista de usuarios
    }
  } catch (error) {
    console.error("Error al renovar usuario:", error);
    alert("Error al renovar usuario: " + error.message);
  }
};

// Eliminar usuario
window.eliminarUsuario = async function (userId) {
  try {
    const userRef = doc(db, "users", userId);
    await deleteDoc(userRef);
    alert("Usuario eliminado exitosamente.");
    listarUsuarios(); // Actualizar la lista de usuarios
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    alert("Error al eliminar usuario: " + error.message);
  }
};

// Filtrar usuarios por búsqueda
document.getElementById("search-bar").addEventListener("input", (e) => {
  const filter = e.target.value;
  listarUsuarios(filter);
});

// Cerrar sesión del administrador
document.getElementById("logout-btn").addEventListener("click", async () => {
  await signOut(auth);
  location.reload();
});

// Redirigir al enlace de contenidos al hacer clic en el botón
document.getElementById("content-btn").addEventListener("click", () => {
  window.location.href = "https://replay-tv.github.io/generador_contenidos/";
});
