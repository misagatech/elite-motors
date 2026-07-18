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
  
  // Cerrar menú al hacer clic en un enlace
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', toggleMenu);
  });
}

// ========================================
// 3. CERRAR MENÚ AL REDIMENSIONAR
// ========================================
window.addEventListener('resize', function() {
  if (window.innerWidth > 768) {
    nav.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// ========================================
// 4. FILTROS (ejemplo con datos estáticos)
// ========================================
// Datos de ejemplo (luego vendrán de Firebase)
const vehiculosEjemplo = [
  {
    id: 1,
    marca: "BMW",
    modelo: "120i",
    año: 2022,
    precio: 65000000,
    kilometraje: 87295,
    transmision: "Automático",
    imagen: "img/bmw-120i.jpg",
    estado: "disponible"
  },
  {
    id: 2,
    marca: "Mercedes",
    modelo: "C200",
    año: 2021,
    precio: 78000000,
    kilometraje: 45000,
    transmision: "Automático",
    imagen: "img/mercedes-c200.jpg",
    estado: "disponible"
  },
  {
    id: 3,
    marca: "Mazda",
    modelo: "CX-5",
    año: 2023,
    precio: 58000000,
    kilometraje: 15000,
    transmision: "Automático",
    imagen: "img/mazda-cx5.jpg",
    estado: "disponible"
  }
];

// Función para renderizar vehículos
function renderVehiculos(vehiculos) {
  const grid = document.getElementById('vehiculosGrid');
  
  if (!grid) return;
  
  if (vehiculos.length === 0) {
    grid.innerHTML = `
      <div class="no-vehiculos">
        <p>No hay vehículos disponibles en este momento.</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = vehiculos.map(vehiculo => `
    <div class="vehiculo-card">
      <div class="card-imagen">
        <img src="${vehiculo.imagen}" alt="${vehiculo.marca} ${vehiculo.modelo}">
        <span class="card-estado estado-${vehiculo.estado}">
          ${vehiculo.estado === 'disponible' ? '🟢 Disponible' : '🔴 Vendido'}
        </span>
      </div>
      
      <div class="card-body">
        <h3 class="card-title">${vehiculo.marca} ${vehiculo.modelo}</h3>
        <div class="card-precio">$${vehiculo.precio.toLocaleString('es-CO')}</div>
        
        <div class="card-detalles">
          <span class="card-detalle-item">
            <i class="fas fa-tachometer-alt"></i> ${vehiculo.kilometraje.toLocaleString()} km
          </span>
          <span class="card-detalle-item">
            <i class="fas fa-cog"></i> ${vehiculo.transmision}
          </span>
        </div>
        
        <a href="vehiculo.html?id=${vehiculo.id}" class="card-btn">
          VER VEHÍCULO
          <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    </div>
  `).join('');
}

// Función para filtrar vehículos
function filtrarVehiculos(filtro) {
  if (filtro === 'all') {
    renderVehiculos(vehiculosEjemplo);
  } else {
    const filtrados = vehiculosEjemplo.filter(v => 
      v.marca.toLowerCase() === filtro.toLowerCase()
    );
    renderVehiculos(filtrados);
  }
}

// ========================================
// 5. EVENTOS DE FILTROS
// ========================================
document.addEventListener('DOMContentLoaded', function() {
  // Renderizar vehículos iniciales
  renderVehiculos(vehiculosEjemplo);
  
  // Configurar filtros
  document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      // Activar/desactivar botones
      document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      const filtro = this.dataset.filter;
      filtrarVehiculos(filtro);
    });
  });
});
