import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Target, 
  ShieldCheck, 
  Users, 
  Flame, 
  Award, 
  Compass, 
  Eye, 
  CheckCircle2, 
  HeartHandshake, 
  Sparkles, 
  Phone, 
  MessageCircle,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

export default function Nosotros() {
  const WHATSAPP_PHONE = "51963896985";

  const pilares = [
    {
      titulo: "1. Metodología Pedagógica Progresiva",
      desc: "Nuestros programas están diseñados por etapas madurativas. No aceleramos procesos: enseñamos la técnica correcta desde la base para que el alumno evolucione con confianza y sin lesiones."
    },
    {
      titulo: "2. Formación Ética y en Valores",
      desc: "Creemos que un verdadero campeón se define por su actitud fuera de la cancha. El respeto a los árbitros, compañeros, rivales y padres es un requisito innegociable en nuestras clases."
    },
    {
      titulo: "3. Preparación Física y Motriz",
      desc: "Desarrollamos capacidades coordinativas, velocidad de reacción, potencia de salto y resistencia cardiovascular con ejercicios dinámicos y adaptados a cada edad."
    },
    {
      titulo: "4. Competencia Formativa y Saludable",
      desc: "Participamos en ligas distritales, partidos amistosos y torneos interacademias para que los alumnos aprendan a ganar con humildad y a perder con aprendizaje."
    }
  ];

  const valores = [
    {
      titulo: "Disciplina",
      desc: "Puntualidad, constancia y compromiso con el entrenamiento diario.",
      icon: <Target className="w-6 h-6 text-teal-400" />
    },
    {
      titulo: "Respeto",
      desc: "Juego limpio y trato digno hacia profesores, compañeros y rivales.",
      icon: <ShieldCheck className="w-6 h-6 text-amber-400" />
    },
    {
      titulo: "Trabajo en Equipo",
      desc: "Fomentamos la empatía y la solidaridad. El grupo siempre está por encima del ego.",
      icon: <Users className="w-6 h-6 text-cyan-400" />
    },
    {
      titulo: "Superación",
      desc: "Ganas constantes de mejorar, vencer los miedos y superarse día a día.",
      icon: <Flame className="w-6 h-6 text-teal-300" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#060d19] text-slate-100 font-sans selection:bg-teal-400 selection:text-slate-950">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#060d19]/90 backdrop-blur-md border-b border-teal-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Campeones Lima Logo" 
              className="w-11 h-11 object-contain drop-shadow-[0_0_10px_rgba(20,184,166,0.3)]"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-white">
                  CAMPEONES <span className="text-amber-400">LIMA</span>
                </span>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 font-bold px-1.5 py-0.5 rounded border border-teal-500/30">
                  2015
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-1.5 bg-gradient-to-r from-red-600 via-white to-red-600 rounded-sm" />
                <p className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold">Club & Academia Deportiva</p>
              </div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <Link to="/" className="hover:text-teal-400 transition-colors">Inicio</Link>
            <Link to="/nosotros" className="text-teal-400 font-bold">Nosotros</Link>
            <a href="/#disciplinas" className="hover:text-teal-400 transition-colors">Disciplinas</a>
            <a href="/#sedes" className="hover:text-teal-400 transition-colors">Sedes</a>
            <a href="/#faq" className="hover:text-teal-400 transition-colors">Preguntas</a>
          </div>

          <a 
            href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola,%20deseo%20solicitar%20una%20clase%20de%20prueba`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-sm shadow-md shadow-teal-500/20 transition-all"
          >
            Clase de Prueba
          </a>
        </div>
      </nav>

      {/* HEADER DE PÁGINA */}
      <section className="relative pt-36 pb-20 bg-gradient-to-b from-[#0a182c] to-[#060d19] border-b border-teal-950/60 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d1f36] border border-teal-500/30 text-teal-300 text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" /> Nuestra Identidad e Historia
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Acerca de <span className="bg-gradient-to-r from-teal-300 to-amber-300 bg-clip-text text-transparent">Campeones Lima</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Más de una década formando atletas y educando personas con valores dentro y fuera de la cancha.
          </p>
        </div>
      </section>

      {/* HISTORIA DETALLADA */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#081322] border border-teal-900/40 rounded-3xl p-8 sm:p-14 shadow-2xl">
            <div className="flex items-center gap-2 text-xs font-extrabold text-teal-400 uppercase tracking-widest mb-3">
              <HeartHandshake className="w-4 h-4 text-amber-400" /> Trayectoria Desde 2015
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white mb-6">Nuestra Historia</h2>
            
            <div className="space-y-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              <p>
                <strong>Club Deportivo & Academia Campeones Lima</strong> fue fundado en el año <strong>2015</strong> en la ciudad de Lima con un propósito claro: democratizar el acceso a un entrenamiento deportivo de alta calidad técnica y con un profundo enfoque en valores humanos.
              </p>
              <p>
                Comenzamos con un pequeño grupo de niños apasionados por el básquetbol y el vóley en el Cercado de Lima. Con el paso de los años, gracias a la confianza de los padres de familia y al trabajo comprometido de nuestro cuerpo técnico, crecimos hasta consolidar múltiples sedes estratégicas en Lima (Mirones, Liceo Naval y Pueblo Libre).
              </p>
              <p>
                Hoy en día, más de 500 alumnos de todas las edades —desde semilleros de 5 años hasta categorías master de adultos— entrenan semanalmente en nuestras filas, participando con orgullo en torneos distritales, ligas federadas y festivales deportivos.
              </p>
            </div>

            {/* Cuadro Destacado */}
            <div className="mt-8 p-6 rounded-2xl bg-[#0d1f36] border border-teal-500/30 flex items-start gap-4">
              <Trophy className="w-8 h-8 text-amber-400 shrink-0 mt-1" />
              <div>
                <h3 className="text-base font-bold text-white">Nuestra Filosofía Central</h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  "No solo formamos al deportista que anota puntos o gana medallas; formamos a la persona disciplinada, resiliente y respetuosa que triunfará en cualquier reto de su vida."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISIÓN Y VISIÓN */}
      <section className="py-20 bg-[#040812] border-y border-teal-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Misión */}
            <div className="bg-[#081322] border border-teal-900/50 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-6 border border-teal-500/20">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-4">Misión Institucional</h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Brindar una formación integral deportiva de primer nivel en básquetbol, voleibol y fútbol, potenciando las capacidades técnicas, físicas y emocionales de nuestros deportistas mediante una pedagogía moderna basada en el esfuerzo, la constancia y el respeto mutuo.
              </p>
            </div>

            {/* Visión */}
            <div className="bg-[#081322] border border-teal-900/50 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-6 border border-amber-400/20">
                <Eye className="w-7 h-7" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-4">Visión de Futuro</h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Ser reconocidos como el club y academia deportiva formativa líder en el Perú, referente por la excelencia de sus entrenadores, la formación de deportistas de selección y el impacto social positivo en la juventud y las familias peruanas.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* VALORES */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-2">Código de Honor</h2>
            <p className="text-3xl sm:text-4xl font-black text-white">Nuestros Valores Fundamentales</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {valores.map((v, i) => (
              <div key={i} className="bg-[#081322] p-6 rounded-2xl border border-teal-950 hover:border-teal-500/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#0d1f36] flex items-center justify-center mb-5 border border-teal-900/50">
                  {v.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{v.titulo}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* METODOLOGÍA / PILARES */}
      <section className="py-20 bg-[#040812] border-t border-teal-950/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-2">Excelencia Pedagógica</h2>
            <p className="text-3xl sm:text-4xl font-black text-white">Pilares de Nuestro Entrenamiento</p>
          </div>

          <div className="space-y-4">
            {pilares.map((p, idx) => (
              <div key={idx} className="bg-[#081322] border border-teal-950/80 rounded-2xl p-6 sm:p-8 flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-teal-400 shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-white">{p.titulo}</h3>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-b from-[#0a182c] to-[#081322] border border-teal-900/50 rounded-3xl p-10 sm:p-14 shadow-2xl">
            <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-black text-white">¿Listo para ser un Campeón?</h2>
            <p className="text-sm sm:text-base text-slate-300 mt-3 max-w-xl mx-auto">
              Únete a nuestra familia deportiva. Solicita una clase de prueba gratuita en cualquiera de nuestras sedes.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola%20Campeones%20Lima,%20leí%20su%20historia%20y%20deseo%20inscribirme`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-black px-8 py-4 rounded-xl shadow-lg shadow-teal-500/20 text-sm"
              >
                <MessageCircle className="w-5 h-5 fill-slate-950" />
                Contactar por WhatsApp
              </a>
              <Link 
                to="/"
                className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-4 rounded-xl border border-slate-800 text-sm"
              >
                Volver al Inicio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#03060c] border-t border-teal-950/60 py-10 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Logo Campeones Lima" 
              className="w-8 h-8 object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div>
              <p className="font-black text-white text-sm">CAMPEONES LIMA</p>
              <p className="text-[11px] text-slate-500">Club & Academia Deportiva · Desde 2015</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-slate-300">
            <Link to="/" className="hover:text-teal-400">Inicio</Link>
            <Link to="/nosotros" className="text-teal-400 font-bold">Nosotros</Link>
            <a 
              href={`https://wa.me/${WHATSAPP_PHONE}`} 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-teal-400 flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-teal-400" /> +51 963 896 985
            </a>
          </div>

          <p className="text-slate-600 text-center md:text-right">
            © {new Date().getFullYear()} Campeones Lima. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {/* BOTÓN FLOTANTE DE WHATSAPP */}
      <a
        href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola%20Campeones%20Lima,%20deseo%20más%20información`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba59] text-white p-4 rounded-full shadow-2xl shadow-green-500/30 flex items-center justify-center transition-all transform hover:scale-110 active:scale-95"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-white stroke-none" />
      </a>

    </div>
  );
}