// ========================================
// LOGIN - ELITE MOTORS
// ========================================

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

// Si ya está logueado, redirigir al admin
auth.onAuthStateChanged((user) => {
  if (user && window.location.pathname.includes('login.html')) {
    window.location.href = 'admin.html';
  }
});
