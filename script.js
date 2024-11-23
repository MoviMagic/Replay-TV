import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  deleteUser
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
  updateDoc,
  getDoc,
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

// Verificar el estado de autenticación al cargar la página
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("login-modal").style.display = "none";
    document.getElementById("admin-panel").style.display = "block";
    document.getElementById("admin-email-display").innerText = `Administrador: ${user.email}`;
    listarUsuarios(); // Mostrar todos los usuarios al autenticarse
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
  const password = document.getElementById("password").value;
  const expirationDate = new Date(document.getElementById("expirationDate").value);

  if (!auth.currentUser) {
    alert("Debes iniciar sesión como administrador para crear usuarios.");
    return;
  }

  try {
    // Crear usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Guardar usuario en Firestore Database
    await setDoc(doc(db, "users", uid), {
      username,
      email,
      expirationDate: expirationDate, // Guardar como una fecha en Firestore
      adminId: "Sm4NkYQ5GGd5fwd1Q7tHASiBZC52" // Fijar el adminId del administrador
    });

    alert("Usuario creado exitosamente.");
    document.getElementById("user-form").reset(); // Limpiar el formulario
    listarUsuarios(); // Actualizar la lista de usuarios
  } catch (error) {
    console.error("Error al crear usuario:", error);
    alert("Error al crear usuario: " + error.message);
  }
});

// Función para listar los usuarios creados
async function listarUsuarios(filter = "") {
  const usersContainer = document.getElementById("users-list");
  usersContainer.innerHTML = ""; // Limpiar contenido previo

  try {
    // Obtener todos los documentos de la colección "users"
    const querySnapshot = await getDocs(collection(db, "users"));

    if (querySnapshot.empty) {
      usersContainer.innerHTML = "<p>No hay usuarios creados.</p>";
    } else {
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        const userId = doc.id; // UID del usuario

        // Filtrar usuarios si el nombre o email no coincide con el filtro
        if (
          filter &&
          !userData.username.toLowerCase().includes(filter.toLowerCase()) &&
          !userData.email.toLowerCase().includes(filter.toLowerCase())
        ) {
          return;
        }

        // Crear el elemento de usuario en la lista
        const userElement = document.createElement("div");
        userElement.classList.add("user-item");
        userElement.innerHTML = `
          <p><strong>UID:</strong> ${userId}</p>
          <p><strong>Nombre:</strong> ${userData.username}</p>
          <p><strong>Email:</strong> ${userData.email}</p>
          <p><strong>Fecha de Expiración:</strong> ${userData.expirationDate.toDate().toLocaleDateString()}</p>
          <div class="user-actions">
            <button onclick="renovarUsuario('${userId}', 1)">Renovar 1 mes</button>
            <button onclick="renovarUsuario('${userId}', 3)">Renovar 3 meses</button>
            <button onclick="renovarUsuario('${userId}', 6)">Renovar 6 meses</button>
            <button onclick="renovarUsuario('${userId}', 12)">Renovar 12 meses</button>
            <button onclick="eliminarUsuario('${userId}')">Eliminar Usuario</button>
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

// Función para renovar la cuenta del usuario desde la fecha adecuada (fecha actual o fecha de vencimiento)
window.renovarUsuario = async function (userId, months) {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      let expirationDate = userData.expirationDate.toDate(); // Fecha de vencimiento actual del usuario
      const now = new Date(); // Fecha actual

      // Comprobar si el usuario está vencido o no
      if (expirationDate < now) {
        expirationDate = now; // Si está vencido, iniciar renovación desde hoy
      }

      // Sumar los meses a la fecha de inicio de la renovación (fecha actual o fecha de vencimiento)
      expirationDate.setMonth(expirationDate.getMonth() + months);

      await updateDoc(userRef, { expirationDate: expirationDate });
      alert(`Usuario renovado exitosamente por ${months} mes(es).`);
      listarUsuarios(); // Actualizar la lista de usuarios
    }
  } catch (error) {
    console.error("Error al renovar usuario:", error);
    alert("Error al renovar usuario: " + error.message);
  }
};

// Función para eliminar usuario
window.eliminarUsuario = async function (userId) {
  try {
    // Eliminar usuario de Firebase Authentication
    const userAuth = auth.currentUser;
    if (!userAuth) {
      throw new Error("No tienes permisos para eliminar usuarios.");
    }

    // Eliminar de Firestore Database
    await deleteDoc(doc(db, "users", userId));

    // Eliminar del módulo de autenticación
    await deleteUser(await auth.getUser(userId));

    alert("Usuario eliminado exitosamente de ambos sistemas.");
    listarUsuarios(); // Actualizar la lista de usuarios
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    alert("Error al eliminar usuario: " + error.message);
  }
};

// Filtrar usuarios al escribir en el campo de búsqueda
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
  window.location.href = "https://movimagic.github.io/generador_contenidos/";
});
