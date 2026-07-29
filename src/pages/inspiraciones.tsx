import './inspiraciones.css'
import Com from "/comillas.svg";



export  function Ins() {
    return (
        <section id='insp'>
            <h2>(Minds)</h2>
            <p>
                <span><img src={Com} alt="Comillas" /></span>
                Detras de cada persona hay una idea.
            </p>
        </section>
    )

}

export default Ins;
