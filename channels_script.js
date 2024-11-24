import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;

// Verificar autenticación
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
    } else {
        alert("Debe iniciar sesión para gestionar los canales.");
        return;
    }
});

// Manejar la creación del canal
document.getElementById('channel-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentUser) {
        alert("Debe iniciar sesión para agregar un canal.");
        return;
    }

    // Obtener los valores del formulario
    const name = document.getElementById('name').value.trim();
    const logoUrl = document.getElementById('logoUrl').value.trim();
    const streamUrl = document.getElementById('streamUrl').value.trim();
    const category = document.getElementById('category').value.trim();

    // Generar el id del documento a partir del nombre del canal
    const documentId = name.toLowerCase().replace(/\s+/g, '-');

    try {
        // Agregar o actualizar el documento del canal
        await setDoc(doc(db, 'channels', documentId), {
            name: name,
            logoUrl: logoUrl,
            streamUrl: streamUrl,
            category: category,
        }, { merge: true });

        document.getElementById('message').innerText = "Canal agregado o actualizado exitosamente";
    } catch (error) {
        document.getElementById('message').innerText = "Error al agregar el canal: " + error.message;
    }
});

// Manejar la verificación del canal
document.getElementById('verify-channel-btn').addEventListener('click', async () => {
    const verifyName = document.getElementById('verify-name').value.trim();
    if (!verifyName) {
        alert("Por favor, ingrese el nombre del canal a verificar.");
        return;
    }

    // Generar el id del documento a partir del nombre del canal
    const documentId = verifyName.toLowerCase().replace(/\s+/g, '-');

    try {
        const docRef = doc(db, 'channels', documentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('name').value = data.name || '';
            document.getElementById('logoUrl').value = data.logoUrl || '';
            document.getElementById('streamUrl').value = data.streamUrl || '';
            document.getElementById('category').value = data.category || '';
            document.getElementById('message').innerText = "Canal encontrado. Campos completados.";
        } else {
            document.getElementById('message').innerText = "El canal no existe. Puede agregarlo.";
        }
    } catch (error) {
        document.getElementById('message').innerText = "Error al verificar el canal: " + error.message;
    }
});

// Manejar la eliminación del canal
document.getElementById('delete-channel-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentUser) {
        alert("Debe iniciar sesión para eliminar un canal.");
        return;
    }

    // Obtener el nombre del canal a eliminar
    const deleteName = document.getElementById('delete-name').value.trim();
    if (!deleteName) {
        alert("Por favor, ingrese el nombre del canal a eliminar.");
        return;
    }

    // Generar el id del documento a partir del nombre del canal
    const documentId = deleteName.toLowerCase().replace(/\s+/g, '-');

    try {
        // Eliminar el documento del canal
        await deleteDoc(doc(db, 'channels', documentId));
        document.getElementById('message').innerText = "Canal eliminado exitosamente";
    } catch (error) {
        document.getElementById('message').innerText = "Error al eliminar el canal: " + error.message;
    }
});
