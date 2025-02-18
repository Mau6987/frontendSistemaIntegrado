import React, { useEffect, useState } from 'react';
import { Form, Modal, ModalBody, FormLabel ,ModalHeader, ModalTitle, Table, FormGroup, FormControl, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import Select from 'react-select';
import '../css/TableCargasAgua.css';


// Importaciones de IndexedDB
import { 
  saveTipoCamion, 
  getTiposDeCamion, 
  saveUsuario, 
  getUsuarios,
  saveCargaAgua, 
  getCargasAgua, 
  deleteCargaAgua,
  syncCargasAgua
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

export default function TableCargasAgua() {
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
  const [newRegistro, setNewRegistro] = useState({});
  const [validated, setValidated] = useState(false);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const URL = 'https://mi-backendsecond.onrender.com/cargagua';
  useEffect(() => {
    const role = localStorage.getItem('rol');
    if (role !== 'admin') {
      navigate('/');
    } else {
      const  fetchTiposCamion = async () => {
        try {
          if (navigator.onLine) {
            const response = await fetch('https://mi-backendsecond.onrender.com/tiposDeCamion', {
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
            const response = await fetch('https://mi-backendsecond.onrender.com/usuariosrol', {
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
      fetchTiposCamion();
    }
  }, []);
  

  const handleInputChange = (key, value) => {
    if (editMode) {
      setSelectedRegistro((prevRegistro) => ({
        ...prevRegistro,
        [key]: value,
      }));
    } else {
      setNewRegistro((prevRegistro) => ({
        ...prevRegistro,
        [key]: value,
      }));
    }
  };

  const handleVerRegistro = async (registro) => {
    try {
      const response = await fetch(`https://xvxsfhnjxj.execute-api.us-east-1.amazonaws.com/dev/cargagua/${registro.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedRegistro(data);
        setShowModal(true);
        setEditMode(false);
      } else {
        console.error('No se pudo obtener la información de la carga de agua');
        alert('Error al obtener la información de la carga de agua');
      }
    } catch (error) {
      console.error('Error al realizar la solicitud GET:', error);
    }
  };
  //ss
  const handleCloseModal = () => {
    setShowModal(false);
  };
  const handleShow = (registro) => {
    setSelectedRegistro(registro);
    setShow(true);
  };
  const handleEditRegistro = (registro) => {
    const editRegistro = { ...registro };
    setSelectedRegistro(editRegistro);
    setShowModal(true);
    setEditMode(true);
    setNewRegistro({});
  };
  const handleCreateRegistro = () => {        
    setSelectedRegistro(null);
    setShowModal(true);
    setEditMode(false);
  };const handleGuardarCreateRegistro = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
  
    if (form.checkValidity() && estado !== "") {
      const nuevoRegistro = {
        id: navigator.onLine ? undefined : `offline-${Date.now()}`, // Generar ID temporal si está offline
        fechaHora: fechaHora,
        estado: estado,
        usuarioId: usuarioId,
        tipoCamionId: tipoCamionId,
      };
  
      try {
        if (navigator.onLine) {
          const response = await fetch(URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(nuevoRegistro),
          });
  
          if (response.ok) {
            setShowModal(false);
            fetchData();
            alert('Registro creado con éxito.');
          } else {
            console.error('Error al guardar en el servidor.');
          }
        } else {
          // Guardar en IndexedDB con ID temporal
          await saveCargaAgua(nuevoRegistro);
          setShowModal(false);
          alert('Modo offline: El registro se guardó localmente y se sincronizará cuando haya conexión.');
        }
      } catch (error) {
        console.error('Error al guardar el registro:', error);
      }
    } else {
      setValidated(true);
    }
  };
  const handleSaveEditRegistro = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
  
    if (form.checkValidity()) {
      try {
        if (navigator.onLine) {
          // Si hay conexión, actualizar directamente en el servidor
          const response = await fetch(`${URL}/${selectedRegistro.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(selectedRegistro),
          });
  
          if (response.ok) {
            setShowModal(false);
            fetchData(); // Refrescar los datos desde el servidor
            alert('Registro actualizado con éxito.');
          } else {
            console.error('Error al actualizar en el servidor.');
          }
        } else {
          // Guardar en IndexedDB y marcar como "pendiente de sincronización"
          await saveCargaAgua({ ...selectedRegistro, updatePending: true });
          setShowModal(false);
          alert('Modo offline: Los cambios se guardaron localmente y se sincronizarán cuando haya conexión.');
        }
      } catch (error) {
        console.error('Error al guardar los cambios:', error);
      }
    } else {
      setValidated(true);
    }
  };
  const handleEliminarRegistro = async (registroId) => {
    try {
      if (navigator.onLine) {
        // Si hay conexión, eliminar directamente en el servidor
        const response = await fetch(`${URL}/${registroId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.ok) {
          fetchData(); // Refrescar los datos desde el servidor
          setShow(false);
          alert('Registro eliminado con éxito.');
        } else {
          console.error('Error al eliminar el registro en el servidor.');
        }
      } else {
        // Marcar el registro como "pendiente de eliminación"
        await saveCargaAgua({ id: registroId, deletePending: true });
        setShow(false);
        alert('Modo offline: El registro se eliminará cuando haya conexión.');
      }
    } catch (error) {
      console.error('Error al eliminar el registro:', error);
    }
  };
  
  const customSelectStyles = {
    control: (base) => ({
      ...base,
      color: 'black', // Color del texto en el control
      backgroundColor: 'white', // Color de fondo del control
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'black', // Color del texto seleccionado
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999, // Asegúrate de que el menú se muestre correctamente
    }),
  };
  const renderModalData = () => {
    if (selectedRegistro && !editMode) {
      // Modo solo lectura
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
          <FormGroup className="mb-3" controlId="formField_tipoCamion">
            <FormLabel style={{ color: "red" }}>Tipo de Camión</FormLabel>
            <FormControl type="text" value={selectedRegistro.tiposDeCamion.descripcion} readOnly plaintext />
          </FormGroup>
          <FormGroup className="mb-3" controlId="formField_usuario">
            <FormLabel style={{ color: "red" }}>Nombre de Usuario</FormLabel>
            <FormControl type="text" value={selectedRegistro.usuario.nombre} readOnly plaintext />
          </FormGroup>
        </ModalBody>
      );
    } else if (selectedRegistro && editMode) {
      // Modo edición
      //sss
      return (
        <ModalBody>
          <Form noValidate validated={validated} onSubmit={handleSaveEditRegistro}>
            <FormGroup className="mb-3" controlId="formField_fechaHora">
              <FormLabel style={{ color: "red" }}>Fecha y Hora</FormLabel>
              <FormControl
                type="datetime-local"
                value={selectedRegistro.fechaHora ? new Date(selectedRegistro.fechaHora).toISOString().substring(0, 16) : ''}
                onChange={(e) => handleInputChange('fechaHora', e.target.value)}
                required
              />
              <FormControl.Feedback type="invalid">Este campo es requerido.</FormControl.Feedback>
            </FormGroup>
            <FormGroup className="mb-3" controlId="formField_estado">
              <FormLabel style={{ color: "red" }}>Estado</FormLabel>
              <FormControl
                as="select"
                value="deuda"
                disabled
              >
                <option value="deuda">deuda</option>
              </FormControl>
            </FormGroup>
            <FormGroup className="mb-3" controlId="formField_usuario">
              <FormLabel style={{ color: "red" }}>Usuario</FormLabel>
              <Select
                options={usuarios.map((usuario) => ({ value: usuario.id, label: usuario.nombre }))}
                value={usuarios.find((usuario) => usuario.id === selectedRegistro.usuarioId)}
                onChange={(value) => handleInputChange('usuarioId', value.value)}
                required
                styles={customSelectStyles}
              />
              <FormControl.Feedback type="invalid">Este campo es requerido.</FormControl.Feedback>
            </FormGroup>
            <FormGroup className="mb-3" controlId="formField_tipoCamion">
              <FormLabel style={{ color: "red" }}>Tipo de Camión</FormLabel>
              <FormControl
                as="select"
                value={selectedRegistro.tipoCamionId}
                onChange={(e) => handleInputChange('tipoCamionId', e.target.value)}
                required
              >
                <option value="">Seleccione un tipo de camión</option>
                {tiposCamion.map((tipoCamion) => (
                  <option key={tipoCamion.id} value={tipoCamion.id}>
                    {tipoCamion.descripcion}
                  </option>
                ))}
              </FormControl>
              <FormControl.Feedback type="invalid">Este campo es requerido.</FormControl.Feedback>
            </FormGroup>
            <Button variant="success" type="submit">Guardar</Button>
            <Button onClick={handleCloseModal}>Cancelar</Button>
          </Form>
        </ModalBody>
      );
    } else if (!editMode) {
      // Modo creación
      return (
        <ModalBody>
          <Form noValidate validated={validated} onSubmit={handleGuardarCreateRegistro}>
            <FormGroup className="mb-3" controlId="formField_fechaHora">
              <FormLabel style={{ color: "red" }}>Fecha y Hora</FormLabel>
              <FormControl
                type="datetime-local"
                value={fechaHora}
                onChange={(e) => setFechaHora(e.target.value)}
                required
              />
              <FormControl.Feedback type="invalid">Este campo es requerido.</FormControl.Feedback>
            </FormGroup>
            <FormGroup className="mb-3" controlId="formField_estado">
              <FormLabel style={{ color: "red" }}>Estado</FormLabel>
              <FormControl
                as="select"
                value="deuda"
                disabled
              >
                <option value="deuda">deuda</option>
              </FormControl>
            </FormGroup>
            <FormGroup className="mb-3" controlId="formField_usuario">
              <FormLabel style={{ color: "red" }}>Usuario</FormLabel>
              <Select
                options={usuarios.map((usuario) => ({ value: usuario.id, label: usuario.username }))}
                value={usuarios.find((usuario) => usuario.id === usuarioId) || null}
                onChange={(value) => setUsuarioId(value.value)}
                required
                styles={customSelectStyles}
              />
              <FormControl.Feedback type="invalid">Este campo es requerido.</FormControl.Feedback>
            </FormGroup>
            <FormGroup className="mb-3" controlId="formField_tipoCamion">
              <FormLabel style={{ color: "red" }}>Tipo de Camión</FormLabel>
              <FormControl
                as="select"
                value={tipoCamionId}
                onChange={(e) => setTipoCamionId(e.target.value)}
                required
              >
                <option value="">Seleccione un tipo de camión</option>
                {tiposCamion.map((tipoCamion) => (
                  <option key={tipoCamion.id} value={tipoCamion.id}>
                    {tipoCamion.descripcion}
                  </option>
                ))}
              </FormControl>
              <FormControl.Feedback type="invalid">Este campo es requerido.</FormControl.Feedback>
            </FormGroup>
            <Button variant="success" type="submit">Guardar</Button>
            <Button onClick={handleCloseModal}>Cancelar</Button>
          </Form>
        </ModalBody>
      );
    }
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
          // Guardar datos en IndexedDB para uso offline
          await Promise.all(jsonData.map((registro) => saveCargaAgua(registro)));
        } else if (response.status === 401) {
          navigate('/');
        } else {
          console.error('Error al obtener los datos del servidor.');
        }
      } else {
        // Obtener datos desde IndexedDB
        const cachedData = await getCargasAgua();
        setData(cachedData);
      }
    } catch (error) {
      console.error('Error al obtener datos:', error);
    }
  };
  const renderHeaders = () => (
    <thead>
      <tr>
        <th>Fecha y Hora</th>
        <th>Estado</th>
        <th>Nombre de Usuario</th>
        <th>Ver Registro</th>
        <th>Editar</th>
        <th>Eliminar</th>
      </tr>
    </thead>
  );
  const renderRows = () => (
    <tbody>
      {data.map((item, index) => (
        <tr key={index}>
          <td>{new Date(item.fechaHora).toLocaleString('es-ES')}</td>
          <td>{item.estado}</td>
          <td>{item.usuario.username}</td>
          <td>
            <Button className="btn btn-success" onClick={() => handleVerRegistro(item)}>
              Ver
            </Button>
          </td>
          <td>
            <Button className="btn btn-warning" onClick={() => handleEditRegistro(item)}>
              Editar
            </Button>
          </td>
          <td>
            <Button className="btn btn-danger" onClick={() => handleShow(item)}>
              Eliminar
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  );

  const renderTable = () => (
    <Table responsive striped bordered hover variant="dark">
      {renderHeaders()}
      {renderRows()}
    </Table>
  );

  const renderCards = () => (
    <div>
      {data.map((item, index) => (
        <Card key={index} className="mb-3">
          <Card.Body>
            <div className="d-flex justify-content-between">
              <strong>Fecha y Hora:</strong>
              <span>{new Date(item.fechaHora).toLocaleString('es-ES')}</span>
            </div>
            <div className="d-flex justify-content-between">
              <strong>Estado:</strong>
              <span>{item.estado}</span>
            </div>
            <div className="d-flex justify-content-between">
              <strong>Nombre de Usuario:</strong>
              <span>{item.usuario.username}</span>
            </div>
            <div className="d-flex justify-content-around mt-3">
              <Button onClick={() => handleVerRegistro(item)}>Ver</Button>
              <Button variant="warning" onClick={() => handleEditRegistro(item)}>Editar</Button>
              <Button variant="danger" onClick={() => handleShow(item)}>Eliminar</Button>
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="main-container">
        <div className="tabla-div">
          {isMobile ? renderCards() : renderTable()}
        </div>
        <div className="btn-crear-div">
          <Button className="btn btn-success" onClick={handleCreateRegistro}>
            Crear Registro
          </Button>
        </div>
      </div>
      <Modal show={showModal} onHide={handleCloseModal}>
        
        {renderModalData()}
      </Modal>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmación</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Está seguro de que desea eliminar este registro?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cerrar
          </Button>
          <Button variant="danger" onClick={() => handleEliminarRegistro(selectedRegistro.id)}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
