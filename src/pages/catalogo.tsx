import './catalogo.css'
import cat1 from '/cat1.png';
import cat2 from '/cat2.jpg';
import { useState } from 'react';



export function Catg() {
    // 1. Estado para saber qué filtro está activo (por defecto mostramos "All")
    const [filtroActivo, setFiltroActivo] = useState('All');

    // 2. Tu base de datos local de productos. 
    // Aquí es donde aplicas tu idea de asignarles una categoría a cada uno.
    const productos = [
        { id: 'cat1', img: cat1, titulo: 'catalg 2026', categoria: 'Interior' },
        { id: 'cat2', img: cat2, titulo: 'catalg 2026', categoria: 'Muebles' },
        { id: 'cat3', img: cat2, titulo: 'catalg 2026', categoria: 'Exterior' },
        { id: 'cat4', img: cat1, titulo: 'catalg 2026', categoria: 'Interior' },
        { id: 'cat5', img: cat1, titulo: 'catalg 2026', categoria: 'Muebles' },
    ];

    // 3. Lógica de filtrado: si es 'All', mostramos todos. Si no, filtramos por categoría.
    const productosFiltrados = filtroActivo === 'All' 
        ? productos 
        : productos.filter(producto => producto.categoria === filtroActivo);

    return (
        <section id='catalogo'>
            <div className='filtro1'>
                <ul>
                    <li 
                        onClick={() => setFiltroActivo('All')}
                        style={{ cursor: 'pointer', fontWeight: filtroActivo === 'All' ? 'bold' : 'normal' }}
                    >
                        All
                    </li>
                    <li 
                        onClick={() => setFiltroActivo('Interior')}
                        style={{ cursor: 'pointer', fontWeight: filtroActivo === 'Interior' ? 'bold' : 'normal' }}
                    >
                        Interior
                    </li>
                    <li 
                        onClick={() => setFiltroActivo('Muebles')}
                        style={{ cursor: 'pointer', fontWeight: filtroActivo === 'Muebles' ? 'bold' : 'normal' }}
                    >
                        Muebles
                    </li>
                    <li 
                        onClick={() => setFiltroActivo('Exterior')}
                        style={{ cursor: 'pointer', fontWeight: filtroActivo === 'Exterior' ? 'bold' : 'normal' }}
                    >
                        Exterior
                    </li>
                </ul>
            </div>
            
            <div className='catalCont'>
                {/* 4. Renderizamos dinámicamente usando .map() sobre el arreglo ya filtrado */}
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

export default Catg;