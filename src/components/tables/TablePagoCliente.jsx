import React, { useEffect, useState } from 'react';
import { Form, FormLabel, Modal, ModalBody, ModalHeader, ModalTitle, Table, FormGroup, FormControl, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import '../css/TableCargasAguaCliente.css'; // Reutiliza el CSS existente
import { savePagoCliente, getPagoCliente } from '../../services/indexedDB'; // Importa funciones de IndexedDB

export default function TablePagoCliente() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // Datos filtrados
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false); // Controla el modal de filtro
  const [selectedRegistro, setSelectedRegistro] = useState(null);

  // Estados para Filtros
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const URL = `https://xvxsfhnjxj.execute-api.us-east-1.amazonaws.com/dev/pagoscliente/${localStorage.getItem('idUser')}`;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (navigator.onLine) {
          // Obtener datos desde el servidor
          const response = await fetch(URL, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.status === 401) {
            navigate('/');
            return;
          }

          if (response.ok) {
            const jsonData = await response.json();
            setData(jsonData);
            setFilteredData(jsonData); // Guardar datos filtrados inicialmente

            // Guardar datos en IndexedDB
            await Promise.all(
              jsonData.map(async (registro) => {
                try {
                  await savePagoCliente(registro);
                } catch (error) {
                  console.error('Error al guardar en IndexedDB:', error);
                }
              })
            );
          } else {
            console.error('Error al obtener los datos del servidor.');
          }
        } else {
          // Obtener datos desde IndexedDB
          const cachedData = await getPagoCliente();
          console.log('Datos cargados desde IndexedDB:', cachedData);
          setData(cachedData);
          setFilteredData(cachedData);
        }
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };

    fetchData();
  }, [URL, token, navigate]);

  // Aplicar Filtros
  const applyFilters = () => {
    let filtered = data;

    if (fechaInicio && fechaFin) {
      filtered = filtered.filter((registro) => {
        const fechaRegistro = new Date(registro.fechaHora);
        return fechaRegistro >= new Date(fechaInicio) && fechaRegistro <= new Date(fechaFin);
      });
    }

    setFilteredData(filtered);
    setShowFilter(false); // Cierra el modal después de aplicar los filtros
  };

  const handleVerRegistro = (registro) => {
    setSelectedRegistro(registro);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const renderHeaders = () => (
    <thead>
      <tr>
        <th>Fecha y Hora</th>
        <th>Monto</th>
        <th>Nombre de Usuario</th>
        <th>Ver Registro</th>
      </tr>
    </thead>
  );

  const renderRows = () => (
    <tbody>
      {filteredData.map((item, index) => (
        <tr key={index}>
          <td>{formatDate(item.fechaHora)}</td>
          <td>{item.monto}</td>
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

  return (
    <>
      <Navbar />
      <div className="main-container">

        {/* 🔹 Tabla de Datos */}
        <div className="tabla-div">
          <Table responsive striped bordered hover variant="dark">
            {renderHeaders()}
            {renderRows()}
          </Table>
        </div>

        {/* 🔹 Botón para Mostrar el Modal de Filtros */}
        <div className="filter-button-container">
          <Button variant="primary" onClick={() => setShowFilter(true)}>
            Filtrar por Fecha
          </Button>
        </div>

      </div>

      {/* 🔹 Modal de Filtros */}
      <Modal show={showFilter} onHide={() => setShowFilter(false)} centered>
        <ModalHeader closeButton>
          <ModalTitle>Filtrar por Fecha</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <FormLabel>Fecha de Inicio:</FormLabel>
            <FormControl type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          </FormGroup>

          <FormGroup className="mt-3">
            <FormLabel>Fecha de Fin:</FormLabel>
            <FormControl type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
          </FormGroup>
        </ModalBody>
        <Modal.Footer>
          <Button variant="success" onClick={applyFilters}>Aplicar Filtros</Button>
          <Button variant="danger" onClick={() => setShowFilter(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      {/* 🔹 Modal de Detalles */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <ModalHeader closeButton>
          <ModalTitle>Detalles del Registro</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p><strong>Fecha:</strong> {selectedRegistro?.fechaHora}</p>
          <p><strong>Monto:</strong> {selectedRegistro?.monto}</p>
          <p><strong>Usuario:</strong> {selectedRegistro?.usuario?.nombre}</p>
        </ModalBody>
      </Modal>
    </>
  );
}
