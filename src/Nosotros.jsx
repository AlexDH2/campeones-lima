import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Target, 
  ShieldCheck, 
  Award, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  Medal, 
  ArrowRight, 
  Camera, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Star, 
  MapPin, 
  Share2 
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useTheme } from './theme';
import { supabase } from './supabase';

const CONTENIDO_BASE = {
  foto_basquet: "",
  foto_voley: "",
  logros: [],
  galeria: []
};

export default function Nosotros() {
  const { esOscuro = true } = useTheme();
  const [seccionActiva, setSeccionActiva] = useState('historia');
  const [datosClub, setDatosClub] = useState(CONTENIDO_BASE);

  // Visor Lightbox
  const [fotoLightboxIdx, setFotoLightboxIdx] = useState(null);

  useEffect(() => {
    async function cargarDatosReales() {
      try {
        const { data } = await supabase.from('configuracion_web').select('valor').eq('clave', 'nosotros_contenido').maybeSingle();
        if (data?.valor) {
          setDatosClub({
            foto_basquet: data.valor.foto_basquet || "",
            posicion_basquet: data.valor.posicion_basquet ?? 50,
            posicion_voley: data.valor.posicion_voley ?? 50,
            foto_voley: data.valor.foto_voley || "",
            logros: Array.isArray(data.valor.logros) ? data.valor.logros : [],
            galeria: Array.isArray(data.valor.galeria) ? data.valor.galeria : []
          });
        }
      } catch (err) {
        console.error("Error al cargar datos de Nosotros:", err);
      }
    }
    cargarDatosReales();
  }, []);

  const tabs = [
    { id: 'historia', label: 'Nuestra Historia', icon: Calendar },
    { id: 'disciplinas', label: 'Disciplinas & Playbook', icon: Trophy },
    { id: 'palmares', label: 'Vitrina de Copas & Galería', icon: Medal },
    { id: 'mision', label: 'Misión, Visión & Valores', icon: Target },
  ];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 relative overflow-hidden ${
      esOscuro ? 'bg-[#040914] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <Navbar />

      {/* MARCA DE AGUA VECTORIAL DUAL */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.045] select-none overflow-hidden z-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20%" cy="30%" r="280" fill="none" stroke="#F7B52C" strokeWidth="2" strokeDasharray="8 8" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#00B4A7" strokeWidth="3" strokeDasharray="6 6" />
          <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#00B4A7" strokeWidth="2" strokeDasharray="8 8" />
          <circle cx="80%" cy="30%" r="220" fill="none" stroke="#00B4A7" strokeWidth="2" strokeDasharray="6 6" />
        </svg>
      </div>

      <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-[#F7B52C]/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-[#00B4A7]/20 rounded-full blur-[160px] pointer-events-none" />

      {/* LIGHTBOX DE FOTOS REALES */}
      {fotoLightboxIdx !== null && datosClub.galeria[fotoLightboxIdx] && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col items-center justify-center p-4 animate-in fade-in">
          <button
            onClick={() => setFotoLightboxIdx(null)}
            className="absolute top-5 right-5 text-white/70 hover:text-white p-2.5 rounded-full bg-slate-900/80 cursor-pointer transition-colors"
          >
            <X className="w-7 h-7" />
          </button>

          <div className="relative max-w-4xl max-h-[85vh] flex items-center justify-center">
            <img 
              src={datosClub.galeria[fotoLightboxIdx]} 
              alt="Foto ampliada" 
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-slate-800" 
            />

            {datosClub.galeria.length > 1 && (
              <>
                <button
                  onClick={() => setFotoLightboxIdx(prev => prev === 0 ? datosClub.galeria.length - 1 : prev - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-black/80 hover:bg-[#00B4A7] hover:text-slate-950 text-white rounded-full transition-all cursor-pointer shadow-lg"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setFotoLightboxIdx(prev => (prev + 1) % datosClub.galeria.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-black/80 hover:bg-[#00B4A7] hover:text-slate-950 text-white rounded-full transition-all cursor-pointer shadow-lg"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <p className="text-slate-400 text-xs mt-3 font-mono">
            Foto {fotoLightboxIdx + 1} de {datosClub.galeria.length}
          </p>
        </div>
      )}

      {/* HEADER */}
      <header className="pt-24 sm:pt-36 pb-10 text-center border-b border-slate-800 bg-[#071527]/70 relative overflow-hidden backdrop-blur-md z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 space-y-4">

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white italic drop-shadow-[0_4px_25px_rgba(0,0,0,0.9)]">
            NUESTRA IDENTIDAD & TRAYECTORIA
          </h1>

          <p className="mt-2 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed text-slate-300 font-medium">
            Más de una década formando atletas de alto rendimiento en coliseos techados de Lima. Disciplina, técnica de juego y valores competitivos.
          </p>
        </div>
      </header>

      {/* MARCADOR LED DIGITAL (MÉTRICAS OFICIALES DEL CLUB) */}
      <section className="border-b-2 border-slate-800 bg-[#071527] py-6 sm:py-8 relative z-10 shadow-2xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="p-3 sm:p-4 rounded-3xl bg-[#040914] border-2 border-slate-800 shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-[#071527] border border-[#F7B52C]/30 shadow relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#F7B52C]" />
                <p className="text-3xl sm:text-4xl font-black text-[#F7B52C] font-mono tracking-tight">+11</p>
                <p className="text-[10px] sm:text-xs text-slate-300 font-black uppercase tracking-wider mt-1">Años de Trayectoria</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#071527] border border-[#00B4A7]/30 shadow relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#00B4A7]" />
                <p className="text-3xl sm:text-4xl font-black text-[#00B4A7] font-mono tracking-tight">+4,000</p>
                <p className="text-[10px] sm:text-xs text-slate-300 font-black uppercase tracking-wider mt-1">Atletas Formados</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#071527] border border-cyan-400/30 shadow relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400" />
                <p className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono tracking-tight">+6,766</p>
                <p className="text-[10px] sm:text-xs text-slate-300 font-black uppercase tracking-wider mt-1">Comunidad en Redes</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#071527] border border-white/20 shadow relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-white" />
                <p className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">6 SEDES</p>
                <p className="text-[10px] sm:text-xs text-slate-300 font-black uppercase tracking-wider mt-1">Coliseos Techados</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 PESTAÑAS */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 relative z-10">
        <div className="p-1.5 rounded-2xl bg-[#071527] border border-slate-800 flex items-center justify-start md:justify-center gap-2 overflow-x-auto shadow-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const activo = seccionActiva === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setSeccionActiva(tab.id)}
                className={`shrink-0 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer border whitespace-nowrap ${
                  activo
                    ? 'bg-[#00B4A7] text-slate-950 border-[#00B4A7] shadow-lg shadow-[#00B4A7]/30 scale-105'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-[#040914]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${activo ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* CONTENIDO DE LAS PESTAÑAS */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 pb-24 space-y-12 relative z-10">
        
        {/* 1. HISTORIA */}
        {seccionActiva === 'historia' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div className="text-center max-w-2xl mx-auto space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#F7B52C] bg-[#F7B52C]/10 px-3 py-1 rounded-full border border-[#F7B52C]/30">
                Línea de Tiempo Oficial
              </span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase text-white italic">
                El Partido de los +11 Años
              </h2>
            </div>

            <div className="relative border-l-4 border-slate-800 ml-4 sm:ml-8 space-y-8 pl-6 sm:pl-10">
              <div className="relative p-5 rounded-2xl bg-[#071527] border border-slate-800 shadow-xl space-y-2">
                <div className="absolute -left-[35px] sm:-left-[51px] top-4 w-7 h-7 rounded-full bg-[#F7B52C] border-4 border-[#040914] shadow-md flex items-center justify-center font-black text-[10px] text-slate-950">1Q</div>
                <span className="text-xs font-black text-[#F7B52C] font-mono bg-[#F7B52C]/10 px-2.5 py-0.5 rounded">2015 · Salto Inicial</span>
                <h3 className="text-lg font-black text-white">Fundación de Campeones Lima</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Iniciamos con entrenamientos formativos de básquetbol y vóley, priorizando la biomecánica, el respeto arbitral y la inclusión deportiva desde los 6 años.
                </p>
              </div>

              <div className="relative p-5 rounded-2xl bg-[#071527] border border-slate-800 shadow-xl space-y-2">
                <div className="absolute -left-[35px] sm:-left-[51px] top-4 w-7 h-7 rounded-full bg-[#00B4A7] border-4 border-[#040914] shadow-md flex items-center justify-center font-black text-[10px] text-slate-950">2Q</div>
                <span className="text-xs font-black text-[#00B4A7] font-mono bg-[#00B4A7]/10 px-2.5 py-0.5 rounded">2018 · Expansión Oficial</span>
                <h3 className="text-lg font-black text-white">Llegada a Coliseos Techados de Élite</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Damos el salto al Coliseo del Liceo Naval en San Miguel, garantizando canchas techadas con tableros de vidrio profesionales y piso cuidado.
                </p>
              </div>

              <div className="relative p-5 rounded-2xl bg-[#071527] border border-slate-800 shadow-xl space-y-2">
                <div className="absolute -left-[35px] sm:-left-[51px] top-4 w-7 h-7 rounded-full bg-cyan-400 border-4 border-[#040914] shadow-md flex items-center justify-center font-black text-[10px] text-slate-950">3Q</div>
                <span className="text-xs font-black text-cyan-400 font-mono bg-cyan-400/10 px-2.5 py-0.5 rounded">2022 · Competencia Oficial</span>
                <h3 className="text-lg font-black text-white">Podios y Copas Metropolitanas</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Debut de nuestras selecciones en torneos oficiales y festivales inter-academias, logrando campeonatos invictos en categorías U14 y subcampeonatos en vóley infantil.
                </p>
              </div>

              <div className="relative p-5 rounded-2xl bg-[#071527] border-2 border-[#F7B52C] shadow-2xl space-y-2">
                <div className="absolute -left-[35px] sm:-left-[51px] top-4 w-7 h-7 rounded-full bg-[#F7B52C] border-4 border-[#040914] shadow-md flex items-center justify-center font-black text-[10px] text-slate-950">🏆</div>
                <span className="text-xs font-black text-slate-950 bg-[#F7B52C] px-2.5 py-0.5 rounded font-mono">2026 · Presente</span>
                <h3 className="text-lg font-black text-white">+4,000 Atletas y 6 Sedes</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Consolidación como una de las academias formativas líderes de Lima, con una comunidad de más de 6,766 seguidores y presencia en 6 coliseos techados reglamentarios.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. DISCIPLINAS */}
        {seccionActiva === 'disciplinas' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div className="text-center max-w-2xl mx-auto space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00B4A7] bg-[#00B4A7]/10 px-3 py-1 rounded-full border border-[#00B4A7]/30">
                Playbook Técnico
              </span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase text-white italic">Fundamentos en Cancha</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* BÁSQUETBOL */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#071527] border-2 border-[#F7B52C]/50 space-y-5 shadow-2xl flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <span className="text-xs font-black text-[#F7B52C] uppercase tracking-wider">🏀 Ficha Técnica Básquetbol</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-[#040914] px-2.5 py-0.5 rounded border border-slate-800">FIBA</span>
                  </div>
                  <h3 className="text-2xl font-black text-white italic uppercase">Básquetbol Formativo</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Mecánica de tiro, drible dinámico ambidiestro y lectura defensiva con tableros de vidrio y balones oficiales Molten.
                  </p>
                  <div className="space-y-3 pt-2">
                    <div>
                      <div className="flex justify-between text-[11px] font-black text-slate-300 mb-1">
                        <span>Mecánica de Tiro & Drible</span><span className="text-[#F7B52C]">100%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#040914] overflow-hidden"><div className="w-full h-full bg-[#F7B52C]" /></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] font-black text-slate-300 mb-1">
                        <span>Visión Táctica de Cancha</span><span className="text-[#F7B52C]">95%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#040914] overflow-hidden"><div className="w-[95%] h-full bg-[#F7B52C]" /></div>
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <Link to="/sedes" className="w-full py-3.5 rounded-xl bg-[#F7B52C] hover:bg-[#e6a524] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg">
                    <span>Ver Sedes con Básquet</span><ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* VOLEIBOL */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#071527] border-2 border-[#00B4A7]/50 space-y-5 shadow-2xl flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <span className="text-xs font-black text-[#00B4A7] uppercase tracking-wider">🏐 Ficha Técnica Voleibol</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-[#040914] px-2.5 py-0.5 rounded border border-slate-800">FPV</span>
                  </div>
                  <h3 className="text-2xl font-black text-white italic uppercase">Voleibol Técnico</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Voleo de colocación, recepción baja con antebrazo, saques de potencia y bloqueo en red oficial para todas las edades.
                  </p>
                  <div className="space-y-3 pt-2">
                    <div>
                      <div className="flex justify-between text-[11px] font-black text-slate-300 mb-1">
                        <span>Técnica de Voleo & Recepción</span><span className="text-[#00B4A7]">100%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#040914] overflow-hidden"><div className="w-full h-full bg-[#00B4A7]" /></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] font-black text-slate-300 mb-1">
                        <span>Saque & Coordinación en Red</span><span className="text-[#00B4A7]">95%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#040914] overflow-hidden"><div className="w-[95%] h-full bg-[#00B4A7]" /></div>
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <Link to="/sedes" className="w-full py-3.5 rounded-xl bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg">
                    <span>Ver Sedes con Voleibol</span><ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. VITRINA DE COPAS & GALERÍA DE FOTOS REALES */}
        {seccionActiva === 'palmares' && (
          <div className="space-y-14 animate-in fade-in duration-300">
            
            {/* SECCIÓN TROFEOS REALES */}
            <div className="space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#F7B52C] bg-[#F7B52C]/10 px-3 py-1 rounded-full border border-[#F7B52C]/30">
                  Palmarés Oficial
                </span>
                <h2 className="text-3xl sm:text-4xl font-black uppercase text-white italic">
                  Vitrina de Trofeos
                </h2>
                <p className="text-xs text-slate-400">
                  Títulos y campeonatos obtenidos por nuestros alumnos en competencias oficiales.
                </p>
              </div>

              {datosClub.logros.length === 0 ? (
                <div className="p-10 text-center bg-[#071527] rounded-3xl border border-dashed border-slate-800 text-xs text-slate-400 space-y-2">
                  <Trophy className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="font-bold text-white">Aún no se han publicado trofeos en el sistema.</p>
                  <p className="text-[11px] text-slate-500">Pronto compartiremos nuestros logros y nuevas fotografías.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {datosClub.logros.map((logro, idx) => (
                    <div key={idx} className="bg-[#071527] border border-slate-800 hover:border-[#F7B52C] rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group transition-all">
                      <div>
                        {logro.foto && (
                          <div className="relative w-full aspect-[16/10] bg-slate-950 overflow-hidden">
                            <img src={logro.foto} alt={logro.titulo} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          </div>
                        )}
                        <div className="p-5 space-y-1.5">
                          {logro.categoria && (
                            <span className="bg-[#F7B52C] text-slate-950 font-black text-[10px] px-2 py-0.5 rounded shadow inline-block">
                              🏆 {logro.categoria}
                            </span>
                          )}
                          <h3 className="font-black text-white text-base mt-1">{logro.titulo}</h3>
                          {logro.descripcion && <p className="text-xs text-slate-300 leading-relaxed">{logro.descripcion}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECCIÓN GALERÍA DE FOTOS REALES */}
            <div className="space-y-6 pt-10 border-t border-slate-800/80">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00B4A7] bg-[#00B4A7]/10 px-3 py-1 rounded-full border border-[#00B4A7]/30">
                  Acción Real
                </span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase text-white italic">
                  Galería de Fotos en Cancha
                </h2>
                <p className="text-xs text-slate-400">
                  Toca cualquier foto para ampliarla a pantalla completa.
                </p>
              </div>

              {datosClub.galeria.length === 0 ? (
                <div className="p-10 text-center bg-[#071527] rounded-3xl border border-dashed border-slate-800 text-xs text-slate-400 space-y-2">
                  <Camera className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="font-bold text-white">No hay fotos registradas en la galería.</p>
                  <p className="text-[11px] text-slate-500">Sube fotos en la pestaña "Nosotros & Galería" del Admin para verlas aquí.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {datosClub.galeria.map((foto, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setFotoLightboxIdx(idx)}
                      className="relative aspect-square rounded-2xl overflow-hidden border border-slate-800 shadow bg-slate-950 cursor-pointer group"
                    >
                      <img src={foto} alt="Galería" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                        <span>🔍 Ver en grande</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* 4. MISIÓN, VISIÓN & CÓDIGO DE CANCHA */}
        {seccionActiva === 'mision' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            <div className="text-center max-w-xl mx-auto space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#F7B52C] bg-[#F7B52C]/10 px-3 py-1 rounded-full border border-[#F7B52C]/30">
                Rumbo & Principios del Club
              </span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase text-white italic">
                Propósito & Código de Cancha
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-7 rounded-3xl bg-[#071527] border-2 border-[#00B4A7]/40 space-y-3 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-[#00B4A7]/15 text-[#00B4A7] flex items-center justify-center font-black">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white italic uppercase">Nuestra Misión</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Brindar formación técnica y humana de primer nivel en básquetbol y vóley dentro de coliseos cerrados reglamentarios. Forjamos atletas comprometidos, seguros y preparados para competir con respeto.
                </p>
              </div>

              <div className="p-7 rounded-3xl bg-[#071527] border-2 border-[#F7B52C]/40 space-y-3 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-[#F7B52C]/15 text-[#F7B52C] flex items-center justify-center font-black">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white italic uppercase">Nuestra Visión</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Consolidarnos como la academia deportiva formativa de referencia en Lima Metropolitana, proyectando a nuestros alumnos hacia selecciones distritales y torneos de alta competencia.
                </p>
              </div>
            </div>

            {/* CÓDIGO DE CANCHA */}
            <div className="space-y-6 pt-4 border-t border-slate-800/80">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00B4A7] bg-[#00B4A7]/10 px-3 py-1 rounded-full border border-[#00B4A7]/30">
                  Reglamento del Vestuario
                </span>
                <h3 className="text-2xl font-black uppercase text-white italic">
                  El Código de Cancha
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-6 rounded-3xl bg-[#071527] border-2 border-slate-800 hover:border-[#F7B52C] transition-all space-y-2 shadow-xl">
                  <span className="text-[10px] font-mono text-[#F7B52C] font-black">REGLA 01</span>
                  <h4 className="text-lg font-black text-white uppercase italic">Disciplina</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Llegar 10 minutos antes de cada sesión, portar el uniforme oficial completo y respetar al árbitro y profesores.</p>
                </div>
                <div className="p-6 rounded-3xl bg-[#071527] border-2 border-slate-800 hover:border-[#00B4A7] transition-all space-y-2 shadow-xl">
                  <span className="text-[10px] font-mono text-[#00B4A7] font-black">REGLA 02</span>
                  <h4 className="text-lg font-black text-white uppercase italic">Compañerismo</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">El equipo está por encima de lo individual. Celebramos la canasta y el punto juntos, y aprendemos en equipo.</p>
                </div>
                <div className="p-6 rounded-3xl bg-[#071527] border-2 border-slate-800 hover:border-cyan-400 transition-all space-y-2 shadow-xl">
                  <span className="text-[10px] font-mono text-cyan-400 font-black">REGLA 03</span>
                  <h4 className="text-lg font-black text-white uppercase italic">Superación</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Ningún tiro o saque se da por perdido. Esfuerzo máximo en cada repetición y exigencia física constante.</p>
                </div>
                <div className="p-6 rounded-3xl bg-[#071527] border-2 border-slate-800 hover:border-amber-400 transition-all space-y-2 shadow-xl">
                  <span className="text-[10px] font-mono text-amber-400 font-black">REGLA 04</span>
                  <h4 className="text-lg font-black text-white uppercase italic">Pasión</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Amor genuino por el básquet y el vóley. Jugamos con alegría, intensidad y orgullo por defender los colores del club.</p>
                </div>
              </div>
            </div>

            {/* PILARES */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#071527] border border-slate-800 grid sm:grid-cols-3 gap-6 shadow-xl">
              <div className="space-y-1.5">
                <ShieldCheck className="w-6 h-6 text-[#00B4A7]" />
                <h4 className="text-sm font-black text-white">6 Sedes con Canchas Techadas</h4>
                <p className="text-xs text-slate-400">Coliseos cerrados que protegen del clima y cuidan las articulaciones de los alumnos.</p>
              </div>
              <div className="space-y-1.5">
                <Trophy className="w-6 h-6 text-[#F7B52C]" />
                <h4 className="text-sm font-black text-white">Metodología Formativa</h4>
                <p className="text-xs text-slate-400">Entrenadores federados con amplia trayectoria formativa y competitiva en Lima.</p>
              </div>
              <div className="space-y-1.5">
                <Share2 className="w-6 h-6 text-cyan-400" />
                <h4 className="text-sm font-black text-white">+6,766 Seguidores</h4>
                <p className="text-xs text-slate-400">Una comunidad unida y participativa dentro y fuera de las canchas.</p>
              </div>
            </div>

          </div>
        )}

        {/* BLOQUE DE CIERRE */}
        <section className="p-8 sm:p-12 rounded-3xl bg-[#071527] border-2 border-[#00B4A7]/60 text-center space-y-4 shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7B52C]/15 border border-[#F7B52C]/40 text-[10px] font-black uppercase text-[#F7B52C]">
            <Sparkles className="w-3.5 h-3.5" /> Únete al Club
          </div>
          <h3 className="text-2xl sm:text-4xl font-black uppercase text-white italic">
            ¿Listo para ponerte la camiseta de Campeones Lima?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Forma parte de nuestros más de 4,000 atletas en Lima. Solicita tu clase de prueba y entrena en el coliseo más cercano a ti.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link 
              to="/#ticket-cancha" 
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
            >
              Solicitar Clase de Prueba
            </Link>
            <Link 
              to="/sedes" 
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#040914] hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-[#00B4A7]" /> Conocer Nuestras 6 Sedes
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}