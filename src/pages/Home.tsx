import { useRef } from 'react';
import './Home.css';
import port from '/placa1.png';
import vid1 from '../assets/vid1.mp4';

export function Home() {
    // 1. Creamos la referencia al video y el estado del botón
    const videoRef = useRef(null);

    // 2. Función que controla la reproducción


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
                <div className="block2-1">
                    <div className="img1">
                        <p>3</p>
                        <div className="descr">
                        <img src={port} alt="" />
                        <p>Lorem ipsum, dolor sit amet.</p>
                        </div>
                    </div>
                    <div className="img2">
                        <p>5</p>
                        <div className="descr">
                        <img src={port} alt="" />
                        <p>Lorem ipsum, dolor sit amet.</p>
                        </div>
                    </div>
                </div>
                <div className="block2-2"></div>
            </section>
        </main>
    )
}

export default Home;