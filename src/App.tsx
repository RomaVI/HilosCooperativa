import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import logo from './assets/logo13.jpg';

function App() {
  return (
    <>
      <section id="nav">
        <div className='logo'>
          <div className='imgLogo'>
            <img src={logo} alt="Logo" />
          </div>
        </div>
        <div className='txtLogo'>
          <h1>Hilos del Retorno</h1>
        </div>
        
        <div className='icons'>
          {/* Envolvemos cada imagen en un Link */}
          
          <Link to="/" className='iconItem'>
            <img src="https://img.icons8.com/?size=100&id=59778&format=png&color=000000" alt="Inicio" />
          </Link>

          <Link to="/info" className='iconItem'>
            <img src="https://img.icons8.com/?size=100&id=v2LNL7ofGkrB&format=png&color=000000" width="30vh" height="30vh" alt="Información" />
          </Link>

          <Link to="/cart" className='iconItem'>
            <img src="https://img.icons8.com/?size=100&id=61845&format=png&color=000000" alt="Carrito" />
          </Link>

          <Link to="/perfil" className='iconItem enditem'>
            <img src="https://img.icons8.com/?size=100&id=4FCpkShJnmAa&format=png&color=000000" alt="Perfil" />
          </Link>
        </div>
      </section>

      <main className="content">
        <Routes>
          <Route path="/" element={<h2>Bienvenido al Inicio</h2>} />
          <Route path="/info" element={<h2>Sección de Información</h2>} />
          <Route path="/cart" element={<h2>Tu Carrito de Compras</h2>} />
          <Route path="/perfil" element={<h2>Tu Perfil</h2>} />
        </Routes>
      </main>
    </>
  );
}

export default App;