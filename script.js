import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  getDocs, 
  collection 
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

// UID del administrador permitido
const ADMIN_UID = "6iHWl92CqaNCeb71l9yiwhrl9bw1";

// Inicio de sesión
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('admin-email').value;
  const password = document.getElementById('admin-password').value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Verificar si el UID corresponde al administrador
    if (user.uid !== ADMIN_UID) {
      alert("No tienes permisos para acceder al panel.");
      await signOut(auth);
      return;
    }

    // Mostrar el panel si es administrador
    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    document.getElementById('admin-email-display').innerText = `Administrador: ${email}`;
    listarUsuarios();
  } catch (error) {
    console.error("Error al iniciar sesión:", error.message);
    alert("Error al iniciar sesión: " + error.message);
  }
});

// Crear usuario
document.getElementById('user-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const expirationDate = new Date(document.getElementById('expirationDate').value);

  try {
    // Crear el usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userUID = userCredential.user.uid;

    // Guardar el usuario en Firestore con el adminId
    await setDoc(doc(db, 'users', userUID), {
      username,
      email,
      password,
      expirationDate,
      adminId: ADMIN_UID // UID del administrador
    });

    alert("Usuario creado correctamente.");
    listarUsuarios();
  } catch (error) {
    console.error("Error al crear usuario:", error.message);
    alert("Error al crear usuario: " + error.message);
  }
});

// Listar usuarios
async function listarUsuarios() {
  const usersContainer = document.getElementById('users-list');
  usersContainer.innerHTML = '';

  try {
    const querySnapshot = await getDocs(collection(db, 'users'));

    if (querySnapshot.empty) {
      usersContainer.innerHTML = "<p>No hay usuarios creados.</p>";
      return;
    }

    querySnapshot.forEach((docSnapshot) => {
      const userData = docSnapshot.data();

      const userElement = document.createElement('div');
      userElement.innerHTML = `
        <p><strong>Nombre:</strong> ${userData.username}</p>
        <p><strong>Email:</strong> ${userData.email}</p>
        <p><strong>Contraseña:</strong> ${userData.password}</p>
        <p><strong>Fecha de Expiración:</strong> ${new Date(userData.expirationDate).toLocaleDateString()}</p>
        <p><strong>Admin ID:</strong> ${userData.adminId}</p>
        <button onclick="eliminarUsuario('${docSnapshot.id}')">Eliminar Usuario</button>
        <button onclick="editarUsuario('${docSnapshot.id}')">Editar Usuario</button>
      `;
      usersContainer.appendChild(userElement);
    });
  } catch (error) {
    console.error("Error al listar usuarios:", error.message);
  }
}

// Eliminar usuario
window.eliminarUsuario = async (userId) => {
  const confirmDelete = confirm("¿Estás seguro de que deseas eliminar este usuario?");
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, 'users', userId));
    alert("Usuario eliminado correctamente.");
    listarUsuarios();
  } catch (error) {
    console.error("Error al eliminar usuario:", error.message);
    alert("Error al eliminar usuario: " + error.message);
  }
};

// Editar usuario
window.editarUsuario = async (userId) => {
  const newUsername = prompt("Ingrese nuevo nombre de usuario:");
  const newPassword = prompt("Ingrese nueva contraseña:");

  try {
    await updateDoc(doc(db, 'users', userId), {
      username: newUsername,
      password: newPassword,
    });

    alert("Usuario editado correctamente.");
    listarUsuarios();
  } catch (error) {
    console.error("Error al editar usuario:", error.message);
    alert("Error al editar usuario: " + error.message);
  }
};

// Cerrar sesión
document.getElementById('logout-btn').addEventListener('click', async () => {
  try {
    await signOut(auth);
    location.reload();
  } catch (error) {
    console.error("Error al cerrar sesión:", error.message);
    alert("Error al cerrar sesión: " + error.message);
  }
});
