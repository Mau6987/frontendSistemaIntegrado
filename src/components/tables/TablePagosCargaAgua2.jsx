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
import { Pagination } from 'react-bootstrap';

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
  const URL_BASE = 'https://mi-backendsecond.onrender.com';
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Máximo de registros por página
  


  useEffect(() => {
    const role = localStorage.getItem('rol');
    if (role !== 'admin') {
      navigate('/');
    } else {
      
  
      fetchUsuarios();
      fetchPagos();
      fetchCargasDeuda();
      setSelectedCargas([]);
    }
  }, [token]);
  const fetchUsuarios = async () => {
    try {
      if (navigator.onLine) {
        const response = await axios.get(`${URL_BASE}/usuariosrol`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          const usuariosData = response.data;
          setUsuarios(usuariosData);
          await Promise.all(usuariosData.map((usuario) => saveUsuario(usuario)));
        }
      } else {
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
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        const pagosData = response.data;
        setPagos(pagosData);
        await Promise.all(pagosData.map((pago) => savePagos(pago))); // Guardar en IndexedDB
      }
    } else {
      const cachedPagos = await getPagos(); // Obtener desde IndexedDB
      setPagos(cachedPagos);
      console.info('Modo offline: Datos obtenidos desde IndexedDB');
    }
  } catch (error) {
    console.error('Error al obtener los pagos:', error);
  }
};

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
  // Agregar ESTADOS para los filtros
const [filtroEstado, setFiltroEstado] = useState('');
const today = new Date(); // Fecha actual

const [showFilterModal, setShowFilterModal] = useState(false);
const [filtroMes, setFiltroMes] = useState(today.getMonth() + 1); // Mes actual (1-12)
const [filtroDia, setFiltroDia] = useState(today.getDate()); // Día actual (1-31)
// 1️⃣ Mover la función `filtrarPagos` arriba de donde se usa
const filtrarPagos = () => {
    return pagos.filter((pago) => {
      const fechaPago = new Date(pago.fechaHora);
  
      // Filtrar por año
      if (filtroAnio && fechaPago.getFullYear() !== parseInt(filtroAnio)) {
        return false;
      }
  
      // Filtrar por mes
      if (filtroMes && fechaPago.getMonth() + 1 !== parseInt(filtroMes)) {
        return false;
      }
  
      // Filtrar por día
      if (filtroDia && fechaPago.getDate() !== parseInt(filtroDia)) {
        return false;
      }
  
      return true;
    });
  };
  




  
  // 🔹 Ahora puedes aplicar los filtros en la paginación

    const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
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

  

const [filtroAnio, setFiltroAnio] = useState(today.getFullYear()); // Año actual

  const pagosFiltrados = filtrarPagos();
  const totalPages = Math.ceil(pagosFiltrados.length / itemsPerPage);
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentPagos = pagosFiltrados.slice(indexOfFirstItem, indexOfLastItem);
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
  {currentPagos.map((pago) => (
    <tr key={pago.id}>
      <td>{pago.id}</td>
      <td>{usuarios.find(usuario => usuario.id === pago.usuarioId)?.username || 'N/A'}</td>
      <td>{pago.monto}</td>
      <td>{new Date(pago.fechaHora).toLocaleString()}</td>
      <td>
        <Button variant="info">Ver</Button>{' '}
        <Button variant="warning">Editar</Button>{' '}
        <Button variant="danger">Eliminar</Button>
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
  
        {/* BOTÓN DE FILTROS Y REGISTRO */}
        <div className="d-flex justify-content-between mb-3">
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
  
          <Button variant="info" onClick={() => setShowFilterModal(true)}>
            Filtrar Pagos
          </Button>
        </div>
  
        {/* TABLA O TARJETAS (VERSIÓN MÓVIL) */}
        {isMobile ? renderCards() : renderTable()}
  
        {/* PAGINACIÓN */}
        {totalPages > 1 && (
          <Pagination className="justify-content-center">
            <Pagination.Prev onClick={handlePreviousPage} disabled={currentPage === 1} />
            <span className="mx-3 align-self-center">
              Página {currentPage} de {totalPages}
            </span>
            <Pagination.Next onClick={handleNextPage} disabled={currentPage === totalPages} />
          </Pagination>
        )}
  
        {/* MODAL PARA REGISTRO Y EDICIÓN */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <ModalHeader closeButton>
            <ModalTitle>
              {editMode ? 'Editar Pago' : selectedPago ? 'Detalles del Pago' : 'Registrar Pago'}
            </ModalTitle>
          </ModalHeader>
          {renderModalContent()}
        </Modal>
  
        {/* MODAL PARA FILTROS */}
            <Modal show={showFilterModal} onHide={() => setShowFilterModal(false)}>
            <ModalHeader closeButton>
                <ModalTitle>Filtrar Pagos</ModalTitle>
            </ModalHeader>
            <ModalBody>
                <Form>
                {/* Filtrar por Año */}
                <FormGroup className="mb-2">
                    <FormLabel>Filtrar por Año:</FormLabel>
                    <FormControl
                    type="number"
                    min="2000"
                    max="2100"
                    value={filtroAnio}
                    onChange={(e) => setFiltroAnio(e.target.value)}
                    />
                </FormGroup>

                {/* Filtrar por Mes */}
                <FormGroup className="mb-2">
                    <FormLabel>Filtrar por Mes:</FormLabel>
                    <FormControl as="select" value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)}>
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                        {new Date(2025, i, 1).toLocaleString('es-ES', { month: 'long' })}
                        </option>
                    ))}
                    </FormControl>
                </FormGroup>

                {/* Filtrar por Día */}
                <FormGroup className="mb-2">
                    <FormLabel>Filtrar por Día:</FormLabel>
                    <FormControl
                    type="number"
                    min="1"
                    max="31"
                    value={filtroDia}
                    onChange={(e) => setFiltroDia(e.target.value)}
                    />
                </FormGroup>
                </Form>
            </ModalBody>
            <Modal.Footer>
                <Button variant="primary" onClick={() => { setCurrentPage(1); setShowFilterModal(false); }}>
                Aplicar Filtros
                </Button>
                <Button variant="secondary" onClick={() => { 
                setFiltroMes(today.getMonth() + 1); 
                setFiltroDia(today.getDate()); 
                setFiltroAnio(today.getFullYear()); 
                setCurrentPage(1); 
                setShowFilterModal(false); 
                }}>
                Restablecer Fecha Actual
                </Button>
            </Modal.Footer>
            </Modal>

      </Container>
    </>
  );
  
}
