import { useRef, useState, useEffect } from 'react';
import './Home.css';
import port from '/placa1.png';
import port2 from '/placa2.webp';
import port3 from '/personal2.avif';
import port4 from '/pr.webp';
import vid1 from '/vid2.webm';

export function Home() {
    const videoRef = useRef(null);


    // 1. NUEVO: Estado para saber si el bloque está expandido (200%) o normal (100%)
    const [isWide, setIsWide] = useState(true && (window.innerWidth > 1000));
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
                    width: (isWide) ? '200%' : '100%',
                    transition: 'width 1.5s cubic-bezier(0.25, 1, 0.5, 1)' // Animación súper suave y premium
                }}>
                <div className="grid-galeria">

                    <div className="bloque bloque-1">
                        <video ref={videoRef} src={vid1} /*poster={port}*/ autoPlay loop muted playsInline className="video-fondo"></video>
                    </div>

                    <div className="bloque bloque-2">
                        <p> "Ayni, del quechua, significa reciprocidad, ayuda y solidaridad. Por esto, con detalle y equilibrio, creamos productos de sumo cuidado y calidad a partir de los residuos que la tierra no puede consumir."</p>
                        <p className='bloque-2p'> Loremmms .</p>
                    </div>



                    <div className="bloque bloque-3">
                        <p>1.</p>
                        <picture>
                            <img src={port3} alt="" />
                        </picture>
                    </div>

                </div>
            </section>
            <section id='block2'>
                <div className="block2-1">
                    <div className="img1">
                        <p className='pim'>(3)</p>
                        <div className="cimg">
                            <div className="cimgg">
                                <picture>
                                    <img src={port} alt="" />
                                </picture>
                            </div>
                            <p>Las placas textiles cuentan con certificacion ecologica, contra el fuego y la formación de hongos; además de ser un material no tóxico e hipoalergénico.</p>
                        </div>
                    </div>
                    <div className="img2 animar-subida">
                        <p className='pim'>(5)</p>
                        <div className="cimg">
                            <div className="cimgg">
                                <video src={vid1} autoPlay loop muted playsInline  ></video>
                            </div>
                            <p>lorem descrigtionas aimg astergert.</p>
                        </div>
                    </div>
                </div>
                <div className="block2-2">
                    <div className="contextb22 animar-subida">
                        <p>
                            Los paneles y aislantes de textil reciclado destacan por su excepcional aislamiento acústico y térmico. Ya que por su estructura porosa no solo absorben el ruido de forma natural y son un excelente aislante térmico, sino que también son transpirables, regulando la humedad y previniendo el moho a diferencia de otros materiales.
                        </p>
                        <a href="">
                            referent
                        </a>
                    </div>
                    <div className="img2-2 animar-subida">
                        <p>(4)</p>
                        <div className="cimg2-2">
                            <div className="cimgg2-2">
                                <picture>
                                    <img src={port2} alt="" />
                                </picture>
                            </div>
                            <p>
                                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                            </p>
                            <p>
                                Exercitationem, corrupti libero magni iusto ipsum et obcaecati error fuga
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <section id='block3'>
                <div className='block3-1'>
                    <h3>Nueva copertaiva 2026</h3>
                    <p>Los grandes proyectos nacen de dar respuesta a las verdaderas necesidades. Nuestra cooperativa surge en un sector popular de Córdoba como una iniciativa comunitaria frente a una problemática crítica: las enormes y sofocantes olas de calor del verano que afectaban drásticamente el bienestar en los hogares de la zona.
                        Ante esto, asumimos un compromiso claro: para ayudar de verdad, debíamos encontrar una solución inteligente, accesible, ecológica y que no dependiera del consumo eléctrico. Encontramos la respuesta en el reciclaje textil, desarrollando paneles y aislantes que regulan la temperatura interior de las viviendas de forma natural. De este modo, logramos transformar un residuo problemático en una herramienta de confort y dignidad.</p>
                    <a href="">DESCUBRE MÁS</a>
                </div>
                <div className='block3-2'>
                    <p>(6)</p>
                    <div className='img-3-2'>
                        <picture>
                            <img src={port4} alt="" />
                        </picture>
                        <p><span>lorem </span> lorem dist nom lorem sert </p>
                        <p><span>lorem </span> lorem dist nom lorem sert </p>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Home;