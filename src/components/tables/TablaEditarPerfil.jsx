import React, { useEffect, useState } from 'react';
import { Card, Button, Form, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import '../css/TableEditarPerfil.css';
import { saveProfile, getProfile, syncProfile  } from '../../services/indexedDB'; // Importar funciones de IndexedDB

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

export default function TableEditarPerfil() {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();
  const apiUrl = `https://mi-backendsecond.onrender.com/perfil/${localStorage.getItem('idUser')}`;
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;

  
  useEffect(() => {
    fetchProfile();
    
  }, []);

  const fetchProfile = async () => {
    if (navigator.onLine) {
      // Modo online: obtén datos del servidor
      try {
        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();

          // Asegúrate de que el perfil tenga un 'id'
          if (!data.id) {
            data.id = localStorage.getItem('idUser');
          }

          setProfile(data);

          // Guardar perfil en IndexedDB
          await saveProfile(data);
        } else if (response.status === 401) {
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    } else {
      // Modo offline: obtén datos cacheados
      const cachedProfile = await getProfile();
      if (cachedProfile) {
        setProfile(cachedProfile);
      } else {
        console.warn('No hay datos cacheados disponibles.');
      }
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setShowProfileModal(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setShowProfileModal(false);
    fetchProfile();
  };

  const handleSave = async () => {
    if (!profile.id) {
      console.error('El perfil no tiene un ID definido.');
      return;
    }
  
    if (navigator.onLine) {
      // Modo online: actualizar en el servidor
      try {
        const response = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(profile),
        });
  
        if (response.ok) {
          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 3000);
          setEditMode(false);
          setShowProfileModal(false);
          fetchProfile();
        } else if (response.status === 401) {
          navigate('/');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    } else {
      // Modo offline: guardar en IndexedDB y esperar sincronización
      await saveProfile(profile);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      setEditMode(false);
      setShowProfileModal(false);
      console.warn('Guardado localmente. Se sincronizará cuando haya conexión.');
    }
  };
  
///sss
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        {isMobile ? (
          <>
            <Button variant="primary" onClick={() => setShowProfileModal(true)}>
              Editar Perfil
            </Button>
            <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Editar Perfil</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                      type="text"
                      name="nombre"
                      value={profile?.nombre || ''}
                      onChange={handleChange}
                      readOnly={!editMode}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={profile?.username || ''}
                      onChange={handleChange}
                      readOnly={!editMode}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Correo</Form.Label>
                    <Form.Control
                      type="email"
                      name="correo"
                      value={profile?.correo || ''}
                      onChange={handleChange}
                      readOnly={!editMode}
                    />
                  </Form.Group>
                  {editMode ? (
                    <div className="d-flex justify-content-end">
                      <Button variant="secondary" onClick={handleCancel} className="me-2">
                        Cancelar
                      </Button>
                      <Button variant="primary" onClick={handleSave}>
                        Guardar Cambios
                      </Button>
                    </div>
                  ) : (
                    <Button variant="primary" onClick={handleEdit}>
                      Editar
                    </Button>
                  )}
                </Form>
              </Modal.Body>
            </Modal>
          </>
        ) : (
          <Card>
            <Card.Body>
              {showSuccessMessage && <Alert variant="success">¡Perfil actualizado correctamente!</Alert>}
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={profile?.nombre || ''}
                    onChange={handleChange}
                    readOnly={!editMode}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={profile?.username || ''}
                    onChange={handleChange}
                    readOnly={!editMode}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Correo</Form.Label>
                  <Form.Control
                    type="email"
                    name="correo"
                    value={profile?.correo || ''}
                    onChange={handleChange}
                    readOnly={!editMode}
                  />
                </Form.Group>
                {editMode ? (
                  <div className="d-flex justify-content-end">
                    <Button variant="secondary" onClick={handleCancel} className="me-2">
                      Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                      Guardar Cambios
                    </Button>
                  </div>
                ) : (
                  <Button variant="primary" onClick={handleEdit}>
                    Editar
                  </Button>
                )}
              </Form>
            </Card.Body>
          </Card>
        )}
      </div>
    </>
  );
}
