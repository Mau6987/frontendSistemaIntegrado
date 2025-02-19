import React, { useEffect, useState } from 'react';
import { Form, FormLabel, Modal, ModalBody, ModalHeader, ModalTitle, Table, FormGroup, FormControl, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import axios from 'axios';
import '../css/TableCargasAguaCliente.css';

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
import { 
  saveCargaAguaCliente,
  saveTipoCamion,
  getCargasAguaCliente,
  saveUsuario,
  getUsuarios,
  getTiposDeCamion
  
} from '../../services/indexedDB';

export default function TableCargasAguaCliente() {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const [fechaHora, setFechaHora] = useState("");
  const [estado, setEstado] = useState("deuda");
  const [showFilter, setShowFilter] = useState(false);

  const [tiposCamion, setTiposCamion] = useState([]);
  const [tipoCamionId, setTipoCamionId] = useState(0);
  const [usuarioId, setUsuarioId] = useState(0);
  const [usuarios, setUsuarios] = useState([]);

  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [validated, setValidated] = useState(false);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const URL = `https://xvxsfhnjxj.execute-api.us-east-1.amazonaws.com/dev/cargascliente/${localStorage.getItem('idUser')}`;
  const [filteredData, setFilteredData] = useState([]); // Datos filtrados
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // Cantidad de elementos por página
  
  // Filtros
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedStatus, setSelectedStatus] = useState([]); // Permitir múltiples estados
  const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };
  const applyFilters = () => {
    let filtered = data;
  
    if (selectedStatus.length > 0) {
      filtered = filtered.filter((registro) => selectedStatus.includes(registro.estado));
    }
  
    filtered = filtered.filter((registro) => {
      const fecha = new Date(registro.fechaHora);
      return fecha.getFullYear() === selectedYear && fecha.getMonth() + 1 === selectedMonth;
    });
  
    setFilteredData(filtered);
    setCurrentPage(1); // Reiniciar a la primera página tras aplicar filtros
  };
  
  useEffect(() => {
    const getTiposCamion = async () => {
              try {
                if (navigator.onLine) {
                  const response = await fetch('https://xvxsfhnjxj.execute-api.us-east-1.amazonaws.com/dev/tiposDeCamion', {
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                  });
                  if (response.ok) {
                    const data = await response.json();
                    setTiposCamion(data);
                    // Guardar en IndexedDB
                    await Promise.all(data.map((tipoCamion) => saveTipoCamion(tipoCamion)));
                  } else {
                    console.error('Error al obtener los tipos de camión del servidor.');
                  }
                } else {
                  // Obtener datos desde IndexedDB
                  const cachedTiposCamion = await getTiposDeCamion();
                  setTiposCamion(cachedTiposCamion);
                }
              } catch (error) {
                console.error('Error al obtener tipos de camión:', error);
              }
            };

    const fetchUsuarios = async () => {
            try {
              if (navigator.onLine) {
                const response = await fetch('https://xvxsfhnjxj.execute-api.us-east-1.amazonaws.com/dev/usuariosrol', {
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                });
                if (response.ok) {
                  const data = await response.json();
                  setUsuarios(data);
                  // Guardar en IndexedDB
                  await Promise.all(data.map((usuario) => saveUsuario(usuario)));
                } else {
                  console.error('Error al obtener usuarios del servidor.');
                }
              } else {
                // Obtener datos desde IndexedDB
                const cachedUsuarios = await getUsuarios();
                setUsuarios(cachedUsuarios);
              }
            } catch (error) {
              console.error('Error al obtener usuarios:', error);
            }
          };

    fetchData();
    fetchUsuarios();
    getTiposCamion();
    applyFilters();
  }, [selectedYear, selectedMonth, selectedStatus]);

  const handleVerRegistro = (registro) => {
    setSelectedRegistro(registro);
    setShowModal(true);
    setEditMode(false);
    setNewRegistro({});
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const fetchData = async () => {
    try {
      if (navigator.onLine) {
        const response = await fetch(URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.ok) {
          const jsonData = await response.json();
          setData(jsonData);
          setFilteredData(jsonData); // Guardar datos filtrados inicialmente
  
          // Guardar en IndexedDB para uso offline
          await Promise.all(
            jsonData.map(async (registro) => {
              try {
                await saveCargaAguaCliente(registro);
              } catch (error) {
                console.error('Error al guardar en IndexedDB:', error);
              }
            })
          );
        } else if (response.status === 401) {
          navigate('/');
        }
      } else {
        // Modo Offline: Obtener datos desde IndexedDB
        const cachedData = await getCargasAguaCliente();
        console.log('Datos cargados desde IndexedDB:', cachedData);
        setData(cachedData);
        setFilteredData(cachedData);
      }
    } catch (error) {
      console.error('Error al obtener datos:', error);
    }
  };
  
  const renderHeaders = () => {
    return (
      <thead>
        <tr>
          <th>Fecha y Hora</th>
          <th>Estado</th>
          <th>Nombre de Usuario</th>
          <th>Ver Registro</th>
        </tr>
      </thead>
    );
  };

  const renderRows = () => (
    <tbody>
      {currentItems.map((item, index) => (
        <tr key={index}>
          <td>{formatDate(item.fechaHora)}</td>
          <td>{item.estado}</td>
          <td>{item.usuario?.nombre}</td>
          <td>
            <Button variant="success" onClick={() => handleVerRegistro(item)}>
              Ver
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  );
  const renderPagination = () => {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
    return (
      <div className="pagination-div">
        <Button variant="secondary" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
          Anterior
        </Button>
        <span className="mx-2">Página {currentPage} de {totalPages}</span>
        <Button variant="secondary" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
          Siguiente
        </Button>
      </div>
    );
  };
  

  const renderModalData = () => {
    if (selectedRegistro) {
      return (
        <ModalBody>
            <FormGroup className="mb-3" controlId="formField_fechaHora">
            <FormLabel style={{ color: "red" }}>Fecha/Hora</FormLabel>
            <FormControl
              type="text"
              value={new Date(selectedRegistro.fechaHora).toLocaleString()}
              readOnly
              plaintext
            />
          </FormGroup>

            <FormGroup className="mb-3" controlId="formField_estado">
              <FormLabel style={{ color: "red" }}>Estado</FormLabel>
              <FormControl type="text" value={selectedRegistro.estado} readOnly plaintext />
            </FormGroup>
            <FormGroup className="mb-3" controlId="formField_estado">
              <FormLabel style={{ color: "red" }}>Tipo de camion</FormLabel>
              <FormControl type="text" value={selectedRegistro.tiposDeCamion.descripcion} readOnly plaintext />
            </FormGroup>
            <FormGroup className="mb-3" controlId="formField_estado">
              <FormLabel style={{ color: "red" }}>Nombre de usuario</FormLabel>
              <FormControl type="text" value={selectedRegistro.usuario.nombre} readOnly plaintext />
            </FormGroup>
          </ModalBody>
      );
    }
  };

  const renderTable = () => (
    <Table responsive striped bordered hover variant="dark">
      {renderHeaders()}
      {renderRows()}
    </Table>
  );

  const renderCards = () => (
    <div>
      {data.map((item, index) => {
        const formattedDate = formatDate(item.fechaHora);
        return (
          <Card key={index} className="mb-3 card-custom">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <span><strong>Fecha y Hora:</strong></span>
                <span>{formattedDate}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span><strong>Estado:</strong></span>
                <span>{item.estado}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span><strong>Nombre de Usuario:</strong></span>
                <span>{item.usuario.nombre}</span>
              </div>
              <div className="d-flex justify-content-around mt-3">
                <Button variant="success" onClick={() => handleVerRegistro(item)}>Ver</Button>
              </div>
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
  return (
    <>
      <Navbar />
      <div className="main-container">
        
        {/* 🔹 Tabla de Datos */}
        <div className="tabla-div">
          {renderTable()}
        </div>
  
        {/* 🔹 Paginación Debajo de la Tabla */}
        <div className="pagination-container">
          {renderPagination()}
        </div>
  
        {/* 🔹 Botón para Abrir el Filtro en un Modal */}
        <div className="filter-button-container">
          <Button variant="primary" onClick={() => setShowFilter(true)}>
            Mostrar Filtros
          </Button>
        </div>
  
        {/* 🔹 Modal para Filtros */}
        <Modal show={showFilter} onHide={() => setShowFilter(false)} centered>
          <ModalHeader closeButton>
            <ModalTitle>Filtrar Registros</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <FormGroup>
              <FormLabel>Filtrar por Año:</FormLabel>
              <FormControl type="number" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} />
            </FormGroup>
  
            <FormGroup className="mt-3">
              <FormLabel>Filtrar por Mes:</FormLabel>
              <FormControl as="select" value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>{new Date(2021, month - 1).toLocaleString('es-ES', { month: 'long' })}</option>
                ))}
              </FormControl>
            </FormGroup>
  
            <FormGroup className="mt-3">
              <FormLabel>Filtrar por Estado:</FormLabel>
              <Form.Check type="checkbox" label="Deuda" value="deuda" onChange={(e) => {
                const value = e.target.value;
                setSelectedStatus(prev => prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]);
              }} />
              <Form.Check type="checkbox" label="Pagado" value="pagado" onChange={(e) => {
                const value = e.target.value;
                setSelectedStatus(prev => prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]);
              }} />
            </FormGroup>
          </ModalBody>
          <Modal.Footer>
            <Button variant="success" onClick={applyFilters}>Aplicar Filtros</Button>
            <Button variant="danger" onClick={() => setShowFilter(false)}>Cerrar</Button>
          </Modal.Footer>
        </Modal>
  
      </div>
  
      {/* 🔹 Modal de Detalles */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <ModalHeader closeButton>
          <ModalTitle>Detalles del Registro</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p><strong>Fecha:</strong> {selectedRegistro?.fechaHora}</p>
          <p><strong>Estado:</strong> {selectedRegistro?.estado}</p>
          <p><strong>Usuario:</strong> {selectedRegistro?.usuario?.nombre}</p>
        </ModalBody>
      </Modal>
    </>
  );
  
}
