// Configuración de Firebase
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referencia a la colección "users"
const usersCollection = collection(db, "users");

// Crear Usuario
const userForm = document.getElementById("userForm");
userForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const expirationDate = new Date(document.getElementById("expirationDate").value).toISOString();

  try {
    // Crea un nuevo documento con UID único
    await addDoc(usersCollection, {
      username,
      email,
      password,
      expirationDate
    });

    alert("Usuario creado con éxito");
    loadUsers(); // Actualiza la lista de usuarios
  } catch (error) {
    console.error("Error al crear usuario: ", error);
  }
});

// Cargar Usuarios
async function loadUsers() {
  const usersList = document.getElementById("users");
  usersList.innerHTML = "";

  try {
    const querySnapshot = await getDocs(usersCollection);
    querySnapshot.forEach((doc) => {
      const user = doc.data();
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${user.username} (${user.email})</span>
        <button onclick="deleteUser('${doc.id}')">Eliminar</button>
      `;
      usersList.appendChild(li);
    });
  } catch (error) {
    console.error("Error al cargar usuarios: ", error);
  }
}

// Eliminar Usuario
async function deleteUser(userId) {
  try {
    await deleteDoc(doc(db, "users", userId));
    alert("Usuario eliminado con éxito");
    loadUsers(); // Actualiza la lista de usuarios
  } catch (error) {
    console.error("Error al eliminar usuario: ", error);
  }
}

// Cargar usuarios al iniciar
loadUsers();
