import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updatePassword, 
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
  updateDoc, 
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

// CREAR USUARIO
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

    const devicesRef = collection(db, `users/${userUID}/devices`);
    await addDoc(devicesRef, { deviceName: "Default", lastLogin: new Date(), platform: "Unknown" });
    alert("Usuario creado correctamente.");
    listarUsuarios();
  } catch (error) {
    console.error("Error al crear usuario:", error);
    alert("Error al crear usuario.");
  }
});

// CARGAR USUARIOS
async function listarUsuarios() {
  const usersContainer = document.getElementById('users-list');
  usersContainer.innerHTML = '';

  try {
    const snapshot = await getDocs(collection(db, 'users'));
    snapshot.forEach((doc) => {
      const data = doc.data();
      const userHTML = `
        <div>
          <p>${data.username} (${data.email})</p>
          <button onclick="editarUsuario('${doc.id}')">Editar</button>
          <button onclick="eliminarUsuario('${doc.id}')">Eliminar</button>
        </div>
      `;
      usersContainer.innerHTML += userHTML;
    });
  } catch (error) {
    console.error("Error al cargar usuarios.");
  }
}

// AGREGAR MÁS FUNCIONALIDADES AQUÍ COMO EDICIÓN, RENOVACIÓN, ETC.
