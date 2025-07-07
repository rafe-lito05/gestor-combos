// Configuración inicial
document.addEventListener("DOMContentLoaded", function () {
  // Navegación - Botón Nuevo Pedido
  const nuevoComboBtn = document.getElementById("nuevo-combo");
  if (nuevoComboBtn) {
    nuevoComboBtn.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "nuevo-combo.html";
    });
  }

  // Cargar combos en index
  if (document.getElementById("lista-combos")) {
    cargarCombos();
  }

  // Buscar combos
  const btnBuscar = document.getElementById("btn-buscar");
  if (btnBuscar) {
    btnBuscar.addEventListener("click", function () {
      const query = document.getElementById("buscar-cliente").value;
      cargarCombos(query);
    });
  }
});

// Función para cargar combos
function cargarCombos(query) {
  const lista = document.getElementById("lista-combos");
  lista.innerHTML = "<p>Cargando combos...</p>";

  // Simulamos una pequeña demora para la carga
  setTimeout(function () {
    const combos = obtenerCombos(query);
    renderizarCombos(combos, lista);
  }, 300);
}

// Función para obtener combos (con localStorage como respaldo)
function obtenerCombos(query) {
  try {
    // Intenta usar localStorage primero
    const combosGuardados = localStorage.getItem("combos");
    let combos = combosGuardados ? JSON.parse(combosGuardados) : [];

    // Si hay query, filtramos
    if (query) {
      combos = combos.filter(function (combo) {
        return combo.cliente.toLowerCase().includes(query.toLowerCase());
      });
    }

    return combos;
  } catch (error) {
    console.error("Error al obtener combos:", error);
    return [];
  }
}

// Función para renderizar combos
function renderizarCombos(combos, contenedor) {
  contenedor.innerHTML = "";

  if (combos.length === 0) {
    contenedor.innerHTML = "<p>No hay pedidos registrados</p>";
    return;
  }

  combos.forEach(function (combo) {
    const comboElement = document.createElement("div");
    comboElement.className = "combo-card";
    comboElement.innerHTML = `
      <h3>${combo.cliente}</h3>
      <p><strong>Teléfono:</strong> ${combo.telefono}</p>
      <p><strong>Fecha:</strong> ${combo.fecha}</p>
      <p><strong>Estado:</strong> <span class="estado-badge estado-${
        combo.estado || "pendiente"
      }">${
      (combo.estado || "pendiente").charAt(0).toUpperCase() +
      (combo.estado || "pendiente").slice(1)
    }</span></p>
      <p><strong>Precio Venta:</strong> $${combo.precioTotal.toFixed(2)}</p>
      <p><strong>Ganancia:</strong> $${combo.gananciaTotal.toFixed(2)}</p>
      <button data-id="${combo.id}" class="btn ver-detalle">Ver Detalle</button>
    `;
    contenedor.appendChild(comboElement);
  });

  // Agregar eventos a los botones de ver detalle
  document.querySelectorAll(".ver-detalle").forEach(function (boton) {
    boton.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      verDetalle(id);
    });
  });
}

// Función para ver detalle
function verDetalle(id) {
  localStorage.setItem("comboActual", id);
  window.location.href = "detalle-combo.html";
}

// Hacer la función accesible globalmente
window.verDetalle = verDetalle;
