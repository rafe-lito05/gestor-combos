import { initDB } from "./database.js";

// Añadir campos de producto
if (document.getElementById("agregar-producto")) {
  document.getElementById("agregar-producto").addEventListener("click", () => {
    agregarProducto();
  });
}

function agregarProducto() {
  const container = document.getElementById("productos-container");
  const productoDiv = document.createElement("div");
  productoDiv.className = "producto-container";

  productoDiv.innerHTML = `
    <div class="producto-header">
      <h4>Producto</h4>
      <button class="producto-eliminar">Eliminar</button>
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

  // Agregar evento para eliminar producto
  productoDiv
    .querySelector(".producto-eliminar")
    .addEventListener("click", () => {
      productoDiv.remove();
      calcularTotales();
    });

  // Agregar eventos para calcular en tiempo real
  const cantidadInput = productoDiv.querySelector(".producto-cantidad");
  const costoInput = productoDiv.querySelector(".producto-costo");
  const precioInput = productoDiv.querySelector(".producto-precio");

  const calcularHandler = () => {
    calcularProducto(productoDiv);
    calcularTotales();
  };

  cantidadInput.addEventListener("input", calcularHandler);
  costoInput.addEventListener("input", calcularHandler);
  precioInput.addEventListener("input", calcularHandler);
}

function calcularProducto(productoDiv) {
  const cantidad =
    parseFloat(productoDiv.querySelector(".producto-cantidad").value) || 0;
  const costo =
    parseFloat(productoDiv.querySelector(".producto-costo").value) || 0;
  const precio =
    parseFloat(productoDiv.querySelector(".producto-precio").value) || 0;

  const ganancia = precio - costo;
  const subtotal = cantidad * precio;
  const costoTotal = cantidad * costo;

  productoDiv.querySelector(".producto-ganancia").textContent =
    ganancia.toFixed(2);
  productoDiv.querySelector(".producto-subtotal").textContent =
    subtotal.toFixed(2);
}

function calcularTotales() {
  const productos = document.querySelectorAll(".producto-container");
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

  if (document.getElementById("costo-total")) {
    document.getElementById("costo-total").textContent = costoTotal.toFixed(2);
    document.getElementById("precio-total").textContent =
      precioTotal.toFixed(2);
    document.getElementById("ganancia-total").textContent =
      gananciaTotal.toFixed(2);
  }

  return { costoTotal, precioTotal, gananciaTotal };
}

// Cargar detalle del combo
if (document.getElementById("tabla-productos")) {
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      await initDB();
      const comboId = parseInt(localStorage.getItem("comboActual"));
      const combo = await getComboById(comboId);

      if (combo) {
        document.getElementById("nombre-cliente-detalle").textContent =
          combo.cliente;
        document.getElementById("telefono-cliente").textContent =
          combo.telefono;
        document.getElementById("direccion-cliente").textContent =
          combo.direccion || "No especificada";
        document.getElementById("fecha-combo").textContent = combo.fecha;

        const tbody = document.querySelector("#tabla-productos tbody");
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
            <td>$${prod.costo.toFixed(2)}</td>
            <td>$${prod.precio.toFixed(2)}</td>
            <td>$${ganancia.toFixed(2)}</td>
            <td>$${subtotal.toFixed(2)}</td>
          `;
          tbody.appendChild(row);
        });

        document.getElementById("costo-total-detalle").textContent =
          costoTotal.toFixed(2);
        document.getElementById("precio-total-detalle").textContent =
          precioTotal.toFixed(2);
        document.getElementById("ganancia-total-detalle").textContent =
          gananciaTotal.toFixed(2);
      } else {
        window.location.href = "index.html";
      }
    } catch (error) {
      console.error("Error cargando detalle:", error);
      window.location.href = "index.html";
    }
  });
}
