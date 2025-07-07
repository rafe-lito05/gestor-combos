import { initDB, getAllCombos, getComboById, searchCombosByCliente } from './database.js';

// Configuración inicial
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await initDB();
    
    // Navegación
    if (document.getElementById("nuevo-combo")) {
      document.getElementById("nuevo-combo").addEventListener("click", () => {
        window.location.href = "nuevo-combo.html";
      });
    }

    // Cargar combos en index
    if (document.getElementById("lista-combos")) {
      await cargarCombos();
    }

    // Buscar combos
    if (document.getElementById("btn-buscar")) {
      document.getElementById("btn-buscar").addEventListener("click", async () => {
        const query = document.getElementById("buscar-cliente").value;
        await cargarCombos(query);
      });
    }
  } catch (error) {
    console.error('Error inicializando la aplicación:', error);
    mostrarMensaje('Error al cargar la aplicación', 'error');
  }
});

// Función para cargar combos
async function cargarCombos(query = '') {
  const lista = document.getElementById("lista-combos");
  lista.innerHTML = "<p>Cargando combos...</p>";

  try {
    let combos;
    if (query) {
      combos = await searchCombosByCliente(query);
    } else {
      combos = await getAllCombos();
    }

    lista.innerHTML = "";

    if (combos.length === 0) {
      lista.innerHTML = "<p>No hay pedidos registrados</p>";
      return;
    }

    combos.forEach((combo) => {
      const comboElement = document.createElement("div");
      comboElement.className = "combo-card";
      comboElement.innerHTML = `
        <h3>${combo.cliente}</h3>
        <p><strong>Teléfono:</strong> ${combo.telefono}</p>
        <p><strong>Fecha:</strong> ${combo.fecha}</p>
        <p><strong>Precio Venta:</strong> $${combo.precioTotal.toFixed(2)}</p>
        <p><strong>Ganancia:</strong> $${combo.gananciaTotal.toFixed(2)}</p>
        <button onclick="verDetalle(${combo.id})" class="btn">Ver Detalle</button>
      `;
      lista.appendChild(comboElement);
    });
  } catch (error) {
    console.error('Error cargando combos:', error);
    lista.innerHTML = "<p class='mensaje-error'>Error al cargar los combos</p>";
  }
}

// Función para ver detalle
window.verDetalle = async function(id) {
  try {
    localStorage.setItem("comboActual", id);
    window.location.href = "detalle-combo.html";
  } catch (error) {
    console.error('Error al ver detalle:', error);
    mostrarMensaje('Error al cargar el detalle', 'error');
  }
}

// Función para mostrar mensajes
function mostrarMensaje(texto, tipo = 'exito') {
  const mensaje = document.createElement('div');
  mensaje.className = `mensaje mensaje-${tipo}`;
  mensaje.textContent = texto;
  
  const container = document.querySelector('.container');
  container.insertBefore(mensaje, container.firstChild);
  
  setTimeout(() => {
    mensaje.remove();
  }, 5000);
}