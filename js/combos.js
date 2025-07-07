import { initDB, saveCombo } from './database.js';

// Guardar nuevo combo
if (document.getElementById("form-combo")) {
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      await initDB();
      
      document.getElementById("form-combo").addEventListener("submit", async (e) => {
        e.preventDefault();

        const cliente = document.getElementById("nombre-cliente").value;
        const direccion = document.getElementById("direccion").value;
        const telefono = document.getElementById("telefono").value;
        const productos = [];

        document.querySelectorAll(".producto-container").forEach((prod) => {
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
          alert("Debe agregar al menos un producto");
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

        try {
          await saveCombo(nuevoCombo);
          window.location.href = "index.html";
        } catch (error) {
          console.error('Error guardando combo:', error);
          alert('Error al guardar el pedido');
        }
      });
    } catch (error) {
      console.error('Error inicializando formulario:', error);
      alert('Error al cargar el formulario');
    }
  });
}