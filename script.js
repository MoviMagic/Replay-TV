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
  getDoc, 
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

// Inicio de sesión
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('admin-email').value;
  const password = document.getElementById('admin-password').value;

  try {
    console.log("Iniciando sesión...");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Verificar si es administrador
    console.log("Verificando permisos del administrador...");
    const adminDoc = await getDoc(doc(db, 'adminUsers', user.uid));
    if (!adminDoc.exists()) {
      alert("No tienes permisos para acceder al panel.");
      console.error("El usuario no tiene permisos de administrador.");
      await signOut(auth);
      return;
    }

    // Mostrar el panel
    console.log("Acceso permitido. Mostrando el panel...");
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
    console.log("Creando usuario...");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userUID = userCredential.user.uid;

    // Guardar datos en Firestore
    await setDoc(doc(db, 'users', userUID), {
      username,
      email,
      password,
      expirationDate,
      adminId: auth.currentUser.uid
    });

    console.log("Usuario creado correctamente.");
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
    console.log("Cargando lista de usuarios...");
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
        <button onclick="eliminarUsuario('${docSnapshot.id}')">Eliminar Usuario</button>
        <button onclick="editarUsuario('${docSnapshot.id}')">Editar Usuario</button>
        <div id="devices-${docSnapshot.id}" class="devices-container">
          <p><strong>Dispositivos:</strong></p>
          <div class="device-list">Cargando dispositivos...</div>
        </div>
      `;
      usersContainer.appendChild(userElement);

      // Cargar dispositivos del usuario
      cargarDispositivos(docSnapshot.id);
    });
  } catch (error) {
    console.error("Error al cargar usuarios:", error.message);
  }
}

// Cargar dispositivos de un usuario
async function cargarDispositivos(userId) {
  const devicesContainer = document.querySelector(`#devices-${userId} .device-list`);
  devicesContainer.innerHTML = '';

  try {
    console.log(`Cargando dispositivos del usuario ${userId}...`);
    const devicesSnapshot = await getDocs(collection(db, `users/${userId}/devices`));

    if (devicesSnapshot.empty) {
      devicesContainer.innerHTML = "<p>No hay dispositivos registrados.</p>";
      return;
    }

    devicesSnapshot.forEach((deviceDoc) => {
      const deviceData = deviceDoc.data();
      const deviceElement = document.createElement('div');
      deviceElement.innerHTML = `
        <p>${deviceData.deviceName} (${deviceData.platform}) - Último login: ${new Date(deviceData.lastLogin.toDate()).toLocaleString()}</p>
        <button onclick="eliminarDispositivo('${userId}', '${deviceDoc.id}')">Eliminar Dispositivo</button>
      `;
      devicesContainer.appendChild(deviceElement);
    });
  } catch (error) {
    console.error(`Error al cargar dispositivos del usuario ${userId}:`, error.message);
    devicesContainer.innerHTML = "<p>Error al cargar dispositivos.</p>";
  }
}

// Eliminar usuario
window.eliminarUsuario = async (userId) => {
  const confirmDelete = confirm("¿Estás seguro de que deseas eliminar este usuario?");
  if (!confirmDelete) return;

  try {
    console.log(`Eliminando usuario ${userId}...`);
    // Eliminar dispositivos del usuario
    const devicesSnapshot = await getDocs(collection(db, `users/${userId}/devices`));
    for (const deviceDoc of devicesSnapshot.docs) {
      await deleteDoc(deviceDoc.ref);
    }

    // Eliminar usuario
    await deleteDoc(doc(db, 'users', userId));
    alert("Usuario eliminado correctamente.");
    listarUsuarios();
  } catch (error) {
    console.error("Error al eliminar usuario:", error.message);
    alert("Error al eliminar usuario: " + error.message);
  }
};

// Eliminar dispositivo
window.eliminarDispositivo = async (userId, deviceId) => {
  const confirmDelete = confirm("¿Estás seguro de que deseas eliminar este dispositivo?");
  if (!confirmDelete) return;

  try {
    console.log(`Eliminando dispositivo ${deviceId} del usuario ${userId}...`);
    await deleteDoc(doc(db, `users/${userId}/devices/${deviceId}`));
    alert("Dispositivo eliminado correctamente.");
    cargarDispositivos(userId);
  } catch (error) {
    console.error("Error al eliminar dispositivo:", error.message);
    alert("Error al eliminar dispositivo: " + error.message);
  }
};

// Cerrar sesión
document.getElementById('logout-btn').addEventListener('click', async () => {
  try {
    console.log("Cerrando sesión...");
    await signOut(auth);
    location.reload();
  } catch (error) {
    console.error("Error al cerrar sesión:", error.message);
    alert("Error al cerrar sesión: " + error.message);
  }
});
