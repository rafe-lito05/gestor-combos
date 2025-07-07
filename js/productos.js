// productos.js - Versión corregida

document.addEventListener("DOMContentLoaded", function() {
    // Solo ejecutar si estamos en la página de detalle
    if (document.getElementById("tabla-productos")) {
      cargarDetalleCombo();
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
    const combo = combos.find(function(c) { return c.id === comboId; });
  
    if (!combo) {
      window.location.href = "index.html";
      return;
    }
  
    // Mostrar información del cliente
    document.getElementById("nombre-cliente-detalle").textContent = combo.cliente;
    document.getElementById("telefono-cliente").textContent = combo.telefono;
    document.getElementById("direccion-cliente").textContent = combo.direccion || "No especificada";
    document.getElementById("fecha-combo").textContent = combo.fecha;
  
    // Mostrar productos en la tabla
    const tbody = document.querySelector("#tabla-productos tbody");
    tbody.innerHTML = "";
  
    let costoTotal = 0;
    let precioTotal = 0;
    let gananciaTotal = 0;
  
    combo.productos.forEach(function(prod) {
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
    document.getElementById("costo-total-detalle").textContent = costoTotal.toFixed(2);
    document.getElementById("precio-total-detalle").textContent = precioTotal.toFixed(2);
    document.getElementById("ganancia-total-detalle").textContent = gananciaTotal.toFixed(2);
  }