import './minds.css';
import Com from "/comillas.svg";
import per from "/personal2.avif";
import per2 from "/personal.avif";

export function Minds() {
    // 1. Creamos el arreglo con la información de cada persona.
    // Le agregamos un 'id' que también usaremos para mantener tus clases (mind1, mind2, etc.)
    const equipo = [
        { 
            id: 'mind1', 
            img: per, 
            nombre: 'Nombre Apellido', 
            desc: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit molestias aliquid pariatur saepe velit fugiat. Laboriosam porro aperiam a qui possimus omnis facere voluptas voluptate, nam recusandae cum, maxime velit.' 
        },
        { id: 'mind2', img: per2, nombre: 'Nombre Apellido', desc: 'loremmmm satre asrte minser ardrod' },
        { id: 'mind3', img: per, nombre: 'Nombre Apellido', desc: 'loremmmm satre asrte minser ardrod' },
        { id: 'mind4', img: per2, nombre: 'Nombre Apellido', desc: 'loremmmm satre asrte minser ardrod' },
        { id: 'mind5', img: per, nombre: 'Nombre Apellido', desc: 'loremmmm satre asrte minser ardrod' },
        { id: 'mind6', img: per2, nombre: 'Nombre Apellido', desc: 'loremmmm satre asrte minser ardrod' },
        { id: 'mind7', img: per, nombre: 'Nombre Apellido', desc: 'loremmmm satre asrte minser ardrod' },
        { id: 'mind8', img: per2, nombre: 'Nombre Apellido', desc: 'loremmmm satre asrte minser ardrod' },
    ];

    return (
        <section id='minds'>
            <h2>(Minds)</h2>
            <p>
                <span><img src={Com} alt="Comillas" /></span>
                Detras de un gran proyecto hay grandes personas.
            </p>
            
            <div className='BlockMinds'>
                {/* 2. Recorremos el arreglo con .map() para generar cada tarjeta */}
                {equipo.map((persona) => (
                    // Usamos template literals (` `) para inyectar el id (mind1, mind2) como clase
                    <div key={persona.id} className={`${persona.id} mindstr`}>
                        <img src={persona.img} alt={persona.nombre} />
                        <div className='mindstxt'>
                            <h2>{persona.nombre}</h2>
                            <p>{persona.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Minds;