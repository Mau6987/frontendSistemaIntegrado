import React, { useEffect, useState } from 'react';
import { Form, Modal, ModalBody, FormLabel ,ModalHeader, ModalTitle, Table, FormGroup, FormControl, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import Select from 'react-select';
import '../css/TableCargasAgua.css';


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


export default function TableCargasAgua2() {

  const getDaysInMonth = (month, year) => {
    if (month === 2) {
        // Si el mes es febrero, verificamos si es un año bisiesto
        return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
    }
    // Meses con 30 días
    if ([4, 6, 9, 11].includes(month)) return 30;
    // Meses con 31 días
    return 31;
  };
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const [fechaHora, setFechaHora] = useState("");
  const [estado, setEstado] = useState("deuda");
  const [showMonthFilter, setShowMonthFilter] = useState(false);
const [showStatusFilter, setShowStatusFilter] = useState(false);
const [availableMonths, setAvailableMonths] = useState([]);
const today = new Date();
const [selectedDay, setSelectedDay] = useState(today.getDate());
const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
const [selectedYear, setSelectedYear] = useState(today.getFullYear());
const [diaInicio, setDiaInicio] = useState(1);
const [diaFin, setDiaFin] = useState(31);


const getMonthName = (month) => { 
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return monthNames[month - 1]; // Los meses van de 0 a 11 en JS
  };
  

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
  const URL = 'https://xvxsfhnjxj.execute-api.us-east-1.amazonaws.com/dev/cargagua';


  const [selectedStatus, setSelectedStatus] = useState([]); // ✅ Permitir múltiples filtros de estado
  const [dateRange, setDateRange] = useState({ fechaInicio: '', fechaFin: '' }); // ✅ Rango de fechas

  const [itemsPerPage] = useState(6);
const [showFilterMenu, setShowFilterMenu] = useState(false); // Para mostrar el filtro

const [currentPage, setCurrentPage] = useState(1); // Página actual
const [cargasPerPage] = useState(6); // Cantidad de cargas por página

// 🔹 Índices para la paginación
const indexOfLastCarga = currentPage * cargasPerPage; 
const indexOfFirstCarga = indexOfLastCarga - cargasPerPage; 
const currentCargas = data.slice(indexOfFirstCarga, indexOfLastCarga); // Filtrar cargas de la página actual
const totalPages = Math.ceil(data.length / cargasPerPage); // Número total de páginas

// 🔹 Funciones para cambiar de página
const nextPage = () => {
  if (currentPage < totalPages) {
    setCurrentPage(currentPage + 1);
  }
};

const prevPage = () => {
  if (currentPage > 1) {
    setCurrentPage(currentPage - 1);
  }
};
useEffect(() => {
  const role = localStorage.getItem('rol');
  if (role !== 'admin') {
      navigate('/');
  } else {
      const fetchTiposCamion = async () => {
          try {
              const response = await fetch('https://xvxsfhnjxj.execute-api.us-east-1.amazonaws.com/dev/tiposDeCamion', {
                  headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                  },
              });
              if (response.ok) {
                  const data = await response.json();
                  setTiposCamion(data);
              } else {
                  console.error('Error al obtener los tipos de camión del servidor.');
              }
          } catch (error) {
              console.error('Error al obtener tipos de camión:', error);
          }
      };

      const fetchUsuarios = async () => {
          try {
              const response = await fetch('https://xvxsfhnjxj.execute-api.us-east-1.amazonaws.com/dev/usuariosrol', {
                  headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                  },
              });
              if (response.ok) {
                  const data = await response.json();
                  setUsuarios(data);
              } else {
                  console.error('Error al obtener usuarios del servidor.');
              }
          } catch (error) {
              console.error('Error al obtener usuarios:', error);
          }
      };

      const months = Array.from({ length: 12 }, (_, i) => i + 1); // Genera 1 a 12
      setAvailableMonths(months);

      fetchData();
      fetchUsuarios();
      fetchTiposCamion();
  }
}, [diaInicio, diaFin, selectedMonth, selectedYear, selectedStatus]);

const handleMonthChange = (event) => {
  setSelectedMonth(parseInt(event.target.value));
};

  
  // 📌 Función para cambiar el estado seleccionado
  const handleStatusFilterChange = (event) => {
    const value = event.target.value;
    setSelectedStatus((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };
  
  

  const handleDateChange = (event) => {
    setDateRange((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };
 


  
    const applyMonthFilter = () => {
        fetchData(selectedMonth, selectedStatus);
        setShowMonthFilter(false);
    };
    
    const applyStatusFilter = () => {
        fetchData(selectedMonth, selectedStatus);
        setShowStatusFilter(false);
    };
  
    const renderFilterButton = () => (
        <div className="btn-filtro-container">
          <Button 
            onClick={() => setShowFilterMenu(!showFilterMenu)} 
            className="btn-filtro"
          >
            🔍 Filtros
          </Button>
        </div>
      );
      
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
  };
  
  const handleGuardarCreateRegistro = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() && estado !== "" && usuarioId) {
        const nuevoRegistro = {
            fechaHora,
            estado,
            usuarioId,
            tipoCamionId
        };

        try {
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
                alert('No se pudo guardar el registro.');
            }
        } catch (error) {
            console.error('Error al guardar el registro:', error);
            alert('Error de conexión. Inténtalo nuevamente.');
        }
    } else {
        alert("Error: Selecciona un usuario antes de guardar.");
        setValidated(true);
    }
};

const handleSaveEditRegistro = async (e) => {
  e.preventDefault();
  const form = e.currentTarget;

  if (form.checkValidity()) {
      try {
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
              fetchData();
              alert('Registro actualizado con éxito.');
          } else {
              console.error('Error al actualizar en el servidor.');
              alert('No se pudo actualizar el registro.');
          }
      } catch (error) {
          console.error('Error al guardar los cambios:', error);
          alert('Error de conexión. Inténtalo nuevamente.');
      }
  } else {
      setValidated(true);
  }
};

const handleEliminarRegistro = async (registroId) => {
  try {
      const response = await fetch(`${URL}/${registroId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
          fetchData();
          setShow(false);
          alert('Registro eliminado con éxito.');
      } else {
          console.error('Error al eliminar el registro en el servidor.');
          alert('No se pudo eliminar el registro.');
      }
  } catch (error) {
      console.error('Error al eliminar el registro:', error);
      alert('Error de conexión. Inténtalo nuevamente.');
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
        const response = await fetch(URL, {
            headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.ok) {
            let jsonData = await response.json();
            jsonData.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));
  
            if (selectedStatus.length > 0) {
                jsonData = jsonData.filter((registro) => selectedStatus.includes(registro.estado));
            }
  
            jsonData = jsonData.filter((registro) => {
                const registroFecha = new Date(registro.fechaHora);
                return (
                    registroFecha.getDate() >= diaInicio &&
                    registroFecha.getDate() <= diaFin &&
                    registroFecha.getMonth() + 1 === selectedMonth &&
                    registroFecha.getFullYear() === selectedYear
                );
            });
  
            setData(jsonData);
            setCurrentPage(1);
        } else if (response.status === 401) {
            navigate('/');
        }
    } catch (error) {
        console.error('Error al obtener datos:', error);
    }
  };
  




// 📌 Función para cambiar el mes seleccionado

  // 📌 Función para aplicar filtros
  const applyFilters = () => {
    fetchData();
    setShowFilterMenu(false);
  };
  // Función para cambiar de página
const paginate = (pageNumber) => setCurrentPage(pageNumber);

// Obtener los registros actuales para la página
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

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
  const renderRows = () => {
    const paginatedData = currentItems; // Se usa la paginación correctamente
  
    return (
      <tbody>
        {paginatedData.map((item, index) => (
          <tr key={index}>
            <td>{new Date(item.fechaHora).toLocaleString('es-ES')}</td>
            <td>{item.estado}</td>
            <td>{item.usuario?.username || 'Sin usuario'}</td>
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
  };
  
  const renderPagination = () => (
    <div className="pagination-div">
      <Button
        variant="secondary"
        onClick={prevPage}
        disabled={currentPage === 1}
      >
        Anterior
      </Button>
  
      <span className="mx-2">Página {currentPage} de {totalPages}</span>
  
      <Button
        variant="secondary"
        onClick={nextPage}
        disabled={currentPage === totalPages}
      >
        Siguiente
      </Button>
    </div>
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
       
        {/* 🔹 Card de Filtros (Centrado en Pantalla) */}
        {showFilterMenu && (
          <div className="filter-card">
            <Card className="p-3 shadow-lg rounded bg-light">
              <Card.Body>
                <Card.Title className="text-center"><strong>Filtrar Registros</strong></Card.Title>
                
            {/* 🔹 Filtro por Año */}
              <FormGroup className="mt-3">
                <FormLabel>Filtrar por Año:</FormLabel>
                <FormControl 
                  type="number" 
                  min="2000" 
                  max="2100" 
                  value={selectedYear} 
                  onChange={(e) => {
                    const newYear = parseInt(e.target.value);
                    setSelectedYear(newYear);
                    
                  }}
                />
              </FormGroup>

              {/* 🔹 Filtro por Mes */}
              <FormGroup className="mt-3">
                <FormLabel>Filtrar por Mes:</FormLabel>
                <FormControl as="select" value={selectedMonth} onChange={(e) => {
                    const newMonth = parseInt(e.target.value);
                    setSelectedMonth(newMonth);
                    // Ajustar los días según el nuevo mes
                  }}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>{getMonthName(month)}</option>
                  ))}
                </FormControl>
              </FormGroup>

              {/* 🔹 Filtro por Rango de Días */}
              <FormGroup className="mt-3">
                <FormLabel>Desde el día:</FormLabel>
                <FormControl 
                  as="select" 
                  value={diaInicio} 
                  onChange={(e) => setDiaInicio(parseInt(e.target.value))}
                >
                  {Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </FormControl>
              </FormGroup>

              <FormGroup className="mt-3">
                <FormLabel>Hasta el día:</FormLabel>
                <FormControl 
                  as="select" 
                  value={diaFin} 
                  onChange={(e) => setDiaFin(parseInt(e.target.value))}
                >
                  {Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </FormControl>
              </FormGroup>



                {/* 🔹 Filtro por Estado */}
                <FormGroup className="mt-3">
                  <FormLabel>Filtrar por Estado:</FormLabel>
                  <Form.Check type="checkbox" label="Deuda" value="deuda" onChange={handleStatusFilterChange} checked={selectedStatus.includes("deuda")} />
                  <Form.Check type="checkbox" label="Pagado" value="pagado" onChange={handleStatusFilterChange} checked={selectedStatus.includes("pagado")} />
                </FormGroup>

                {/* 🔹 Botones para aplicar o cancelar filtros */}
                <div className="filter-buttons">
                  <Button variant="success" onClick={applyFilters} className="me-2">Aplicar Filtros</Button>
                  <Button variant="danger" onClick={() => setShowFilterMenu(false)}>Cancelar</Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        )}

        {/* 🔹 Tabla de Registros */}
        <div className="tabla-div">
          {isMobile ? renderCards() : renderTable()}
        </div>

        {/* 🔹 Paginación */}
        <div className="pagination-div">
          {renderPagination()}
        </div>
        
        {/* 🔹 Contenedor de botones (Filtros + Crear Registro) */}
        <div className="btn-container">
          <Button variant="primary" onClick={() => setShowFilterMenu(!showFilterMenu)} className="btn-filtro">
            <i className="fa-solid fa-filter"></i> Filtros
          </Button>
          <Button className="btn btn-success" onClick={handleCreateRegistro}>
            Crear Registro
          </Button>
        </div>

        {/* 🔹 Modales */}
        <Modal show={showModal} onHide={handleCloseModal}>
          {renderModalData()}
        </Modal>

        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Confirmación</Modal.Title>
          </Modal.Header>
          <Modal.Body>¿Está seguro de que desea eliminar este registro?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Cerrar</Button>
            <Button variant="danger" onClick={() => handleEliminarRegistro(selectedRegistro.id)}>Eliminar</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
);

  //sdsdad
}
