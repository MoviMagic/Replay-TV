import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDocs, collection, query, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    listarUsuarios();
  } else {
    document.getElementById('login-modal').style.display = 'flex';
    document.getElementById('admin-panel').style.display = 'none';
  }
});

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

async function listarUsuarios() {
  const usersContainer = document.getElementById('users-list');
  usersContainer.innerHTML = '';
  const q = query(collection(db, 'users'));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    const user = doc.data();
    const userItem = document.createElement('div');
    userItem.classList.add('user-item');
    userItem.innerHTML = `<p><strong>Nombre:</strong> ${user.username}</p>`;
    usersContainer.appendChild(userItem);
  });
}
