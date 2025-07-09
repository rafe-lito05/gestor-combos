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

  // Buscar combos
  if (document.getElementById("btn-buscar")) {
    document
      .getElementById("btn-buscar")
      .addEventListener("click", function () {
        const query = document.getElementById("buscar-cliente").value;
        cargarCombos(query);
      });
  }
});

// Función para cargar combos
function cargarCombos(query) {
  const lista = document.getElementById("lista-combos");
  lista.innerHTML = "<p>Cargando combos...</p>";

  setTimeout(function () {
    const combos = obtenerCombos(query);
    renderizarCombos(combos, lista);
  }, 300);
}

// Función para obtener combos
function obtenerCombos(query) {
  try {
    const combosGuardados = localStorage.getItem("combos");
    let combos = combosGuardados ? JSON.parse(combosGuardados) : [];

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
      <p><strong>Precio Venta:</strong> $${combo.precioTotal.toFixed(2)}</p>
      <p><strong>Ganancia:</strong> $${combo.gananciaTotal.toFixed(2)}</p>
      <div class="acciones-combo">
        <button data-id="${
          combo.id
        }" class="btn ver-detalle">Ver Detalle</button>
        <button data-id="${
          combo.id
        }" class="btn btn-primary editar-combo">Editar</button>
      </div>
    `;
    contenedor.appendChild(comboElement);
  });

  // Agregar eventos
  document.querySelectorAll(".ver-detalle").forEach(function (boton) {
    boton.addEventListener("click", function () {
      verDetalle(this.getAttribute("data-id"));
    });
  });

  document.querySelectorAll(".editar-combo").forEach(function (boton) {
    boton.addEventListener("click", function () {
      editarCombo(this.getAttribute("data-id"));
    });
  });
}

// Formatear teléfono cubano
function formatearTelefonoCubano(telefono) {
  if (!telefono) return "";
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

// Hacer funciones accesibles globalmente
window.verDetalle = verDetalle;
window.editarCombo = editarCombo;
window.formatearTelefonoCubano = formatearTelefonoCubano;
