import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { Home } from './pages/Home';
import { Prod } from './pages/Productos';
import { Proy } from './pages/proyectos';
import { Catg } from './pages/catalogo';
import { Ins } from './pages/inspiraciones';
import { Sos  } from './pages/sostenibilidad';
import { Minds  } from './pages/minds';
import { AyniM  } from './pages/ayniM';
import { Client } from './pages/atcliente';
import   logo   from './assets/Ayni.svg';
import { LayerMarkersDemo } from '@/components/ui/mapcn-layer-markers';




function App() {
  // Estado menu
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* 1. menu*/}
      <header className="ayni-header">
        <button className="menu-btn" onClick={toggleMenu}>
          {isOpen ? 'CERRAR' : 'MENÚ'}
        </button>
      </header>
      <div className={`menu-wrapper ${isOpen ? 'open' : ''}`}>

        {/* El fondo difuminado (si haces clic en el fondo, también se cierra) */}
        <div className="menu-overlay" onClick={toggleMenu}></div>

        {/* La caja donde irán los enlaces en el siguiente paso */}
        <div className="menu-box">
          {/* Primer bloque */}
          <ul>
            <li>
              <Link to="/inspiraciones" onClick={toggleMenu}>
                <span>INSPIRACIONES</span>
              </Link>
            </li>
            <li>
              <Link to="/productos" onClick={toggleMenu}>
                <span>PRODUCTOS</span>
              </Link>
            </li>
            <li>
              <Link to="/proyectos" onClick={toggleMenu}>
                <span>PROYECTOS</span>
              </Link>
            </li>
            <li>
              <Link to="/minds" onClick={toggleMenu}>
                <span>MINDS</span>
              </Link>
            </li>
            <li>
              <Link to="/catalogos" onClick={toggleMenu}>
                <span>CATÁLOGOS</span>
              </Link>
            </li>
            <li>
              <Link to="/sostenibilidad" onClick={toggleMenu}>
                <span>SOSTENIBILIDAD</span>
              </Link>
            </li>
          </ul>

          {/* Segundo bloque */}
          <ul>
            <li>
              <Link to="/ayni-mondo" onClick={toggleMenu}>
                <span>AYNI MONDO</span>
              </Link>
            </li>
            <li>
              <Link to="/atencion-al-cliente" onClick={toggleMenu}>
                <span>ATENCIÓN AL CLIENTE</span>
              </Link>
            </li>
            <li>
              <Link to="/map" onClick={toggleMenu}>
                <span>PUNTOS DE VENTA</span>
              </Link>
            </li>
          </ul>

          {/* Tercer bloque: La marca */}
          <ul className="menu-brand">
            <li>
              <Link to="/" onClick={toggleMenu}>
                <span>AYNI&C</span>
              </Link>
            </li>
          </ul>
        </div>

      </div>

      {/* 2. EL CONTENIDO DE TU PÁGINA */}
      <div className="logo-central">
        <img src={logo} alt="Ayni&C Logo" className="logo-svg" />
      </div>
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/info" element={<h2>Sección de Información</h2>} />
          <Route path="/cart" element={<h2>Tu Carrito de Compras</h2>} />
          <Route path="/productos" element={<Prod/>} />
          <Route path="/proyectos" element={<Proy/>} />
          <Route path="/minds" element={<Minds/>} />
          <Route path="/ayni-mondo" element={<AyniM/>} />
          <Route path="/atencion-al-cliente" element={<Client/>} />
          <Route path="/catalogos" element={<Catg/>} />
          <Route path="/inspiraciones" element={<Ins/>} />
          <Route path="/sostenibilidad" element={<Sos/>} />
          <Route path="/map" element={<LayerMarkersDemo/>} />
        </Routes>
      </main>
    </>
  );
}

export default App;