import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut, 
  createUserWithEmailAndPassword, 
  deleteUser 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  updateDoc, 
  getDoc, 
  deleteDoc 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDnGHxXiUkm1Onblu3en-V2v5Yxk9OnFL8",
  authDomain: "replay-tv-33de1.firebaseapp.com",
  projectId: "replay-tv-33de1",
  storageBucket: "replay-tv-33de1.appspot.com",
  messagingSenderId: "19557200212",
  appId: "1:19557200212:web:a9bb8b64cbd17be46758c1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Manejo del Inicio de Sesión
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('admin-email').value;
  const password = document.getElementById('admin-password').value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const adminDoc = await getDoc(doc(db, 'adminUsers', user.uid));
    if (!adminDoc.exists() || adminDoc.data().role !== 'admin') {
      alert("No tienes permisos para acceder al panel administrativo.");
      await signOut(auth);
      return;
    }

    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    document.getElementById('admin-email-display').innerText = `Administrador: ${email}`;
    listarUsuarios();
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    alert("Error al iniciar sesión: " + error.message);
  }
});

// Listar Usuarios
async function listarUsuarios() {
  const usersContainer = document.getElementById('users-list');
  usersContainer.innerHTML = '';

  try {
    const q = query(collection(db, 'users'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      usersContainer.innerHTML = "<p>No hay usuarios creados.</p>";
    } else {
      querySnapshot.forEach((doc) => {
        const userData = doc.data();

        const userElement = document.createElement('div');
        userElement.innerHTML = `
          <p><strong>Nombre:</strong> ${userData.username}</p>
          <p><strong>Email:</strong> ${userData.email}</p>
          <button onclick="eliminarUsuario('${doc.id}')">Eliminar Usuario</button>
        `;
        usersContainer.appendChild(userElement);
      });
    }
  } catch (error) {
    console.error("Error al listar usuarios:", error);
  }
}

// Eliminar Usuario
window.eliminarUsuario = async function (userId) {
  try {
    await deleteDoc(doc(db, 'users', userId));
    alert("Usuario eliminado correctamente.");
    listarUsuarios();
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    alert("Error al eliminar usuario: " + error.message);
  }
};

// Cerrar Sesión
document.getElementById('logout-btn').addEventListener('click', async () => {
  await signOut(auth);
  location.reload();
});
