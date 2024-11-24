// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDnGHxXiUkm1Onblu3en-V2v5Yxk9OnFL8",
  authDomain: "replay-tv-33de1.firebaseapp.com",
  projectId: "replay-tv-33de1",
  storageBucket: "replay-tv-33de1.firebasestorage.app",
  messagingSenderId: "19557200212",
  appId: "1:19557200212:web:a9bb8b64cbd17be46758c1",
  measurementId: "G-JLFC3D8V9Y"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const loginForm = document.getElementById("admin-login-form");
const userManagementContainer = document.getElementById("user-management-container");
const loginContainer = document.getElementById("login-container");
const userList = document.getElementById("user-list");
const deviceList = document.getElementById("device-list");

// Configurar persistencia de sesión
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch((error) => {
  console.error("Error configurando persistencia de sesión:", error);
});

// Verificar si hay un usuario autenticado al cargar la página
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const userDoc = await db.collection("adminUsers").doc(user.uid).get();
    if (userDoc.exists && userDoc.data().role === "admin") {
      loginContainer.classList.add("hidden");
      userManagementContainer.classList.remove("hidden");
      loadUsers();
    } else {
      auth.signOut(); // Si no es administrador, cerrar sesión
    }
  } else {
    loginContainer.classList.remove("hidden");
    userManagementContainer.classList.add("hidden");
  }
});

// Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("admin-login-email").value;
  const password = document.getElementById("admin-login-password").value;

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const userDoc = await db.collection("adminUsers").doc(userCredential.user.uid).get();
    if (userDoc.exists && userDoc.data().role === "admin") {
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
  auth.signOut().then(() => {
    loginContainer.classList.remove("hidden");
    userManagementContainer.classList.add("hidden");
  });
});

// Load Users
async function loadUsers() {
  const querySnapshot = await db.collection("users").get();
  userList.innerHTML = "";
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    userList.innerHTML += 
      <tr>
        <td>${data.username}</td>
        <td>${data.email}</td>
        <td>${data.password}</td>
        <td>${data.expirationDate.toDate().toLocaleDateString()}</td>
        <td>
          <button onclick="renewUser('${doc.id}', 1)">+1 Mes</button>
          <button onclick="renewUser('${doc.id}', 3)">+3 Meses</button>
          <button onclick="renewUser('${doc.id}', 6)">+6 Meses</button>
          <button onclick="renewUser('${doc.id}', 12)">+12 Meses</button>
          <button onclick="deleteUser('${doc.id}')">Eliminar</button>
          <button onclick="loadDevices('${doc.id}')">Ver Dispositivos</button>
        </td>
      </tr>;
  });
}

// Create User
document.getElementById("add-user-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("new-username").value;
  const email = document.getElementById("new-email").value;
  const password = document.getElementById("new-password").value;
  const expirationDate = document.getElementById("expiration-date").value;

  try {
    const newUser = await auth.createUserWithEmailAndPassword(email, password);

    // Convertir expirationDate a Timestamp
    const expirationTimestamp = firebase.firestore.Timestamp.fromDate(new Date(expirationDate));

    await db.collection("users").doc(newUser.user.uid).set({
      username,
      email,
      password,
      expirationDate: expirationTimestamp, // Guardar como Timestamp
    });
    loadUsers();
  } catch (error) {
    console.error("Error creando usuario:", error);
  }
});

// Renew User
async function renewUser(userId, months) {
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();

  if (userDoc.exists) {
    const currentDate = new Date(); // Fecha actual
    const expirationDate = userDoc.data().expirationDate.toDate(); // Fecha de expiración actual

    // Calcular la fecha base para la renovación
    const baseDate = expirationDate > currentDate ? expirationDate : currentDate;

    // Añadir los meses de renovación
    baseDate.setMonth(baseDate.getMonth() + months);

    // Convertir a Timestamp y actualizar en Firestore
    const newExpirationTimestamp = firebase.firestore.Timestamp.fromDate(baseDate);
    await userRef.update({ expirationDate: newExpirationTimestamp });

    // Recargar la lista de usuarios
    loadUsers();
  }
}

// Delete User
async function deleteUser(userId) {
  await db.collection("users").doc(userId).delete();
  loadUsers();
}

// Load Devices
async function loadDevices(userId) {
  const devicesRef = db.collection("users").doc(userId).collection("devices");
  const querySnapshot = await devicesRef.get();
  deviceList.innerHTML = "";
  querySnapshot.forEach((doc) => {
    deviceList.innerHTML += 
      <tr>
        <td>${doc.id}</td>
        <td>
          <button onclick="deleteDevice('${userId}', '${doc.id}')">Eliminar</button>
        </td>
      </tr>;
  });
}

// Delete Device
async function deleteDevice(userId, deviceId) {
  await db.collection("users").doc(userId).collection("devices").doc(deviceId).delete();
  loadDevices(userId);
}