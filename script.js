import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut, 
  createUserWithEmailAndPassword, 
  updatePassword, 
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

// Verificar si el usuario es administrador
async function isAdmin(uid) {
  try {
    const adminDoc = await getDoc(doc(db, 'adminUsers', uid));
    return adminDoc.exists() && adminDoc.data().role === 'admin';
  } catch (error) {
    console.error("Error al verificar si el usuario es administrador:", error);
    return false;
  }
}

// Mostrar mensajes debajo del botón "Agregar Usuario"
function showMessage(message, color) {
  const messageElement = document.getElementById('message');
  messageElement.innerText = message;
  messageElement.style.color = color;
  messageElement.style.marginTop = "10px";
}

// Manejo de la autenticación
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const isUserAdmin = await isAdmin(user.uid);

    if (isUserAdmin) {
      document.getElementById('login-modal').style.display = 'none';
      document.getElementById('admin-panel').style.display = 'block';
      document.getElementById('admin-email-display').innerText = `Administrador: ${user.email}`;
      listarUsuarios(user.uid);
    }
  } else {
    document.getElementById('login-modal').style.display = 'flex';
    document.getElementById('admin-panel').style.display = 'none';
  }
});

// Crear un nuevo usuario
document.getElementById('user-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const expirationDate = new Date(document.getElementById('expirationDate').value);

  const adminUID = auth.currentUser.uid;

  try {
    // Verificar si el usuario ya existe
    const userQuery = query(collection(db, 'users'), where("email", "==", email));
    const querySnapshot = await getDocs(userQuery);

    if (!querySnapshot.empty) {
      showMessage("Usuario ya existe", "yellow");
      return;
    }

    // Crear usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userUID = userCredential.user.uid;

    // Guardar datos en Firestore
    await setDoc(doc(db, 'users', userUID), {
      adminId: adminUID,
      username: username,
      email: email,
      password: password,
      expirationDate: expirationDate
    });

    showMessage("Usuario creado exitosamente", "green");
    listarUsuarios(adminUID);
    document.getElementById('user-form').reset();
  } catch (error) {
    console.error("Error al crear usuario:", error);
    showMessage("Error al crear usuario: " + error.message, "red");
  }
});

// Editar un usuario
window.editarUsuario = async function (userId) {
  const newUsername = prompt("Ingrese el nuevo nombre de usuario:");
  const newPassword = prompt("Ingrese la nueva contraseña:");

  if (!newUsername || !newPassword) {
    alert("Los campos no pueden estar vacíos.");
    return;
  }

  try {
    // Actualizar en Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      username: newUsername,
      password: newPassword
    });

    // Actualizar en Firebase Authentication
    const userCredential = await getDoc(userRef);
    if (userCredential.exists()) {
      const userAuth = auth.currentUser;
      if (userAuth.uid === userId) {
        await updatePassword(userAuth, newPassword);
      }
    }

    alert("Usuario actualizado correctamente.");
    listarUsuarios(auth.currentUser.uid);
  } catch (error) {
    console.error("Error al editar usuario:", error);
    alert("Error al editar usuario: " + error.message);
  }
};

// Eliminar un usuario
window.eliminarUsuario = async function (userId) {
  const confirmDelete = confirm("¿Estás seguro de que deseas eliminar este usuario?");

  if (!confirmDelete) return;

  try {
    // Eliminar de Firebase Authentication
    const userCredential = await getDoc(doc(db, 'users', userId));
    if (userCredential.exists()) {
      const userAuth = auth.currentUser;
      if (userAuth.uid === userId) {
        await deleteUser(userAuth);
      }
    }

    // Eliminar de Firestore
    await deleteDoc(doc(db, 'users', userId));

    alert("Usuario eliminado correctamente.");
    listarUsuarios(auth.currentUser.uid);
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    alert("Error al eliminar usuario: " + error.message);
  }
};

// Listar usuarios
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
