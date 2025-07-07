// Configuración de IndexedDB
const DB_NAME = "CombosDB";
const DB_VERSION = 1;
const STORE_NAME = "combos";

let db;

// Inicializar la base de datos
export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("Error al abrir la base de datos", event);
      reject("Error al abrir la base de datos");
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
      store.createIndex("cliente", "cliente", { unique: false });
      store.createIndex("fecha", "fecha", { unique: false });
    };
  });
}

// Obtener todos los combos
export function getAllCombos() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = (event) => {
      reject("Error al obtener los combos");
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
  });
}

// Obtener un combo por ID
export function getComboById(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onerror = (event) => {
      reject("Error al obtener el combo");
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
  });
}

// Guardar un nuevo combo
export function saveCombo(combo) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(combo);

    request.onerror = (event) => {
      reject("Error al guardar el combo");
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
  });
}

// Buscar combos por cliente
export function searchCombosByCliente(query) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("cliente");
    const request = index.getAll();

    request.onerror = (event) => {
      reject("Error al buscar combos");
    };

    request.onsuccess = (event) => {
      const combos = event.target.result;
      const filtered = combos.filter((combo) =>
        combo.cliente.toLowerCase().includes(query.toLowerCase())
      );
      resolve(filtered);
    };
  });
}
