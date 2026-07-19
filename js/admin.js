// ========================================
// ADMIN - ELITE MOTORS
// ========================================

// ========================================
// 0. PROTEGER ADMIN - VERIFICAR AUTENTICACIÓN
// ========================================
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
// 4. CARGAR VEHÍCULOS - CON CONTADOR DE FOTOS
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
        const fotos = v.fotos || [];
        const totalFotos = fotos.length;
        
        // Usar la primera foto si existe, sino placeholder
        const img = totalFotos > 0 ? fotos[0] : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%231a1a1a"/%3E%3Ctext x="200" y="150" font-family="Arial" font-size="24" fill="%23D4AF37" text-anchor="middle" dominant-baseline="middle"%3EElite Motors%3C/text%3E%3C/svg%3E';

        html += `
          <div class="admin-card" data-id="${id}">
            <div class="admin-card-imagen">
              <img src="${img}" alt="${v.marca} ${v.modelo}" loading="lazy">
              <span class="admin-card-estado ${v.estado === 'vendido' ? 'vendido' : 'disponible'}">
                ${v.estado === 'vendido' ? 'VENDIDO' : 'DISPONIBLE'}
              </span>
              <span class="admin-card-fotos-badge">
                📸 ${totalFotos}
              </span>
            </div>
            <div class="admin-card-body">
              <h3>${v.marca} ${v.modelo}</h3>
              <div class="version">${v.version || ''}</div>
              <div class="precio">$${Number(v.precio).toLocaleString('es-CO')}</div>
              <div class="detalles-admin">
                <span><i class="fas fa-tachometer-alt"></i> ${Number(v.kilometraje).toLocaleString()} km</span>
                <span><i class="fas fa-cog"></i> ${v.transmision || 'Automático'}</span>
              </div>
              <div class="admin-card-acciones">
                <button class="btn-editar" onclick="editarVehiculo('${id}')">✏️ Editar</button>
                <button class="btn-fotos" onclick="verFotos('${id}')">📸 Fotos (${totalFotos})</button>
                <button class="btn-vendido" onclick="toggleEstado('${id}')">
                  ${v.estado === 'vendido' ? '📦 Disponible' : '🚫 Vendido'}
                </button>
                <button class="btn-eliminar" onclick="eliminarVehiculo('${id}')">🗑️ Eliminar</button>
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
  const marca = document.getElementById('marca').value;
  const modelo = document.getElementById('modelo').value;
  const version = document.getElementById('version').value;
  
  // Crear nombre base para las fotos
  const nombreBase = `${marca.toLowerCase()}-${modelo.toLowerCase()}`.replace(/\s+/g, '-');
  
  const data = {
    marca: marca,
    modelo: modelo,
    version: version,
    año: parseInt(document.getElementById('año').value),
    precio: parseInt(document.getElementById('precio').value),
    kilometraje: parseInt(document.getElementById('kilometraje').value),
    transmision: document.getElementById('transmision').value,
    combustible: document.getElementById('combustible').value,
    estado: document.getElementById('estado').value,
    descripcion: document.getElementById('descripcion').value
  };

  // Subir imágenes (mínimo 1, máximo 8)
  const files = document.getElementById('fotos').files;
  
  // 🔥 CAMBIO AQUÍ: mínimo 1 foto en lugar de 2
  if (files.length > 0 && files.length < 1) {
    alert('Selecciona al menos 1 foto (máximo 8)');
    return;
  }
  if (files.length > 8) {
    alert('Máximo 8 fotos');
    return;
  }

  const fotosUrls = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    // Crear nombre automático: portada, 1, 2, 3...
    let nombreFoto;
    if (i === 0) {
      nombreFoto = `${nombreBase}-portada`;
    } else {
      nombreFoto = `${nombreBase}-${i}`;
    }
    // Obtener extensión del archivo original
    const extension = file.name.split('.').pop();
    const nombreCompleto = `${nombreFoto}.${extension}`;
    
    const storageRef = storage.ref(`vehiculos/${Date.now()}_${nombreCompleto}`);
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
// 8. VER FOTOS DE UN VEHÍCULO
// ========================================
function verFotos(id) {
  if (typeof db === 'undefined') return;

  db.collection('vehiculos').doc(id).get()
    .then(doc => {
      if (!doc.exists) return;
      const v = doc.data();
      const fotos = v.fotos || [];
      const marca = v.marca || '';
      const modelo = v.modelo || '';
      
      // Crear modal de fotos
      const modal = document.createElement('div');
      modal.className = 'modal-fotos active';
      modal.dataset.vehiculoId = id;
      modal.innerHTML = `
        <div class="modal-fotos-content">
          <button class="modal-fotos-close" onclick="this.closest('.modal-fotos').remove()">&times;</button>
          <h3>${marca} ${modelo} - <span>Fotos (${fotos.length})</span></h3>
          <div class="modal-fotos-grid">
            ${fotos.map((url, index) => {
              const nombre = index === 0 ? 'Portada' : `Foto ${index}`;
              return `
                <div class="modal-foto-item">
                  <img src="${url}" alt="${nombre}">
                  <span class="modal-foto-nombre">${nombre}</span>
                  <button class="btn-eliminar-foto" onclick="eliminarFoto('${id}', ${index})">🗑️</button>
                </div>
              `;
            }).join('')}
            ${fotos.length === 0 ? '<p style="color: #888; text-align:center; grid-column: 1/-1;">No hay fotos para este vehículo</p>' : ''}
          </div>
          <div class="modal-fotos-acciones">
            <button class="btn-gold" onclick="agregarFotos('${id}')">➕ Agregar Fotos</button>
            <button class="btn-gold" onclick="this.closest('.modal-fotos').remove()">Cerrar</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    });
}

// ========================================
// 9. AGREGAR FOTOS A UN VEHÍCULO
// ========================================
// ========================================
// AGREGAR FOTOS - VERSIÓN CLOUDINARY (MÚLTIPLES)
// ========================================
function agregarFotos(id) {
  if (!auth.currentUser) {
    alert('❌ Debes iniciar sesión');
    window.location.href = 'login.html';
    return;
  }
  
  const cloudName = 'ifuxuvyj'; // ← TU CLOUD NAME
  
  // Array para guardar todas las URLs
  let fotosSubidas = [];
  let totalFotos = 0;
  
  const widget = cloudinary.createUploadWidget(
    {
      cloudName: cloudName,
      uploadPreset: 'elite_motors',
      multiple: true, // ← PERMITE MÚLTIPLES FOTOS
      maxFiles: 8,
      sources: ['local', 'url', 'camera'],
      styles: {
        palette: {
          window: '#0B0B0B',
          sourceBg: '#141414',
          border: '#D4AF37',
          text: '#FFFFFF',
          action: '#D4AF37',
          inactive: '#666'
        }
      }
    },
    async (error, result) => {
      // Cuando se sube una foto exitosamente
      if (!error && result && result.event === 'success') {
        fotosSubidas.push(result.info.secure_url);
        totalFotos++;
        console.log(`📸 Foto ${totalFotos} subida: ${result.info.secure_url}`);
      }
      
      // Cuando se cierra el widget (todas las fotos se han subido o se cerró)
      if (!error && result && result.event === 'close') {
        if (fotosSubidas.length === 0) {
          console.log('⚠️ No se subieron fotos');
          return;
        }
        
        try {
          // Mostrar mensaje de guardado
          const btn = document.querySelector('.modal-fotos-acciones .btn-gold');
          if (btn) {
            btn.textContent = '⏳ Guardando...';
            btn.disabled = true;
          }
          
          // Obtener el vehículo actual
          const doc = await db.collection('vehiculos').doc(id).get();
          if (!doc.exists) {
            alert('❌ Vehículo no encontrado');
            return;
          }
          
          const v = doc.data();
          const fotosExistentes = v.fotos || [];
          
          // Combinar fotos existentes con las nuevas
          const todasLasFotos = [...fotosExistentes, ...fotosSubidas];
          
          // Actualizar en Firestore
          await db.collection('vehiculos').doc(id).update({
            fotos: todasLasFotos
          });
          
          // Recargar el panel y el modal
          cargarVehiculosAdmin();
          verFotos(id);
          
          alert(`✅ ${fotosSubidas.length} fotos subidas correctamente`);
          
        } catch (error) {
          console.error('Error al guardar:', error);
          alert('❌ Error al guardar las fotos');
        } finally {
          // Restaurar botón
          const btn = document.querySelector('.modal-fotos-acciones .btn-gold');
          if (btn) {
            btn.textContent = '📸 Subir Fotos';
            btn.disabled = false;
          }
        }
      }
    }
  );
  
  widget.open();
}
// ========================================
// 10. ELIMINAR UNA FOTO
// ========================================
function eliminarFoto(id, index) {
  if (!confirm('¿Eliminar esta foto?')) return;
  
  db.collection('vehiculos').doc(id).get()
    .then(doc => {
      if (!doc.exists) return;
      const v = doc.data();
      const fotos = v.fotos || [];
      
      // Eliminar la foto del array
      fotos.splice(index, 1);
      
      return db.collection('vehiculos').doc(id).update({
        fotos: fotos
      });
    })
    .then(() => {
      alert('✅ Foto eliminada');
      cargarVehiculosAdmin();
      // Recargar modal de fotos
      const modal = document.querySelector('.modal-fotos');
      if (modal) {
        const id = modal.dataset.vehiculoId;
        verFotos(id);
      }
    })
    .catch(error => alert('❌ Error: ' + error.message));
}

// ========================================
// 11. ELIMINAR VEHÍCULO
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
// 12. CAMBIAR ESTADO (Vendido/Disponible)
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
// 13. CERRAR SESIÓN
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
// 14. INICIALIZAR
// ========================================
document.addEventListener('DOMContentLoaded', function() {
  cargarVehiculosAdmin();
});

// Hacer funciones globales
window.editarVehiculo = editarVehiculo;
window.eliminarVehiculo = eliminarVehiculo;
window.toggleEstado = toggleEstado;
window.verFotos = verFotos;
window.agregarFotos = agregarFotos;
window.eliminarFoto = eliminarFoto;
