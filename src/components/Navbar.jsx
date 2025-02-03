import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './NavbarStyles.css'; // Asegúrate de que esto venga después de Bootstrap para sobrescribir correctamente
import { Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from "react-router-dom";


export default function Navbar() {
  const navigate = useNavigate();
  const rol = localStorage.getItem('rol');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleTableSelect = (table) => {
    navigate(`/${table}`);
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    navigate('/');
  };
//sss
  return (
    <nav className='NavbarItems'>
      {rol === 'admin' && (
        <h1 className='logo' onClick={() => navigate('/Home')}>
          Los Pinos <i className="fa-solid fa-bucket icon-white"></i>
        </h1>
      )}
      {rol === 'propietario' && (
        <h1 className='logo' onClick={() => navigate('/HomePro')}>
          Los Pinos <i className="fa-solid fa-bucket icon-white"></i>
        </h1>
      )}
      {rol === 'conductor' && (
        <h1 className='logo' onClick={() => navigate('/ClienteHome')}>
          Los Pinos <i className="fa-solid fa-bucket icon-white"></i>
        </h1>
      )}

      <div className="menu-icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </div>
      <ul className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
        {rol === 'admin' && (
          <li className='nav-links'>
            <a href='/Home'>
              <i className='fa-solid fa-house-user'></i>Inicio
            </a>
          </li>
        )}
        {rol === 'propietario' && (
          <li className='nav-links'>
            <a href='/HomePro'>
              <i className='fa-solid fa-house-user'></i>Inicio
            </a>
          </li>
        )}
        {rol === 'conductor' && (
          <li className='nav-links'>
            <a href='/ClienteHome'>
              <i className='fa-solid fa-house-user'></i>Inicio
            </a>
          </li>
        )}
        {rol === 'admin' && (
          <li className='nav-links'>
            <Dropdown>
              <Dropdown.Toggle id='tables-dropdown'>
                <i className="fa-solid fa-pencil"></i>Menu
              </Dropdown.Toggle>
              <Dropdown.Menu variant='dark' className='tables-dropdown-menu'>
               
                <Dropdown.Item onClick={() => handleTableSelect('usuarios2')}>
                  Gestión de Usuarios2
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleTableSelect('tiposDeCamion')}>
                  Gestión Tipo de Camión
                </Dropdown.Item>
                
                <Dropdown.Item onClick={() => handleTableSelect('cargagua2')}>
                  Gestión de Carga de Agua2
                </Dropdown.Item>
                
                <Dropdown.Item onClick={() => handleTableSelect('pagos2')}>
                  Gestión de Pagos2
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleTableSelect('consultas')}>
                TableConsultas
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleTableSelect('consultaUsuario')}>
                 Buscar Usuario
                </Dropdown.Item>
                
              </Dropdown.Menu>
            </Dropdown>
          </li>
        )}
        {rol === 'propietario' && (
          <li className='nav-links'>
            <Dropdown>
              <Dropdown.Toggle id='tables-dropdown'>
                <i className="fa-solid fa-pencil"></i>Menu
              </Dropdown.Toggle>
              <Dropdown.Menu variant='dark' className='tables-dropdown-menu'>
                <Dropdown.Item onClick={() => handleTableSelect('editarperfil')}>
                  Editar Perfil
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleTableSelect('cargaguaCliente')}>
                  Cargas de Agua
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleTableSelect('pagosCliente')}>
                  Pagos realizados
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleTableSelect('conductores')}>
                  Conductores
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleTableSelect('cargasconductores')}>
                  Cargas realizadas tus conductores
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleTableSelect('pagosconductores')}>
                  Pagos realizados tus conductores
                </Dropdown.Item>
                
              </Dropdown.Menu>
            </Dropdown>
          </li>
        )}
        {rol === 'conductor' && (
          <li className='nav-links'>
            <Dropdown>
              <Dropdown.Toggle id='tables-dropdown'>
                <i className="fa-solid fa-pencil"></i>Menu
              </Dropdown.Toggle>
              <Dropdown.Menu variant='dark' className='tables-dropdown-menu'>
                <Dropdown.Item onClick={() => handleTableSelect('editarperfil')}>
                  Editar Perfil
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleTableSelect('cargaguaCliente')}>
                  Cargas de Agua
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleTableSelect('pagosCliente')}>
                  Pagos realizados
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </li>
        )}
        <li className='nav-links'>
          <a href='#' onClick={handleCerrarSesion}>
            <i className='fa-solid fa-right-to-bracket'></i>Cerrar Sesión
          </a>
        </li>
      </ul>
    </nav>
  );
}
