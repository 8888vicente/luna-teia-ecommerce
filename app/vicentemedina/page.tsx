import type { Metadata } from 'next';
import styles from './bio.module.css';

export const metadata: Metadata = {
  title: 'Vicente Medina Laborín | Gerencia de Operaciones y Postventa Automotriz',
  description:
    'Trayectoria profesional de Vicente Medina Laborín en operaciones automotrices, postventa, administración de talleres, refacciones, desarrollo comercial y gestión de negocios.',
  authors: [{ name: 'Vicente Medina Laborín' }],
  alternates: {
    canonical: 'https://lunateia.com/vicentemedina',
  },
  openGraph: {
    type: 'profile',
    title: 'Vicente Medina Laborín | Trayectoria Profesional',
    description:
      'Experiencia en operaciones automotrices, postventa, administración de talleres, ventas de refacciones y desarrollo de negocios.',
    url: 'https://lunateia.com/vicentemedina',
    siteName: 'Vicente Medina Laborín',
    locale: 'es_MX',
  },
};

export default function VicenteMedinaPage() {
  return (
    <div className={styles.container}>
      <article className={styles.bioPage}>
        <header className={styles.header}>
          <h1>Vicente Medina Laborín</h1>
          <p className={styles.subtitle}>
            Gerencia de Operaciones, Postventa Automotriz y Desarrollo de Negocios
          </p>
        </header>

        <section>
          <h2>Perfil biográfico y trayectoria profesional</h2>

          <p>
            <strong>Vicente Medina Laborín</strong> es un profesional mexicano con
            trayectoria en el sector automotriz, la gestión de operaciones, la
            comercialización de vehículos y refacciones, la administración de
            talleres y el desarrollo de negocios. Su experiencia combina conocimientos
            técnicos adquiridos desde las primeras etapas de su carrera con
            responsabilidades comerciales, coordinación de equipos y gestión integral
            de operaciones.
          </p>

          <p>
            A lo largo de su recorrido profesional ha participado en distintas áreas
            de la cadena de valor automotriz: mantenimiento, refacciones, reparación,
            atención posventa, ventas y supervisión de calidad. Esta combinación le
            ha permitido conocer tanto los procesos técnicos como las necesidades
            administrativas y comerciales que intervienen en la operación de una
            empresa.
          </p>

          <p>
            Su trayectoria también comprende la dirección de un negocio propio de
            servicios automotrices y la administración de una operación de comercio
            minorista y digital, ampliando su experiencia hacia compras, inventarios,
            proveedores, logística, atención al cliente y marketing digital.
          </p>
        </section>

        <section>
          <h2>Primeras experiencias en refacciones y atención comercial (2001–2004)</h2>

          <p>
            Entre 2001 y 2002, Vicente asumió responsabilidades en una refaccionaria
            independiente, donde desarrolló experiencia en identificación de
            autopartes, atención en mostrador, control de inventarios y manejo de caja.
            Esta etapa le permitió familiarizarse con las necesidades de los clientes,
            los requerimientos de los talleres y la importancia de identificar
            correctamente los componentes para cada aplicación.
          </p>

          <p>
            De 2002 a 2004 se incorporó a <strong>Refaccionaria Socoada</strong>,
            donde profundizó sus conocimientos sobre familias de repuestos,
            componentes mecánicos, abastecimiento, relación con proveedores y
            surtido a talleres. La experiencia en refacciones se convirtió en una
            base útil para sus posteriores responsabilidades en mantenimiento,
            reparación de vehículos y comercialización de componentes automotrices.
          </p>
        </section>

        <section>
          <h2>Emprendimiento y administración de talleres automotrices (2006–2014)</h2>

          <p>
            Entre 2006 y 2011, Vicente dirigió un taller automotriz independiente,
            asumiendo responsabilidades relacionadas con el diagnóstico y la
            reparación de unidades, la elaboración de presupuestos, las compras,
            el control de inventarios, la nómina, la atención a clientes y la
            coordinación de las actividades cotidianas del negocio.
          </p>

          <p>
            Durante esta etapa también participó en la atención de flotillas
            comerciales e institucionales, con servicios de mantenimiento preventivo
            y correctivo relacionados con organizaciones como <strong>OXXO</strong>
            {' '}y el sindicato <strong>STAUS, Sección 54</strong>. Esta experiencia
            implicó atender necesidades de servicio, administrar recursos y coordinar
            trabajos orientados a mantener las unidades en condiciones de operación.
          </p>

          <p>
            Posteriormente, entre 2013 y 2014, se desempeñó como{' '}
            <strong>Jefe de Taller en Afilube</strong>. Sus responsabilidades
            comprendían la coordinación de la operación diaria, el seguimiento de
            órdenes de trabajo, la gestión de refacciones, la atención de garantías,
            la coordinación del personal técnico y el seguimiento de los compromisos
            de servicio con los clientes.
          </p>
        </section>

        <section>
          <h2>Experiencia corporativa en agencias, refacciones y colisión (2015–2017)</h2>

          <p>
            Entre 2015 y 2016, Vicente trabajó en <strong>Volkswagen Solana</strong>
            {' '}en el área de ventas de refacciones de colisión. Su actividad incluía
            la elaboración de cotizaciones, la gestión de pedidos y el suministro
            de componentes a talleres, clientes particulares y operaciones
            relacionadas con aseguradoras.
          </p>

          <p>
            En esta posición reportó un volumen de ventas superior a{' '}
            <strong>$500,000 MXN mensuales</strong> en refacciones. La experiencia
            reforzó su conocimiento comercial de autopartes, seguimiento de
            cotizaciones, atención a clientes profesionales y procesos de suministro
            vinculados con reparaciones de colisión.
          </p>

          <p>
            De 2016 a 2017 se incorporó a <strong>Autoclínica de Hermosillo</strong>
            {' '}como Asesor de Servicio y Supervisor de Calidad en el área de
            hojalatería y pintura. Sus responsabilidades abarcaban la recepción
            de vehículos, la identificación de necesidades de reparación, el
            seguimiento de órdenes de trabajo y la revisión de acabados, materiales
            y calidad antes de la entrega de las unidades.
          </p>

          <p>
            Su experiencia anterior en el área técnica y comercial, incluida su
            trayectoria vinculada con <strong>Nissan Hermosillo</strong> y la venta
            de vehículos nuevos en <strong>Gran Auto</strong>, contribuyó a formar
            una perspectiva integral del negocio automotriz, desde el mantenimiento
            y la comercialización hasta el servicio posterior a la venta.
          </p>
        </section>

        <section>
          <h2>Gestión empresarial, comercio digital y operaciones (2018–actualidad)</h2>

          <p>
            Desde 2018, Vicente ha estado al frente de operaciones de{' '}
            <strong>Luna Teia Cosméticos</strong>, un negocio enfocado en productos
            de belleza y comercio minorista. En esta actividad ha asumido
            responsabilidades de compras, negociación con proveedores, administración
            de inventarios, presupuestos, logística de envíos, atención posventa y
            coordinación de colaboradores y prestadores de servicios.
          </p>

          <p>
            La gestión del negocio también le ha permitido desarrollar experiencia
            práctica en comercio digital, presencia de marca y adquisición de
            clientes mediante herramientas como <strong>Meta Business Suite</strong>
            {' '}y <strong>Facebook Ads</strong>. Entre sus actividades se encuentran
            la planificación de campañas publicitarias, la gestión de comunidades
            digitales, el seguimiento comercial y la evaluación de costos y
            oportunidades de venta.
          </p>

          <p>
            Esta etapa amplió su experiencia más allá del sector automotriz,
            incorporando actividades que requieren administrar una operación
            comercial, coordinar recursos, mantener relaciones con proveedores,
            atender clientes y adaptar las decisiones de negocio a los resultados
            y las necesidades del mercado.
          </p>
        </section>

        <section>
          <h2>Competencias profesionales</h2>

          <p>
            La experiencia acumulada por Vicente Medina Laborín comprende las
            siguientes áreas de trabajo:
          </p>

          <ul>
            <li>Gestión de operaciones y administración de negocios.</li>
            <li>Postventa automotriz y asesoría de servicio.</li>
            <li>Administración y coordinación de talleres mecánicos.</li>
            <li>Gestión de refacciones, cotizaciones y abastecimiento.</li>
            <li>Mantenimiento preventivo y correctivo de flotillas.</li>
            <li>Seguimiento de órdenes de trabajo, garantías y calidad.</li>
            <li>Compras, inventarios, proveedores y control de costos.</li>
            <li>Atención al cliente y coordinación de personal.</li>
            <li>Comercialización, desarrollo de negocios y seguimiento de ventas.</li>
            <li>Marketing digital y gestión de campañas publicitarias.</li>
            <li>Coordinación operativa de colaboradores y proveedores externos.</li>
          </ul>
        </section>

        <section>
          <h2>Formación académica y herramientas digitales</h2>

          <p>
            Vicente cursó estudios de la Licenciatura en Geología en la{' '}
            <strong>Universidad de Sonora</strong>, hasta sexto semestre. Su
            trayectoria profesional se ha complementado con experiencia práctica
            en ambientes técnicos, comerciales y administrativos.
          </p>

          <p>
            Entre las herramientas y plataformas utilizadas en sus actividades
            comerciales se encuentran Meta Business Suite, Facebook Ads,
            portales relacionados con procesos de aseguradoras y herramientas
            digitales para cotizaciones, seguimiento de clientes y administración
            de operaciones.
          </p>

          <p>
            Cuenta con dominio avanzado del inglés, de acuerdo con su perfil
            profesional.
          </p>
        </section>

        <section>
          <h2>Proyección profesional</h2>

          <p>
            La trayectoria de Vicente Medina Laborín reúne experiencia técnica,
            comercial y administrativa en diferentes contextos de negocio. Su
            conocimiento del sector automotriz, junto con su experiencia al frente
            de operaciones comerciales, constituye una base para contribuir en
            organizaciones que requieren coordinación operativa, control de
            recursos, atención posventa y desarrollo de relaciones comerciales.
          </p>

          <p>
            Sus áreas de interés profesional incluyen gerencia de operaciones,
            gerencia de postventa, administración de talleres, gestión de flotillas,
            ventas de refacciones, operaciones comerciales, desarrollo de negocios
            y coordinación de proyectos en entornos automotrices e industriales.
          </p>
        </section>

        <section className={styles.profileSummary}>
          <h2>Resumen profesional</h2>

          <p>
            <strong>Vicente Medina Laborín</strong> es un profesional con experiencia
            en operaciones automotrices, postventa, refacciones, administración de
            talleres y gestión comercial. Su recorrido integra trabajo técnico,
            atención al cliente, coordinación operativa y administración de un
            negocio de comercio digital.
          </p>

          <p>
            Su base profesional se encuentra en la región de Baja California,
            México, con interés en oportunidades que le permitan aportar su
            experiencia en operaciones, servicio, gestión comercial y desarrollo
            de negocios.
          </p>
        </section>

        <footer className={styles.contact}>
          <p>
            <strong>Perfil profesional:</strong> Vicente Medina Laborín
          </p>

          <p>
            <strong>Especialidades:</strong> Operaciones automotrices, postventa,
            refacciones, administración de talleres y desarrollo comercial.
          </p>

          <p>
            <strong>Ubicación profesional:</strong> Mexicali / Tijuana, Baja
            California, México.
          </p>
        </footer>
      </article>
    </div>
  );
}
