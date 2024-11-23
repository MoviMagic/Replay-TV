import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDnGHxXiUkm1Onblu3en-V2v5Yxk9OnFL8",
  authDomain: "replay-tv-33de1.firebaseapp.com",
  projectId: "replay-tv-33de1",
  storageBucket: "replay-tv-33de1.firebasestorage.app",
  messagingSenderId: "19557200212",
  appId: "1:19557200212:web:a9bb8b64cbd17be46758c1",
  measurementId: "G-JLFC3D8V9Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginForm = document.getElementById("login-form");
const userManagementContainer = document.getElementById("user-management-container");
const loginContainer = document.getElementById("login-container");
const userList = document.getElementById("user-list");

// Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("admin-email").value;
  const password = document.getElementById("admin-password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, "adminUsers", userCredential.user.uid));
    if (userDoc.exists() && userDoc.data().role === "admin") {
      loginContainer.classList.add("hidden");
      userManagementContainer.classList.remove("hidden");
      loadUsers();
    } else {
      throw new Error("No tienes permiso para acceder.");
    }
  } catch (error) {
    document.getElementById("login-error").classList.remove("hidden");
  }
});

// Logout
document.getElementById("logout-btn").addEventListener("click", () => {
  signOut(auth).then(() => {
    loginContainer.classList.remove("hidden");
    userManagementContainer.classList.add("hidden");
  });
});

// Load Users
async function loadUsers() {
  const querySnapshot = await getDocs(collection(db, "users"));
  userList.innerHTML = "";
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    userList.innerHTML += `
      <tr>
        <td>${data.username}</td>
        <td>${data.email}</td>
        <td>${data.password}</td>
        <td>${new Date(data.expirationDate.seconds * 1000).toLocaleDateString()}</td>
        <td>
          <button onclick="renewUser('${doc.id}', 1)">+1 Mes</button>
          <button onclick="renewUser('${doc.id}', 3)">+3 Meses</button>
          <button onclick="renewUser('${doc.id}', 6)">+6 Meses</button>
          <button onclick="renewUser('${doc.id}', 12)">+12 Meses</button>
          <button onclick="deleteUser('${doc.id}')">Eliminar</button>
        </td>
      </tr>`;
  });
}

// Create User
document.getElementById("create-user-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const newUser = await auth.createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", newUser.user.uid), {
      username,
      email,
      password,
      expirationDate: new Date(),
    });
    loadUsers();
  } catch (error) {
    console.error("Error creando usuario:", error);
  }
});

// Renew User
async function renewUser(userId, months) {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    const expirationDate = new Date(userDoc.data().expirationDate.seconds * 1000);
    expirationDate.setMonth(expirationDate.getMonth() + months);
    await updateDoc(userRef, { expirationDate });
    loadUsers();
  }
}

// Delete User
async function deleteUser(userId) {
  await deleteDoc(doc(db, "users", userId));
  loadUsers();
}
