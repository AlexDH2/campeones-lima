import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Phone, 
  Sparkles, 
  Flame, 
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { supabase } from './supabase';

export default function EventosPage() {
  const WHATSAPP_PHONE = "51963896985";
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const location = useLocation();
  const vieneDeAdmin = new URLSearchParams(location.search).get('from') === 'admin';

  useEffect(() => {
    async function cargarEventos() {
      try {
        const { data, error } = await supabase
          .from('eventos')
          .select('*')
          .eq('visible', true)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setEventos(data);
        }
      } catch (err) {
        console.error("Error al cargar eventos:", err);
      } finally {
        setCargando(false);
      }
    }
    cargarEventos();
  }, []);

  const eventosFiltrados = eventos.filter((ev) => {
    if (categoriaFiltro === 'todos') return true;
    return ev.tipo === categoriaFiltro;
  });

  return (
    <div className="min-h-screen bg-[#060d19] text-slate-100 font-sans selection:bg-teal-400 selection:text-slate-950">
      
      {vieneDeAdmin && (
        <div className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-amber-500 via-teal-500 to-cyan-500 text-slate-950 px-4 py-2 text-xs font-black flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Modo Previsualización: Eventos en vivo
          </div>
          <Link 
            to="/admin" 
            className="bg-slate-950 hover:bg-slate-900 text-white px-3.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver al Panel de Admin
          </Link>
        </div>
      )}

      {/* NAVBAR */}
      <nav className={`fixed left-0 w-full z-40 bg-[#060d19]/90 backdrop-blur-md border-b border-teal-950/60 transition-all ${vieneDeAdmin ? 'top-8' : 'top-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-11 h-11 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-white">CAMPEONES <span className="text-amber-400">LIMA</span></span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Club & Academia Deportiva</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <Link to="/" className="hover:text-teal-400 transition-colors">Inicio</Link>
            <Link to="/nosotros" className="hover:text-teal-400 transition-colors">Nosotros</Link>
            <Link to="/sedes" className="hover:text-teal-400 transition-colors">Sedes</Link>
            <Link to="/eventos" className="text-teal-400 font-bold">Eventos</Link>
            <Link to="/tienda" className="hover:text-teal-400 transition-colors">Tienda</Link>
            <Link to="/trabaja" className="hover:text-teal-400 transition-colors">Trabaja con Nosotros</Link>
          </div>

          <a 
            href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola,%20deseo%20inscribirme%20en%20los%20eventos`}
            target="_blank"
            rel="noreferrer"
            className="bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-sm"
          >
            Inscripción
          </a>
        </div>
      </nav>

      {/* HEADER */}
      <section className={`pb-16 text-center ${vieneDeAdmin ? 'pt-44' : 'pt-36'}`}>
        <h1 className="text-4xl sm:text-6xl font-black text-white">Eventos y <span className="text-teal-300">Torneos</span></h1>
        <p className="mt-4 text-slate-300 text-sm">Calendario de competencias oficiales, festivales y copas de Campeones Lima.</p>
      </section>

      {/* FILTROS */}
      <section className={`py-6 bg-[#040812] border-b border-teal-950/40 sticky z-30 backdrop-blur-md bg-opacity-95 ${vieneDeAdmin ? 'top-28' : 'top-20'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { id: 'todos', label: '🏆 Todos los Eventos' },
              { id: 'voley', label: '🏐 Festivales de Vóley' },
              { id: 'basquet', label: '🏀 Copas de Básquetbol' },
              { id: 'multideporte', label: '⚽ Torneos Relámpago' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setCategoriaFiltro(f.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  categoriaFiltro === f.id
                    ? 'bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 shadow-md shadow-teal-500/20'
                    : 'bg-[#0a182b] text-slate-400 hover:text-white border border-teal-950'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTOS DESDE SUPABASE */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {cargando ? (
            <div className="text-center py-20">
              <Loader2 className="w-10 h-10 text-teal-400 animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-400">Cargando calendario de eventos...</p>
            </div>
          ) : eventosFiltrados.length === 0 ? (
            /* ESTADO VACÍO (SIN DATOS FALSOS) */
            <div className="text-center py-20 bg-[#081322] border border-slate-800 rounded-3xl p-8 max-w-md mx-auto">
              <Calendar className="w-12 h-12 text-teal-400/50 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">Próximos torneos en preparación</h3>
              <p className="text-xs text-slate-400 mb-6">Estamos organizando las próximas fechas de festivales y torneos. Mantente atento a nuestras redes o consulta por WhatsApp.</p>
              <a 
                href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola%20Campeones%20Lima,%20deseo%20información%20sobre%20los%20próximos%20torneos`}
                target="_blank"
                rel="noreferrer"
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs"
              >
                Preguntar por WhatsApp
              </a>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {eventosFiltrados.map((ev) => (
                <div key={ev.id} className="bg-[#081322] border border-teal-900/40 rounded-3xl p-7 flex flex-col justify-between shadow-2xl">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full border bg-teal-500/10 text-teal-300 border-teal-500/30">
                        {ev.estado}
                      </span>
                      <span className="text-xs font-bold text-amber-400 capitalize">{ev.tipo}</span>
                    </div>

                    <h2 className="text-2xl font-black text-white mb-2">{ev.titulo}</h2>
                    <p className="text-xs sm:text-sm text-slate-300 mb-6">{ev.descripcion}</p>

                    <div className="space-y-2 border-t border-slate-800 pt-4 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-teal-400" />
                        <span className="font-bold text-white">{ev.fecha}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>{ev.hora}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        <span>{ev.sede}</span>
                      </div>
                    </div>

                    {ev.categorias && ev.categorias.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                        {ev.categorias.map((cat, i) => (
                          <span key={i} className="text-[11px] bg-[#0d1f36] text-teal-200 px-2.5 py-0.5 rounded border border-teal-950">
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-400" /> {ev.cupos}
                    </span>
                    <a
                      href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola%20Campeones%20Lima,%20deseo%20inscribirme%20en:%20${encodeURIComponent(ev.titulo)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs"
                    >
                      Inscribirse
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#03060c] border-t border-teal-950/60 py-10 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <div>
              <p className="font-black text-white text-sm">CAMPEONES LIMA</p>
              <p className="text-[11px] text-slate-500">Club & Academia Deportiva · Desde 2015</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-slate-300">
            <Link to="/" className="hover:text-teal-400">Inicio</Link>
            <Link to="/nosotros" className="hover:text-teal-400">Nosotros</Link>
            <Link to="/sedes" className="hover:text-teal-400">Sedes</Link>
            <Link to="/eventos" className="text-teal-400 font-bold">Eventos</Link>
            <Link to="/tienda" className="hover:text-teal-400">Tienda</Link>
            <a href={`https://wa.me/${WHATSAPP_PHONE}`} target="_blank" rel="noreferrer" className="hover:text-teal-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-teal-400" /> +51 963 896 985
            </a>
          </div>
          <p className="text-slate-600 text-center md:text-right">© {new Date().getFullYear()} Campeones Lima.</p>
        </div>
      </footer>
    </div>
  );
}