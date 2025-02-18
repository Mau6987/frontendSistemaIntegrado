import { openDB } from 'idb';

// Inicializar la base de datos
const dbPromise = openDB('app-db', 55, { // Cambia la versión al número más reciente
  upgrade(db, oldVersion) {
    console.log('Actualizando la base de datos...');
    if (!db.objectStoreNames.contains('cargasAguaPropietario')) {
      db.createObjectStore('cargasAguaPropietario', { keyPath: 'id' });
      console.log('Object store "cargasAguaPropietario" creado.');
    }
  

    if (!db.objectStoreNames.contains('perfil')) {
      db.createObjectStore('perfil', { keyPath: 'id' });
    }

    if (!db.objectStoreNames.contains('usuarios')) {
      db.createObjectStore('usuarios', { keyPath: 'id' });
    }

    if (!db.objectStoreNames.contains('tiposDeCamion')) {
      db.createObjectStore('tiposDeCamion', { keyPath: 'id' });
    }

    if (!db.objectStoreNames.contains('cargasAgua')) {
      db.createObjectStore('cargasAgua', { keyPath: 'id' });
    }

    if (!db.objectStoreNames.contains('propietarios')) {
      db.createObjectStore('propietarios', { keyPath: 'id' });
    }

    if (!db.objectStoreNames.contains('pagos')) {
      db.createObjectStore('pagos', { keyPath: 'id' });
    }

    if (!db.objectStoreNames.contains('CargaAguaDeuda')) {
      db.createObjectStore('CargaAguaDeuda', { keyPath: 'id' });
    }

    if (!db.objectStoreNames.contains('cargasAguaCliente')) {
      db.createObjectStore('cargasAguaCliente', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('PagoCliente')) {
      db.createObjectStore('PagoCliente', { keyPath: 'id' });
    }
    
    if (!db.objectStoreNames.contains('Conductores')) {
      db.createObjectStore('Conductores', { keyPath: 'id' });
      console.log('Object store "Conductores" creado.');
    }
    if (!db.objectStoreNames.contains('PagoPropietario')) {
      db.createObjectStore('PagoPropietario', { keyPath: 'id' });
      console.log('Object store "PagoPropietario" creado.');
    }
  },
});
// -------------------- Funciones Generales --------------------

// Guardar un registro en una tabla
export const saveRecord = async (storeName, record) => {
  const db = await dbPromise;
  const tx = db.transaction(storeName, 'readwrite');
  await tx.store.put(record);
  await tx.done;
};

// Obtener todos los registros de una tabla
export const getAllRecords = async (storeName) => {
  const db = await dbPromise;
  return db.getAll(storeName);
};

// Eliminar un registro por ID
export const deleteRecord = async (storeName, id) => {
  const db = await dbPromise;
  const tx = db.transaction(storeName, 'readwrite');
  await tx.store.delete(id);
  await tx.done;
};

// Obtener un registro por ID
export const getRecordById = async (storeName, id) => {
  const db = await dbPromise;
  return db.get(storeName, id);
};

// -------------------- Funciones Específicas --------------------

// Perfil
export const saveProfile = async (profile) => saveRecord('perfil', profile);
export const getProfile = async () => {
  const idUser = localStorage.getItem('idUser');
  return getRecordById('perfil', idUser);
};

// Tipos de Camión
export const saveTipoCamion = async (tipoCamion) => saveRecord('tiposDeCamion', tipoCamion);
export const getTiposDeCamion = async () => getAllRecords('tiposDeCamion');
export const deleteTipoCamion = async (id) => deleteRecord('tiposDeCamion', id);

// Usuarios
export const saveUsuario = async (usuario) => saveRecord('usuarios', usuario);
export const getUsuarios = async () => getAllRecords('usuarios');
export const deleteUsuario = async (id) => deleteRecord('usuarios', id);

// Cargas de Agua
export const saveCargaAgua = async (cargaAgua) => saveRecord('cargasAgua', cargaAgua);
export const getCargasAgua = async () => getAllRecords('cargasAgua');
export const deleteCargaAgua = async (id) => deleteRecord('cargasAgua', id);
export const getCargaAguaById = async (id) => getRecordById('cargasAgua', id);

// Propietarios
export const savePropietario = async (propietario) => saveRecord('propietarios', propietario);
export const getPropietarios = async () => getAllRecords('propietarios');
export const deletePropietario = async (id) => deleteRecord('propietarios', id);

// Pagos
export const savePagos = async (pagos) => saveRecord('pagos', pagos);
export const getPagos = async () => getAllRecords('pagos');
export const deletePagos = async (id) => deleteRecord('pagos', id);
export const getPagosById = async (id) => getRecordById('pagos', id);

// Carga Agua Deuda
export const saveCargaAguaDeuda = async (cargaAguaDeuda) => saveRecord('CargaAguaDeuda', cargaAguaDeuda);
export const getCargaAguaDeuda = async () => getAllRecords('CargaAguaDeuda');
export const deleteCargaAguaDeuda = async (id) => deleteRecord('CargaAguaDeuda', id);

// Cargas Agua Cliente
export const saveCargaAguaCliente = async (cargaAguaCliente) => {
  const db = await dbPromise;
  if (!db.objectStoreNames.contains('cargasAguaCliente')) {
    console.error('El object store "cargasAguaCliente" no existe');
    return;
  }
  const tx = db.transaction('cargasAguaCliente', 'readwrite');
  await tx.store.put(cargaAguaCliente);
  await tx.done;
};
export const getCargasAguaCliente = async () => {
  try {
    const db = await dbPromise;
    const tx = db.transaction('cargasAguaCliente', 'readonly');
    const records = await tx.store.getAll();
    console.log('Datos desde IndexedDB:', records);
    return records || [];
  } catch (error) {
    console.error('Error al obtener datos de IndexedDB:', error);
    return [];
  }
};

export const deleteCargaAguaCliente = async (id) => deleteRecord('CargaAguaCliente', id);
export const getCargaClienteAguaById = async (id) => getRecordById('CargaAguaCliente', id);

// Guardar datos en IndexedDB
export const  savePagoCliente = async (registro) => {
  try {
    const db = await dbPromise;
    const tx = db.transaction('PagoCliente', 'readwrite');
    await tx.store.put(registro);
    await tx.done;
    console.log('Registro guardado en IndexedDB:', registro);
  } catch (error) {
    console.error('Error al guardar el registro en IndexedDB:', error);
  }
};

// -----------------------------------------------------------------------
export const getPagoCliente = async () => {
  try {
    const db = await dbPromise;
    const tx = db.transaction('PagoCliente', 'readonly');
    const records = await tx.store.getAll();
    console.log('Datos obtenidos de IndexedDB:', records);
    return records;
  } catch (error) {
    console.error('Error al obtener datos de IndexedDB:', error);
    return [];
  }
};
// -----------------------------------------------------------------------
export const getCargasAguaPropietario = async () => {
  try {
    const db = await dbPromise;
    const tx = db.transaction('cargasAguaPropietario', 'readonly');
    const records = await tx.store.getAll();
    console.log('Datos obtenidos de IndexedDB:', records);
    return records;
  } catch (error) {
    console.error('Error al obtener datos de IndexedDB:', error);
    return [];
  }
};
export const  saveCargasAguaPropietario = async (registro) => {
  try {
    const db = await dbPromise;
    const tx = db.transaction('cargasAguaPropietario', 'readwrite');
    await tx.store.put(registro);
    await tx.done;
    console.log('Registro guardado en IndexedDB:', registro);
  } catch (error) {
    console.error('Error al guardar el registro en IndexedDB:', error);
  }
};
//--------------------------------------------------------------------------------
export const getConductores = async () => {
  try {
    const db = await dbPromise;
    const tx = db.transaction('Conductores', 'readonly');
    const records = await tx.store.getAll();
    console.log('Datos obtenidos de IndexedDB:', records);
    return records;
  } catch (error) {
    console.error('Error al obtener datos de IndexedDB:', error);
    return [];
  }
};
export const saveConductores = async (registro) => {
  try {
    const db = await dbPromise;
    const tx = db.transaction('Conductores', 'readwrite');
    await tx.store.put(registro);
    await tx.done;
    console.log('Registro guardado en IndexedDB:', registro);
  } catch (error) {
    console.error('Error al guardar el registro en IndexedDB:', error);
  }
};
//--------------------------------------------------------------------------------
export const getPagoPropietario = async () => {
  try {
    const db = await dbPromise;
    const tx = db.transaction('PagoPropietario', 'readonly');
    const records = await tx.store.getAll();
    console.log('Datos obtenidos de IndexedDB:', records);
    return records;
  } catch (error) {
    console.error('Error al obtener datos de IndexedDB:', error);
    return [];
  }
};
export const savePagoPropietario = async (registro) => {
  try {
    const db = await dbPromise;
    const tx = db.transaction('PagoPropietario', 'readwrite');
    await tx.store.put(registro);
    await tx.done;
    console.log('Registro guardado en IndexedDB:', registro);
  } catch (error) {
    console.error('Error al guardar el registro en IndexedDB:', error);
  }
};
export const syncProfile = async () => {
  if (!navigator.onLine) return; // Solo sincroniza si hay conexión

  try {
    const db = await dbPromise;
    const tx = db.transaction('perfil', 'readonly');
    const storedProfile = await tx.store.getAll(); // Obtener el perfil almacenado localmente

    if (storedProfile.length > 0) {
      const profile = storedProfile[0]; // Solo hay un perfil guardado

      // Enviar al servidor
      const response = await fetch(`https://mi-backendsecond.onrender.com/perfil/${profile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        console.log('Perfil sincronizado con éxito.');

        // Limpiar IndexedDB después de la sincronización
        const deleteTx = db.transaction('perfil', 'readwrite');
        await deleteTx.store.clear();
      } else {
        console.error('Error al sincronizar con el servidor:', response.status);
      }
    }
  } catch (error) {
    console.error('Error en la sincronización:', error);
  }
};


//
export const syncCargasAgua = async () => {
  if (!navigator.onLine) return;

  try {
    const db = await dbPromise;
    const tx = db.transaction('cargasAgua', 'readonly');
    const storedCargas = await tx.store.getAll();

    if (storedCargas.length > 0) {
      for (const carga of storedCargas) {
        let response;

        if (carga.deletePending) {
          // Si el registro está marcado para eliminar, eliminarlo en el servidor
          response = await fetch(`https://mi-backendsecond.onrender.com/cargagua/${carga.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
        } else if (carga.updatePending) {
          // Si el registro está marcado para actualización, actualizar en el servidor
          response = await fetch(`https://mi-backendsecond.onrender.com/cargagua/${carga.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(carga),
          });
        } else if (carga.id.startsWith('offline-')) {
          // Si es un nuevo registro creado en offline, crear en el servidor
          response = await fetch('https://mi-backendsecond.onrender.com/cargagua', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(carga),
          });
        }

        if (response && response.ok) {
          console.log('Carga de agua sincronizada con éxito:', carga);

          // Eliminar de IndexedDB después de sincronizar
          const deleteTx = db.transaction('cargasAgua', 'readwrite');
          await deleteTx.store.delete(carga.id);
        } else {
          console.error('Error al sincronizar carga de agua:', response ? response.status : 'No hay respuesta');
        }
      }
    }
  } catch (error) {
    console.error('Error en la sincronización de cargas de agua:', error);
  }
};

export const syncTiposDeCamion = async () => {
  if (!navigator.onLine) return;

  try {
    const db = await dbPromise;
    const tx = db.transaction('tiposDeCamion', 'readonly');
    const storedTipos = await tx.store.getAll();

    if (storedTipos.length > 0) {
      for (const tipo of storedTipos) {
        let response;

        if (tipo.deletePending) {
          // Si está marcado para eliminar, eliminarlo del servidor
          response = await fetch(`https://mi-backendsecond.onrender.com/tiposDeCamion/${tipo.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
        } else if (tipo.updatePending) {
          // Si está marcado para actualización, actualizarlo en el servidor
          response = await fetch(`https://mi-backendsecond.onrender.com/tiposDeCamion/${tipo.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(tipo),
          });
        } else if (tipo.id.startsWith('offline-')) {
          // Si es un nuevo registro creado en offline, crearlo en el servidor
          response = await fetch('https://mi-backendsecond.onrender.com/tiposDeCamion', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(tipo),
          });
        }

        if (response && response.ok) {
          console.log('Tipo de camión sincronizado con éxito:', tipo);

          // Eliminar de IndexedDB después de sincronizar
          const deleteTx = db.transaction('tiposDeCamion', 'readwrite');
          await deleteTx.store.delete(tipo.id);
        } else {
          console.error('Error al sincronizar tipo de camión:', response ? response.status : 'No hay respuesta');
        }
      }
    }
  } catch (error) {
    console.error('Error en la sincronización de tipos de camión:', error);
  }
};



export const syncEliminarTiposDeCamion = async () => {
  if (!navigator.onLine) return;

  try {
    const db = await dbPromise;
    const tx = db.transaction('tiposDeCamion', 'readonly');
    const storedTipos = await tx.store.getAll();

    if (storedTipos.length > 0) {
      for (const tipo of storedTipos) {
        if (tipo.deletePending) {
          const response = await fetch(`https://mi-backendsecond.onrender.com/tiposDeCamion/${tipo.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });

          if (response.ok) {
            console.log('Tipo de camión eliminado con éxito:', tipo);

            // Eliminar de IndexedDB después de sincronizar
            const deleteTx = db.transaction('tiposDeCamion', 'readwrite');
            await deleteTx.store.delete(tipo.id);
          } else {
            console.error('Error al sincronizar eliminación:', response.status);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error en la sincronización de eliminaciones:', error);
  }
};

export const syncUsuarios = async () => {
  if (!navigator.onLine) return;

  try {
    const db = await dbPromise;
    const tx = db.transaction('usuarios', 'readonly');
    const storedUsuarios = await tx.store.getAll();

    for (const usuario of storedUsuarios) {
      if (usuario.pendingSync) {
        // Si fue creado en offline, enviarlo al servidor
        const response = await fetch('https://mi-backendsecond.onrender.com/usuarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(usuario),
        });

        if (response.ok) {
          console.log('Usuario sincronizado:', usuario);

          // Eliminar de IndexedDB después de sincronizar
          const deleteTx = db.transaction('usuarios', 'readwrite');
          await deleteTx.store.delete(usuario.id);
        } else {
          console.error('Error al sincronizar usuario:', response.status);
        }
      }

      if (usuario.deletePending) {
        // Si estaba marcado para eliminación, eliminar del servidor
        const response = await fetch(`https://mi-backendsecond.onrender.com/usuarios/${usuario.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if (response.ok) {
          console.log('Usuario eliminado del servidor:', usuario);

          // Eliminar de IndexedDB
          const deleteTx = db.transaction('usuarios', 'readwrite');
          await deleteTx.store.delete(usuario.id);
        } else {
          console.error('Error al eliminar usuario:', response.status);
        }
      }
    }
  } catch (error) {
    console.error('Error en la sincronización de usuarios:', error);
  }
};

export const syncPagos = async () => {
  if (!navigator.onLine) return;

  try {
    const storedPagos = await getPagos(); // Obtener pagos de IndexedDB

    for (const pago of storedPagos) {
      if (!pago.synced) {
        // Enviar pagos guardados offline al servidor
        const response = await axios.post(`${URL_BASE}/pagoscargagua`, pago, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if (response.status === 201) {
          await deletePagos(pago.id); // Eliminar de IndexedDB después de sincronizar
        } else {
          console.error('Error al sincronizar pago:', response.status);
        }
      }

      if (pago.deletePending) {
        // Si estaba marcado para eliminación, eliminar del servidor
        const response = await axios.delete(`${URL_BASE}/pagoscargagua/${pago.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if (response.status === 200) {
          await deletePagos(pago.id);
        } else {
          console.error('Error al eliminar pago:', response.status);
        }
      }
    }
  } catch (error) {
    console.error('Error en la sincronización de pagos:', error);
  }
};


