import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/system';
import logo2 from '/public/logo2.png';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'white',
  color: '#228',
  maxWidth: '90%', // Ajusta el ancho máximo para pantallas más pequeñas
  margin: 'auto',
  borderRadius: '15px',
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  [theme.breakpoints.up('sm')]: {
    maxWidth: 400, // Ancho máximo para pantallas más grandes
  },
}));

const StyledLogoContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
}));
const StyledLogo = styled('div')(({ theme }) => ({
  width: '100px',
  height: '100px',
  borderRadius: '20%',
  background: '#fff',
  backgroundImage: `url(${logo2})`, // Usando la variable importada
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  [theme.breakpoints.up('sm')]: {
    width: '150px',
    height: '150px',
  },
}));


const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await fetch('https://xvxsfhnjxj.execute-api.us-east-1.amazonaws.com/dev/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const { userId, token, rol, idUser } = data;
        localStorage.setItem('token', token);
        localStorage.setItem('rol', rol);
        localStorage.setItem('idUser', idUser);
        if (rol === 'admin') {
          navigate('/Home');
        } else if (rol === 'propietario') {
          navigate('/HomePro');
        } else if (rol === 'conductor') {
          navigate('/ClienteHome');
        }
      } else {
        setLoginError(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setLoginError(true);
    }
  };

  return (
    <div className='login'>
      <StyledCard>
      <Typography component="h1" variant="h5" align="center" fontFamily={'sans-serif'}>
            ------------------------
          </Typography>
        <CardContent>
          <StyledLogoContainer>
            <StyledLogo />
          </StyledLogoContainer>

          <Typography component="h1" variant="h5" align="center" fontFamily={'sans-serif'}>
            Inicio de sesión
          </Typography>

          <>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Nombre de usuario o correo"
              name="username"
              autoComplete="off"
              value={username !== '' ? username : correo}
              onChange={(e) => {
                setUsername(e.target.value);
                setCorreo(e.target.value);
              }}
              color='secondary'
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              color='secondary'
            />

            {loginError && (
              <Typography
                variant="body2"
                color="error"
                sx={{ marginBottom: 2 }}
              >
                Credenciales incorrectas. Inténtalo nuevamente.
              </Typography>
            )}

            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleLogin}
              disabled={!username || !password}
            >
              Iniciar sesión
            </Button>
          </>
        </CardContent>
      </StyledCard>
    </div>
  );
};
//ss
export default Login;
