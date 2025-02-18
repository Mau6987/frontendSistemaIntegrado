import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from './components/Login'
import Home from './components/Home'
import TableUsuarios from './components/tables/TableUsuarios'
import TableUsuarios2 from './components/tables/TableUsuarios2'
import TableCargaAgua from './components/tables/TableCargaAgua'
import TableCargaAgua2 from './components/tables/TableCargaAgua2'
import TableTipoDeCamion from './components/tables/TableTipoDeCamion'
import ClienteHome from './components/ClienteHome';
import TableEditarPerfil from './components/tables/TablaEditarPerfil';
import TableCargasAguaCliente from './components/tables/TableCargaAguaCliente';
import TableConductoresPropietario from './components/tables/TableConductores';
import TableCargasPropietario  from './components/tables/TableCargasPropietario'
import  PagoCargaAgua from './components/tables/TablePagosCargaAgua'
import PagoCargaAgua2 from './components/tables/TablePagosCargaAgua2'
import TablePagoCliente from './components/tables/TablePagoCliente'
import TablePagoPropietario from './components/tables/TablePagoPropietario'
import TableConsultas from './components/tables/TableConsultas'
import TableConsultaUsuario from './components/tables/TableConsultaUsuario'

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<Login/>} />                          
        <Route path='/Home'element={<Home/>}/>
        <Route path='/ClienteHome'element={<ClienteHome/>}/>
        <Route path='/HomePro'element={<ClienteHome/>}/>

        <Route path='/conductores'element={<TableConductoresPropietario/>}/>
        <Route path='/cargasconductores'element={<TableCargasPropietario/>}/>
        <Route path='/consultas'element={<TableConsultas/>}/>
        <Route path='/consultaUsuario'element={<TableConsultaUsuario/>}/>
        
        <Route path= '/pagos' element={<PagoCargaAgua/>}></Route>
        <Route path= '/pagos2' element={<PagoCargaAgua2/>}></Route>
        <Route path= '/usuarios' element={<TableUsuarios/>}></Route>
        <Route path= '/usuarios2' element={<TableUsuarios2/>}></Route>
        <Route path= '/cargagua' element={<TableCargaAgua/>}></Route>
        <Route path= '/cargagua2' element={<TableCargaAgua2/>}></Route>
        <Route path= '/tiposDeCamion' element={<TableTipoDeCamion/>}></Route>
        <Route path= '/editarperfil' element={<TableEditarPerfil/>}></Route>

        <Route path= '/cargaguaCliente' element={<TableCargasAguaCliente/>}></Route>
        <Route path= '/pagosCliente' element={< TablePagoCliente/>}></Route>
        <Route path= '/pagosConductores' element={<TablePagoPropietario/>}></Route>
      </Routes>
    </BrowserRouter>
    
  )
}
export default AppRoutes