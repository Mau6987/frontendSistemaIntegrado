import React, { useEffect, useState } from 'react';
import {
  Table,
  Modal,
  ModalBody,
  ModalHeader,
  ModalTitle,
  Button,
  Form,
  FormGroup,
  FormLabel,
  FormControl,
  Alert,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import '../css/TableTipoCamion.css';
import { getTiposDeCamion, saveTipoCamion, syncEliminarTiposDeCamion, syncTiposDeCamion} from '../../services/indexedDB';

// Hook para manejar el tamaño de la ventana
const useWindowWidth = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowWidth;
};

export default function TableTipoCamion() {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [cantidadDeAgua, setCantidadDeAgua] = useState('12000');
  const [offlineMode, setOfflineMode] = useState(!navigator.onLine);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const URL = 'https://mi-backendsecond.onrender.com/tiposDeCamion';

  useEffect(() => {
    const updateOfflineStatus = () => setOfflineMode(!navigator.onLine);
    window.addEventListener('online', updateOfflineStatus);
    window.addEventListener('offline', updateOfflineStatus);
    fetchData();
    return () => {
      window.removeEventListener('online', updateOfflineStatus);
      window.removeEventListener('offline', updateOfflineStatus);
    };
  }, []);

  const fetchData = async () => {
    try {
      if (navigator.onLine) {
        const response = await fetch(URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const jsonData = await response.json();
          setData(jsonData);
          await Promise.all(jsonData.map((registro) => saveTipoCamion(registro)));
        } else if (response.status === 401) {
          navigate('/');
        }
      } else {
        const cachedData = await getTiposDeCamion();
        setData(cachedData);
      }
    } catch (error) {
      console.error('Error al obtener datos:', error);
    }
  };
  const handleGuardarRegistro = async () => {
    const nuevoRegistro = {
      id: selectedRegistro?.id || (navigator.onLine ? undefined : `offline-${Date.now()}`),
      descripcion,
      cantidadDeAgua,
      pendingSync: !navigator.onLine // Marcar como pendiente si está offline
    };
  
    try {
      if (navigator.onLine) {
        const response = await fetch(
          selectedRegistro ? `${URL}/${selectedRegistro.id}` : URL,
          {
            method: selectedRegistro ? 'PUT' : 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(nuevoRegistro),
          }
        );
  
        if (response.ok) {
          fetchData();
          setShowModal(false);
          Swal.fire({
            icon: 'success',
            title: selectedRegistro ? 'Registro actualizado' : 'Registro creado',
            text: 'Los cambios se han guardado exitosamente.',
          });
        } else {
          console.error('Error al guardar el registro.');
        }
      } else {
        await saveTipoCamion(nuevoRegistro);
        setShowModal(false);
        Swal.fire({
          icon: 'info',
          title: 'Modo offline',
          text: 'Los cambios se guardaron localmente y se sincronizarán cuando haya conexión.',
        });
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
    }
  };
  

  const handleEliminarRegistro = async () => {
    try {
      if (navigator.onLine) {
        const response = await fetch(`${URL}/${selectedRegistro.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.ok) {
          fetchData();
          setShowDeleteModal(false);
          Swal.fire({
            icon: 'success',
            title: 'Registro eliminado',
            text: 'El registro se ha eliminado exitosamente.',
          });
        } else {
          console.error('Error al eliminar el registro.');
        }
      } else {
        // Marcar para eliminación en IndexedDB
        await saveTipoCamion({ ...selectedRegistro, deletePending: true });
        setShowDeleteModal(false);
        Swal.fire({
          icon: 'info',
          title: 'Modo offline',
          text: 'El registro se eliminará cuando haya conexión.',
        });
      }
    } catch (error) {
      console.error('Error al eliminar el registro:', error);
    }
  };
  
  const renderHeaders = () => (
    <thead>
      <tr>
        <th>Descripción</th>
        <th>Cantidad de Agua</th>
        <th>Ver</th>
        <th>Editar</th>
        <th>Eliminar</th>
      </tr>
    </thead>
  );

  const renderRows = () => (
    <tbody>
      {data.map((item) => (
        <tr key={item.id}>
          <td>{item.descripcion}</td>
          <td>{item.cantidadDeAgua}</td>
          <td>
            <Button variant="info" onClick={() => handleVerRegistro(item)}>
              Ver
            </Button>
          </td>
          <td>
            <Button variant="warning" onClick={() => handleEditRegistro(item)}>
              Editar
            </Button>
          </td>
          <td>
            <Button variant="danger" onClick={() => handleShowDeleteModal(item)}>
              Eliminar
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  );

  const renderMiniCards = () => (
    <div className="tabla-div">
      {data.map((item) => (
        <div className="mini-card" key={item.id}>
          <div className="card-header">Registro #{item.id}</div>
          <div className="card-body">
            <div>
              <span>Descripción:</span>
              <span>{item.descripcion}</span>
            </div>
            <div>
              <span>Cantidad de Agua:</span>
              <span>{item.cantidadDeAgua}</span>
            </div>
          </div>
          <div className="card-actions">
            <Button variant="info" onClick={() => handleVerRegistro(item)}>Ver</Button>
            <Button variant="warning" onClick={() => handleEditRegistro(item)}>Editar</Button>
            <Button variant="danger" onClick={() => handleShowDeleteModal(item)}>Eliminar</Button>
          </div>
        </div>
      ))}
    </div>
  );

  const handleVerRegistro = (registro) => {
    setSelectedRegistro(registro);
    setEditMode(false);
    setShowModal(true);
  };

  const handleEditRegistro = (registro) => {
    setSelectedRegistro(registro);
    setDescripcion(registro.descripcion);
    setCantidadDeAgua(registro.cantidadDeAgua);
    setEditMode(true);
    setShowModal(true);
  };

  const handleShowDeleteModal = (registro) => {
    setSelectedRegistro(registro);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  return (
    <>
      <Navbar />
      <div className="main-container">
        {isMobile ? renderMiniCards() : (
          <div className="tabla-div">
           <Table className="table table-hover" responsive bordered>
  {renderHeaders()}
  {renderRows()}
</Table>

          </div>
        )}
        <div className="btn-crear-div">
          <Button variant="success" onClick={() => setShowModal(true)}>
            CREAR REGISTRO
          </Button>
        </div>
      </div>
      {offlineMode && (
        <div className="offline-alert" style={{ marginTop: '20px', textAlign: 'center' }}>
          <Alert variant="warning">Estás en modo offline. Algunos cambios no se guardarán hasta que vuelvas a estar en línea.</Alert>
        </div>
      )}
      <Modal show={showModal} onHide={handleCloseModal}>
        <ModalHeader closeButton>
          <ModalTitle>{editMode ? 'Editar Registro' : 'Detalles del Registro'}</ModalTitle>
        </ModalHeader>
        <ModalBody>
  <Form>
    <FormGroup>
      <FormLabel>Descripción</FormLabel>
      <FormControl
        type="text"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        readOnly={!editMode} // Permitir edición en offline
      />
    </FormGroup>
    <FormGroup>
      <FormLabel>Cantidad de Agua</FormLabel>
      <FormControl
        as="select"
        value={cantidadDeAgua}
        onChange={(e) => setCantidadDeAgua(e.target.value)}
        disabled={!editMode} // Permitir cambios en offline
      >
        <option value="12000">12000</option>
        <option value="15000">15000</option>
        <option value="18000">18000</option>
      </FormControl>
    </FormGroup>
  </Form>
</ModalBody>

        <Modal.Footer>
          {editMode && <Button variant="success" onClick={handleGuardarRegistro}>Guardar</Button>}
          <Button variant="secondary" onClick={handleCloseModal}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <ModalHeader closeButton>
          <ModalTitle>Confirmar Eliminación</ModalTitle>
        </ModalHeader>
        <ModalBody>
          ¿Está seguro de que desea eliminar el registro <strong>{selectedRegistro?.descripcion}</strong>?
        </ModalBody>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleEliminarRegistro}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
