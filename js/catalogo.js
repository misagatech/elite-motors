// ========================================
// CATÁLOGO - ELITE MOTORS
// ========================================

// ========================================
// 1. HEADER - EFECTO SCROLL
// ========================================
document.addEventListener('DOMContentLoaded', function() {
  const header = document.getElementById('header');
  
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
});

// ========================================
// 2. MENÚ HAMBURGUESA
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
  
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', toggleMenu);
  });
}

window.addEventListener('resize', function() {
  if (window.innerWidth > 768) {
    nav.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// ========================================
// 3. VARIABLES GLOBALES
// ========================================
let todosLosVehiculos = [];
let filtroActual = 'all';

// ========================================
// 4. FUNCIÓN PARA RENDERIZAR VEHÍCULOS
// ========================================
function renderVehiculos(vehiculos) {
  const grid = document.getElementById('vehiculosGrid');
  
  if (!grid) return;
  
  if (!vehiculos || vehiculos.length === 0) {
    grid.innerHTML = `
      <div class="no-vehiculos">
        <p>No hay vehículos disponibles en este momento.</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = vehiculos.map(vehiculo => {
    // Usar imagen de Firebase o placeholder
   const imagenUrl = vehiculo.fotos && vehiculo.fotos.length > 0 
  ? vehiculo.fotos[0] 
  : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%231a1a1a"/%3E%3Ctext x="200" y="150" font-size="60" text-anchor="middle" dominant-baseline="middle"%3E🚗%3C/text%3E%3Ctext x="200" y="200" font-family="Arial" font-size="20" fill="%23D4AF37" text-anchor="middle"%3EElite Motors%3C/text%3E%3C/svg%3E';
    return `
    <div class="vehiculo-card">
      <div class="card-imagen">
        <img src="${imagenUrl}" alt="${vehiculo.marca} ${vehiculo.modelo}">
        <span class="card-estado estado-${vehiculo.estado || 'disponible'}">
          ${vehiculo.estado === 'vendido' ? '🔴 Vendido' : '🟢 Disponible'}
        </span>
      </div>
      
      <div class="card-body">
        <h3 class="card-title">${vehiculo.marca} ${vehiculo.modelo}</h3>
        <div class="card-precio">$${Number(vehiculo.precio).toLocaleString('es-CO')}</div>
        
        <div class="card-detalles">
          <span class="card-detalle-item">
            <i class="fas fa-tachometer-alt"></i> ${Number(vehiculo.kilometraje).toLocaleString()} km
          </span>
          <span class="card-detalle-item">
            <i class="fas fa-cog"></i> ${vehiculo.transmision || 'Automático'}
          </span>
        </div>
        
        <a href="vehiculo.html?id=${vehiculo.id}" class="card-btn">
          VER VEHÍCULO
          <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    </div>
  `}).join('');
}

// ========================================
// 5. FUNCIÓN PARA FILTRAR
// ========================================
function filtrarVehiculos(filtro) {
  if (!todosLosVehiculos || todosLosVehiculos.length === 0) {
    renderVehiculos([]);
    return;
  }
  
  if (filtro === 'all') {
    renderVehiculos(todosLosVehiculos);
  } else {
    const filtrados = todosLosVehiculos.filter(v => 
      v.marca && v.marca.toLowerCase() === filtro.toLowerCase()
    );
    renderVehiculos(filtrados);
  }
}

// ========================================
// 6. CARGAR VEHÍCULOS DESDE FIREBASE
// ========================================
function cargarVehiculos() {
  const grid = document.getElementById('vehiculosGrid');
  const contador = document.getElementById('contadorVehiculos');
  
  if (grid) {
    grid.innerHTML = `
      <div class="no-vehiculos">
        <p style="color: var(--gold);">Cargando vehículos...</p>
      </div>
    `;
  }
  
  if (contador) {
    contador.textContent = '🔄 Cargando vehículos...';
  }
  
  if (typeof db === 'undefined') {
    console.error('❌ Firebase no está inicializado');
    if (grid) {
      grid.innerHTML = `
        <div class="no-vehiculos">
          <p>Error al cargar vehículos. Firebase no disponible.</p>
        </div>
      `;
    }
    if (contador) {
      contador.textContent = '❌ Error al cargar';
    }
    return;
  }
  
  console.log('🔄 Cargando vehículos desde Firebase...');
  
  db.collection('vehiculos')
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        console.log('⚠️ No hay vehículos en Firestore');
        if (grid) {
          grid.innerHTML = `
            <div class="no-vehiculos">
              <p>No hay vehículos disponibles en este momento.</p>
            </div>
          `;
        }
        if (contador) {
          contador.textContent = '0 vehículos disponibles';
        }
        todosLosVehiculos = [];
        return;
      }
      
      const vehiculos = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        vehiculos.push({
          id: doc.id,
          ...data
        });
      });
      
      todosLosVehiculos = vehiculos;
      
      // ✅ ACTUALIZAR CONTADOR
      if (contador) {
        const disponibles = vehiculos.filter(v => v.estado !== 'vendido').length;
        const total = vehiculos.length;
        contador.innerHTML = `<span>${disponibles}</span> vehículos disponibles de <span>${total}</span> en total`;
      }
      
      console.log(`✅ ${vehiculos.length} vehículos cargados desde Firebase`);
      renderVehiculos(vehiculos);
    })
    .catch((error) => {
      console.error('❌ Error al cargar vehículos:', error);
      if (grid) {
        grid.innerHTML = `
          <div class="no-vehiculos">
            <p>Error al cargar vehículos.</p>
            <p style="font-size: 14px; margin-top: 10px; color: #666;">
              ${error.message}
            </p>
          </div>
        `;
      }
      if (contador) {
        contador.textContent = '❌ Error al cargar vehículos';
      }
    });
}
// ========================================
// 7. CONFIGURAR FILTROS
// ========================================
function configurarFiltros() {
  document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      filtroActual = this.dataset.filter;
      filtrarVehiculos(filtroActual);
    });
  });
}
// En catalogo.js
// Botón "Ir arriba"
const scrollBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        scrollBtn.classList.add('visible');
    } else {
        scrollBtn.classList.remove('visible');
    }
});
scrollBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ========================================
// 8. INICIALIZAR
// ========================================
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Inicializando catálogo...');
  configurarFiltros();
  cargarVehiculos();
});

// Hacer disponible la función globalmente
window.cargarVehiculos = cargarVehiculos;
