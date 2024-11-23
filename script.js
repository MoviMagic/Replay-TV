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
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("Usuario autenticado con UID:", user.uid);
    try {
      const isAdmin = await verificarAdmin(user.uid);
      if (isAdmin) {
        document.getElementById("login-modal").style.display = "none";
        document.getElementById("admin-panel").style.display = "block";
        document.getElementById("admin-email-display").innerText = `Administrador: ${user.email}`;
        listarUsuarios();
      } else {
        alert("Acceso denegado. Solo el administrador puede acceder al panel.");
        await signOut(auth);
        location.reload();
      }
    } catch (error) {
      console.error("Error verificando administrador:", error);
      alert("Error en el sistema. Por favor, intenta nuevamente.");
      await signOut(auth);
      location.reload();
    }
  } else {
    document.getElementById("login-modal").style.display = "flex";
    document.getElementById("admin-panel").style.display = "none";
  }
});

// Verificar si el usuario es administrador
async function verificarAdmin(uid) {
  try {
    const adminDoc = await getDoc(doc(db, "adminUsers", uid));
    if (adminDoc.exists()) {
      const role = adminDoc.data().role;
      console.log("Rol encontrado:", role);
      return role === "admin";
    } else {
      console.error("El documento del administrador no existe.");
      return false;
    }
  } catch (error) {
    console.error("Error al verificar administrador:", error);
    return false;
  }
}

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
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    await setDoc(doc(db, "users", uid), {
      username,
      email,
      password,
      expirationDate: expirationDate,
      adminId: auth.currentUser.uid
    });

    alert("Usuario creado exitosamente.");
    document.getElementById("user-form").reset();
    listarUsuarios();
  } catch (error) {
    console.error("Error al crear usuario:", error);
    alert("Error al crear usuario: " + error.message);
  }
});

// Función para listar los usuarios creados
async function listarUsuarios(filter = "") {
  const usersContainer = document.getElementById("users-list");
  usersContainer.innerHTML = "";

  try {
    const querySnapshot = await getDocs(collection(db, "users"));

    if (querySnapshot.empty) {
      usersContainer.innerHTML = "<p>No hay usuarios creados.</p>";
    } else {
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        const userId = doc.id;

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
          <p><strong>UID:</strong> ${userId}</p>
          <p><strong>Nombre:</strong> ${userData.username}</p>
          <p><strong>Email:</strong> ${userData.email}</p>
          <p><strong>Password:</strong> ${userData.password}</p>
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

// Función para renovar la cuenta del usuario desde la fecha adecuada
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
      listarUsuarios();
    }
  } catch (error) {
    console.error("Error al renovar usuario:", error);
    alert("Error al renovar usuario: " + error.message);
  }
};

// Función para eliminar usuario
window.eliminarUsuario = async function (userId) {
  try {
    if (auth.currentUser.uid === userId) {
      throw new Error("No puedes eliminar tu propia cuenta.");
    }

    await deleteDoc(doc(db, "users", userId));
    alert("Usuario eliminado exitosamente de Firestore.");
    listarUsuarios();
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
