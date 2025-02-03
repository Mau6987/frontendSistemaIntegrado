import React, { useEffect, useState } from 'react';
import { Card, Container, Row, Col, Button, FormGroup, FormLabel } from 'react-bootstrap';
import Select from 'react-select';
import Navbar from '../Navbar';

const URL = 'https://mi-backendsecond.onrender.com/';

const TableConsultaUsuario = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [usuarioDetalles, setUsuarioDetalles] = useState(null);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const users = await (await fetch(`${URL}usuarios`)).json();
      setUsuarios(users);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  const handleUsuarioChange = async (selectedOption) => {
    setSelectedUsuario(selectedOption?.value || null);
    if (!selectedOption) return;

    try {
      const user = usuarios.find((u) => u.id === selectedOption.value);
      setUsuarioDetalles(user);

      if (user.rol === 'propietario') {
        const conductoresData = await (await fetch(`${URL}conductores/${user.id}`)).json();
        setConductores(conductoresData);
      } else {
        setConductores([]);
      }
      setShowForm(false);
    } catch (error) {
      console.error("Error al obtener detalles del usuario:", error);
    }
  };

  return (
    <Container className="mt-5">
      <Navbar />
      {showForm ? (
        <Card className="p-5 shadow-lg rounded mt-5 text-center" style={{ maxWidth: '600px', margin: 'auto' }}>
          <h3 className="mb-4">Seleccionar Usuario</h3>
          <FormGroup>
            <FormLabel>Usuario</FormLabel>
            <Select options={usuarios.map((user) => ({ value: user.id, label: user.nombre }))} onChange={handleUsuarioChange} />
          </FormGroup>
        </Card>
      ) : (
        <>
          {/* Card del usuario seleccionado */}
          <Row className="justify-content-center">
            <Col md={8}>
              <Card className="p-4 shadow-lg rounded mb-4" style={{ backgroundColor: "#f8f9fa" }}>
                <Card.Body>
                  <Card.Title className="text-center mb-3" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {usuarioDetalles.nombre}
                  </Card.Title>
                  <Card.Text><strong>Username:</strong> {usuarioDetalles.username}</Card.Text>
                  <Card.Text><strong>Correo:</strong> {usuarioDetalles.correo}</Card.Text>
                  <Card.Text><strong>Rol:</strong> {usuarioDetalles.rol}</Card.Text>
                  <Card.Text><strong>CI:</strong> {usuarioDetalles.ci}</Card.Text>
                  <Card.Text><strong>Tarjeta RFID:</strong> {usuarioDetalles.numeroTarjetaRFID}</Card.Text>
                  {usuarioDetalles.propietarioId && <Card.Text><strong>Propietario ID:</strong> {usuarioDetalles.propietarioId}</Card.Text>}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Cards de conductores asociados */}
          {conductores.length > 0 && (
            <>
              <h4 className="mt-4 text-center">Conductores Asociados</h4>
              <Row className="justify-content-center">
                {conductores.map((conductor) => (
                  <Col md={8} key={conductor.id}>
                    <Card className="p-4 shadow-lg rounded mb-3" style={{ backgroundColor: "#ffffff", borderLeft: "5px solid #007bff" }}>
                      <Card.Body>
                        <Card.Title className="text-center" style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
                          {conductor.nombre}
                        </Card.Title>
                        <Card.Text><strong>Username:</strong> {conductor.username}</Card.Text>
                        <Card.Text><strong>Correo:</strong> {conductor.correo}</Card.Text>
                        <Card.Text><strong>CI:</strong> {conductor.ci}</Card.Text>
                        <Card.Text><strong>Tarjeta RFID:</strong> {conductor.numeroTarjetaRFID}</Card.Text>
                        {conductor.propietarioId && <Card.Text><strong>Propietario ID:</strong> {conductor.propietarioId}</Card.Text>}
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </>
          )}

          {/* Botón para realizar una nueva consulta */}
          <div className="text-center">
            <Button onClick={() => setShowForm(true)} className="mt-4 px-4 py-2" variant="dark" style={{ fontSize: '1rem', fontWeight: 'bold' }}>
              Nueva Consulta
            </Button>
          </div>
        </>
      )}
    </Container>
  );
};

export default TableConsultaUsuario;
