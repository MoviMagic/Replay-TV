import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updatePassword 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDnGHxXiUkm1Onblu3en-V2v5Yxk9OnFL8",
  authDomain: "replay-tv-33de1.firebaseapp.com",
  projectId: "replay-tv-33de1",
  storageBucket: "replay-tv-33de1.firebasestorage.app",
  messagingSenderId: "19557200212",
  appId: "1:19557200212:web:a9bb8b64cbd17be46758c1",
  measurementId: "G-JLFC3D8V9Y",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Inicio de sesión
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('admin-email').value;
  const password = document.getElementById('admin-password').value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const adminDoc = await getDoc(doc(db, 'adminUsers', user.uid));
    if (!adminDoc.exists()) {
      alert("No tienes permisos para acceder.");
      await signOut(auth);
      return;
    }

    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    listarUsuarios();
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    alert("Error al iniciar sesión.");
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
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userUID = userCredential.user.uid;

    await setDoc(doc(db, 'users', userUID), {
      username,
      email,
      password,
      expirationDate,
    });

    listarUsuarios();
  } catch (error) {
    console.error("Error al crear usuario:", error);
  }
});

// Listar usuarios
async function listarUsuarios() {
  const usersContainer = document.getElementById('users-list');
  usersContainer.innerHTML = '';

  const querySnapshot = await getDocs(collection(db, 'users'));
  querySnapshot.forEach((docSnapshot) => {
    const userData = docSnapshot.data();

    const userElement = document.createElement('div');
    userElement.innerHTML = `
      <p><strong>Usuario:</strong> ${userData.username}</p>
      <p><strong>Email:</strong> ${userData.email}</p>
      <p><strong>Contraseña:</strong> ${userData.password}</p>
      <p><strong>Fecha de Expiración:</strong> ${userData.expirationDate.toDate()}</p>
      <button onclick="eliminarUsuario('${docSnapshot.id}')">Eliminar Usuario</button>
      <button onclick="editarUsuario('${docSnapshot.id}')">Editar Usuario</button>
    `;
    usersContainer.appendChild(userElement);
  });
}

// Eliminar usuario
window.eliminarUsuario = async (userId) => {
  await deleteDoc(doc(db, 'users', userId));
  listarUsuarios();
};

// Editar usuario
window.editarUsuario = async (userId) => {
  const newUsername = prompt("Ingrese nuevo nombre de usuario:");
  const newPassword = prompt("Ingrese nueva contraseña:");

  await updateDoc(doc(db, 'users', userId), {
    username: newUsername,
    password: newPassword,
  });

  listarUsuarios();
};
