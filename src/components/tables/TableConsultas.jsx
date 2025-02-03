import React, { useEffect, useState } from 'react';
import { Form, Table, Button, Card, FormGroup, FormLabel, FormControl, Container, Row, Col, Pagination } from 'react-bootstrap';
import Select from 'react-select';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Navbar from '../Navbar';

const URL = 'https://mi-backendsecond.onrender.com/';

const TableConsultas = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [selectedConductores, setSelectedConductores] = useState([]);
  const [usuarioEsPropietario, setUsuarioEsPropietario] = useState(false);
  const [diaInicio, setDiaInicio] = useState(1);
  const [diaFin, setDiaFin] = useState(31);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [estado, setEstado] = useState("ambos");
  const [includeCargas, setIncludeCargas] = useState(false);
  const [includePagos, setIncludePagos] = useState(false);
  const [cargas, setCargas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const recordsPerPage = 6;
  const [currentPageCargas, setCurrentPageCargas] = useState(1);
  const [currentPagePagos, setCurrentPagePagos] = useState(1);

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
    setConductores([]);
    setSelectedConductores([]);
    setUsuarioEsPropietario(false);

    if (!selectedOption) return;

    const user = usuarios.find((u) => u.id === selectedOption.value);
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
    const usuarioIds = selectedConductores.length ? selectedConductores.map(c => c.value) : [selectedUsuario];
    let dataCargas = [], dataPagos = [];
  
    if (includeCargas) {
      let response = await fetch(`${URL}cargagua?usuarios=${usuarioIds.join(',')}&diaInicio=${diaInicio}&diaFin=${diaFin}&mes=${selectedMonth}&anio=${selectedYear}`);
      dataCargas = await response.json();
  
      // Filtrar solo por estado seleccionado (si no es "ambos")
      if (estado !== "ambos") {
        dataCargas = dataCargas.filter(carga => carga.estado === estado);
      }
    }
  
    if (includePagos) {
      let response = await fetch(`${URL}pagoscargagua?usuarios=${usuarioIds.join(',')}&diaInicio=${diaInicio}&diaFin=${diaFin}&mes=${selectedMonth}&anio=${selectedYear}`);
      dataPagos = await response.json();
    }
  
    setCargas(dataCargas);
    setPagos(dataPagos);
  };
  
  const formatDate = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()} ${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`;
  };
  
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Reporte de Consultas', 10, 10);
    if (cargas.length > 0) {
      doc.autoTable({ head: [['ID', 'Fecha', 'Estado']], body: cargas.map(c => [c.id, c.fechaHora, c.estado]) });
    }
    if (pagos.length > 0) {
      doc.autoTable({ head: [['ID', 'Fecha']], body: pagos.map(p => [p.id, p.fechaHora]) });
    }
    doc.save(`reporte_consultas_${new Date().toISOString().split('T')[0]}.pdf`);
  };
  const handleNuevaConsulta = () => {
    setShowForm(true);
    setCargas([]);
    setPagos([]);
    setCurrentPageCargas(1); // Reiniciar la paginación de cargas
    setCurrentPagePagos(1); // Reiniciar la paginación de pagos
  };
  
  return (
    <Container className="mt-5">
      <Navbar />
      {showForm ? (
        <Card className="p-5 shadow-lg rounded mt-5" style={{ maxWidth: '900px', margin: 'auto' }}>
          <h3 className="text-center">Consulta de Cargas y Pagos</h3>
          <FormGroup>
            <FormLabel>Seleccionar Usuario</FormLabel>
            <Select options={usuarios.map((user) => ({ value: user.id, label: user.nombre }))} onChange={handleUsuarioChange} />
          </FormGroup>
  
          {usuarioEsPropietario && conductores.length > 0 && (
            <FormGroup>
              <FormLabel>Seleccionar Conductores Asociados</FormLabel>
              <Select options={conductores.map(c => ({ value: c.id, label: c.nombre }))} isMulti onChange={setSelectedConductores} />
            </FormGroup>
          )}
  
          <FormGroup>
            <Form.Check type="checkbox" label="Cargas de Agua" checked={includeCargas} onChange={() => setIncludeCargas(!includeCargas)} />
            <Form.Check type="checkbox" label="Pagos de Cargas de Agua" checked={includePagos} onChange={() => setIncludePagos(!includePagos)} />
          </FormGroup>
  
          {includeCargas && (
            <FormGroup>
              <FormLabel>Estado de Carga</FormLabel>
              <FormControl as="select" value={estado} onChange={(e) => setEstado(e.target.value)}>
                <option value="ambos">Ambos</option>
                <option value="deuda">Deuda</option>
                <option value="pagado">Pagado</option>
              </FormControl>
            </FormGroup>
          )}
  
          <FormGroup>
            <FormLabel>Rango de Fechas</FormLabel>
            <Row>
              <Col><FormControl type="number" min="1" max="31" value={diaInicio} onChange={(e) => setDiaInicio(e.target.value)} placeholder="Día inicio" /></Col>
              <Col><FormControl type="number" min="1" max="31" value={diaFin} onChange={(e) => setDiaFin(e.target.value)} placeholder="Día fin" /></Col>
              <Col><FormControl type="number" min="1" max="12" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} placeholder="Mes" /></Col>
              <Col><FormControl type="number" min="2000" max={new Date().getFullYear()} value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} placeholder="Año" /></Col>
            </Row>
          </FormGroup>
  
          <Button onClick={fetchData} variant="primary">Consultar</Button>
        </Card>
      ) : (
        <>
          <h4 className="mt-4">Resultados</h4>
  
          {/* Tabla de Cargas */}
{cargas.length > 0 && (
  <>
    <h4 className="mt-4">Cargas de Agua</h4>
    <Table striped bordered hover className="mt-3">
      <thead>
        <tr><th>ID</th><th>Fecha</th><th>Estado</th></tr>
      </thead>
      <tbody>
        {cargas.slice((currentPageCargas - 1) * recordsPerPage, currentPageCargas * recordsPerPage).map((carga) => (
          <tr key={carga.id}><td>{carga.id}</td><td>{formatDate(carga.fechaHora)}</td><td>{carga.estado}</td></tr>
        ))}
      </tbody>
    </Table>
    <Pagination className="justify-content-center">
      {[...Array(Math.ceil(cargas.length / recordsPerPage))].map((_, i) => (
        <Pagination.Item key={i} active={i + 1 === currentPageCargas} onClick={() => setCurrentPageCargas(i + 1)}>{i + 1}</Pagination.Item>
      ))}
    </Pagination>
  </>
)}

{/* Tabla de Pagos */}
{pagos.length > 0 && (
  <>
    <h4 className="mt-4">Pagos de Cargas de Agua</h4>
    <Table striped bordered hover className="mt-3">
      <thead>
        <tr><th>ID</th><th>Fecha</th></tr>
      </thead>
      <tbody>
        {pagos.slice((currentPagePagos - 1) * recordsPerPage, currentPagePagos * recordsPerPage).map((pago) => (
          <tr key={pago.id}><td>{pago.id}</td><td>{formatDate(pago.fechaHora)}</td></tr>
        ))}
      </tbody>
    </Table>
    <Pagination className="justify-content-center">
      {[...Array(Math.ceil(pagos.length / recordsPerPage))].map((_, i) => (
        <Pagination.Item key={i} active={i + 1 === currentPagePagos} onClick={() => setCurrentPagePagos(i + 1)}>{i + 1}</Pagination.Item>
      ))}
    </Pagination>
  </>
)}
  
          <Button onClick={exportToPDF} className="mt-3 me-2" variant="success">Exportar PDF</Button>
          <Button onClick={() => setShowForm(true)} className="mt-3" variant="secondary">Nueva Consulta</Button>
        </>
      )}
    </Container>
  );
  
};

export default TableConsultas;
