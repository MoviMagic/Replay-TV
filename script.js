import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut, 
  createUserWithEmailAndPassword, 
  deleteUser, 
  updatePassword 
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

// Mostrar mensajes
function showMessage(message, type = "success") {
  const messageBox = document.getElementById("message-box");
  messageBox.textContent = message;
  messageBox.className = `message-box ${type}`;
  messageBox.style.display = "block";
  setTimeout(() => (messageBox.style.display = "none"), 5000);
}

// Manejar creación de usuarios
document.getElementById("user-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const expirationDateInput = document.getElementById("expirationDate").value;

  if (!username || !email || !password || !expirationDateInput) {
    showMessage("Por favor completa todos los campos.", "error");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const expirationDate = new Date(expirationDateInput);

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      username,
      email,
      password,
      expirationDate,
    });

    showMessage("Usuario creado exitosamente.");
    listarUsuarios();
  } catch (error) {
    console.error(error);
    showMessage("Error al crear usuario.", "error");
  }
});

// Función para listar usuarios
async function listarUsuarios() {
  const usersContainer = document.getElementById("users-list");
  usersContainer.innerHTML = "";

  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach((doc) => {
      const user = doc.data();
      usersContainer.innerHTML += `
        <div class="user-item">
          <p><strong>Nombre:</strong> ${user.username}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Contraseña:</strong> ${user.password}</p>
          <p><strong>Expiración:</strong> ${user.expirationDate.toDate().toLocaleDateString()}</p>
          <div class="user-actions">
            <button onclick="editarUsuario('${doc.id}')">Editar</button>
            <button onclick="eliminarUsuario('${doc.id}')">Eliminar</button>
          </div>
        </div>
      `;
    });
  } catch (error) {
    console.error(error);
    showMessage("Error al listar usuarios.", "error");
  }
}

// Función para editar usuarios
window.editarUsuario = async function (userId) {
  const newUsername = prompt("Nuevo nombre:");
  const newPassword = prompt("Nueva contraseña:");

  if (!newUsername && !newPassword) {
    showMessage("No se realizaron cambios.", "error");
    return;
  }

  try {
    const userRef = doc(db, "users", userId);
    if (newUsername) await updateDoc(userRef, { username: newUsername });
    if (newPassword) await updateDoc(userRef, { password: newPassword });
    showMessage("Usuario actualizado.");
    listarUsuarios();
  } catch (error) {
    console.error(error);
    showMessage("Error al actualizar usuario.", "error");
  }
};

// Función para eliminar usuarios
window.eliminarUsuario = async function (userId) {
  try {
    await deleteDoc(doc(db, "users", userId));
    showMessage("Usuario eliminado.");
    listarUsuarios();
  } catch (error) {
    console.error(error);
    showMessage("Error al eliminar usuario.", "error");
  }
};

// Inicializar listado al cargar
onAuthStateChanged(auth, (user) => {
  if (user) listarUsuarios();
});
