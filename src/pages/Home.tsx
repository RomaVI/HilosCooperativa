import { useRef, useState, useEffect } from 'react';
import './Home.css';
import port from '/placa1.png';
import port2 from '/placa2.webp';
import port3 from '/placa3.webp';
import vid1 from '/vid1.mp4';

export function Home() {
    const videoRef = useRef(null);


    // 1. NUEVO: Estado para saber si el bloque está expandido (200%) o normal (100%)
    const [isWide, setIsWide] = useState(true);
    useEffect(() => {
        // Configuramos el "vigilante"
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                // Si el elemento entra en la pantalla...
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible'); // Le agrega la clase que lo hace subir
                    
                    observer.unobserve(entry.target); 
                }
            });
        }, { 
            threshold: 0.1 // Se activa cuando al menos el 10% de la foto es visible
        });

        // Buscamos todos los elementos con la clase 'animar-subida'
        const elementos = document.querySelectorAll('.animar-subida');
        elementos.forEach((el) => observer.observe(el));

        // Limpieza de memoria
        return () => {
            elementos.forEach((el) => observer.unobserve(el));
        };
    }, []);
    // 2. NUEVO: Efecto que controla el tiempo y los eventos
    useEffect(() => {
        // Función que encoge el bloque al 100%
        const shrinkBlock = () => setIsWide(false);

        // a) Temporizador: se encoge automáticamente a los 2000 milisegundos (2 segundos)
        const timer = setTimeout(shrinkBlock, 2000);

        // b) Eventos: se encoge si el usuario hace clic o toca una tecla antes de los 2 segundos
        window.addEventListener('mousedown', shrinkBlock);
        window.addEventListener('keydown', shrinkBlock);

        // Limpiamos la memoria cuando el componente se desmonta
        return () => {
            clearTimeout(timer);
            window.removeEventListener('mousedown', shrinkBlock);
            window.removeEventListener('keydown', shrinkBlock);
        };
    }, []); // Los corchetes vacíos indican que esto se ejecuta solo una vez al cargar la página


    return (
        <main className="home-page">
            <section id='block1'
                className="struct"
                style={{
                    width: isWide ? '200%' : '100%',
                    transition: 'width 1.5s cubic-bezier(0.25, 1, 0.5, 1)' // Animación súper suave y premium
                }}>
                <div className="grid-galeria">

                    <div className="bloque bloque-1">
                        <video ref={videoRef} src={vid1} autoPlay loop muted playsInline className="video-fondo"></video>
                    </div>

                    <div className="bloque bloque-2">
                        <p> "Ayni, del quechua, significa reciprocidad, ayuda y solidaridad. Por esto, con detalle y equilibrio, creamos productos de sumo cuidado y calidad a partir de los residuos que la tierra no puede consumir."</p>
                        <p> Sé parte de la solución.</p>
                    </div>

                    <div className="bloque bloque-3">
                        <p>1.</p>
                        <img src={port3} alt="" />
                    </div>

                </div>
            </section>
            <section id='block2' className="struct">
                <div className="block2-1">
                    <div className="img1">
                        <p className='pim'>(3)</p>
                        <div className="cimg">
                            <div className="cimgg">
                                <img src={port3} alt="" />
                            </div>
                            <p>lorem descrigtionas aimg astergert.</p>
                        </div>
                    </div>
                    <div className="img2 animar-subida">
                        <p className='pim'>(5)</p>
                        <div className="cimg">
                            <div className="cimgg">
                                <img src={port2} alt="" />
                            </div>
                            <p>lorem descrigtionas aimg astergert.</p>
                        </div>
                    </div>
                </div>
                <div className="block2-2">
                    <div className="contextb22 animar-subida">
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nobis dicta quasi impedit eligendi a corrupti fugiat ipsa! Inventore architecto perferendis quas vitae officia corporis accusamus eligendi tempora ipsum, hic rem.
                        </p>
                        <a href="">
                            referent
                        </a>
                    </div>
                    <div className="img2-2 animar-subida">
                        <p>(4)</p>
                        <div className="cimg2-2">
                            <div className="cimgg2-2">
                                <img src={port} alt="" />
                            </div>
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem, corrupti libero magni iusto ipsum et obcaecati error fuga </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Home;