import React, { useEffect, useState } from 'react';
import { Form, FormLabel, Modal, ModalBody, ModalHeader, ModalTitle, Table, FormGroup, FormControl, Button, Card, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Navbar';
import '../css/TablePago.css'; // Asegúrate de crear este archivo
import Swal from 'sweetalert2';
import {
  savePagos,
  saveCargaAguaDeuda,
  getPagos,
  deletePagos,
  getPagosById,
  saveUsuario,
  getUsuarios,
} from '../../services/indexedDB';

const useWindowWidth = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowWidth;
};

export default function PagoCargaAgua() {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const [fechaHora, setFechaHora] = useState('');
  const [usuarioId, setUsuarioId] = useState(0);
  const [usuarios, setUsuarios] = useState([]);
  const [cargasDeuda, setCargasDeuda] = useState([]);
  const [selectedCargas, setSelectedCargas] = useState([]);
  const [monto, setMonto] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [pagos, setPagos] = useState([]);
  const [selectedPago, setSelectedPago] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const URL_BASE = 'https://xvxsfhnjxj.execute-api.us-east-1.amazonaws.com/dev';

  useEffect(() => {
    const role = localStorage.getItem('rol');
    if (role !== 'admin') {
      navigate('/');
    } else {
      const fetchUsuarios = async () => {
        try {
          if (navigator.onLine) {
            const response = await axios.get(`${URL_BASE}/usuariosrol`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (response.status === 200) {
              const usuariosData = response.data;
              setUsuarios(usuariosData);
              // Guardar datos en IndexedDB
              await Promise.all(usuariosData.map((usuario) => saveUsuario(usuario)));
            } else {
              console.error('Error al obtener los usuarios del servidor.');
            }
          } else {
            // Obtener datos desde IndexedDB
            const cachedUsuarios = await getUsuarios();
            setUsuarios(cachedUsuarios);
          }
        } catch (error) {
          console.error('Error al obtener los usuarios:', error);
        }
      };
  
      const fetchPagos = async () => {
        try {
          if (navigator.onLine) {
            const response = await axios.get(`${URL_BASE}/pagoscargagua`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (response.status === 200) {
              const pagosData = response.data;
              setPagos(pagosData);
              // Guardar datos en IndexedDB
              await Promise.all(pagosData.map((pago) => savePagos(pago)));
            } else {
              console.error('Error al obtener los pagos del servidor.');
            }
          } else {
            // Obtener datos desde IndexedDB
            const cachedPagos = await getPagos();
            setPagos(cachedPagos);
          }
        } catch (error) {
          console.error('Error al obtener los pagos:', error);
        }
      };
  
      fetchUsuarios();
      fetchPagos();
      fetchCargasDeuda();
      setSelectedCargas([]);
    }
  }, [token]);

  const fetchCargasDeuda = async (usuarioId) => {
    try {
      if (navigator.onLine) {
        // Online: Obtener datos del servidor
        const response = await axios.get(`${URL_BASE}/cargasPropietarioDeuda/${usuarioId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (response.status === 200) {
          setCargasDeuda(response.data);
          // Guardar datos en IndexedDB
          await Promise.all(response.data.map((carga) => saveCargaAguaDeuda(carga)));
        } else {
          console.error('Error al obtener las cargas de agua con deuda desde el servidor.');
        }
      } else {
        // Offline: Obtener datos desde IndexedDB
        const cachedCargas = await getCargasAgua();
        const filteredCargas = cachedCargas.filter((carga) => carga.usuarioId === parseInt(usuarioId));
        setCargasDeuda(filteredCargas);
        console.info('Datos obtenidos de IndexedDB en modo offline:', filteredCargas);
      }
    } catch (error) {
      console.error('Error al obtener las cargas de agua con deuda:', error);
    }
  };
  

  const handleUsuarioChange = (event) => {
    const selectedUsuarioId = event.target.value;
    setUsuarioId(selectedUsuarioId);
    fetchCargasDeuda(selectedUsuarioId);
  };

  const handleCargasChange = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
    setSelectedCargas(selectedOptions);
  };

  const handleVerPago = async (pago) => {
    try {
      if (navigator.onLine) {
        // Si hay conexión, obtener el pago desde el servidor
        const response = await axios.get(`${URL_BASE}/pagoscargagua/${pago.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          setSelectedPago(response.data);
          setShowModal(true);
          setEditMode(false);
          Swal.fire({
            icon: 'success',
            title: 'Pago obtenido',
            text: 'Se obtuvo la información del pago exitosamente.',
          });
        } else {
          console.error('Error al obtener el pago desde el servidor.');
        }
      } else {
        // Si no hay conexión, obtener el pago desde IndexedDB
        const cachedPago = await getPagosById(pago.id);
        if (cachedPago) {
          setSelectedPago(cachedPago);
          setShowModal(true);
          setEditMode(false);
          Swal.fire({
            icon: 'info',
            title: 'Modo offline',
            text: 'Se obtuvo la información del pago desde el almacenamiento local.',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Pago no encontrado',
            text: 'No se encontró el pago en el almacenamiento local.',
          });
        }
      }
    } catch (error) {
      console.error('Error al obtener la información del pago:', error);
    }
  };
  const handleEditPago = async (pago) => {
    try {
      let pagoData;
  
      if (navigator.onLine) {
        const response = await axios.get(`${URL_BASE}/pagoscargagua/${pago.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.status === 200) {
          pagoData = response.data;
        } else {
          console.error('Error al obtener el pago desde el servidor.');
        }
      } else {
        pagoData = await getPagosById(pago.id);
        if (!pagoData) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se encontró el pago en el almacenamiento local.',
          });
          return;
        }
      }
  
      setSelectedPago(pagoData);
      setFechaHora(new Date(pagoData.fechaHora).toISOString().substring(0, 16));
      setMonto(pagoData.monto);
      setUsuarioId(pagoData.usuarioId);
      setSelectedCargas(pagoData.cargaAguaIds);
      setShowModal(true);
      setEditMode(true);
    } catch (error) {
      console.error('Error al cargar los datos para editar el pago:', error);
    }
  };
  
  const handleDeletePago = async (pagoId) => {
    try {
      if (navigator.onLine) {
        const response = await axios.delete(`${URL_BASE}/pagoscargagua/${pagoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.status === 200) {
          setPagos(pagos.filter((pago) => pago.id !== pagoId));
          Swal.fire({
            icon: 'success',
            title: 'Pago eliminado',
            text: 'El pago se eliminó exitosamente.',
          });
        } else {
          console.error('Error al eliminar el pago en el servidor.');
        }
      } else {
        await savePagos({ id: pagoId, deletePending: true }); // Marcar para eliminar en IndexedDB
        setPagos(pagos.filter((pago) => pago.id !== pagoId));
        Swal.fire({
          icon: 'info',
          title: 'Modo offline',
          text: 'El pago se eliminó localmente y se sincronizará cuando haya conexión.',
        });
      }
    } catch (error) {
      console.error('Error al eliminar el pago:', error);
    }
  };
  
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    
    if (!form.checkValidity() || selectedCargas.length === 0) {
      event.stopPropagation();
      setValidated(true);
      return;
    }
  
    const nuevoPago = {
      id: navigator.onLine ? undefined : `offline-${Date.now()}`, // ID temporal en offline
      usuarioId,
      monto: parseFloat(monto),
      cargaAguaIds: selectedCargas.map((id) => parseInt(id)), // Convertir a entero
      fechaHora: new Date(fechaHora),
      synced: navigator.onLine, // Marcar si está sincronizado o no
    };
  
    try {
      if (navigator.onLine) {
        let response;
        if (editMode) {
          response = await axios.put(`${URL_BASE}/pagoscargagua/${selectedPago.id}`, nuevoPago, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          response = await axios.post(`${URL_BASE}/pagoscargagua`, nuevoPago, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
  
        if (response.status === 200 || response.status === 201) {
          if (editMode) {
            setPagos(pagos.map((pago) => (pago.id === selectedPago.id ? response.data : pago)));
          } else {
            setPagos([...pagos, response.data]);
          }
          Swal.fire({
            icon: 'success',
            title: 'Pago registrado',
            text: 'El pago se ha registrado exitosamente.',
          });
        } else {
          console.error('Error al registrar el pago en el servidor.');
        }
      } else {
        // Guardar en IndexedDB con flag `synced: false`
        await savePagos(nuevoPago);
        Swal.fire({
          icon: 'info',
          title: 'Modo offline',
          text: 'El pago se guardó localmente y se sincronizará cuando haya conexión.',
        });
      }
  
      // Reset estado después de guardar
      setShowModal(false);
      setFechaHora('');
      setUsuarioId(0);
      setMonto('');
      setSelectedCargas([]);
      setEditMode(false);
    } catch (error) {
      console.error('Error al registrar el pago de carga de agua:', error);
    }
  };
  
  

  const renderModalContent = () => {
    if (selectedPago && !editMode) {
      return (
        <ModalBody>
          <FormGroup className="mb-3">
            <FormLabel>Fecha y Hora:</FormLabel>
            <FormControl
              type="text"
              value={new Date(selectedPago.fechaHora).toLocaleString()}
              readOnly
              plaintext
            />
          </FormGroup>
          <FormGroup className="mb-3">
            <FormLabel>Monto:</FormLabel>
            <FormControl type="text" value={selectedPago.monto} readOnly plaintext />
          </FormGroup>
          <FormGroup className="mb-3">
            <FormLabel>Usuario:</FormLabel>
            <FormControl type="text" value={usuarios.find(usuario => usuario.id === selectedPago.usuarioId)?.username || 'N/A'} readOnly plaintext />
          </FormGroup>
          <FormGroup className="mb-3">
            <FormLabel>Cargas:</FormLabel>
            <FormControl type="text" value={selectedPago.cargaAguaIds.join(', ')} readOnly plaintext />
          </FormGroup>
        </ModalBody>
      );
    } else {
      return (
        <ModalBody>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <FormGroup className="mb-3" controlId="formFechaHora">
              <FormLabel>Fecha y Hora:</FormLabel>
              <FormControl
                type="datetime-local"
                value={fechaHora}
                onChange={(e) => setFechaHora(e.target.value)}
                required
              />
              <FormControl.Feedback type="invalid">
                Por favor, ingresa la fecha y hora.
              </FormControl.Feedback>
            </FormGroup>
            <FormGroup className="mb-3" controlId="formUsuario">
              <FormLabel>Usuario:</FormLabel>
              <FormControl
                as="select"
                value={usuarioId}
                onChange={handleUsuarioChange}
                required
              >
                <option value="">Selecciona un usuario</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.username}
                  </option>
                ))}
              </FormControl>
              <FormControl.Feedback type="invalid">
                Por favor, selecciona un usuario.
              </FormControl.Feedback>
            </FormGroup>
            <FormGroup className="mb-3" controlId="formCargas">
              <FormLabel>Cargas de Agua con Deuda:</FormLabel>
              <FormControl
                as="select"
                multiple
                value={selectedCargas}
                onChange={handleCargasChange}
                required
              >
                {cargasDeuda.map((carga) => (
                  <option key={carga.id} value={carga.id}>
                    {`Carga #${carga.id} - Estado: ${carga.estado} -    Usuario: ${carga.usuario.nombre} `}
                  </option>
                ))}
              </FormControl>
              <FormControl.Feedback type="invalid">
                Por favor, selecciona al menos una carga de agua con deuda.
              </FormControl.Feedback>
            </FormGroup>
            <FormGroup className="mb-3" controlId="formMonto">
              <FormLabel>Monto:</FormLabel>
              <FormControl
                type="number"
                step="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                required
              />
              <FormControl.Feedback type="invalid">
                Por favor, ingresa el monto.
              </FormControl.Feedback>
            </FormGroup>
            <Button variant="primary" type="submit">
              {editMode ? 'Guardar Cambios' : 'Registrar Pago'}
            </Button>
          </Form>
        </ModalBody>
      );
    }
  };

  const renderHeaders = () => (
    <thead>
      <tr>
        <th>ID</th>
        <th>Usuario</th>
        <th>Monto</th>
        <th>Fecha</th>
        <th>Acciones</th>
      </tr>
    </thead>
  );

  const renderRows = () => (
    <tbody>
      {pagos.map((pago) => (
        <tr key={pago.id}>
          <td>{pago.id}</td>
          <td>{usuarios.find(usuario => usuario.id === pago.usuarioId)?.username || 'N/A'}</td>
          <td>{pago.monto}</td>
          <td>{new Date(pago.fechaHora).toLocaleString()}</td>
          <td>
            <Button variant="info" onClick={() => handleVerPago(pago)}>
              Ver
            </Button>{' '}
            <Button variant="warning" onClick={() => handleEditPago(pago)}>
              Editar
            </Button>{' '}
            <Button variant="danger" onClick={() => handleDeletePago(pago.id)}>
              Eliminar
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  );

  const renderTable = () => (
    <Table responsive striped bordered hover className="pago-carga-agua-table">
      {renderHeaders()}
      {renderRows()}
    </Table>
  );
//s
  const renderCards = () => (
    <div className="card-container">
      {pagos.map((pago) => (
        <Card key={pago.id} className="mb-3 card-custom">
          <Card.Body>
            <div className="d-flex justify-content-between">
              <span><strong>ID:</strong></span>
              <span>{pago.id}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span><strong>Usuario:</strong></span>
              <span>{usuarios.find(usuario => usuario.id === pago.usuarioId)?.username || 'N/A'}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span><strong>Monto:</strong></span>
              <span>{pago.monto}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span><strong>Fecha:</strong></span>
              <span>{new Date(pago.fechaHora).toLocaleString()}</span>
            </div>
            <div className="d-flex justify-content-around mt-3">
              <Button variant="info" onClick={() => handleVerPago(pago)}>Ver</Button>
              <Button variant="warning" onClick={() => handleEditPago(pago)}>Editar</Button>
              <Button variant="danger" onClick={() => handleDeletePago(pago.id)}>Eliminar</Button>
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );

  return (
    <>
      <Navbar />
      <Container className="main-container">
        <h2 className="mt-4">Pagos de Carga de Agua</h2>
        {isMobile ? renderCards() : renderTable()}
        <Button variant="success" onClick={() => {
          setShowModal(true);
          setEditMode(false);
          setSelectedPago(null);
          setFechaHora('');
          setUsuarioId(0);
          setMonto('');
          setSelectedCargas([]);
        }}>
          Registrar Pago
        </Button>
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <ModalHeader closeButton>
            <ModalTitle>
              {editMode ? 'Editar Pago' : selectedPago ? 'Detalles del Pago' : 'Registrar Pago'}
            </ModalTitle>
          </ModalHeader>
          {renderModalContent()}
        </Modal>
      </Container>
    </>
  );
}
