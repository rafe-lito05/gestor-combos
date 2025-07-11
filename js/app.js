// Configuración inicial
document.addEventListener("DOMContentLoaded", function () {
  // Navegación
  if (document.getElementById("nuevo-combo")) {
    document
      .getElementById("nuevo-combo")
      .addEventListener("click", function (e) {
        e.preventDefault();
        window.location.href = "nuevo-combo.html";
      });
  }

  // Cargar combos en index
  if (document.getElementById("lista-combos")) {
    cargarCombos();
  }

  // Buscar combos con debounce
  if (document.getElementById("buscar-cliente")) {
    let timeoutBusqueda;
    document
      .getElementById("buscar-cliente")
      .addEventListener("input", function () {
        clearTimeout(timeoutBusqueda);
        timeoutBusqueda = setTimeout(() => {
          cargarCombos(this.value);
        }, 300);
      });
  }
});

// Función para cargar combos
function cargarCombos(query) {
  const lista = document.getElementById("lista-combos");
  lista.innerHTML = '<div class="loading">Cargando combos...</div>';

  const combos = obtenerCombos(query);
  renderizarCombos(combos, lista);
}

// Función para obtener combos
function obtenerCombos(query) {
  try {
    const combosGuardados = localStorage.getItem("combos");
    let combos = combosGuardados ? JSON.parse(combosGuardados) : [];

    if (query) {
      const queryLower = query.toLowerCase();
      combos = combos.filter(function (combo) {
        return (
          combo.cliente.toLowerCase().includes(queryLower) ||
          (combo.telefono && combo.telefono.includes(query)) ||
          (combo.direccion &&
            combo.direccion.toLowerCase().includes(queryLower))
        );
      });
    }

    // Ordenar por fecha más reciente primero
    combos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    return combos;
  } catch (error) {
    console.error("Error al obtener combos:", error);
    mostrarNotificacion("Error al cargar los combos", "error");
    return [];
  }
}

// Función para renderizar combos
function renderizarCombos(combos, contenedor) {
  contenedor.innerHTML = "";

  if (combos.length === 0) {
    contenedor.innerHTML = `
      <div class="empty-state">
        <img src="Assets/empty.png" alt="Sin pedidos" class="empty-img">
        <p>No hay pedidos registrados</p>
      </div>
    `;
    return;
  }

  combos.forEach(function (combo) {
    const comboElement = document.createElement("div");
    comboElement.className = "combo-card";
    comboElement.innerHTML = `
      <h3>${combo.cliente}</h3>
      <p><strong>Teléfono:</strong> ${formatearTelefonoCubano(
        combo.telefono
      )}</p>
      <p><strong>Fecha:</strong> ${combo.fecha}</p>
      <p><strong>Estado:</strong> <span class="estado-badge estado-${
        combo.estado || "pendiente"
      }">${
      (combo.estado || "pendiente").charAt(0).toUpperCase() +
      (combo.estado || "pendiente").slice(1)
    }</span></p>
      <p><strong>Precio Venta:</strong> ${formatearMoneda(
        combo.precioTotalCUP
      )} CUP (${formatearMoneda(combo.precioTotalUSD)} USD)</p>
      <p><strong>Ganancia:</strong> ${formatearMoneda(
        combo.gananciaTotalCUP
      )} CUP</p>
      <div class="acciones-combo">
        <button data-id="${
          combo.id
        }" class="btn ver-detalle" aria-label="Ver detalle del pedido">Ver Detalle</button>
        <button data-id="${
          combo.id
        }" class="btn btn-primary editar-combo" aria-label="Editar pedido">Editar</button>
      </div>
    `;
    contenedor.appendChild(comboElement);
  });

  // Usar delegación de eventos para los botones dinámicos
  contenedor.addEventListener("click", function (e) {
    if (e.target.classList.contains("ver-detalle")) {
      verDetalle(e.target.getAttribute("data-id"));
    } else if (e.target.classList.contains("editar-combo")) {
      editarCombo(e.target.getAttribute("data-id"));
    }
  });
}

// Formatear teléfono cubano
function formatearTelefonoCubano(telefono) {
  if (!telefono) return "No especificado";
  const numero = telefono.toString().replace(/\D/g, "").slice(0, 8);
  if (numero.length === 8) {
    return `${numero.substring(0, 4)} ${numero.substring(4)}`;
  }
  return telefono;
}

// Función para ver detalle
function verDetalle(id) {
  localStorage.setItem("comboActual", id);
  window.location.href = "detalle-combo.html";
}

// Función para editar combo
function editarCombo(id) {
  localStorage.setItem("comboActual", id);
  window.location.href = "editar-combo.html";
}

// Funciones utilitarias
function formatearMoneda(valor) {
  return `$${parseFloat(valor).toFixed(2)}`;
}

function mostrarNotificacion(mensaje, tipo = "success") {
  const notificacion = document.createElement("div");
  notificacion.className = `notificacion notificacion-${tipo}`;
  notificacion.textContent = mensaje;
  document.body.appendChild(notificacion);
  setTimeout(() => notificacion.remove(), 3000);
}

// Hacer funciones accesibles globalmente
window.verDetalle = verDetalle;
window.editarCombo = editarCombo;
window.formatearTelefonoCubano = formatearTelefonoCubano;
window.formatearMoneda = formatearMoneda;
