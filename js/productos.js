document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("tabla-productos")) {
    cargarDetalleCombo();
    configurarEliminarCombo();
    configurarEstadoCombo();
  }
});

function cargarDetalleCombo() {
  const comboId = parseInt(localStorage.getItem("comboActual"));
  const combosGuardados = localStorage.getItem("combos");

  if (!combosGuardados) {
    window.location.href = "index.html";
    return;
  }

  const combos = JSON.parse(combosGuardados);
  const combo = combos.find(function (c) {
    return c.id === comboId;
  });

  if (!combo) {
    window.location.href = "index.html";
    return;
  }

  // Mostrar información del cliente
  document.getElementById("nombre-cliente-detalle").textContent = combo.cliente;
  document.getElementById("telefono-cliente").textContent = combo.telefono;
  document.getElementById("direccion-cliente").textContent =
    combo.direccion || "No especificada";
  document.getElementById("fecha-combo").textContent = combo.fecha;

  // Mostrar estado actual
  const estadoActual = combo.estado || "pendiente";
  document.getElementById("estado-combo").value = estadoActual;
  actualizarBadgeEstado(estadoActual);

  // Mostrar productos en la tabla
  const tbody = document.querySelector("#tabla-productos tbody");
  tbody.innerHTML = "";

  let costoTotal = 0;
  let precioTotal = 0;
  let gananciaTotal = 0;

  combo.productos.forEach(function (prod) {
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
      <td>$${prod.costo.toFixed(2)}</td>
      <td>$${prod.precio.toFixed(2)}</td>
      <td>$${ganancia.toFixed(2)}</td>
      <td>$${subtotal.toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  });

  // Mostrar totales
  document.getElementById("costo-total-detalle").textContent =
    costoTotal.toFixed(2);
  document.getElementById("precio-total-detalle").textContent =
    precioTotal.toFixed(2);
  document.getElementById("ganancia-total-detalle").textContent =
    gananciaTotal.toFixed(2);
}

function configurarEliminarCombo() {
  const btnEliminar = document.getElementById("eliminar-combo");
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

function eliminarCombo() {
  const comboId = parseInt(localStorage.getItem("comboActual"));
  const combosGuardados = localStorage.getItem("combos");

  if (!combosGuardados) return;

  const combos = JSON.parse(combosGuardados);
  const nuevosCombos = combos.filter(function (c) {
    return c.id !== comboId;
  });

  localStorage.setItem("combos", JSON.stringify(nuevosCombos));
  window.location.href = "index.html";
}

function configurarEstadoCombo() {
  const selectEstado = document.getElementById("estado-combo");
  selectEstado.addEventListener("change", function () {
    const nuevoEstado = this.value;
    actualizarEstadoCombo(nuevoEstado);
    actualizarBadgeEstado(nuevoEstado);
  });
}

function actualizarEstadoCombo(nuevoEstado) {
  const comboId = parseInt(localStorage.getItem("comboActual"));
  const combosGuardados = localStorage.getItem("combos");

  if (!combosGuardados) return;

  const combos = JSON.parse(combosGuardados);
  const comboIndex = combos.findIndex(function (c) {
    return c.id === comboId;
  });

  if (comboIndex !== -1) {
    combos[comboIndex].estado = nuevoEstado;
    localStorage.setItem("combos", JSON.stringify(combos));
  }
}

function actualizarBadgeEstado(estado) {
  const badge = document.getElementById("estado-actual");
  badge.textContent = estado.charAt(0).toUpperCase() + estado.slice(1);
  badge.className = "estado-badge estado-" + estado;
}
