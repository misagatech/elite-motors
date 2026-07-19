// ========================================
// LOGIN - ELITE MOTORS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  // Si ya está logueado, redirigir al admin
  if (typeof auth !== 'undefined') {
    auth.onAuthStateChanged((user) => {
      if (user && window.location.pathname.includes('login.html')) {
        window.location.href = 'admin.html';
      }
    });
  }
});

document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  
  errorEl.style.display = 'none';
  
  if (typeof auth === 'undefined') {
    errorEl.textContent = 'Firebase no está disponible';
    errorEl.style.display = 'block';
    return;
  }
  
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = 'admin.html';
    })
    .catch((error) => {
      errorEl.textContent = '❌ ' + error.message;
      errorEl.style.display = 'block';
    });
});

// ========================================
// CREDENCIALES DE PRUEBA
// ========================================
console.log('📋 Credenciales de administrador:');
console.log('   📧 Email: elitemotors2026colombia@gmail.com');
console.log('   🔑 Contraseña: Colombia#Elite2026!');
