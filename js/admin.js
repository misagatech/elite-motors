// ========================================
// ADMIN - ELITE MOTORS
// ========================================

// ========================================
// 0. PROTEGER ADMIN - VERIFICAR AUTENTICACIÓN
// ========================================
// Esta sección debe ir al PRINCIPIO del archivo
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = 'login.html';
  }
});
// ========================================
// 1. VARIABLES GLOBALES
// ========================================
let vehiculoEditando = null;

// ========================================
// 2. HEADER - EFECTO SCROLL
// ========================================
document.addEventListener('DOMContentLoaded', function() {
  const header = document.getElementById('header');
  window.addEventListener('scroll', function() {
    header.classList.toggle('scrolled', window.scrollY > 50);
  });
});

// ========================================
// 3. MENÚ HAMBURGUESA
// ========================================
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('headerNav');
const overlay = document.getElementById('headerOverlay');

function toggleMenu() {
  nav.classList.toggle('open');
  overlay.classList.toggle('active');
  document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
}

if (hamburger && nav && overlay) {
  hamburger.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', toggleMenu);
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', toggleMenu));
}

window.addEventListener('resize', function() {
  if (window.innerWidth > 768) {
    nav.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// ========================================
// 4. CARGAR VEHÍCULOS
// ========================================
function cargarVehiculosAdmin() {
  const grid = document.getElementById('adminGrid');
  if (!grid) return;

  grid.innerHTML = '<p style="color: #888; text-align: center;">Cargando vehículos...</p>';

  if (typeof db === 'undefined') {
    grid.innerHTML = '<p style="color: #ff4757; text-align: center;">Firebase no disponible</p>';
    return;
  }

  db.collection('vehiculos')
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        grid.innerHTML = '<p style="color: #888; text-align: center;">No hay vehículos</p>';
        return;
      }

      let html = '';
      snapshot.forEach(doc => {
        const v = doc.data();
        const id = doc.id;
        const img = v.fotos && v.fotos.length > 0 ? v.fotos[0] : 'https://via.placeholder.com/400x300/1a1a1a/D4AF37?text=Elite+Motors';

        html += `
          <div class="admin-card" data-id="${id}">
            <div class="admin-card-imagen">
              <img src="${img}" alt="${v.marca} ${v.modelo}">
            </div>
            <div class="admin-card-body">
              <h3>${v.marca} ${v.modelo}</h3>
              <div class="precio">$${Number(v.precio).toLocaleString('es-CO')}</div>
              <div style="color: #888; font-size: 13px;">${v.estado === 'vendido' ? '🔴 Vendido' : '🟢 Disponible'}</div>
              <div class="admin-card-acciones">
                <button class="btn-editar" onclick="editarVehiculo('${id}')">Editar</button>
                <button class="btn-vendido" onclick="toggleEstado('${id}')">
                  ${v.estado === 'vendido' ? 'Disponible' : 'Vendido'}
                </button>
                <button class="btn-eliminar" onclick="eliminarVehiculo('${id}')">Eliminar</button>
              </div>
            </div>
          </div>
        `;
      });

      grid.innerHTML = html;
    })
    .catch(error => {
      console.error('Error:', error);
      grid.innerHTML = '<p style="color: #ff4757; text-align: center;">Error al cargar vehículos</p>';
    });
}

// ========================================
// 5. AGREGAR/EDITAR VEHÍCULO
// ========================================
document.getElementById('btnAgregarVehiculo')?.addEventListener('click', function() {
  vehiculoEditando = null;
  document.getElementById('modalTitle').textContent = 'Agregar Vehículo';
  document.getElementById('formVehiculo').reset();
  document.getElementById('vehiculoId').value = '';
  document.getElementById('modalVehiculo').classList.add('active');
});

document.getElementById('modalClose')?.addEventListener('click', function() {
  document.getElementById('modalVehiculo').classList.remove('active');
});

document.getElementById('modalVehiculo')?.addEventListener('click', function(e) {
  if (e.target === this) {
    this.classList.remove('active');
  }
});

// ========================================
// 6. EDITAR VEHÍCULO
// ========================================
function editarVehiculo(id) {
  if (typeof db === 'undefined') return;

  db.collection('vehiculos').doc(id).get()
    .then(doc => {
      if (!doc.exists) return;
      const v = doc.data();
      vehiculoEditando = id;
      
      document.getElementById('modalTitle').textContent = 'Editar Vehículo';
      document.getElementById('vehiculoId').value = id;
      document.getElementById('marca').value = v.marca || '';
      document.getElementById('modelo').value = v.modelo || '';
      document.getElementById('version').value = v.version || '';
      document.getElementById('año').value = v.año || '';
      document.getElementById('precio').value = v.precio || '';
      document.getElementById('kilometraje').value = v.kilometraje || '';
      document.getElementById('transmision').value = v.transmision || 'Automático';
      document.getElementById('combustible').value = v.combustible || 'Gasolina';
      document.getElementById('estado').value = v.estado || 'disponible';
      document.getElementById('descripcion').value = v.descripcion || '';
      
      document.getElementById('modalVehiculo').classList.add('active');
    });
}

// ========================================
// 7. GUARDAR VEHÍCULO
// ========================================
document.getElementById('formVehiculo')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const id = document.getElementById('vehiculoId').value;
  const data = {
    marca: document.getElementById('marca').value,
    modelo: document.getElementById('modelo').value,
    version: document.getElementById('version').value,
    año: parseInt(document.getElementById('año').value),
    precio: parseInt(document.getElementById('precio').value),
    kilometraje: parseInt(document.getElementById('kilometraje').value),
    transmision: document.getElementById('transmision').value,
    combustible: document.getElementById('combustible').value,
    estado: document.getElementById('estado').value,
    descripcion: document.getElementById('descripcion').value
  };

  // Subir imágenes
  const files = document.getElementById('fotos').files;
  if (files.length > 0 && files.length < 2) {
    alert('Selecciona al menos 2 fotos (máximo 8)');
    return;
  }
  if (files.length > 8) {
    alert('Máximo 8 fotos');
    return;
  }

  const fotosUrls = [];
  for (const file of files) {
    const storageRef = storage.ref(`vehiculos/${Date.now()}_${file.name}`);
    await storageRef.put(file);
    const url = await storageRef.getDownloadURL();
    fotosUrls.push(url);
  }

  if (fotosUrls.length > 0) {
    data.fotos = fotosUrls;
  }

  try {
    if (id) {
      await db.collection('vehiculos').doc(id).update(data);
      alert('✅ Vehículo actualizado');
    } else {
      await db.collection('vehiculos').add(data);
      alert('✅ Vehículo agregado');
    }
    
    document.getElementById('modalVehiculo').classList.remove('active');
    cargarVehiculosAdmin();
  } catch (error) {
    alert('❌ Error al guardar: ' + error.message);
  }
});

// ========================================
// 8. ELIMINAR VEHÍCULO
// ========================================
function eliminarVehiculo(id) {
  if (!confirm('¿Seguro que quieres eliminar este vehículo?')) return;
  
  db.collection('vehiculos').doc(id).delete()
    .then(() => {
      alert('✅ Vehículo eliminado');
      cargarVehiculosAdmin();
    })
    .catch(error => alert('❌ Error: ' + error.message));
}

// ========================================
// 9. CAMBIAR ESTADO (Vendido/Disponible)
// ========================================
function toggleEstado(id) {
  db.collection('vehiculos').doc(id).get()
    .then(doc => {
      if (!doc.exists) return;
      const nuevoEstado = doc.data().estado === 'vendido' ? 'disponible' : 'vendido';
      return db.collection('vehiculos').doc(id).update({ estado: nuevoEstado });
    })
    .then(() => {
      cargarVehiculosAdmin();
    })
    .catch(error => alert('❌ Error: ' + error.message));
}

// ========================================
// 10. CERRAR SESIÓN
// ========================================
document.getElementById('btnLogout')?.addEventListener('click', function(e) {
  e.preventDefault();
  if (typeof auth !== 'undefined') {
    auth.signOut().then(() => {
      window.location.href = 'login.html';
    });
  }
});

// ========================================
// 11. INICIALIZAR
// ========================================
document.addEventListener('DOMContentLoaded', function() {
  cargarVehiculosAdmin();
});

window.editarVehiculo = editarVehiculo;
window.eliminarVehiculo = eliminarVehiculo;
window.toggleEstado = toggleEstado;
