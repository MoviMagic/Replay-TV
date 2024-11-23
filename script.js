import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDocs, collection, query, updateDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

// Manejo de la autenticación
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    document.getElementById('admin-email-display').innerText = `Administrador: ${user.email}`;
    listarUsuarios();
  } else {
    document.getElementById('login-modal').style.display = 'flex';
    document.getElementById('admin-panel').style.display = 'none';
  }
});

// Inicio de sesión del administrador
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('admin-email').value;
  const password = document.getElementById('admin-password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert("Error: " + error.message);
  }
});

// Crear un nuevo usuario
document.getElementById('user-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const expirationDate = new Date(document.getElementById('expirationDate').value);

  // Generar un UID para el nuevo usuario
  const userUID = crypto.randomUUID();

  try {
    await setDoc(doc(db, 'users', userUID), {
      adminId: auth.currentUser.uid,
      username: username,
      email: email,
      password: password,
      expirationDate: expirationDate
    });

    alert('Usuario creado exitosamente.');
    listarUsuarios();
    document.getElementById('user-form').reset();
  } catch (error) {
    alert("Error al crear usuario: " + error.message);
  }
});

// Listar usuarios
async function listarUsuarios(filter = "") {
  const usersContainer = document.getElementById('users-list');
  usersContainer.innerHTML = ''; // Limpiar contenido previo

  try {
    const q = query(collection(db, 'users'), where("adminId", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      usersContainer.innerHTML = "<p>No hay usuarios creados.</p>";
    } else {
      querySnapshot.forEach((doc) => {
        const userData = doc.data();

        // Filtrar usuarios según el término de búsqueda
        if (filter && !userData.username.toLowerCase().includes(filter.toLowerCase()) &&
            !userData.email.toLowerCase().includes(filter.toLowerCase())) {
          return;
        }

        const userElement = document.createElement('div');
        userElement.classList.add('user-item');
        userElement.innerHTML = `
          <p><strong>Nombre:</strong> ${userData.username}</p>
          <p><strong>Email:</strong> ${userData.email}</p>
          <p><strong>Fecha de Expiración:</strong> ${userData.expirationDate.toDate().toLocaleDateString()}</p>
          <div class="user-actions">
            <button onclick="renovarUsuario('${doc.id}', 1)">Renovar 1 mes</button>
            <button onclick="renovarUsuario('${doc.id}', 3)">Renovar 3 meses</button>
            <button onclick="renovarUsuario('${doc.id}', 6)">Renovar 6 meses</button>
            <button onclick="renovarUsuario('${doc.id}', 12)">Renovar 12 meses</button>
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

// Renovar cuenta de usuario
window.renovarUsuario = async function (userId, months) {
  try {
    const userRef = doc(db, 'users', userId);
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
      alert(`Usuario renovado por ${months} mes(es).`);
      listarUsuarios();
    }
  } catch (error) {
    console.error("Error al renovar usuario:", error);
    alert("Error al renovar usuario: " + error.message);
  }
};

// Filtrar usuarios
document.getElementById('search-bar').addEventListener('input', (e) => {
  const filter = e.target.value;
  listarUsuarios(filter);
});

// Cerrar sesión
document.getElementById('logout-btn').addEventListener('click', async () => {
  await signOut(auth);
  location.reload();
});

// Redirigir al generador de contenidos
document.getElementById('content-btn').addEventListener('click', () => {
  window.location.href = "https://movimagic.github.io/generador_contenidos/";
});
