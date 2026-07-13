import './Home.css'
import port from '../assets/placa1.png'

export function Home() {
    return (
        <main className="home-page">
            <section id='block1' className="struct">
                <div className='dblock1'>
                    <div className='block-struct'>
                        <div className='txtBlock1'>
                            <h4>Aislante Termico y Placas a Partir de Textiles Reciclados.</h4>
                            <p>Innovación sostenible para la construcción y la industria. Soluciones eficaces, ecológicas y de alta calidad.</p>
                        </div>
                        <div className='imgBlock1'>
                            <img src={port} alt="placa" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Bloque 2 */}
            <section id='block2' className="struct">
                <div className='block2'>
                    <p>Nuestros Productos</p>
                    <div className='block2Struct'>
                        {/* Items... */}
                        <div className='b2item1'>
                            <div className='placeholder-image'>Imagen</div>
                            <div className='itemText'>
                                <h4>Placa textil</h4>
                                <p>Descripción del producto...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bloque 3 */}
            <section id='block3' className="struct">
                <p>Quienes somos?</p>
                <div className='block3'></div>
            </section>
        </main>
    )
}

export default Home