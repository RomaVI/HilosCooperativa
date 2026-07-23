
import './Home.css';
import port from '/placa1.png';
import port2 from '/placa2.webp';
import port3 from '/placa3.webp';
import vid1 from '/vid1.mp4';

export function Home() {
    // 1. Creamos la referencia al video y el estado del botón


    // 2. Función que controla la reproducción


    return (
        <main className="home-page">
            <section id='block1' className="struct">
                <div className="grid-galeria">

                    <div className="bloque bloque-1">
                        <video src={vid1}></video>

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
                    <div className="img2">
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
                    <div className="contextb22">
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nobis dicta quasi impedit eligendi a corrupti fugiat ipsa! Inventore architecto perferendis quas vitae officia corporis accusamus eligendi tempora ipsum, hic rem.
                        </p>
                        <a href="">
                            referent
                        </a>
                    </div>
                    <div className="img2-2">
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