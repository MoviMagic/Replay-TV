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

// Función para eliminar un usuario
window.eliminarUsuario = async function (userId) {
  const confirmDelete = confirm("¿Estás seguro de que deseas eliminar este usuario?");
  if (!confirmDelete) return;

  try {
    // Obtener las credenciales del usuario a eliminar desde Firestore
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) {
      alert("Usuario no encontrado en Firestore.");
      return;
    }

    // Obtener email y contraseña para volver a autenticar antes de eliminar
    const userData = userDoc.data();
    const { email, password } = userData;

    // Reautenticar como el usuario para obtener permisos de eliminación
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Eliminar el usuario de Firebase Authentication
    await deleteUser(user);

    // Eliminar el usuario de Firestore
    await deleteDoc(doc(db, "users", userId));

    alert("Usuario eliminado correctamente.");
    listarUsuarios(auth.currentUser.uid);
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    alert("Error al eliminar usuario: " + error.message);
  }
};

// Función para listar usuarios
async function listarUsuarios(adminUID) {
  const usersContainer = document.getElementById('users-list');
  usersContainer.innerHTML = '';

  try {
    const q = query(collection(db, 'users'), where("adminId", "==", adminUID));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      usersContainer.innerHTML = "<p>No hay usuarios creados.</p>";
    } else {
      querySnapshot.forEach((doc) => {
        const userData = doc.data();

        const userElement = document.createElement('div');
        userElement.classList.add('user-item');
        userElement.innerHTML = `
          <p><strong>Nombre:</strong> ${userData.username}</p>
          <p><strong>Email:</strong> ${userData.email}</p>
          <p><strong>Fecha de Expiración:</strong> ${new Date(userData.expirationDate).toLocaleDateString()}</p>
          <div class="user-actions">
            <button onclick="editarUsuario('${doc.id}')">Editar Usuario</button>
            <button onclick="eliminarUsuario('${doc.id}')">Eliminar Usuario</button>
            <button onclick="renovarUsuario('${doc.id}', 1)">Renovar 1 mes</button>
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
