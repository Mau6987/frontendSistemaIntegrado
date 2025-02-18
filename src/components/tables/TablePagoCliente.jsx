import React, { useEffect, useState } from 'react';
import { Form, FormLabel, Modal, ModalBody, ModalHeader, ModalTitle, Table, FormGroup, FormControl, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import axios from 'axios';
import '../css/TableCargasAguaCliente.css';
import { savePagoCliente,  getPagoCliente } from '../../services/indexedDB'; // Importa funciones de IndexedDB

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

export default function TablePagoCliente() {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState(null);

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
        }
      } catch (error) {
        console.error('Error al obtener datos:', error);
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

  const renderHeaders = () => {
    return (
      <thead>
        <tr>
          <th>Fecha y Hora</th>
          <th>Monto</th>
          <th>Nombre de Usuario</th>
          <th>Ver Registro</th>
        </tr>
      </thead>
    );
  };

  const renderRows = () => {
    return (
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            <td data-label="Fecha y Hora">{formatDate(item.fechaHora)}</td>
            <td data-label="Monto">{item.monto}</td>
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
          <FormGroup className="mb-3" controlId="formField_monto">
            <FormLabel style={{ color: "red" }}>Monto</FormLabel>
            <FormControl type="text" value={selectedRegistro.monto} readOnly plaintext />
          </FormGroup>
          <FormGroup className="mb-3" controlId="formField_usuario">
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
                <span><strong>Monto:</strong></span>
                <span>{item.monto}</span>
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
//sss
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
