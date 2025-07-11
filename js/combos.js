// Configuración de eventos
document.addEventListener("DOMContentLoaded", function () {
  // Nuevo combo
  if (document.getElementById("form-combo")) {
    document
      .getElementById("form-combo")
      .addEventListener("submit", function (e) {
        e.preventDefault();
        guardarCombo(false);
      });

    document
      .getElementById("agregar-producto")
      .addEventListener("click", agregarProducto);

    // Escuchar cambios en la tasa de dólar
    document
      .getElementById("tasa-dolar")
      .addEventListener("input", calcularTotales);
  }

  // Editar combo
  if (document.getElementById("form-editar-combo")) {
    document
      .getElementById("form-editar-combo")
      .addEventListener("submit", function (e) {
        e.preventDefault();
        guardarCombo(true);
      });

    document
      .getElementById("agregar-producto-editar")
      .addEventListener("click", function () {
        agregarProductoEditar();
      });

    // Escuchar cambios en la tasa de dólar
    document
      .getElementById("editar-tasa-dolar")
      .addEventListener("input", actualizarTotalesEdicion);

    cargarComboParaEditar();
  }
});

// Función para agregar producto (nuevo combo)
function agregarProducto() {
  const container = document.getElementById("productos-container");
  const productoDiv = document.createElement("div");
  productoDiv.className = "producto-container";

  productoDiv.innerHTML = `
    <div class="producto-header">
      <h4>Producto</h4>
      <button class="producto-eliminar btn-danger" aria-label="Eliminar producto">Eliminar</button>
    </div>
    <div class="producto-content">
      <div class="producto-item">
        <label>Nombre del Producto*</label>
        <input type="text" class="producto-nombre" required>
      </div>
      <div class="producto-item">
        <label>Cantidad*</label>
        <input type="number" class="producto-cantidad" min="1" value="1" required>
      </div>
      <div class="producto-item">
        <label>Costo Unitario (CUP)*</label>
        <input type="number" class="producto-costo" step="0.01" min="0.01" required>
      </div>
      <div class="producto-item">
        <label>Precio de Venta (USD)*</label>
        <input type="number" class="producto-precio" step="0.01" min="0.01" required>
      </div>
      <div class="producto-item">
        <label>Ganancia (CUP)</label>
        <div class="producto-ganancia">0.00</div>
      </div>
      <div class="producto-item">
        <label>Subtotal (USD)</label>
        <div class="producto-subtotal">0.00</div>
      </div>
    </div>
  `;

  container.appendChild(productoDiv);

  // Eventos usando delegación
  productoDiv.addEventListener("click", function (e) {
    if (e.target.classList.contains("producto-eliminar")) {
      productoDiv.remove();
      calcularTotales();
    }
  });

  const inputs = productoDiv.querySelectorAll(
    ".producto-cantidad, .producto-costo, .producto-precio"
  );
  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      if (validarNumeroPositivo(this.value)) {
        calcularProducto(productoDiv);
        calcularTotales();
      } else {
        this.value = "";
      }
    });
  });
}

// Función para agregar producto (editar combo)
function agregarProductoEditar(producto = null) {
  const container = document.getElementById("editar-productos-container");
  const productoDiv = document.createElement("div");
  productoDiv.className = "producto-container";

  productoDiv.innerHTML = `
    <div class="producto-header">
      <h4>Producto</h4>
      <button class="producto-eliminar btn-danger" aria-label="Eliminar producto">Eliminar</button>
    </div>
    <div class="producto-content">
      <div class="producto-item">
        <label>Nombre del Producto*</label>
        <input type="text" class="producto-nombre" value="${
          producto?.nombre || ""
        }" required>
      </div>
      <div class="producto-item">
        <label>Cantidad*</label>
        <input type="number" class="producto-cantidad" min="1" value="${
          producto?.cantidad || 1
        }" required>
      </div>
      <div class="producto-item">
        <label>Costo Unitario (CUP)*</label>
        <input type="number" class="producto-costo" step="0.01" min="0.01" value="${
          producto?.costo || 0.01
        }" required>
      </div>
      <div class="producto-item">
        <label>Precio de Venta (USD)*</label>
        <input type="number" class="producto-precio" step="0.01" min="0.01" value="${
          producto?.precio || 0.01
        }" required>
      </div>
      <div class="producto-item">
        <label>Ganancia (CUP)</label>
        <div class="producto-ganancia">${
          producto
            ? (producto.precio * producto.tasaDolar - producto.costo).toFixed(2)
            : "0.00"
        }</div>
      </div>
      <div class="producto-item">
        <label>Subtotal (USD)</label>
        <div class="producto-subtotal">${
          producto ? (producto.cantidad * producto.precio).toFixed(2) : "0.00"
        }</div>
      </div>
    </div>
  `;

  container.appendChild(productoDiv);

  // Eventos usando delegación
  productoDiv.addEventListener("click", function (e) {
    if (e.target.classList.contains("producto-eliminar")) {
      productoDiv.remove();
      actualizarTotalesEdicion();
    }
  });

  const inputs = productoDiv.querySelectorAll(
    ".producto-cantidad, .producto-costo, .producto-precio"
  );
  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      if (validarNumeroPositivo(this.value)) {
        calcularProducto(productoDiv);
        actualizarTotalesEdicion();
      } else {
        this.value = "";
      }
    });
  });

  if (producto) {
    calcularProducto(productoDiv);
  }
}

// Función para cargar combo a editar
function cargarComboParaEditar() {
  const comboId = parseInt(localStorage.getItem("comboActual"));
  const combos = JSON.parse(localStorage.getItem("combos")) || [];
  const combo = combos.find((c) => c.id === comboId);

  if (combo) {
    document.getElementById("editar-nombre-cliente").value = combo.cliente;
    document.getElementById("editar-direccion").value = combo.direccion || "";
    document.getElementById("editar-telefono").value = combo.telefono;
    document.getElementById("editar-tasa-dolar").value = combo.tasaDolar || 1;
    document.getElementById("editar-estado").value =
      combo.estado || "pendiente";

    const container = document.getElementById("editar-productos-container");
    container.innerHTML = "";

    combo.productos.forEach((prod) => {
      agregarProductoEditar(prod);
    });

    actualizarTotalesEdicion();
  } else {
    mostrarNotificacion("No se encontró el combo a editar", "error");
    setTimeout(() => (window.location.href = "index.html"), 1500);
  }
}

// Función para calcular producto individual
function calcularProducto(productoDiv) {
  const cantidad =
    parseFloat(productoDiv.querySelector(".producto-cantidad").value) || 0;
  const costo =
    parseFloat(productoDiv.querySelector(".producto-costo").value) || 0;
  const precio =
    parseFloat(productoDiv.querySelector(".producto-precio").value) || 0;
  const tasaDolar = parseFloat(
    document.getElementById("tasa-dolar")?.value ||
      document.getElementById("editar-tasa-dolar")?.value ||
      1
  );

  const subtotalUSD = cantidad * precio;
  const gananciaCUP = precio * tasaDolar * cantidad - costo * cantidad;

  productoDiv.querySelector(".producto-ganancia").textContent =
    formatearMoneda(gananciaCUP);
  productoDiv.querySelector(".producto-subtotal").textContent =
    formatearMoneda(subtotalUSD);
}

// Función para calcular totales (nuevo combo)
function calcularTotales() {
  const productos = document.querySelectorAll(
    "#productos-container .producto-container"
  );
  let costoTotalCUP = 0;
  let precioTotalUSD = 0;
  let gananciaTotalCUP = 0;
  const tasaDolar =
    parseFloat(document.getElementById("tasa-dolar").value) || 1;

  productos.forEach((prod) => {
    const cantidad =
      parseFloat(prod.querySelector(".producto-cantidad").value) || 0;
    const costo = parseFloat(prod.querySelector(".producto-costo").value) || 0;
    const precio =
      parseFloat(prod.querySelector(".producto-precio").value) || 0;

    costoTotalCUP += cantidad * costo;
    precioTotalUSD += cantidad * precio;
    gananciaTotalCUP += precio * tasaDolar * cantidad - costo * cantidad;
  });

  const precioTotalCUP = precioTotalUSD * tasaDolar;

  document.getElementById("costo-total").textContent =
    formatearMoneda(costoTotalCUP);
  document.getElementById("precio-total").textContent =
    formatearMoneda(precioTotalUSD);
  document.getElementById("precio-total-cup").textContent =
    formatearMoneda(precioTotalCUP);
  document.getElementById("ganancia-total").textContent =
    formatearMoneda(gananciaTotalCUP);

  return {
    costoTotalCUP,
    precioTotalUSD,
    gananciaTotalCUP,
    precioTotalCUP,
    tasaDolar,
  };
}

// Función para actualizar totales (editar combo)
function actualizarTotalesEdicion() {
  const productos = document.querySelectorAll(
    "#editar-productos-container .producto-container"
  );
  let costoTotalCUP = 0;
  let precioTotalUSD = 0;
  let gananciaTotalCUP = 0;
  const tasaDolar =
    parseFloat(document.getElementById("editar-tasa-dolar").value) || 1;

  productos.forEach((prod) => {
    const cantidad =
      parseFloat(prod.querySelector(".producto-cantidad").value) || 0;
    const costo = parseFloat(prod.querySelector(".producto-costo").value) || 0;
    const precio =
      parseFloat(prod.querySelector(".producto-precio").value) || 0;

    costoTotalCUP += cantidad * costo;
    precioTotalUSD += cantidad * precio;
    gananciaTotalCUP += precio * tasaDolar * cantidad - costo * cantidad;
  });

  const precioTotalCUP = precioTotalUSD * tasaDolar;

  document.getElementById("editar-costo-total").textContent =
    formatearMoneda(costoTotalCUP);
  document.getElementById("editar-precio-total").textContent =
    formatearMoneda(precioTotalUSD);
  document.getElementById("editar-precio-total-cup").textContent =
    formatearMoneda(precioTotalCUP);
  document.getElementById("editar-ganancia-total").textContent =
    formatearMoneda(gananciaTotalCUP);

  return {
    costoTotalCUP,
    precioTotalUSD,
    gananciaTotalCUP,
    precioTotalCUP,
    tasaDolar,
  };
}

// Función para guardar combo (nuevo o edición)
function guardarCombo(esEdicion) {
  const id = esEdicion
    ? parseInt(localStorage.getItem("comboActual"))
    : Date.now();
  const cliente = esEdicion
    ? document.getElementById("editar-nombre-cliente").value.trim()
    : document.getElementById("nombre-cliente").value.trim();

  const direccion = esEdicion
    ? document.getElementById("editar-direccion").value.trim()
    : document.getElementById("direccion").value.trim();

  const telefono = esEdicion
    ? document.getElementById("editar-telefono").value.trim()
    : document.getElementById("telefono").value.trim();

  const estado = esEdicion
    ? document.getElementById("editar-estado").value
    : "pendiente";

  const tasaDolar = esEdicion
    ? parseFloat(document.getElementById("editar-tasa-dolar").value)
    : parseFloat(document.getElementById("tasa-dolar").value);

  // Validar campos obligatorios
  if (
    !cliente ||
    !telefono ||
    !tasaDolar ||
    isNaN(tasaDolar) ||
    tasaDolar <= 0
  ) {
    mostrarNotificacion(
      "Nombre, teléfono y tasa de dólar son campos obligatorios",
      "error"
    );
    return;
  }

  // Validar teléfono cubano
  if (!/^[57]\d{7}$/.test(telefono)) {
    mostrarNotificacion(
      "El teléfono debe comenzar con 5 o 7 y tener 8 dígitos",
      "error"
    );
    return;
  }

  const productos = [];
  const selector = esEdicion
    ? "#editar-productos-container .producto-container"
    : "#productos-container .producto-container";

  document.querySelectorAll(selector).forEach((prod) => {
    const nombre = prod.querySelector(".producto-nombre").value.trim();
    const cantidad = parseFloat(prod.querySelector(".producto-cantidad").value);
    const costo = parseFloat(prod.querySelector(".producto-costo").value);
    const precio = parseFloat(prod.querySelector(".producto-precio").value);

    if (nombre && cantidad > 0 && costo > 0 && precio > 0) {
      productos.push({
        nombre,
        cantidad,
        costo,
        precio,
        subtotalUSD: cantidad * precio,
        gananciaCUP: precio * tasaDolar * cantidad - costo * cantidad,
      });
    }
  });

  if (productos.length === 0) {
    mostrarNotificacion("Debe agregar al menos un producto válido", "error");
    return;
  }

  const {
    precioTotalUSD,
    gananciaTotalCUP,
    costoTotalCUP,
    precioTotalCUP,
    tasaDolar: tasaActual,
  } = esEdicion ? actualizarTotalesEdicion() : calcularTotales();

  const combos = JSON.parse(localStorage.getItem("combos")) || [];
  const comboOriginal = esEdicion ? combos.find((c) => c.id === id) : null;

  const comboActualizado = {
    id,
    cliente,
    direccion,
    telefono,
    productos,
    precioTotalUSD,
    gananciaTotalCUP,
    costoTotalCUP,
    precioTotalCUP,
    tasaDolar: tasaActual,
    estado,
    fecha:
      comboOriginal?.fecha ||
      new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
  };

  if (esEdicion) {
    const index = combos.findIndex((c) => c.id === id);
    if (index !== -1) {
      combos[index] = comboActualizado;
    }
  } else {
    combos.push(comboActualizado);
  }

  localStorage.setItem("combos", JSON.stringify(combos));
  mostrarNotificacion(
    `Combo ${esEdicion ? "actualizado" : "guardado"} correctamente`,
    "success"
  );
  setTimeout(() => (window.location.href = "index.html"), 1500);
}

// Funciones utilitarias
function validarNumeroPositivo(value) {
  return !isNaN(value) && parseFloat(value) > 0;
}

function formatearMoneda(valor) {
  return parseFloat(valor).toFixed(2);
}

function mostrarNotificacion(mensaje, tipo = "success") {
  const notificacion = document.createElement("div");
  notificacion.className = `notificacion notificacion-${tipo}`;
  notificacion.textContent = mensaje;
  document.body.appendChild(notificacion);
  setTimeout(() => notificacion.remove(), 3000);
}
