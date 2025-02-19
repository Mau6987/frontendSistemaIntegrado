import { useEffect, useState } from "react";
import "./HomeStyles.css"
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

function HomePro() {
 

  useEffect(() =>{
    const token = localStorage.getItem('token');
    if(!token){
      navigate('/');
    }
    const role = localStorage.getItem('rol');
    if (role !== 'propietario') {
      navigate('/');
    }
  },[]);
//sss
  const refreshToken = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('https://xvxsfhnjxj.execute-api.us-east-1.amazonaws.com/dev/refreshToken', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
      });
  
      if (response.status === 200) {
        const data = await response.json();
        const newToken = data.newToken;
        localStorage.setItem('token', newToken);
      } else {
        console.error('Error al refrescar el token. Estado de respuesta:', response.status);
      }
    } catch (error) {
      console.error('Error en la comunicación con el backend', error);
    }
  };

  useEffect(() => {
    // Llamar a refreshToken cada 13 minutos (13 minutos * 60 segundos * 1000 milisegundos)
    const intervalId = setInterval(refreshToken, 13 * 60 * 1000);

    // Limpiar el intervalo al desmontar el componente para evitar fugas de memoria
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <div className='home'>
        <Navbar/>
      </div>
    </>
  );
}

export default HomePro;
