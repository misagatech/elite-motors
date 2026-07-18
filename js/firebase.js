// ========================================
// FIREBASE - CONFIGURACIÓN
// ========================================

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDUpNyX8Rm-vbZoj2y2qQD2xZN5rVss0mU",
  authDomain: "elite-motors-c8f84.firebaseapp.com",
  projectId: "elite-motors-c8f84",
  storageBucket: "elite-motors-c8f84.firebasestorage.app",
  messagingSenderId: "594613354704",
  appId: "1:594613354704:web:9b3d0dc35a6005ad0c5ed5"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// ========================================
// SERVICIOS
// ========================================

const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();

// ========================================
// COLECCIONES
// ========================================

const VEHICULOS_COLLECTION = "vehiculos";

// ========================================
// VARIABLES GLOBALES
// ========================================

// Estas variables quedan disponibles para todo el proyecto
window.db = db;
window.storage = storage;
window.auth = auth;
window.VEHICULOS_COLLECTION = VEHICULOS_COLLECTION;
