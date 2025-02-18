import React, { useEffect, useState } from 'react';
import { Form, Table, Button, Card, FormGroup, FormLabel, FormControl, Container } from 'react-bootstrap';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Navbar from '../Navbar';
import '../css/tableconsultas.css'; // Asegúrate de que la ruta sea correcta

const URL = 'https://xvxsfhnjxj.execute-api.us-east-1.amazonaws.com/dev/';

const animatedComponents = makeAnimated();

const TableConsultas = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [selectedUsuarioDetails, setSelectedUsuarioDetails] = useState({});
  const [selectedConductores, setSelectedConductores] = useState([]);
  const [usuarioEsPropietario, setUsuarioEsPropietario] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [selectedEstados, setSelectedEstados] = useState([]);
  const [includeCargas, setIncludeCargas] = useState(false);
  const [includePagos, setIncludePagos] = useState(false);
  const [cargas, setCargas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await fetch(`${URL}usuarios`);
      const users = await response.json();
      setUsuarios(users);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  const handleUsuarioChange = async (selectedOption) => {
    setSelectedUsuario(selectedOption?.value || null);
    setSelectedUsuarioDetails(selectedOption ? selectedOption : {});
    setConductores([]);
    setSelectedConductores([]);
    setUsuarioEsPropietario(false);

    if (!selectedOption) return;

    const user = usuarios.find(u => u.id === selectedOption.value);
    if (user?.rol === 'propietario') {
      setUsuarioEsPropietario(true);
      try {
        const conductoresData = await (await fetch(`${URL}conductores/${user.id}`)).json();
        setConductores(conductoresData);
      } catch (error) {
        console.error("Error al obtener conductores:", error);
      }
    }
  };

  const fetchData = async () => {
    setShowForm(false);
    const usuarioIds = selectedConductores.map(c => c.value);
    const estados = selectedEstados.map(e => e.value);
    const body = JSON.stringify({
      usuarioId: selectedUsuario,
      fechaInicio,
      fechaFin,
      estado: estados,
      conductoresIds: usuarioEsPropietario ? usuarioIds : undefined
    });

    let headers = { 'Content-Type': 'application/json' };

    if (includeCargas) {
      const responseCargas = await fetch(`${URL}consultacargas`, {
        method: 'POST',
        headers,
        body
      });
      const dataCargas = await responseCargas.json();
      setCargas(dataCargas);
    }

    if (includePagos) {
      const responsePagos = await fetch(`${URL}consultapagos`, {
        method: 'POST',
        headers,
        body
      });
      const dataPagos = await responsePagos.json();
      setPagos(dataPagos);
    }
  };

  const formatDate = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Reporte de Consultas', 10, 10);
    if (cargas.length > 0) {
      doc.autoTable({
        startY: 20,
        head: [['Nombre', 'Fecha', 'Estado']],
        body: cargas.map(c => [c.usuario.nombre, formatDate(c.fechaHora), c.estado])
      });
    }
    if (pagos.length > 0) {
      const startY = doc.lastAutoTable.finalY + 10; // Asegurar que la tabla de pagos comience debajo de la de cargas
      doc.autoTable({
        startY,
        head: [['Nombre', 'Fecha']],
        body: pagos.map(p => [p.usuario.nombre, formatDate(p.fechaHora)])
      });
    }
    doc.save(`reporte_consultas_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleNuevaConsulta = () => {
    setShowForm(true);
    setCargas([]);
    setPagos([]);
  };

  return (
    <Container className="mt-5">
      <Navbar />
      {showForm ? (
        <Card className="p-5 shadow-lg rounded mt-5" style={{ maxWidth: '900px', margin: 'auto' }}>
          <h3 className="text-center">Consulta de Cargas y Pagos</h3>
          <FormGroup>
            <FormLabel>Seleccionar Usuario</FormLabel>
            <Select
              options={usuarios.map((user) => ({ value: user.id, label: user.nombre }))}
              onChange={handleUsuarioChange}
              components={animatedComponents}
            />
          </FormGroup>

          {usuarioEsPropietario && conductores.length > 0 && (
            <FormGroup>
              <FormLabel>Seleccionar Conductores Asociados</FormLabel>
              <Select
                options={conductores.map(c => ({ value: c.id, label: c.nombre }))}
                isMulti
                onChange={setSelectedConductores}
                components={animatedComponents}
              />
            </FormGroup>
          )}

          <FormGroup>
            <Form.Check type="checkbox" label="Cargas de Agua" checked={includeCargas} onChange={() => setIncludeCargas(!includeCargas)} />
            <Form.Check type="checkbox" label="Pagos de Cargas de Agua" checked={includePagos} onChange={() => setIncludePagos(!includePagos)} />
          </FormGroup>

          <FormGroup>
            <FormLabel>Estado de Carga</FormLabel>
            <Select
              isMulti
              options={[
                { value: 'deuda', label: 'Deuda' },
                { value: 'pagado', label: 'Pagado' }
              ]}
              onChange={setSelectedEstados}
              components={animatedComponents}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>Fecha Inicio</FormLabel>
            <FormControl type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
          </FormGroup>

          <FormGroup>
            <FormLabel>Fecha Fin</FormLabel>
            <FormControl type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
          </FormGroup>

          <Button onClick={fetchData} variant="primary">Consultar</Button>
        </Card>
      ) : (
        <>
          <div className="text-center mt-4">
            <Button onClick={exportToPDF} className="me-2" variant="success">Exportar PDF</Button>
            <Button onClick={handleNuevaConsulta} variant="secondary">Nueva Consulta</Button>
          </div>

          {cargas.length > 0 && (
            <div>
              <h5 className="mt-4">Tabla de Cargas - {selectedUsuarioDetails.label}</h5>
              <Table striped bordered hover className="mt-3">
                <thead>
                  <tr>
                    <th>nombre</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {cargas.map(carga => (
                    <tr key={carga.id}>
                      <td>{carga?.usuario?.nombre}</td>
                      <td>{formatDate(carga.fechaHora)}</td>
                      <td>{carga.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
          {pagos.length > 0 && (
            <div>
              <h5 className="mt-4">Tabla de Pagos - {selectedUsuarioDetails.label}</h5>
              <Table striped bordered hover className="mt-3">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {pagos.map(pago => (
                    <tr key={pago.id}>
                      <td>{pago?.usuario?.nombre}</td>
                      <td>{formatDate(pago.fechaHora)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default TableConsultas;
