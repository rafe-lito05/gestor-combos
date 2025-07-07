// combos.js - Versión corregida

document.addEventListener("DOMContentLoaded", function() {
    // Solo ejecutar si estamos en la página de nuevo combo
    if (document.getElementById("form-combo")) {
      inicializarFormularioCombo();
    }
  });
  
  function inicializarFormularioCombo() {
    const formCombo = document.getElementById("form-combo");
    const agregarProductoBtn = document.getElementById("agregar-producto");
  
    // Agregar primer producto automáticamente
    agregarProducto();
  
    // Evento para agregar más productos
    agregarProductoBtn.addEventListener("click", function(e) {
      e.preventDefault();
      agregarProducto();
    });
  
    // Evento para enviar el formulario
    formCombo.addEventListener("submit", function(e) {
      e.preventDefault();
      guardarCombo();
    });
  }
  
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
  
    // Agregar evento para eliminar producto
    productoDiv.querySelector(".producto-eliminar").addEventListener("click", function() {
      productoDiv.remove();
      calcularTotales();
    });
  
    // Agregar eventos para calcular en tiempo real
    const inputs = productoDiv.querySelectorAll(".producto-cantidad, .producto-costo, .producto-precio");
    inputs.forEach(function(input) {
      input.addEventListener("input", function() {
        calcularProducto(productoDiv);
        calcularTotales();
      });
    });
  }
  
  function calcularProducto(productoDiv) {
    const cantidad = parseFloat(productoDiv.querySelector(".producto-cantidad").value) || 0;
    const costo = parseFloat(productoDiv.querySelector(".producto-costo").value) || 0;
    const precio = parseFloat(productoDiv.querySelector(".producto-precio").value) || 0;
    
    const ganancia = precio - costo;
    const subtotal = cantidad * precio;
    
    productoDiv.querySelector(".producto-ganancia").textContent = ganancia.toFixed(2);
    productoDiv.querySelector(".producto-subtotal").textContent = subtotal.toFixed(2);
  }
  
  function calcularTotales() {
    const productos = document.querySelectorAll(".producto-container");
    let costoTotal = 0;
    let precioTotal = 0;
    let gananciaTotal = 0;
  
    productos.forEach(function(prod) {
      const cantidad = parseFloat(prod.querySelector(".producto-cantidad").value) || 0;
      const costo = parseFloat(prod.querySelector(".producto-costo").value) || 0;
      const precio = parseFloat(prod.querySelector(".producto-precio").value) || 0;
      
      costoTotal += cantidad * costo;
      precioTotal += cantidad * precio;
      gananciaTotal += cantidad * (precio - costo);
    });
  
    if (document.getElementById("costo-total")) {
      document.getElementById("costo-total").textContent = costoTotal.toFixed(2);
      document.getElementById("precio-total").textContent = precioTotal.toFixed(2);
      document.getElementById("ganancia-total").textContent = gananciaTotal.toFixed(2);
    }
  
    return { costoTotal, precioTotal, gananciaTotal };
  }
  
  function guardarCombo() {
    const cliente = document.getElementById("nombre-cliente").value;
    const direccion = document.getElementById("direccion").value;
    const telefono = document.getElementById("telefono").value;
    const productos = [];
  
    // Validación básica
    if (!cliente || !telefono) {
      alert("Por favor complete los campos obligatorios (Nombre y Teléfono)");
      return;
    }
  
    document.querySelectorAll(".producto-container").forEach(function(prod) {
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
          ganancia: cantidad * (precio - costo)
        });
      }
    });
  
    if (productos.length === 0) {
      alert("Debe agregar al menos un producto válido");
      return;
    }
  
    const { precioTotal, gananciaTotal, costoTotal } = calcularTotales();
  
    const nuevoCombo = {
      id: Date.now(),
      cliente,
      direccion,
      telefono,
      productos,
      precioTotal,
      gananciaTotal,
      costoTotal,
      fecha: new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    };
  
    guardarComboEnStorage(nuevoCombo);
    window.location.href = "index.html";
  }
  
  function guardarComboEnStorage(combo) {
    try {
      const combosGuardados = localStorage.getItem("combos");
      let combos = combosGuardados ? JSON.parse(combosGuardados) : [];
      combos.push(combo);
      localStorage.setItem("combos", JSON.stringify(combos));
      return true;
    } catch (error) {
      console.error("Error al guardar el combo:", error);
      return false;
    }
  }