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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
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
  }, []);

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
  
          // Guardar en IndexedDB
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
        } else {
          console.error('Error al obtener los datos del servidor.');
        }
      } else {
        const cachedData = await getCargasAguaCliente();
        console.log('Datos cargados desde IndexedDB:', cachedData);
        setData(cachedData);
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

  const renderRows = () => {
    return (
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
