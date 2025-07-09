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
      <button class="producto-eliminar btn-danger">Eliminar</button>
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
        <label>Costo Unitario ($)*</label>
        <input type="number" class="producto-costo" step="0.01" min="0" required>
      </div>
      <div class="producto-item">
        <label>Precio de Venta ($)*</label>
        <input type="number" class="producto-precio" step="0.01" min="0" required>
      </div>
      <div class="producto-item">
        <label>Ganancia</label>
        <div class="producto-ganancia">0.00</div>
      </div>
      <div class="producto-item">
        <label>Subtotal</label>
        <div class="producto-subtotal">0.00</div>
      </div>
    </div>
  `;

  container.appendChild(productoDiv);

  // Eventos
  productoDiv
    .querySelector(".producto-eliminar")
    .addEventListener("click", function () {
      productoDiv.remove();
      calcularTotales();
    });

  const inputs = productoDiv.querySelectorAll(
    ".producto-cantidad, .producto-costo, .producto-precio"
  );
  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      calcularProducto(productoDiv);
      calcularTotales();
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
      <button class="producto-eliminar btn-danger">Eliminar</button>
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
        <label>Costo Unitario ($)*</label>
        <input type="number" class="producto-costo" step="0.01" min="0" value="${
          producto?.costo || 0
        }" required>
      </div>
      <div class="producto-item">
        <label>Precio de Venta ($)*</label>
        <input type="number" class="producto-precio" step="0.01" min="0" value="${
          producto?.precio || 0
        }" required>
      </div>
      <div class="producto-item">
        <label>Ganancia</label>
        <div class="producto-ganancia">${
          producto ? (producto.precio - produto.costo).toFixed(2) : "0.00"
        }</div>
      </div>
      <div class="producto-item">
        <label>Subtotal</label>
        <div class="producto-subtotal">${
          producto ? (producto.cantidad * produto.precio).toFixed(2) : "0.00"
        }</div>
      </div>
    </div>
  `;

  container.appendChild(productoDiv);

  // Eventos
  productoDiv
    .querySelector(".producto-eliminar")
    .addEventListener("click", function () {
      productoDiv.remove();
      actualizarTotalesEdicion();
    });

  const inputs = productoDiv.querySelectorAll(
    ".producto-cantidad, .producto-costo, .producto-precio"
  );
  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      calcularProducto(productoDiv);
      actualizarTotalesEdicion();
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
    document.getElementById("editar-estado").value =
      combo.estado || "pendiente";

    const container = document.getElementById("editar-productos-container");
    container.innerHTML = "";

    combo.productos.forEach((prod) => {
      agregarProductoEditar(prod);
    });

    actualizarTotalesEdicion();
  } else {
    window.location.href = "index.html";
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

  const ganancia = precio - costo;
  const subtotal = cantidad * precio;

  productoDiv.querySelector(".producto-ganancia").textContent =
    ganancia.toFixed(2);
  productoDiv.querySelector(".producto-subtotal").textContent =
    subtotal.toFixed(2);
}

// Función para calcular totales (nuevo combo)
function calcularTotales() {
  const productos = document.querySelectorAll(
    "#productos-container .producto-container"
  );
  let costoTotal = 0;
  let precioTotal = 0;
  let gananciaTotal = 0;

  productos.forEach((prod) => {
    const cantidad =
      parseFloat(prod.querySelector(".producto-cantidad").value) || 0;
    const costo = parseFloat(prod.querySelector(".producto-costo").value) || 0;
    const precio =
      parseFloat(prod.querySelector(".producto-precio").value) || 0;

    costoTotal += cantidad * costo;
    precioTotal += cantidad * precio;
    gananciaTotal += cantidad * (precio - costo);
  });

  document.getElementById("costo-total").textContent = costoTotal.toFixed(2);
  document.getElementById("precio-total").textContent = precioTotal.toFixed(2);
  document.getElementById("ganancia-total").textContent =
    gananciaTotal.toFixed(2);

  return { costoTotal, precioTotal, gananciaTotal };
}

// Función para actualizar totales (editar combo)
function actualizarTotalesEdicion() {
  const productos = document.querySelectorAll(
    "#editar-productos-container .producto-container"
  );
  let costoTotal = 0;
  let precioTotal = 0;
  let gananciaTotal = 0;

  productos.forEach((prod) => {
    const cantidad =
      parseFloat(prod.querySelector(".producto-cantidad").value) || 0;
    const costo = parseFloat(prod.querySelector(".producto-costo").value) || 0;
    const precio =
      parseFloat(prod.querySelector(".producto-precio").value) || 0;

    costoTotal += cantidad * costo;
    precioTotal += cantidad * precio;
    gananciaTotal += cantidad * (precio - costo);
  });

  document.getElementById("editar-costo-total").textContent =
    costoTotal.toFixed(2);
  document.getElementById("editar-precio-total").textContent =
    precioTotal.toFixed(2);
  document.getElementById("editar-ganancia-total").textContent =
    gananciaTotal.toFixed(2);

  return { costoTotal, precioTotal, gananciaTotal };
}

// Función para guardar combo (nuevo o edición)
function guardarCombo(esEdicion) {
  const id = esEdicion
    ? parseInt(localStorage.getItem("comboActual"))
    : Date.now();
  const cliente = esEdicion
    ? document.getElementById("editar-nombre-cliente").value
    : document.getElementById("nombre-cliente").value;

  const direccion = esEdicion
    ? document.getElementById("editar-direccion").value
    : document.getElementById("direccion").value;

  const telefono = esEdicion
    ? document.getElementById("editar-telefono").value
    : document.getElementById("telefono").value;

  const estado = esEdicion
    ? document.getElementById("editar-estado").value
    : "pendiente";

  // Validar teléfono cubano
  if (!/^[57]\d{7}$/.test(telefono)) {
    alert("El teléfono debe comenzar con 5 o 7 y tener 8 dígitos");
    return;
  }

  const productos = [];
  const selector = esEdicion
    ? "#editar-productos-container .producto-container"
    : ".producto-container";

  document.querySelectorAll(selector).forEach((prod) => {
    const nombre = prod.querySelector(".producto-nombre").value;
    const cantidad = parseFloat(prod.querySelector(".producto-cantidad").value);
    const costo = parseFloat(prod.querySelector(".producto-costo").value);
    const precio = parseFloat(prod.querySelector(".producto-precio").value);

    if (nombre && cantidad && costo && precio) {
      productos.push({
        nombre,
        cantidad,
        costo,
        precio,
        subtotal: cantidad * precio,
        ganancia: cantidad * (precio - costo),
      });
    }
  });

  if (productos.length === 0) {
    alert("Debe agregar al menos un producto válido");
    return;
  }

  const { precioTotal, gananciaTotal, costoTotal } = esEdicion
    ? actualizarTotalesEdicion()
    : calcularTotales();

  const comboActualizado = {
    id,
    cliente,
    direccion,
    telefono,
    productos,
    precioTotal,
    gananciaTotal,
    costoTotal,
    estado,
    fecha: new Date().toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
  };

  const combos = JSON.parse(localStorage.getItem("combos")) || [];

  if (esEdicion) {
    const index = combos.findIndex((c) => c.id === id);
    if (index !== -1) {
      combos[index] = comboActualizado;
    }
  } else {
    combos.push(comboActualizado);
  }

  localStorage.setItem("combos", JSON.stringify(combos));
  window.location.href = "index.html";
}
