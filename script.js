import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  deleteUser, 
  signOut 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  deleteDoc, 
  collection, 
  addDoc, 
  getDoc, 
  getDocs 
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

// Crear Usuario con Dispositivos
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
      adminId: auth.currentUser.uid,
      username: username,
      email: email,
      password: password,
      expirationDate: expirationDate
    });

    const devicesCollectionRef = collection(db, `users/${userUID}/devices`);
    await addDoc(devicesCollectionRef, {
      deviceName: "Default Device",
      lastLogin: new Date(),
      platform: "Unknown"
    });

    alert("Usuario creado con dispositivo inicial.");
    listarUsuarios();
  } catch (error) {
    console.error("Error al crear usuario:", error);
    alert("Error al crear usuario: " + error.message);
  }
});

// Listar Usuarios y sus Dispositivos
async function listarUsuarios() {
  const usersContainer = document.getElementById('users-list');
  usersContainer.innerHTML = '';

  try {
    const querySnapshot = await getDocs(collection(db, 'users'));

    if (querySnapshot.empty) {
      usersContainer.innerHTML = "<p>No hay usuarios creados.</p>";
    } else {
      querySnapshot.forEach(async (docSnapshot) => {
        const userData = docSnapshot.data();

        const userElement = document.createElement('div');
        userElement.innerHTML = `
          <p><strong>Nombre:</strong> ${userData.username}</p>
          <p><strong>Email:</strong> ${userData.email}</p>
          <div id="devices-${docSnapshot.id}" class="devices-container">
            <p>Cargando dispositivos...</p>
          </div>
          <button onclick="eliminarUsuario('${docSnapshot.id}')">Eliminar Usuario</button>
        `;
        usersContainer.appendChild(userElement);

        cargarDispositivos(docSnapshot.id);
      });
    }
  } catch (error) {
    console.error("Error al listar usuarios:", error);
  }
}

async function cargarDispositivos(userId) {
  const devicesContainer = document.getElementById(`devices-${userId}`);

  try {
    const devicesSnapshot = await getDocs(collection(db, `users/${userId}/devices`));
    devicesContainer.innerHTML = "";

    devicesSnapshot.forEach((deviceDoc) => {
      const deviceData = deviceDoc.data();
      devicesContainer.innerHTML += `
        <div class="device-item">
          <p>${deviceData.deviceName} (${deviceData.platform})</p>
          <button onclick="eliminarDispositivo('${userId}', '${deviceDoc.id}')">Eliminar</button>
        </div>
      `;
    });
  } catch (error) {
    console.error("Error al cargar dispositivos:", error);
  }
}

window.eliminarUsuario = async function (userId) {
  const confirmDelete = confirm("¿Eliminar usuario y sus dispositivos?");
  if (!confirmDelete) return;

  try {
    const devicesSnapshot = await getDocs(collection(db, `users/${userId}/devices`));
    devicesSnapshot.forEach(async (doc) => await deleteDoc(doc.ref));
    await deleteDoc(doc(db, 'users', userId));

    alert("Usuario eliminado.");
    listarUsuarios();
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
  }
};

window.eliminarDispositivo = async function (userId, deviceId) {
  const confirmDelete = confirm("¿Eliminar este dispositivo?");
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, `users/${userId}/devices/${deviceId}`));
    alert("Dispositivo eliminado.");
    cargarDispositivos(userId);
  } catch (error) {
    console.error("Error al eliminar dispositivo:", error);
  }
};
