import { useRef, useState ,useEffect } from 'react';
import './Home.css';
import port from '/placa1.png';
import vid1 from '../assets/vid1.mp4';

export function Home() {
    // 1. Creamos la referencia al video y el estado del botón
    const videoRef = useRef(null);
    const [isIntro, setIsIntro] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true); // Empieza en true porque tiene autoPlay

    // 2. Función que controla la reproducción
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsIntro(false);
        }, 1500);

        // Limpiamos el timer por si el componente se desmonta antes
        return () => clearTimeout(timer);
    }, []);

    return (
        <main className="home-page">
            <section id='block1' className="struct">
                <div className="grid-galeria">
                    
                    <div className="bloque bloque-1">
                        <video 
                            ref={videoRef}
                            src={vid1} 
                            autoPlay 
                            loop 
                            muted 
                            playsInline 
                            className="video-fondo"
                        ></video>

                    
                    </div>

                    <div className="bloque bloque-2">
                        <p> "Ayni, del quechua, significa reciprocidad, ayuda y solidaridad. Por esto, con detalle y equilibrio, creamos productos de sumo cuidado y calidad a partir de los residuos que la tierra no puede consumir."</p>
                        <p> Sé parte de la solución.</p>
                    </div>

                    <div className="bloque bloque-3">
                        <p>1.</p>
                        <img src={port} alt="" />
                    </div>
                    
                </div>
            </section>
            <section id='block2' className="struct">

            </section>
        </main>
    )
}

export default Home;