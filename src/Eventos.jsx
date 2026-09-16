import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  FileText, 
  MessageCircle
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useTheme } from './theme';
import { supabase } from './supabase';

export default function EventosPage() {
  const { esOscuro } = useTheme();
  const WHATSAPP_PHONE = "51963896985";

  const [eventos, setEventos] = useState([]);
  const [detallesEventos, setDetallesEventos] = useState({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const [resEv, resDet] = await Promise.all([
          supabase.from('eventos').select('*').eq('visible', true).order('created_at', { ascending: false }),
          supabase.from('configuracion_web').select('valor').eq('clave', 'eventos_detalles').maybeSingle()
        ]);
        if (resEv.data) setEventos(resEv.data);
        if (resDet.data?.valor) setDetallesEventos(resDet.data.valor);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${esOscuro ? 'bg-[#040914] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar />

      <header className="pt-24 sm:pt-36 pb-12 text-center border-b border-slate-800">
        <h1 className="text-3xl sm:text-5xl font-black text-white">Eventos, Festivales & Torneos</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
          Competencias deportivas y formativas de Básquetbol y Voleibol organizadas por Campeones Lima.
        </p>
      </header>

      <main className="py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* SKELETON LOADERS */}
        {cargando ? (
          <div className="grid sm:grid-cols-2 gap-8">
            {Array.from({ length: 4 }).map((_, n) => (
              <div key={n} className="border border-slate-800 bg-[#071527] rounded-3xl overflow-hidden p-6 space-y-4 animate-pulse">
                <div className="w-full h-44 rounded-2xl bg-slate-800/60" />
                <div className="h-5 bg-slate-800/60 rounded w-2/3" />
                <div className="h-4 bg-slate-800/60 rounded w-1/2" />
                <div className="h-10 bg-slate-800/60 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : eventos.length === 0 ? (
          <div className="p-12 text-center bg-[#071527] rounded-3xl border border-slate-800 text-slate-400 text-xs">
            Próximamente publicaremos el calendario de torneos de este ciclo.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-8">
            {eventos.map((ev) => {
              const foto = ev.imagenes && ev.imagenes[0];
              const detalles = detallesEventos[ev.id] || {};
              const esVoley = ev.tipo?.toLowerCase().includes('voley');

              return (
                <div key={ev.id} className="bg-[#071527] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
                  <div>
                    {foto && (
                      <div className="relative w-full aspect-video bg-black">
                        <img src={foto} alt={ev.titulo} className="w-full h-full object-cover" />
                        <span className={`absolute top-3 left-3 text-xs font-black px-3 py-1 rounded-full shadow ${esVoley ? 'bg-[#00B4A7] text-slate-950' : 'bg-[#F7B52C] text-slate-950'}`}>
                          {esVoley ? "🏐 VOLEIBOL" : "🏀 BÁSQUETBOL"}
                        </span>
                      </div>
                    )}

                    <div className="p-6 space-y-3">
                      <h2 className="text-xl font-black text-white">{ev.titulo}</h2>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5"><CalendarIcon className="w-4 h-4 text-[#00B4A7]" /> {ev.fecha} ({ev.hora})</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#F7B52C]" /> {ev.sede}</p>

                      {ev.categorias && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {ev.categorias.map((c, i) => (
                            <span key={i} className="text-[10px] font-bold bg-[#040914] text-slate-300 border border-slate-800 px-2.5 py-1 rounded-lg">{c}</span>
                          ))}
                        </div>
                      )}

                      {detalles.reglamento && (
                        <a 
                          href={detalles.reglamento.dataUrl} 
                          download={detalles.reglamento.nombre}
                          className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 bg-purple-950/40 border border-purple-500/30 px-3.5 py-2 rounded-xl"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Descargar Reglamento del Torneo e Indicaciones</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <a
                      href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola%20Campeones%20Lima,%20deseo%20inscribir%20a%20mi%20equipo%20en%20el%20torneo:%20${encodeURIComponent(ev.titulo)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 font-black py-3 rounded-xl text-xs transition-all"
                    >
                      <MessageCircle className="w-4 h-4" /> Inscribir Equipo por WhatsApp
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}