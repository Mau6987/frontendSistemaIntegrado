import React, { useEffect, useState } from 'react';
import { Form, FormLabel, Modal, ModalBody, ModalHeader, ModalTitle, Table, FormGroup, FormControl, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import axios from 'axios';
import '../css/TableCargasAguaCliente.css'; // Reutiliza el CSS existente

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
  saveCargasAguaPropietario,
  getCargasAguaPropietario
  
} from '../../services/indexedDB';

export default function TableCargasPropietario() {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const token = localStorage.getItem('token');
  const propietarioId = localStorage.getItem('idUser'); // Asegúrate de que esto sea correcto
  const navigate = useNavigate();
  const URL = `https://xvxsfhnjxj.execute-api.us-east-1.amazonaws.com/dev/cargasPropietario/${propietarioId}`;
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!URL || !token) {
          console.error('URL o token no están definidos.');
          return;
        }
  
        if (navigator.onLine) {
          try {
            const response = await fetch(URL, {
              headers: { Authorization: `Bearer ${token}` },
            });
  
            if (!response.ok) {
              if (response.status === 401) {
                navigate('/');
              } else {
                throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
              }
            }
  
            const jsonData = await response.json();
            setData(jsonData);
  
            // Guardar en IndexedDB
            await Promise.all(
              jsonData.map(async (registro) => {
                if (registro.id) await saveCargasAguaPropietario(registro);
              })
            );
          } catch (error) {
            console.error('Error al obtener los datos del servidor:', error);
          }
        }
  
        // Obtener datos desde IndexedDB
        const cachedData = await getCargasAguaPropietario();
        if (cachedData && cachedData.length > 0) {
          setData(cachedData);
          console.log('Datos cargados desde IndexedDB.');
        } else {
          console.warn('No hay datos disponibles en IndexedDB.');
        }
      } catch (error) {
        console.error('Error general en fetchData:', error);
      }
    };
  
    fetchData();
  }, [URL, token, navigate]);
  

  const handleVerRegistro = (registro) => {
    setSelectedRegistro(registro);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const renderHeaders = () => (
    <thead>
      <tr>
        <th>Fecha y Hora</th>
        <th>Estado</th>
        <th>Nombre de Usuario</th>
        <th>Ver Registro</th>
      </tr>
    </thead>
  );

  const renderRows = () => (
    <tbody>
      {data.map((item, index) => (
        <tr key={index}>
          <td data-label="Fecha y Hora">{formatDate(item.fechaHora)}</td>
          <td data-label="Estado">{item.estado}</td>
          <td data-label="Nombre de Usuario">{item.usuario?.nombre}</td>
         
          <td data-label="Ver Registro">
            <button className="btn btn-success" onClick={() => handleVerRegistro(item)}>
              <i className="fa-solid fa-eye"></i>
            </button>
          </td>
          
        </tr>
      ))}
    </tbody>
  );

  const renderModalData = () => {
    if (selectedRegistro) {
      return (
        <ModalBody>
          <FormGroup className="mb-3">
            <FormLabel style={{ color: "red" }}>Fecha/Hora</FormLabel>
            <FormControl
              type="text"
              value={new Date(selectedRegistro.fechaHora).toLocaleString()}
              readOnly
              plaintext
            />
          </FormGroup>
          <FormGroup className="mb-3">
            <FormLabel style={{ color: "red" }}>Estado</FormLabel>
            <FormControl type="text" value={selectedRegistro.estado} readOnly plaintext />
          </FormGroup>
          
          <FormGroup className="mb-3">
            <FormLabel style={{ color: "red" }}>Nombre de Usuario</FormLabel>
            <FormControl type="text" value={selectedRegistro.usuario?.nombre} readOnly plaintext />
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
                <span>{item.usuario?.nombre}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span><strong>Tipo de Camión:</strong></span>
                <span>{item.tiposDeCamion?.descripcion}</span>
              </div>
              <div className="d-flex justify-content-around mt-3">
                <Button variant="success" onClick={() => handleVerRegistro(item)}>Ver</Button>
                <Button variant="info" onClick={() => navigate('/cargasrealizadas')}>Cargas Realizadas</Button>
              </div>
              
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
///sss
  return (
    <>
      <div className="main-container">
        <Navbar />
        <div className="tabla-div">
          {isMobile ? renderCards() : renderTable()}
        </div>
      </div>
      <Modal show={showModal} onHide={handleCloseModal}>
        <ModalHeader closeButton>
          <ModalTitle style={{ color: "red" }}>
            {selectedRegistro ? 'Detalles del registro' : ''}
          </ModalTitle>
        </ModalHeader>
        {renderModalData()}
      </Modal>
    </>
  );
}
