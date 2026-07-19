// ========================================
// LOGIN - ELITE MOTORS
// ========================================

console.log('🚀 Cargando login.js...');

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  console.log('📄 DOM cargado');
  
  // Función para verificar Firebase
  function verificarFirebase() {
    if (typeof firebase === 'undefined') {
      console.error('❌ Firebase no está definido');
      return false;
    }
    if (typeof auth === 'undefined') {
      console.error('❌ Auth no está definido');
      return false;
    }
    console.log('✅ Firebase disponible');
    console.log('   - auth:', typeof auth);
    console.log('   - firebase.auth:', typeof firebase.auth);
    return true;
  }
  
  // Verificar Firebase
  if (!verificarFirebase()) {
    const errorEl = document.getElementById('loginError');
    if (errorEl) {
      errorEl.textContent = '❌ Error de conexión con Firebase. Recarga la página.';
      errorEl.style.display = 'block';
    }
    return;
  }
  
  // Si ya está logueado, redirigir
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log('👤 Usuario ya logueado:', user.email);
      window.location.href = 'admin.html';
    } else {
      console.log('👤 No hay usuario logueado');
    }
  });
  
  // Formulario de login
  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      const errorEl = document.getElementById('loginError');
      
      // Limpiar errores
      errorEl.style.display = 'none';
      errorEl.textContent = '';
      
      // Validar campos
      if (!email || !password) {
        errorEl.textContent = '❌ Completa todos los campos';
        errorEl.style.display = 'block';
        return;
      }
      
      // Verificar Firebase nuevamente
      if (typeof auth === 'undefined') {
        errorEl.textContent = '❌ Firebase no está disponible. Recarga la página.';
        errorEl.style.display = 'block';
        return;
      }
      
      console.log('🔄 Intentando login con:', email);
      
      // Intentar login
      auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          console.log('✅ Login exitoso:', userCredential.user.email);
          window.location.href = 'admin.html';
        })
        .catch((error) => {
          console.error('❌ Error de login:', error.code, error.message);
          
          let mensaje = '❌ ';
          switch (error.code) {
            case 'auth/user-not-found':
              mensaje += 'Usuario no encontrado. Verifica el email.';
              break;
            case 'auth/wrong-password':
              mensaje += 'Contraseña incorrecta. Intenta nuevamente.';
              break;
            case 'auth/invalid-email':
              mensaje += 'Formato de email inválido.';
              break;
            case 'auth/too-many-requests':
              mensaje += 'Demasiados intentos. Espera unos minutos.';
              break;
            case 'auth/network-request-failed':
              mensaje += 'Error de red. Verifica tu conexión.';
              break;
            default:
              mensaje += error.message;
          }
          errorEl.textContent = mensaje;
          errorEl.style.display = 'block';
        });
    });
  } else {
    console.error('❌ Formulario no encontrado');
  }
});

// Credenciales de prueba
console.log('📋 Credenciales de administrador:');
console.log('   📧 Email: elitemotors2026colombia@gmail.com');
console.log('   🔑 Contraseña: Colombia#Elite2026!');
