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
  getConductores,
  saveConductores
  
} from '../../services/indexedDB';
export default function TableConductoresPropietario() {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const [usuarios, setUsuarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showCargasModal, setShowCargasModal] = useState(false);
  const [showPagosModal, setShowPagosModal] = useState(false);
  const [selectedConductor, setSelectedConductor] = useState(null);
  const [cargas, setCargas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const token = localStorage.getItem('token');
  const propietarioId = localStorage.getItem('idUser');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConductores = async () => {
      try {
        if (navigator.onLine) {
          // Obtener datos del servidor
          const response = await axios.get(`https://xvxsfhnjxj.execute-api.us-east-1.amazonaws.com/dev/conductores/${propietarioId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
  
          if (response.status === 200) {
            const conductores = response.data;
            setUsuarios(conductores);
  
            // Guardar en IndexedDB
            await Promise.all(
              conductores.map(async (conductor) => {
                try {
                  await saveConductores(conductor);
                } catch (error) {
                  console.error('Error al guardar en IndexedDB:', error);
                }
              })
            );
          }
        } else {
          // Recuperar datos desde IndexedDB
          const cachedConductores = await getConductores();
          console.log('Conductores cargados desde IndexedDB:', cachedConductores);
          setUsuarios(cachedConductores);
        }
      } catch (error) {
        console.error('Error al obtener los conductores del propietario:', error);
        if (error.response && error.response.status === 401) {
          navigate('/');
        }
      }
    };
  
    fetchConductores();
  }, [propietarioId, token, navigate]);

  const handleVerConductor = (conductor) => {
    setSelectedConductor(conductor);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleVerCargas = async (conductorId) => {
    try {
      const response = await axios.get(`https://xvxsfhnjxj.execute-api.us-east-1.amazonaws.com/dev/cargascliente/${conductorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCargas(response.data);
      setShowCargasModal(true);
    } catch (error) {
      console.error('Error al obtener las cargas del usuario:', error);
    }
  };

  const handleCloseCargasModal = () => {
    setShowCargasModal(false);
    setCargas([]);
  };

  const handleVerPagos = async (conductorId) => {
    try {
      const response = await axios.get(`https://xvxsfhnjxj.execute-api.us-east-1.amazonaws.com/dev/pagoscliente/${conductorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setPagos(response.data);
      setShowPagosModal(true);
    } catch (error) {
      console.error('Error al obtener los pagos del usuario:', error);
    }
  };

  const handleClosePagosModal = () => {
    setShowPagosModal(false);
    setPagos([]);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const renderHeaders = () => (
    <thead>
      <tr>
        <th>Nombre</th>
        <th>CI</th>
        <th>Ver</th>
        <th>Cargas Realizadas</th>
        <th>Pagos Realizados</th>
      </tr>
    </thead>
  );

  const renderRows = () => (
    <tbody>
      {usuarios.map((conductor, index) => (
        <tr key={index}>
          <td data-label="Nombre">{conductor.nombre}</td>
          <td data-label="CI">{conductor.ci}</td>
          <td data-label="Ver">
            <button className="btn btn-success" onClick={() => handleVerConductor(conductor)}>
              <i className="fa-solid fa-eye"></i>
            </button>
          </td>
          <td data-label="Cargas Realizadas">
            <button className="btn btn-info" onClick={() => handleVerCargas(conductor.id)}>
              <i className="fa-solid fa-truck"></i>
            </button>
          </td>
          <td data-label="Pagos Realizados">
            <button className="btn btn-primary" onClick={() => handleVerPagos(conductor.id)}>
              <i className="fa-solid fa-dollar-sign"></i>
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  );

  const renderCargasModalData = () => (
    <ModalBody>
      {cargas.length === 0 ? (
        <p>No hay cargas realizadas por este usuario.</p>
      ) : (
        <Table responsive striped bordered hover variant="dark">
          <thead>
            <tr>
              <th>Fecha y Hora</th>
              <th>Estado</th>
              <th>Nombre</th>
            </tr>
          </thead>
          <tbody>
            {cargas.map((carga, index) => (
              <tr key={index}>
                <td>{formatDate(carga.fechaHora)}</td>
                <td>{carga.estado}</td>
                <td>{carga.usuario.nombre}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </ModalBody>
  );

  const renderPagosModalData = () => (
    <ModalBody>
      {pagos.length === 0 ? (
        <p>No hay pagos realizados por este usuario.</p>
      ) : (
        <Table responsive striped bordered hover variant="dark">
          <thead>
            <tr>
              <th>Fecha y Hora</th>
              <th>Monto</th>
              <th>Nombre</th>
            </tr>
          </thead>
          <tbody>
            {pagos.map((pago, index) => (
              <tr key={index}>
                <td>{formatDate(pago.fechaHora)}</td>
                <td>{pago.monto}</td>
                <td>{pago.usuario.nombre}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </ModalBody>
  );

  const renderTable = () => (
    <Table responsive striped bordered hover variant="dark">
      {renderHeaders()}
      {renderRows()}
    </Table>
  );

  const renderCards = () => (
    <div>
      {usuarios.map((conductor, index) => (
        <Card key={index} className="mb-3 card-custom">
          <Card.Body>
            <div className="d-flex justify-content-between">
              <span><strong>Nombre:</strong></span>
              <span>{conductor.nombre}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span><strong>Ci:</strong></span>
              <span>{conductor.ci}</span>
            </div>
           
            <div className="d-flex justify-content-around mt-3">
              <Button variant="success" onClick={() => handleVerConductor(conductor)}>Ver</Button>
              <Button variant="info" onClick={() => handleVerCargas(conductor.id)}>Cargas Realizadas</Button>
              <Button variant="primary" onClick={() => handleVerPagos(conductor.id)}>Pagos Realizados</Button>
            </div>
          </Card.Body>
        </Card>
      ))}
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
            {selectedConductor ? 'Detalles del Conductor' : ''}
          </ModalTitle>
        </ModalHeader>
        <ModalBody>
          {selectedConductor ? (
            <>
              <FormGroup className="mb-3">
                <FormLabel>Nombre</FormLabel>
                <FormControl
                  type="text"
                  value={selectedConductor.nombre}
                  readOnly
                  plaintext
                />
              </FormGroup>
              <FormGroup className="mb-3">
                <FormLabel>CI</FormLabel>
                <FormControl
                  type="text"
                  value={selectedConductor.ci}
                  readOnly
                  plaintext
                />
              </FormGroup>
              <FormGroup className="mb-3">
                <FormLabel>Username</FormLabel>
                <FormControl
                  type="text"
                  value={selectedConductor.username}
                  readOnly
                  plaintext
                />
              </FormGroup>
              
            </>
          ) : null}
        </ModalBody>
      </Modal>
      <Modal show={showCargasModal} onHide={handleCloseCargasModal}>
        <ModalHeader closeButton>
          <ModalTitle style={{ color: "red" }}>
            Cargas Realizadas
          </ModalTitle>
        </ModalHeader>
        {renderCargasModalData()}
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCargasModal}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showPagosModal} onHide={handleClosePagosModal}>
        <ModalHeader closeButton>
          <ModalTitle style={{ color: "red" }}>
            Pagos Realizados
          </ModalTitle>
        </ModalHeader>
        {renderPagosModalData()}
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePagosModal}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
//sss