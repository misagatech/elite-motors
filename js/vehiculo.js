// ========================================
// DETALLE DEL VEHÍCULO - ELITE MOTORS
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
// 3. CARGAR DETALLE DEL VEHÍCULO
// ========================================
document.addEventListener('DOMContentLoaded', function() {
  // Obtener ID del vehículo de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const vehiculoId = urlParams.get('id');
  
  const loading = document.getElementById('detalleLoading');
  const content = document.getElementById('detalleContent');
  const error = document.getElementById('detalleError');
  
  if (!vehiculoId) {
    if (loading) loading.style.display = 'none';
    if (error) error.style.display = 'block';
    return;
  }
  
  // Verificar Firebase
  if (typeof db === 'undefined') {
    if (loading) loading.style.display = 'none';
    if (error) error.style.display = 'block';
    return;
  }
  
  // Cargar vehículo
  db.collection('vehiculos').doc(vehiculoId).get()
    .then((doc) => {
      if (loading) loading.style.display = 'none';
      
      if (!doc.exists) {
        if (error) error.style.display = 'block';
        return;
      }
      
      const vehiculo = doc.data();
      mostrarDetalle(vehiculo, vehiculoId);
    })
    .catch((error) => {
      console.error('Error al cargar vehículo:', error);
      if (loading) loading.style.display = 'none';
      if (error) error.style.display = 'block';
    });
});

// ========================================
// 4. MOSTRAR DETALLE
// ========================================
function mostrarDetalle(vehiculo, id) {
  const content = document.getElementById('detalleContent');
  if (content) content.style.display = 'block';
  
  // Título
  const titulo = document.getElementById('detalleTitulo');
  if (titulo) titulo.textContent = `${vehiculo.marca} ${vehiculo.modelo}`;
  
  // Precio
  const precio = document.getElementById('detallePrecio');
  if (precio) precio.textContent = `$${Number(vehiculo.precio).toLocaleString('es-CO')}`;
  
  // Estado
  const estadoEl = document.getElementById('detalleEstado');
  if (estadoEl) {
    if (vehiculo.estado === 'vendido') {
      estadoEl.textContent = '🔴 VENDIDO';
      estadoEl.className = 'detalle-estado estado-vendido';
    } else {
      estadoEl.textContent = '🟢 DISPONIBLE';
      estadoEl.className = 'detalle-estado estado-disponible';
    }
  }
  
  // Especificaciones
  const km = document.getElementById('detalleKilometraje');
  if (km) km.textContent = `${Number(vehiculo.kilometraje).toLocaleString()} km`;
  
  const transmision = document.getElementById('detalleTransmision');
  if (transmision) transmision.textContent = vehiculo.transmision || 'Automático';
  
  const año = document.getElementById('detalleAño');
  if (año) año.textContent = vehiculo.año || 'N/A';
  
  const combustible = document.getElementById('detalleCombustible');
  if (combustible) combustible.textContent = vehiculo.combustible || 'Gasolina';
  
  // Descripción
  const descripcion = document.getElementById('detalleDescripcion');
  if (descripcion) descripcion.textContent = vehiculo.descripcion || 'Vehículo en excelentes condiciones, mantenimiento al día.';
  
  // WhatsApp
  const whatsapp = document.getElementById('detalleWhatsApp');
  if (whatsapp) {
    const mensaje = `Hola, estoy interesado en el vehículo ${vehiculo.marca} ${vehiculo.modelo}.`;
    whatsapp.href = `https://wa.me/573227578520?text=${encodeURIComponent(mensaje)}`;
  }
  
  // Imagen principal
  const imagenes = vehiculo.fotos || [];
  const imgPrincipal = document.getElementById('detalleImagenPrincipal');
  if (imgPrincipal) {
    imgPrincipal.src = imagenes.length > 0 ? imagenes[0] : 'img/placeholder-car.jpg';
  }
  
  // ========================================
  // 5. MINIATURAS - SOLO LAS QUE EXISTEN
  // ========================================
  const thumbsContainer = document.getElementById('detalleThumbs');
  if (thumbsContainer) {
    thumbsContainer.innerHTML = '';
    
    // Mostrar SOLO las imágenes que existen
    imagenes.forEach((img, index) => {
      const thumb = document.createElement('img');
      thumb.src = img;
      thumb.alt = `Vista ${index + 1}`;
      thumb.className = 'detalle-thumb' + (index === 0 ? ' active' : '');
      thumb.addEventListener('click', function() {
        if (imgPrincipal) imgPrincipal.src = this.src;
        document.querySelectorAll('.detalle-thumb').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
      });
      thumbsContainer.appendChild(thumb);
    });
  }
}
