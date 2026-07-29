import './producto.css';


import prod1 from '/placa1.png';
import prod2 from '/placa2.webp';
import prod3 from '/placa3.webp';
import { useState } from 'react';



export function Prod() {

    const [filtroActivo, setFiltroActivo] = useState('All');
    const productos = [
        { id: 'prod1', img: prod1, titulo: 'Placa', categoria: 'Placa' },
        { id: 'prod2', img: prod2, titulo: 'Placa', categoria: 'Aislante' },
        { id: 'prod3', img: prod3, titulo: 'Placa', categoria: 'Mueble' },
        { id: 'prod4', img: prod1, titulo: 'Placa', categoria: 'Placa' },
        { id: 'prod5', img: prod2, titulo: 'Placa', categoria: 'Aislante' },
    ];

    const productosFiltrados = filtroActivo === 'All' 
        ? productos 
        : productos.filter(producto => producto.categoria === filtroActivo);

    return (
        <section id='product'>
            <div className='filtro1'>
                <ul>
                    <li 
                        onClick={() => setFiltroActivo('All')}
                        style={{ cursor: 'pointer', fontWeight: filtroActivo === 'All' ? 'bold' : 'normal' }}
                    >
                        All
                    </li>
                    <li 
                        onClick={() => setFiltroActivo('Placa')}
                        style={{ cursor: 'pointer', fontWeight: filtroActivo === 'Placa' ? 'bold' : 'normal' }}
                    >
                        Placa
                    </li>
                    <li 
                        onClick={() => setFiltroActivo('Aislante')}
                        style={{ cursor: 'pointer', fontWeight: filtroActivo === 'Aislante' ? 'bold' : 'normal' }}
                    >
                        Aislante
                    </li>
                    <li 
                        onClick={() => setFiltroActivo('Mueble')}
                        style={{ cursor: 'pointer', fontWeight: filtroActivo === 'Mueble' ? 'bold' : 'normal' }}
                    >
                        Mueble
                    </li>
                </ul>
            </div>
            
            <div className='catalCont'>

                {productosFiltrados.map((producto) => (
                    <div key={producto.id} id={producto.id} className={`catlg ${producto.id}`}>
                        <img src={producto.img} alt={producto.categoria} />
                        <div>
                            <p>{producto.titulo}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}


export default Prod;
