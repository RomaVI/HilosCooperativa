import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { Home } from './pages/Home';
import { Prod } from './pages/productos';
import { Proy } from './pages/proyectos';
import { Catg } from './pages/catalogo';
import { Ins } from './pages/inspiraciones';
import { Sos } from './pages/sostenibilidad';
import { Minds } from './pages/minds';
import { AyniM } from './pages/ayniM';
import { Client } from './pages/atcliente';
import logo from './assets/Ayni.svg';
import Whatp from '/icons8-whatsapp.svg';
import { LayerMarkersDemo } from '@/components/ui/mapcn-layer-markers';



function App() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* =========================================
          1. CABECERA Y MENÚ (Siempre arriba)
          ========================================= */}
      <header className="ayni-header">
        <button className="menu-btn" onClick={toggleMenu}>
          {isOpen ? 'CERRAR' : 'MENÚ'}
        </button>
      </header>

      <div className={`menu-wrapper ${isOpen ? 'open' : ''}`}>
        <div className="menu-overlay" onClick={toggleMenu}></div>
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



      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/info" element={<h2>Sección de Información</h2>} />
          <Route path="/cart" element={<h2>Tu Carrito de Compras</h2>} />
          <Route path="/productos" element={<Prod />} />
          <Route path="/proyectos" element={<Proy />} />
          <Route path="/minds" element={<Minds />} />
          <Route path="/ayni-mondo" element={<AyniM />} />
          <Route path="/atencion-al-cliente" element={<Client />} />
          <Route path="/catalogos" element={<Catg />} />
          <Route path="/inspiraciones" element={<Ins />} />
          <Route path="/sostenibilidad" element={<Sos />} />
          <Route path="/map" element={<LayerMarkersDemo />} />
        </Routes>
      </main>
      {/* =========================================
          2. CONTENIDO PRINCIPAL (En el medio)
          ========================================= */}
      <div className="logo-central">
        <img src={logo} alt="Ayni&C Logo" className="logo-svg" />
      </div>
      <div id='whatsap'>
        <a href="https://wa.me/5493512665946?text=Hola,%20me%20gustaría%20hacer%20una%20consulta"
          target="_blank"
          rel="noopener noreferrer"><img src={Whatp} alt="" /></a>
      </div>
      {/* =========================================
          3. PIE DE PÁGINA (Siempre al final)
          ========================================= */}
      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-col col-newsletter">
            <h4>( Newsletter )</h4>
            <p>Suscríbete a nuestro boletín...</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Correo electrónico*" required />
              <button type="submit">ENVIAR</button>
            </form>
          </div>

          <div className="footer-col col-links">
            {/* ... enlaces ... */}
          </div>

          <div className="footer-col col-social">
            <h4>( Redes sociales )</h4>
            <div className="social-icons">
              {/* Si importas lucide-react arriba, puedes descomentar esto:
                        <a href="#"><Facebook size={20} strokeWidth={1.5} /></a>
                        <a href="#"><Linkedin size={20} strokeWidth={1.5} /></a>
                        <a href="#"><Instagram size={20} strokeWidth={1.5} /></a>
                        <a href="#"><Youtube size={20} strokeWidth={1.5} /></a>                      
                      */}
            </div>
          </div>

          <div className="footer-col col-brands">
            {/* ... marcas ... */}
          </div>
        </div>

        <div className="footer-bottom">
          {/* ... links de sitemap y país ... */}
        </div>

        <div className="footer-legal">
          <p>HilosCooperativa - Capital social: $0.00...</p>
        </div>
      </footer>
    </>
  );
}

export default App;