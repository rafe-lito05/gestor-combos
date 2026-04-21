// ========== CONFIGURACIÓN INICIAL ==========
const STORAGE_KEYS = {
  PEDIDOS: "gestor_combos_pedidos",
  ZELLE_VALUE: "gestor_combos_zelle",
};

// Valor por defecto del Zelle
let zelleValue =
  parseFloat(localStorage.getItem(STORAGE_KEYS.ZELLE_VALUE)) || 500;

// Estados disponibles
const ESTADOS = {
  PENDIENTE: "pendiente",
  POR_ENTREGAR: "por-entregar",
  ENTREGADO: "entregado",
};

// Datos de pedidos
let pedidos = JSON.parse(localStorage.getItem(STORAGE_KEYS.PEDIDOS)) || [];

// Productos temporales del formulario actual
let productosTemporales = [];

// Pedido actual en detalles y producto en edición
let pedidoActualId = null;
let productoEditandoIndex = null;

// ========== UTILIDADES ==========
function generarId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatearMoneda(valor, moneda = "CUP") {
  if (moneda === "Zelle") {
    return `${valor.toFixed(2)} Zelle`;
  }
  return `${valor.toFixed(2)} ${moneda}`;
}

function guardarPedidos() {
  localStorage.setItem(STORAGE_KEYS.PEDIDOS, JSON.stringify(pedidos));
}

function guardarZelleValue() {
  localStorage.setItem(STORAGE_KEYS.ZELLE_VALUE, zelleValue);
}

// Calcular ganancia correctamente: (Venta en Zelle × Valor Zelle) - Costo en CUP
function calcularGanancia(totalVentaZelle, totalCostoCUP) {
  return totalVentaZelle * zelleValue - totalCostoCUP;
}

// ========== GESTIÓN DE PANTALLAS ==========
function mostrarPantalla(screenClass) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("screen-active");
  });
  document.querySelector(`.${screenClass}`).classList.add("screen-active");

  if (screenClass === "screen-orders-list") {
    renderizarListaPedidos();
  }
}

// ========== GESTIÓN DE FILTROS ==========
let filtroActual = "todos";

function initFiltros() {
  const filtros = {
    "filter-all": "todos",
    "filter-pending": ESTADOS.PENDIENTE,
    "filter-finished": ESTADOS.POR_ENTREGAR,
    "filter-delivery": ESTADOS.ENTREGADO,
  };

  Object.entries(filtros).forEach(([clase, valor]) => {
    const elemento = document.querySelector(`.${clase}`);
    if (elemento) {
      elemento.addEventListener("click", () => {
        filtroActual = valor;
        document
          .querySelectorAll(".filter")
          .forEach((f) => f.classList.remove("filter-active"));
        elemento.classList.add("filter-active");
        renderizarListaPedidos();
      });
    }
  });
}

// ========== RENDERIZAR LISTA DE PEDIDOS ==========
function renderizarListaPedidos() {
  const contenedor = document.querySelector(".orders-list-container");
  if (!contenedor) return;

  const pedidosFiltrados =
    filtroActual === "todos"
      ? pedidos
      : pedidos.filter((p) => p.estado === filtroActual);

  if (pedidosFiltrados.length === 0) {
    contenedor.innerHTML =
      '<p style="text-align: center; width: 100%; padding: 40px; color: #999;">No hay pedidos para mostrar</p>';
    return;
  }

  let html = "";
  pedidosFiltrados
    .sort((a, b) => b.id - a.id)
    .forEach((pedido) => {
      const estadoClass = {
        [ESTADOS.PENDIENTE]: "state-pending",
        [ESTADOS.POR_ENTREGAR]: "state-finished",
        [ESTADOS.ENTREGADO]: "state-delivered",
      }[pedido.estado];

      const estadoTexto = {
        [ESTADOS.PENDIENTE]: "Pendiente",
        [ESTADOS.POR_ENTREGAR]: "Por entregar",
        [ESTADOS.ENTREGADO]: "Entregado",
      }[pedido.estado];

      const iconoEstado = {
        [ESTADOS.PENDIENTE]: "iconoir-hourglass",
        [ESTADOS.POR_ENTREGAR]: "iconoir-package",
        [ESTADOS.ENTREGADO]: "iconoir-check-circle",
      }[pedido.estado];

      // Calcular totales
      const totalCosto = pedido.productos.reduce(
        (sum, p) => sum + p.costo * p.cantidad,
        0,
      );
      const totalVentaZelle = pedido.productos.reduce(
        (sum, p) => sum + p.venta * p.cantidad,
        0,
      );
      const ganancia = calcularGanancia(totalVentaZelle, totalCosto);

      html += `
        <div class="order-container" data-id="${pedido.id}">
          <div class="order-container-header">
            <h2 class="order-title">${pedido.cliente.nombre}</h2>
            <div style="display: flex; gap: 10px; align-items: center;">
              <div class="tag-state ${estadoClass}">
                <i class="${iconoEstado}"></i>
                <span class="state">${estadoTexto}</span>
                <div class="tag-state-options-container">
                  ${generarOpcionesEstado(pedido.estado)}
                </div>
              </div>
              <i class="iconoir-trash" style="color: var(--danger-color); cursor: pointer; font-size: 20px;" data-eliminar="${pedido.id}"></i>
            </div>
          </div>
          <div class="order-container-body">
            <span class="order-direction"><i class="iconoir-map-pin" style="color: #406ffc;"></i> ${pedido.entrega.direccion || "No especificada"}</span>
            <span class="order-phone"><i class="iconoir-phone" style="color: #406ffc;"></i> ${pedido.cliente.telefono}</span>
            <span class="order-date"><i class="iconoir-calendar" style="color: #406ffc;"></i> ${formatearFecha(pedido.fecha)}</span>
            <span class="order-price-cost"><i class="iconoir-coins" style="color: #406ffc;"></i> Costo: ${formatearMoneda(totalCosto)}</span>
            <span class="order-revenue"><i class="iconoir-graph-up" style="color: #406ffc;"></i> Ganancia: ${formatearMoneda(ganancia)}</span>
          </div>
          <div class="order-container-footer">
            <button class="btn-details" data-id="${pedido.id}">Ver detalles</button>
            <span class="order-price-sold">${formatearMoneda(totalVentaZelle, "Zelle")}</span>
          </div>
        </div>
      `;
    });

  contenedor.innerHTML = html;

  // Inicializar dropdowns de estado
  document.querySelectorAll(".tag-state").forEach((tag) => {
    const optionsContainer = tag.querySelector(".tag-state-options-container");
    if (!optionsContainer) return;

    let timeout;

    tag.addEventListener("mouseenter", () => {
      clearTimeout(timeout);
      optionsContainer.style.height = "auto";
      optionsContainer.style.padding = "5px 0";
    });

    tag.addEventListener("mouseleave", () => {
      timeout = setTimeout(() => {
        optionsContainer.style.height = "0";
        optionsContainer.style.padding = "0";
      }, 200);
    });

    // Click en opciones de estado
    optionsContainer.querySelectorAll(".state-option").forEach((option) => {
      option.addEventListener("click", (e) => {
        e.stopPropagation();
        const orderContainer = tag.closest(".order-container");
        if (!orderContainer) return;
        const pedidoId = parseInt(orderContainer.dataset.id);
        const nuevoEstado = option.dataset.estado;
        cambiarEstadoPedido(pedidoId, nuevoEstado);
      });
    });
  });

  // Botones de detalles
  document.querySelectorAll(".btn-details").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pedidoId = parseInt(btn.dataset.id);
      mostrarDetallesPedido(pedidoId);
    });
  });

  // Botones eliminar
  document.querySelectorAll("[data-eliminar]").forEach((icon) => {
    icon.addEventListener("click", (e) => {
      e.stopPropagation();
      const pedidoId = parseInt(icon.dataset.eliminar);
      eliminarPedido(pedidoId);
    });
  });
}

function generarOpcionesEstado(estadoActual) {
  const opciones = [
    { valor: ESTADOS.PENDIENTE, texto: "Pendiente", icono: "bi-check" },
    { valor: ESTADOS.POR_ENTREGAR, texto: "Por entregar", icono: "" },
    { valor: ESTADOS.ENTREGADO, texto: "Entregado", icono: "" },
  ];

  return opciones
    .map((op) => {
      const selected = op.valor === estadoActual ? "state-option-selected" : "";
      const icono =
        op.valor === estadoActual ? '<i class="bi bi-check"></i>' : "";
      return `<span class="state-option ${selected}" data-estado="${op.valor}">${icono}${op.texto}</span>`;
    })
    .join("");
}

function cambiarEstadoPedido(id, nuevoEstado) {
  const pedido = pedidos.find((p) => p.id === id);
  if (pedido) {
    pedido.estado = nuevoEstado;
    guardarPedidos();
    renderizarListaPedidos();
  }
}

function eliminarPedido(id) {
  if (confirm("¿Estás seguro de eliminar este pedido?")) {
    pedidos = pedidos.filter((p) => p.id !== id);
    guardarPedidos();
    renderizarListaPedidos();
  }
}

// ========== FORMULARIO DE NUEVO PEDIDO ==========
function initFormularioPedido() {
  const fabBtn = document.querySelector(".fab-add-order");
  if (fabBtn) {
    fabBtn.addEventListener("click", () => {
      limpiarFormulario();
      mostrarPantalla("screen-add-order");
    });
  }

  const backBtn = document.querySelector(".screen-add-order .icon-back");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      mostrarPantalla("screen-orders-list");
    });
  }

  const addProductBtn = document.querySelector(".btn-add-product");
  if (addProductBtn) {
    addProductBtn.addEventListener("click", agregarProducto);
  }

  const saveBtn = document.querySelector(".save-order-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", guardarPedidoCompleto);
  }
}

function agregarProducto() {
  const nombre =
    document.querySelector(".input-product-name")?.value.trim() || "";
  const cantidad =
    parseInt(document.querySelector(".input-product-quanty")?.value) || 0;
  const costo =
    parseFloat(document.querySelector(".input-product-price-cost")?.value) || 0;
  const venta =
    parseFloat(document.querySelector(".input-product-price-sold")?.value) || 0;

  if (!nombre || !cantidad || isNaN(costo) || isNaN(venta)) {
    alert("Completa todos los campos del producto");
    return;
  }

  productosTemporales.push({
    id: generarId(),
    nombre,
    cantidad,
    costo,
    venta,
  });

  // Limpiar campos
  document.querySelector(".input-product-name").value = "";
  document.querySelector(".input-product-quanty").value = "";
  document.querySelector(".input-product-price-cost").value = "";
  document.querySelector(".input-product-price-sold").value = "";

  renderizarProductosTemporales();
}

function renderizarProductosTemporales() {
  const contenedor = document.querySelector(".list-products-add-container");
  if (!contenedor) return;

  if (productosTemporales.length === 0) {
    contenedor.innerHTML =
      '<p style="text-align: center; width: 100%; padding: 20px; color: #999;">No hay productos agregados</p>';
    document.querySelector(".products-total-price-cost").textContent =
      "Costo Total: 0 CUP";
    document.querySelector(".products-total-price-sold").textContent =
      "Venta Total: 0 Zelle";
    const gananciaEl = document.querySelector(
      ".screen-add-order .products-total-revenue",
    );
    if (gananciaEl) gananciaEl.textContent = "Ganancia Total: 0 CUP";
    return;
  }

  let html = "";
  let totalCosto = 0;
  let totalVentaZelle = 0;

  productosTemporales.forEach((prod, index) => {
    totalCosto += prod.costo * prod.cantidad;
    totalVentaZelle += prod.venta * prod.cantidad;

    html += `
      <div class="list-products-item" data-index="${index}">
        <div class="product-item-desciption">
          <span class="product-item-name">${prod.nombre}</span>
          <span class="product-item-price-cost">Costo: ${formatearMoneda(prod.costo)} x ${prod.cantidad} = ${formatearMoneda(prod.costo * prod.cantidad)}</span>
          <span class="product-item-price-cost">Venta: ${formatearMoneda(prod.venta, "Zelle")} x ${prod.cantidad} = ${formatearMoneda(prod.venta * prod.cantidad, "Zelle")}</span>
        </div>
        <div class="product-item-options">
          <i class="iconoir-trash" data-index="${index}"></i>
          <div class="product-item-quanty">
            <i class="iconoir-minus" data-index="${index}"></i>
            <span class="product-quanty">${prod.cantidad}</span>
            <i class="iconoir-plus" data-index="${index}"></i>
          </div>
        </div>
      </div>
    `;
  });

  contenedor.innerHTML = html;

  const ganancia = calcularGanancia(totalVentaZelle, totalCosto);

  document.querySelector(".products-total-price-cost").textContent =
    `Costo Total: ${formatearMoneda(totalCosto)}`;
  document.querySelector(".products-total-price-sold").textContent =
    `Venta Total: ${formatearMoneda(totalVentaZelle, "Zelle")}`;

  const gananciaEl = document.querySelector(
    ".screen-add-order .products-total-revenue",
  );
  if (gananciaEl)
    gananciaEl.textContent = `Ganancia Total: ${formatearMoneda(ganancia)}`;

  // Eventos eliminar
  contenedor.querySelectorAll(".iconoir-trash").forEach((icon) => {
    icon.addEventListener("click", () => {
      const index = parseInt(icon.dataset.index);
      productosTemporales.splice(index, 1);
      renderizarProductosTemporales();
    });
  });

  // Eventos cantidad
  contenedor.querySelectorAll(".iconoir-minus").forEach((icon) => {
    icon.addEventListener("click", () => {
      const index = parseInt(icon.dataset.index);
      if (productosTemporales[index].cantidad > 1) {
        productosTemporales[index].cantidad--;
        renderizarProductosTemporales();
      }
    });
  });

  contenedor.querySelectorAll(".iconoir-plus").forEach((icon) => {
    icon.addEventListener("click", () => {
      const index = parseInt(icon.dataset.index);
      productosTemporales[index].cantidad++;
      renderizarProductosTemporales();
    });
  });
}

function guardarPedidoCompleto() {
  const clienteNombre =
    document.querySelector(".input-client-name")?.value.trim() || "";
  const clienteTelefono =
    document.querySelector(".input-client-phone")?.value.trim() || "";
  const entregaNombre =
    document.querySelector(".input-delivery-name")?.value.trim() || "";
  const entregaDireccion =
    document.querySelector(".input-delivery-direction")?.value.trim() || "";
  const entregaTelefono =
    document.querySelector(".input-delivery-phone")?.value.trim() || "";

  if (!clienteNombre || !clienteTelefono) {
    alert("Completa al menos el nombre y teléfono del cliente");
    return;
  }

  if (productosTemporales.length === 0) {
    alert("Agrega al menos un producto");
    return;
  }

  pedidos.push({
    id: generarId(),
    cliente: { nombre: clienteNombre, telefono: clienteTelefono },
    entrega: {
      nombre: entregaNombre || clienteNombre,
      direccion: entregaDireccion,
      telefono: entregaTelefono || clienteTelefono,
    },
    productos: [...productosTemporales],
    estado: ESTADOS.PENDIENTE,
    fecha: new Date().toISOString(),
  });

  guardarPedidos();
  alert("Pedido guardado exitosamente");
  limpiarFormulario();
  mostrarPantalla("screen-orders-list");
}

function limpiarFormulario() {
  [
    "input-client-name",
    "input-client-phone",
    "input-delivery-name",
    "input-delivery-direction",
    "input-delivery-phone",
    "input-product-name",
    "input-product-quanty",
    "input-product-price-cost",
    "input-product-price-sold",
  ].forEach((cls) => {
    const el = document.querySelector(`.${cls}`);
    if (el) el.value = "";
  });

  productosTemporales = [];
  renderizarProductosTemporales();
}

// ========== PANTALLA DE DETALLES ==========
function initPantallaDetalles() {
  const backBtn = document.querySelector(".screen-order-details .icon-back");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      mostrarPantalla("screen-orders-list");
    });
  }

  // Botón para agregar producto desde detalles
  const addProductBtn = document.querySelector(".btn-add-product-order");
  if (addProductBtn) {
    addProductBtn.addEventListener("click", () => {
      abrirModalAgregarProducto();
    });
  }

  // Inicializar modal de edición
  initModalEdicion();
}

function mostrarDetallesPedido(id) {
  const pedido = pedidos.find((p) => p.id === id);
  if (!pedido) return;

  pedidoActualId = id;
  renderizarDetallesPedido(pedido);
  mostrarPantalla("screen-order-details");
}

function renderizarDetallesPedido(pedido) {
  // Datos del cliente
  const clienteContainer = document.querySelector(
    ".order-client-details-container",
  );
  clienteContainer.innerHTML = `
    <p><strong>Cliente:</strong> ${pedido.cliente.nombre}</p>
    <p><strong>Teléfono:</strong> ${pedido.cliente.telefono}</p>
    <p><strong>Entrega:</strong> ${pedido.entrega.nombre}</p>
    <p><strong>Dirección:</strong> ${pedido.entrega.direccion || "No especificada"}</p>
    <p><strong>Fecha:</strong> ${formatearFecha(pedido.fecha)}</p>
  `;

  // Lista de productos
  const productosContainer = document.querySelector(
    ".list-products-details-container",
  );
  let html = "";
  let totalCosto = 0;
  let totalVentaZelle = 0;

  pedido.productos.forEach((prod, index) => {
    totalCosto += prod.costo * prod.cantidad;
    totalVentaZelle += prod.venta * prod.cantidad;

    html += `
      <div class="list-products-item" data-index="${index}">
        <i class="iconoir-edit-pencil" data-editar="${index}"></i>
        <div class="product-item-desciption">
          <span class="product-item-name">${prod.nombre}</span>
          <span class="product-item-price-cost">Costo: ${formatearMoneda(prod.costo)} x ${prod.cantidad} = ${formatearMoneda(prod.costo * prod.cantidad)}</span>
          <span class="product-item-price-cost">Venta: ${formatearMoneda(prod.venta, "Zelle")} x ${prod.cantidad} = ${formatearMoneda(prod.venta * prod.cantidad, "Zelle")}</span>
        </div>
        <div class="product-item-options">
          <i class="iconoir-trash" data-eliminar="${index}"></i>
          <div class="product-item-quanty">
            <i class="iconoir-minus" data-index="${index}"></i>
            <span class="product-quanty">${prod.cantidad}</span>
            <i class="iconoir-plus" data-index="${index}"></i>
          </div>
        </div>
      </div>
    `;
  });

  productosContainer.innerHTML =
    html ||
    '<p style="text-align: center; padding: 20px;">No hay productos</p>';

  // Calcular y mostrar totales
  const ganancia = calcularGanancia(totalVentaZelle, totalCosto);

  const costoEl = document.querySelector(
    ".screen-order-details .products-total-price-cost",
  );
  const ventaEl = document.querySelector(
    ".screen-order-details .products-total-price-sold",
  );
  const gananciaEl = document.querySelector(
    ".screen-order-details .products-total-revenue",
  );

  if (costoEl)
    costoEl.textContent = `Costo Total: ${formatearMoneda(totalCosto)}`;
  if (ventaEl)
    ventaEl.textContent = `Venta Total: ${formatearMoneda(totalVentaZelle, "Zelle")}`;
  if (gananciaEl)
    gananciaEl.textContent = `Ganancia Total: ${formatearMoneda(ganancia)}`;

  // Eventos de productos en detalles
  productosContainer
    .querySelectorAll(".iconoir-edit-pencil")
    .forEach((icon) => {
      icon.addEventListener("click", () => {
        const index = parseInt(icon.dataset.editar);
        abrirModalEdicion(index);
      });
    });

  productosContainer.querySelectorAll(".iconoir-trash").forEach((icon) => {
    icon.addEventListener("click", () => {
      const index = parseInt(icon.dataset.eliminar);
      eliminarProductoDePedido(index);
    });
  });

  productosContainer.querySelectorAll(".iconoir-minus").forEach((icon) => {
    icon.addEventListener("click", () => {
      const index = parseInt(icon.dataset.index);
      cambiarCantidadProducto(index, -1);
    });
  });

  productosContainer.querySelectorAll(".iconoir-plus").forEach((icon) => {
    icon.addEventListener("click", () => {
      const index = parseInt(icon.dataset.index);
      cambiarCantidadProducto(index, 1);
    });
  });
}

function eliminarProductoDePedido(index) {
  const pedido = pedidos.find((p) => p.id === pedidoActualId);
  if (!pedido) return;

  if (confirm("¿Eliminar este producto?")) {
    pedido.productos.splice(index, 1);
    guardarPedidos();
    renderizarDetallesPedido(pedido);
  }
}

function cambiarCantidadProducto(index, delta) {
  const pedido = pedidos.find((p) => p.id === pedidoActualId);
  if (!pedido) return;

  const nuevaCantidad = pedido.productos[index].cantidad + delta;
  if (nuevaCantidad >= 1) {
    pedido.productos[index].cantidad = nuevaCantidad;
    guardarPedidos();
    renderizarDetallesPedido(pedido);
  }
}

// ========== MODAL PARA AGREGAR PRODUCTO ==========
function abrirModalAgregarProducto() {
  productoEditandoIndex = null;

  document.querySelector(".input-edition-product-name").value = "";
  document.querySelector(".input-edition-product-cost").value = "";
  document.querySelector(".input-edition-product-sold").value = "";

  document.querySelector(".modal-title").textContent = "Agregar Producto";

  const modalContainer = document.querySelector(".modal-edition-container");
  const modal = document.querySelector(".modal-edition");
  modalContainer.style.display = "flex";
  setTimeout(() => {
    modalContainer.style.scale = "1";
    modal.style.scale = "1";
  }, 10);
}

// ========== MODAL DE EDICIÓN ==========
function initModalEdicion() {
  const modalContainer = document.querySelector(".modal-edition-container");
  const modal = document.querySelector(".modal-edition");
  const closeBtn = document.querySelector(".modal-edition .iconoir-xmark");
  const cancelBtn = document.querySelector(".btn-cancel-changes");
  const saveBtn = document.querySelector(".btn-save-changes");

  function cerrarModal() {
    modalContainer.style.scale = "0";
    modal.style.scale = "0";
    setTimeout(() => {
      modalContainer.style.display = "none";
      document.querySelector(".modal-title").textContent = "Editar Producto";
    }, 300);
  }

  closeBtn?.addEventListener("click", cerrarModal);
  cancelBtn?.addEventListener("click", cerrarModal);

  modalContainer?.addEventListener("click", (e) => {
    if (e.target === modalContainer) cerrarModal();
  });

  saveBtn?.addEventListener("click", () => {
    const pedido = pedidos.find((p) => p.id === pedidoActualId);
    if (!pedido) return;

    const nombre =
      document.querySelector(".input-edition-product-name")?.value.trim() || "";
    const costo =
      parseFloat(
        document.querySelector(".input-edition-product-cost")?.value,
      ) || 0;
    const venta =
      parseFloat(
        document.querySelector(".input-edition-product-sold")?.value,
      ) || 0;

    if (!nombre) {
      alert("El nombre es requerido");
      return;
    }

    if (productoEditandoIndex !== null) {
      pedido.productos[productoEditandoIndex] = {
        ...pedido.productos[productoEditandoIndex],
        nombre,
        costo,
        venta,
      };
    } else {
      pedido.productos.push({
        id: generarId(),
        nombre,
        cantidad: 1,
        costo,
        venta,
      });
    }

    guardarPedidos();
    renderizarDetallesPedido(pedido);
    cerrarModal();
    productoEditandoIndex = null;
  });
}

function abrirModalEdicion(index) {
  const pedido = pedidos.find((p) => p.id === pedidoActualId);
  if (!pedido) return;

  const producto = pedido.productos[index];
  productoEditandoIndex = index;

  document.querySelector(".modal-title").textContent = "Editar Producto";
  document.querySelector(".input-edition-product-name").value = producto.nombre;
  document.querySelector(".input-edition-product-cost").value = producto.costo;
  document.querySelector(".input-edition-product-sold").value = producto.venta;

  const modalContainer = document.querySelector(".modal-edition-container");
  const modal = document.querySelector(".modal-edition");
  modalContainer.style.display = "flex";
  setTimeout(() => {
    modalContainer.style.scale = "1";
    modal.style.scale = "1";
  }, 10);
}

// ========== GESTIÓN DE ZELLE ==========
function initZelleSettings() {
  const gearIcon = document.querySelector(".bi-gear");
  const settingsContainer = document.querySelector(".setting-container");
  const zelleInput = document.querySelector(".setting-zelle-value");
  const saveBtn = document.querySelector(".btn-save-zelle-value");

  if (!gearIcon || !settingsContainer || !zelleInput || !saveBtn) return;

  zelleInput.value = zelleValue;

  gearIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    settingsContainer.style.transform =
      settingsContainer.style.transform === "scale(1)"
        ? "scale(0)"
        : "scale(1)";
  });

  document.addEventListener("click", (e) => {
    if (!settingsContainer.contains(e.target) && e.target !== gearIcon) {
      settingsContainer.style.transform = "scale(0)";
    }
  });

  saveBtn.addEventListener("click", () => {
    const nuevoValor = parseFloat(zelleInput.value);
    if (!isNaN(nuevoValor) && nuevoValor > 0) {
      zelleValue = nuevoValor;
      guardarZelleValue();
      alert(`Valor del Zelle actualizado: 1 Zelle = ${zelleValue} CUP`);
      settingsContainer.style.transform = "scale(0)";
      if (
        document
          .querySelector(".screen-orders-list")
          .classList.contains("screen-active")
      ) {
        renderizarListaPedidos();
      }
    } else {
      alert("Ingresa un valor válido");
    }
  });
}

// ========== DETECCIÓN OFFLINE PARA iOS ==========
function initOfflineDetection() {
  const offlineIndicator = document.createElement("div");
  offlineIndicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #f44336;
    color: white;
    padding: 12px 24px;
    border-radius: 50px;
    font-size: 14px;
    font-weight: bold;
    z-index: 9999;
    display: none;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    white-space: nowrap;
    backdrop-filter: blur(10px);
  `;
  offlineIndicator.textContent = "📴 Modo offline - Funcionando";
  document.body.appendChild(offlineIndicator);

  function updateOnlineStatus() {
    if (navigator.onLine) {
      offlineIndicator.style.display = "block";
      offlineIndicator.style.backgroundColor = "#00ab64";
      offlineIndicator.textContent = "✅ Conexión restablecida";
      setTimeout(() => {
        offlineIndicator.style.display = "none";
      }, 2000);
    } else {
      offlineIndicator.style.display = "block";
      offlineIndicator.style.backgroundColor = "#f44336";
      offlineIndicator.textContent = "📴 Modo offline - Funcionando";
      setTimeout(() => {
        offlineIndicator.style.opacity = "0.7";
      }, 3000);
    }
  }

  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);

  if (!navigator.onLine) {
    updateOnlineStatus();
  }
}

function verificarStorageOffline() {
  try {
    localStorage.setItem("test_offline", "1");
    localStorage.removeItem("test_offline");
    console.log("✅ LocalStorage disponible offline");
  } catch (e) {
    console.error("❌ LocalStorage no disponible:", e);
  }
}

// ========== SERVICE WORKER ==========
function registrarServiceWorker() {
  if ("serviceWorker" in navigator) {
    const basePath = location.pathname.substring(
      0,
      location.pathname.lastIndexOf("/") + 1,
    );

    navigator.serviceWorker
      .register(basePath + "sw.js")
      .then((registration) => {
        console.log("🍎 Service Worker iOS registrado:", registration.scope);
        registration.update();
        setInterval(() => {
          registration.update();
        }, 3600000);
      })
      .catch((error) => {
        console.log("❌ Error Service Worker:", error);
      });
  }
}

// ========== INICIALIZACIÓN ==========
function init() {
  initFiltros();
  initFormularioPedido();
  initPantallaDetalles();
  initZelleSettings();
  initOfflineDetection();
  verificarStorageOffline();

  const filterDelivery = document.querySelector("sapn.filter-delivery");
  if (filterDelivery) {
    const span = document.createElement("span");
    span.className = filterDelivery.className;
    span.innerHTML = filterDelivery.innerHTML;
    filterDelivery.replaceWith(span);
  }

  renderizarListaPedidos();
  renderizarProductosTemporales();
  registrarServiceWorker();
}

document.addEventListener("DOMContentLoaded", init);
