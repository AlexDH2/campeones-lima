import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Trophy, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  ShieldCheck, 
  Target, 
  Flame, 
  Award, 
  ExternalLink, 
  Phone, 
  Sparkles, 
  Calendar,
  ShoppingBag,
  Briefcase
} from 'lucide-react';
import Nosotros from './Nosotros';
import SedesPage from './Sedes';
import EventosPage from './Eventos';
import TiendaPage from './Tienda';
import TrabajaConNosotros from './TrabajaConNosotros';
import AdminDashboard from './Admin';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Inicio() {
  const WHATSAPP_PHONE = "51963896985";
  const [openFaq, setOpenFaq] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    edad: '',
    disciplina: 'Básquetbol',
    sede: 'Mirones / Complejo Tito Drago',
    telefono: ''
  });

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Busca la función handleFormSubmit en src/App.jsx y cámbiala por esta:
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // 1. Guardar prospecto en Supabase para el Excel del Admin
      await supabase.from('prospectos').insert([{
        nombre_alumno: formData.nombre,
        edad: parseInt(formData.edad) || null,
        disciplina: formData.disciplina,
        sede: formData.sede,
        telefono_apoderado: formData.telefono,
        estado: 'Pendiente'
      }]);
    } catch (error) {
      console.error("Error al registrar prospecto:", error);
    }

    // 2. Redirigir a WhatsApp con el mensaje listo
    const mensaje = `¡Hola Campeones Lima! Vengo desde la web. Quisiera coordinar mi clase de prueba:%0A%0A` +
      `👤 *Alumno:* ${encodeURIComponent(formData.nombre)}%0A` +
      `🎂 *Edad:* ${formData.edad} años%0A` +
      `🏀 *Deporte:* ${encodeURIComponent(formData.disciplina)}%0A` +
      `📍 *Sede:* ${encodeURIComponent(formData.sede)}%0A` +
      `📱 *Teléfono:* ${formData.telefono}`;
    
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${mensaje}`, '_blank');
  };

  const sedes = [
    {
      nombre: "Sede Mirones / Complejo Tito Drago",
      distrito: "Cercado de Lima",
      direccion: "Av. Colonial / Mirones",
      disciplinas: ["Básquet", "Vóley", "Fútbol"],
      horarios: "Lun, Mié y Vie: 4:00 PM - 8:00 PM | Sáb: 8:00 AM - 1:00 PM",
      maps: "https://maps.google.com/?q=Complejo+Deportivo+Tito+Drago+Mirones"
    },
    {
      nombre: "Sede Liceo Naval",
      distrito: "San Miguel / Callao",
      direccion: "Av. Venezuela cdra 34",
      disciplinas: ["Básquet", "Vóley"],
      horarios: "Mar y Jue: 4:30 PM - 7:30 PM | Sáb: 9:00 AM - 12:00 PM",
      maps: "https://maps.google.com/?q=Liceo+Naval+Contralmirante+Montero"
    },
    {
      nombre: "Sede I.E. Libertador",
      distrito: "Pueblo Libre / Breña",
      direccion: "Av. Brasil",
      disciplinas: ["Vóley", "Fútbol Menores"],
      horarios: "Mar, Jue y Sáb: 3:30 PM - 7:00 PM",
      maps: "https://maps.google.com/?q=Lima+Peru"
    }
  ];

  const faqs = [
    {
      q: "¿Se requiere experiencia previa para ingresar a la academia?",
      a: "No. Contamos con grupos formativos desde nivel iniciación hasta selecciones competitivas para torneos oficiales."
    },
    {
      q: "¿A partir de qué edad pueden inscribirse?",
      a: "Recibimos alumnos desde los 5 años en categorías Kids, formativos para jóvenes de 12 a 17 años y grupos especiales para adultos."
    },
    {
      q: "¿Cómo solicito mi primera clase de prueba?",
      a: "Completa el formulario en esta página o haz clic en el botón de WhatsApp para coordinar el día y horario de tu evaluación sin costo."
    },
    {
      q: "¿Dónde puedo adquirir el uniforme oficial?",
      a: "Puedes solicitarlo directamente en nuestra Tienda Web o a través de los profesores encargados en tu sede de entrenamiento."
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

          {/* Menú de Enlaces Completo */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link to="/nosotros" className="hover:text-teal-400 transition-colors font-semibold">Nosotros</Link>
            <Link to="/sedes" className="hover:text-teal-400 transition-colors font-semibold">Sedes</Link>
            <Link to="/eventos" className="hover:text-teal-400 transition-colors font-semibold">Eventos</Link>
            <Link to="/tienda" className="hover:text-teal-400 transition-colors font-semibold">Tienda</Link>
            <Link to="/trabaja" className="hover:text-teal-400 transition-colors font-semibold">Trabaja con Nosotros</Link>
          </div>

          <a 
            href="#inscripcion" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-sm shadow-md shadow-teal-500/20 transition-all transform active:scale-95"
          >
            Clase de Prueba
          </a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[200px] bg-amber-400/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0a1526] border border-teal-500/30 text-teal-300 text-xs font-semibold mb-8 shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400" /> Formando Campeones desde el 2015 en Lima
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Forjamos Atletas con Pasión, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-teal-300 via-cyan-400 to-amber-300 bg-clip-text text-transparent">
              Desarrollamos Campeones
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Academia formativa y de alto rendimiento en <strong className="text-teal-300">Básquetbol</strong>, <strong className="text-teal-300">Voleibol</strong> y <strong className="text-teal-300">Fútbol</strong> para niños, jóvenes y adultos.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a 
              href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola%20Campeones%20Lima,%20deseo%20inscribirme%20y%20conocer%20las%20vacantes`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-black px-7 py-4 rounded-2xl shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 transition-all text-base transform active:scale-95"
            >
              <MessageCircle className="w-5 h-5 fill-slate-950" />
              Inscribirme por WhatsApp
            </a>
            <Link 
              to="/sedes" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0c1a2f] hover:bg-[#11233f] text-slate-200 font-bold px-7 py-4 rounded-2xl border border-teal-900/60 hover:border-teal-500/40 transition-all text-base"
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              Sedes y Horarios
            </Link>
            <Link 
              to="/tienda" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0c1a2f] hover:bg-[#11233f] text-teal-300 font-bold px-7 py-4 rounded-2xl border border-teal-500/30 hover:border-teal-400 transition-all text-base"
            >
              <ShoppingBag className="w-4 h-4 text-teal-400" />
              Tienda Oficial
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-slate-800/80 pt-10 text-slate-400 text-sm">
            <div className="bg-[#081322]/60 p-4 rounded-xl border border-slate-800">
              <span className="text-2xl font-black text-amber-400 block">+11 Años</span>
              <span>De Trayectoria</span>
            </div>
            <div className="bg-[#081322]/60 p-4 rounded-xl border border-slate-800">
              <span className="text-2xl font-black text-teal-300 block">+500</span>
              <span>Alumnos Activos</span>
            </div>
            <div className="bg-[#081322]/60 p-4 rounded-xl border border-slate-800">
              <span className="text-2xl font-black text-cyan-400 block">3</span>
              <span>Disciplinas Oficiales</span>
            </div>
            <div className="bg-[#081322]/60 p-4 rounded-xl border border-slate-800">
              <span className="text-2xl font-black text-white block">100%</span>
              <span>Formación en Valores</span>
            </div>
          </div>
        </div>
      </section>

      {/* METODOLOGÍA */}
      <section id="metodologia" className="py-20 bg-[#040812] border-y border-teal-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-2">Pilares de Formación</h2>
            <p className="text-3xl sm:text-4xl font-black text-white">Nuestra Metodología</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#081322] p-6 rounded-2xl border border-teal-950">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4 border border-teal-500/20">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Técnica Correcta</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Fundamentos sólidos para aprender con seguridad, precisión y eficacia.</p>
            </div>

            <div className="bg-[#081322] p-6 rounded-2xl border border-teal-950">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-4 border border-amber-400/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Valores y Disciplina</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Respeto, compañerismo y mentalidad ganadora para la vida.</p>
            </div>

            <div className="bg-[#081322] p-6 rounded-2xl border border-teal-950">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4 border border-teal-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Preparación Física</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Resistencia, velocidad y coordinación motriz adaptada a cada categoría.</p>
            </div>

            <div className="bg-[#081322] p-6 rounded-2xl border border-teal-950">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-4 border border-amber-400/20">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Ligas y Torneos</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Competencia sana para medir el avance constante del alumno.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FORMULARIO */}
      <section id="inscripcion" className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-b from-[#0a182c] to-[#060d19] border border-teal-900/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center mb-8">
              <span className="text-xs font-extrabold uppercase text-amber-400 tracking-wider">¡Vacantes Limitadas!</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Solicita tu Clase de Prueba</h2>
              <p className="text-xs text-slate-400 mt-2">Completa los datos y te responderemos por WhatsApp para coordinar tu horario.</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nombre del alumno</label>
                <input 
                  type="text"
                  required
                  placeholder="Ej. Mateo Dioses"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full bg-[#060d19] border border-slate-800 focus:border-teal-400 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Edad del alumno</label>
                  <input 
                    type="number"
                    required
                    placeholder="Ej. 12"
                    min="4"
                    max="60"
                    value={formData.edad}
                    onChange={(e) => setFormData({...formData, edad: e.target.value})}
                    className="w-full bg-[#060d19] border border-slate-800 focus:border-teal-400 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Disciplina</label>
                  <select 
                    value={formData.disciplina}
                    onChange={(e) => setFormData({...formData, disciplina: e.target.value})}
                    className="w-full bg-[#060d19] border border-slate-800 focus:border-teal-400 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                  >
                    <option value="Básquetbol">Básquetbol</option>
                    <option value="Voleibol">Voleibol</option>
                    <option value="Fútbol">Fútbol Menores</option>
                    <option value="Adultos Master">Adultos / Master</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sede Preferida</label>
                  <select 
                    value={formData.sede}
                    onChange={(e) => setFormData({...formData, sede: e.target.value})}
                    className="w-full bg-[#060d19] border border-slate-800 focus:border-teal-400 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                  >
                    <option value="Mirones / Complejo Tito Drago">Sede Mirones (Tito Drago)</option>
                    <option value="Liceo Naval / San Miguel">Sede Liceo Naval</option>
                    <option value="I.E. Libertador / Pueblo Libre">Sede I.E. Libertador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">WhatsApp de Contacto</label>
                  <input 
                    type="tel"
                    required
                    placeholder="Ej. 987654321"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    className="w-full bg-[#060d19] border border-slate-800 focus:border-teal-400 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full mt-6 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-black py-4 rounded-xl shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2 transform active:scale-98"
              >
                <MessageCircle className="w-5 h-5 fill-slate-950" />
                Enviar Solicitud a WhatsApp
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-[#040812] border-t border-teal-950/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-2">Preguntas</h2>
            <p className="text-3xl font-black text-white">Preguntas Frecuentes</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-[#081322] border border-teal-950 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between font-bold text-sm text-white hover:text-teal-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-teal-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#03060c] border-t border-teal-950/60 py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Logo Campeones Lima" 
              className="w-8 h-8 object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div>
              <p className="font-black text-white text-sm tracking-tight">CAMPEONES LIMA</p>
              <p className="text-[11px] text-slate-500">Club & Academia Deportiva · Desde 2015</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-slate-300">
            <Link to="/nosotros" className="hover:text-teal-400">Nosotros</Link>
            <Link to="/sedes" className="hover:text-teal-400">Sedes</Link>
            <Link to="/eventos" className="hover:text-teal-400">Eventos</Link>
            <Link to="/tienda" className="hover:text-teal-400">Tienda</Link>
            <Link to="/trabaja" className="hover:text-teal-400">Trabaja con Nosotros</Link>
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

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/sedes" element={<SedesPage />} />
        <Route path="/eventos" element={<EventosPage />} />
        <Route path="/tienda" element={<TiendaPage />} />
        <Route path="/trabaja" element={<TrabajaConNosotros />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}