document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("tabla-productos")) {
    cargarDetalleCombo();
    configurarEventosDetalle();
  }
});

function cargarDetalleCombo() {
  const comboId = parseInt(localStorage.getItem("comboActual"));
  const combosGuardados = localStorage.getItem("combos");

  if (!combosGuardados) {
    mostrarNotificacion("No hay pedidos registrados", "error");
    setTimeout(() => window.location.href = "index.html", 1500);
    return;
  }

  const combos = JSON.parse(combosGuardados);
  const combo = combos.find((c) => c.id === comboId);

  if (!combo) {
    mostrarNotificacion("Pedido no encontrado", "error");
    setTimeout(() => window.location.href = "index.html", 1500);
    return;
  }

  // Mostrar información del cliente
  document.getElementById("nombre-cliente-detalle").textContent = combo.cliente;
  document.getElementById("telefono-cliente").textContent =
    formatearTelefonoCubano(combo.telefono);
  document.getElementById("direccion-cliente").textContent =
    combo.direccion || "No especificada";
  document.getElementById("fecha-combo").textContent = combo.fecha;

  // Mostrar estado actual
  const estadoActual = combo.estado || "pendiente";
  const estadoSelect = document.getElementById("estado-combo");
  if (estadoSelect) {
    estadoSelect.value = estadoActual;
  }
  actualizarBadgeEstado(estadoActual);

  // Mostrar productos en la tabla
  const tbody = document.querySelector("#tabla-productos tbody");
  tbody.innerHTML = "";

  let costoTotal = 0;
  let precioTotal = 0;
  let gananciaTotal = 0;

  combo.productos.forEach((prod) => {
    const subtotal = prod.cantidad * prod.precio;
    const costo = prod.cantidad * prod.costo;
    const ganancia = subtotal - costo;

    costoTotal += costo;
    precioTotal += subtotal;
    gananciaTotal += ganancia;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${prod.nombre}</td>
      <td>${prod.cantidad}</td>
      <td>${formatearMoneda(prod.costo)}</td>
      <td>${formatearMoneda(prod.precio)}</td>
      <td>${formatearMoneda(ganancia)}</td>
      <td>${formatearMoneda(subtotal)}</td>
    `;
    tbody.appendChild(row);
  });

  // Mostrar totales
  document.getElementById("costo-total-detalle").textContent =
    formatearMoneda(costoTotal);
  document.getElementById("precio-total-detalle").textContent =
    formatearMoneda(precioTotal);
  document.getElementById("ganancia-total-detalle").textContent =
    formatearMoneda(gananciaTotal);
}

function configurarEventosDetalle() {
  // Botón eliminar
  const btnEliminar = document.getElementById("eliminar-combo");
  if (btnEliminar) {
    btnEliminar.addEventListener("click", function () {
      if (
        confirm(
          "¿Está seguro que desea eliminar este pedido? Esta acción no se puede deshacer."
        )
      ) {
        eliminarCombo();
      }
    });
  }

  // Botón editar
  const btnEditar = document.getElementById("editar-combo");
  if (btnEditar) {
    btnEditar.addEventListener("click", function () {
      const comboId = localStorage.getItem("comboActual");
      if (comboId) {
        window.editarCombo(comboId);
      }
    });
  }

  // Selector de estado
  const estadoSelect = document.getElementById("estado-combo");
  if (estadoSelect) {
    estadoSelect.addEventListener("change", function () {
      const nuevoEstado = this.value;
      actualizarEstadoCombo(nuevoEstado);
      actualizarBadgeEstado(nuevoEstado);
    });
  }
}

function eliminarCombo() {
  const comboId = parseInt(localStorage.getItem("comboActual"));
  const combos = JSON.parse(localStorage.getItem("combos")) || [];
  const nuevosCombos = combos.filter((c) => c.id !== comboId);

  localStorage.setItem("combos", JSON.stringify(nuevosCombos));
  mostrarNotificacion("Pedido eliminado correctamente", "success");
  setTimeout(() => window.location.href = "index.html", 1500);
}

function actualizarEstadoCombo(nuevoEstado) {
  const comboId = parseInt(localStorage.getItem("comboActual"));
  const combos = JSON.parse(localStorage.getItem("combos")) || [];
  const comboIndex = combos.findIndex((c) => c.id === comboId);

  if (comboIndex !== -1) {
    combos[comboIndex].estado = nuevoEstado;
    localStorage.setItem("combos", JSON.stringify(combos));
    mostrarNotificacion("Estado actualizado correctamente", "success");

    // Actualizar el badge visualmente
    actualizarBadgeEstado(nuevoEstado);
  }
}

function actualizarBadgeEstado(estado) {
  const badge = document.getElementById("estado-actual");
  if (badge) {
    badge.textContent = estado.charAt(0).toUpperCase() + estado.slice(1);
    badge.className = "estado-badge estado-" + estado;
  }
}

// Hacer funciones accesibles globalmente si no están definidas
if (typeof window.editarCombo === "undefined") {
  window.editarCombo = function (id) {
    localStorage.setItem("comboActual", id);
    window.location.href = "editar-combo.html";
  };
}

if (typeof window.formatearTelefonoCubano === "undefined") {
  window.formatearTelefonoCubano = function (telefono) {
    if (!telefono) return "";
    const numero = telefono.toString().replace(/\D/g, "").slice(0, 8);
    if (numero.length === 8) {
      return `${numero.substring(0, 4)} ${numero.substring(4)}`;
    }
    return telefono;
  };
}

if (typeof window.formatearMoneda === "undefined") {
  window.formatearMoneda = function (valor) {
    return `$${parseFloat(valor).toFixed(2)}`;
  };
}

if (typeof window.mostrarNotificacion === "undefined") {
  window.mostrarNotificacion = function (mensaje, tipo = "success") {
    const notificacion = document.createElement("div");
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    setTimeout(() => notificacion.remove(), 3000);
  };
}