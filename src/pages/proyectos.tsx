import './proyectos.css'
import Com from "/comillas.svg";


export  function Proy() {
    return (
        <section id='proy'>
        <h2>(Proyectos)</h2>
            <p>
                <span><img src={Com} alt="Comillas" /></span>
                Detras de cada persona hay un proyecto.
            </p>
        </section>
    )

}

export default Proy;
