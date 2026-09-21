import React, { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Send, 
  Check, 
  Loader2, 
  Sparkles,
  FileText
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useTheme } from './ThemeContext';
import { supabase } from './supabase';
import { validarCv } from './domain';
import { useToast } from './toast';
import { useConvocatorias } from './queries';

export default function TrabajaConNosotros() {
  const { esOscuro = true } = useTheme();
  const cvSubido = useRef(null);
  const [errorFormulario, setErrorFormulario] = useState('');
  const { mostrarToast } = useToast();
  const { data: convocatoriasData, isLoading: cargando, isError } = useConvocatorias();
  const convocatorias = convocatoriasData || [];
  const errorConsulta = isError ? "No pudimos cargar las convocatorias. Recarga la página para reintentar." : '';

  const [puestoElegido, setPuestoElegido] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [archivoCv, setArchivoCv] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [enviadoExito, setEnviadoExito] = useState(false);

  useEffect(() => {
    if (convocatorias.length > 0 && !puestoElegido) {
      setPuestoElegido(convocatorias[0].puesto);
    }
  }, [convocatorias, puestoElegido]);

  const handlePostular = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !telefono.trim()) {
      return mostrarToast("Por favor ingresa tu nombre y teléfono de contacto.", "error");
    }

    setEnviando(true);
    setErrorFormulario('');
    try {
      if (nombre.trim().length < 2 || !/^\+?[0-9 ()-]{9,20}$/.test(telefono.trim())) {
        throw new Error('Ingresa tu nombre completo y un teléfono válido.');
      }
      validarCv(archivoCv);

      let cvRuta = cvSubido.current?.archivo === archivoCv ? cvSubido.current.ruta : '';
      if (archivoCv && !cvRuta) {
        cvRuta = 'cv/' + crypto.randomUUID() + '.' + ({ 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[archivoCv.type]);
        const { error } = await supabase.storage.from('postulaciones_cv').upload(cvRuta, archivoCv, { upsert: false });
        if (error) throw error;
        cvSubido.current = { archivo: archivoCv, ruta: cvRuta };
      }

      const { error } = await supabase.from('postulaciones').insert([{
        puesto: puestoElegido || 'General',
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        email: email.trim(),
        experiencia: experiencia.trim(),
        cv_url: cvRuta,
        estado: 'Pendiente',
      }]);
      if (error) throw error;
      setEnviadoExito(true);
    } catch (error) {
      setErrorFormulario('No se pudo enviar tu postulación. ' + error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 relative overflow-hidden ${
      esOscuro ? 'bg-[#040914] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <Navbar />
      {errorConsulta && <p role="alert" className="mt-24 p-4 bg-red-950 text-red-200">{errorConsulta}</p>}

      <header className={`pt-24 sm:pt-36 pb-12 text-center border-b relative z-10 backdrop-blur-md ${
        esOscuro ? 'border-slate-800 bg-[#071527]/70' : 'border-slate-200 bg-white/70'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00B4A7]/10 border border-[#00B4A7]/50 shadow text-xs font-black uppercase text-[#00B4A7]">
            <Sparkles className="w-3.5 h-3.5 text-[#F7B52C]" /> Oportunidades Laborales
          </div>

          <h1 className={`text-4xl sm:text-6xl font-black uppercase tracking-tight italic ${
            esOscuro ? 'text-white' : 'text-slate-900'
          }`}>
            Trabaja con Nosotros
          </h1>

          <p className={`text-xs sm:text-sm max-w-xl mx-auto ${
            esOscuro ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Únete a nuestro cuerpo técnico y formativo de básquetbol y voleibol en coliseos techados de Lima.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12 relative z-10">
        
        <section className="space-y-6">
          <h2 className={`text-2xl font-black uppercase italic ${
            esOscuro ? 'text-white' : 'text-slate-900'
          }`}>
            Convocatorias Vigentes ({convocatorias.length})
          </h2>

          {cargando ? (
            <div className="p-16 text-center space-y-3">
              <Loader2 className="w-10 h-10 text-[#00B4A7] animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-bold">Cargando convocatorias...</p>
            </div>
          ) : convocatorias.length === 0 ? (
            <div className={`p-12 text-center rounded-3xl border border-dashed text-xs space-y-2 ${
              esOscuro ? 'bg-[#071527] border-slate-800 text-slate-400' : 'bg-white border-slate-300 text-slate-500 shadow-sm'
            }`}>
              <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
              <p className={`font-bold text-base ${esOscuro ? 'text-white' : 'text-slate-900'}`}>Actualmente no hay convocatorias abiertas</p>
              <p>Puedes dejarnos tus datos en el formulario inferior para futuras oportunidades.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {convocatorias.map(c => (
                <div key={c.id} className={`border rounded-3xl p-6 sm:p-7 space-y-4 flex flex-col justify-between shadow-xl ${
                  esOscuro ? 'bg-[#071527] border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="space-y-3">
                    {c.foto && c.foto_visible !== false && (
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 mb-3 border border-slate-800">
                        <img loading="lazy" src={c.foto} alt={c.puesto} className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="flex justify-between items-start gap-2">
                      <h3 className={`text-xl font-black ${esOscuro ? 'text-white' : 'text-slate-900'}`}>{c.puesto}</h3>
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-[#F7B52C]/20 text-[#F7B52C]">
                        {c.tipo_jornada}
                      </span>
                    </div>

                    <p className="text-xs text-[#00B4A7] font-bold flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" /> Sede: {c.sede}
                    </p>

                    {c.descripcion && <p className={`text-xs leading-relaxed ${esOscuro ? 'text-slate-300' : 'text-slate-600'}`}>{c.descripcion}</p>}

                    {c.requisitos && c.requisitos.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Requisitos:</span>
                        <ul className="space-y-1">
                          {c.requisitos.map((req, i) => (
                            <li key={i} className={`text-xs flex items-center gap-2 ${esOscuro ? 'text-slate-300' : 'text-slate-700'}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00B4A7]" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <a
                    href="#formulario-postulacion"
                    onClick={() => setPuestoElegido(c.puesto)}
                    className="w-full py-3 rounded-xl bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow transition-all"
                  >
                    <span>Postular a este Puesto</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* FORMULARIO DE POSTULACIÓN */}
        <section id="formulario-postulacion" className={`max-w-3xl mx-auto border-2 border-[#00B4A7]/50 rounded-3xl p-6 sm:p-10 space-y-6 shadow-2xl ${
          esOscuro ? 'bg-[#071527]' : 'bg-white'
        }`}>
          <div className={`border-b pb-4 ${esOscuro ? 'border-slate-800' : 'border-slate-200'}`}>
            <span className="text-xs font-black uppercase text-[#F7B52C] tracking-wider block">Bolsa de Trabajo Oficial</span>
            <h3 className={`text-2xl font-black italic uppercase mt-1 ${esOscuro ? 'text-white' : 'text-slate-900'}`}>Envíanos tu CV y Postula</h3>
          </div>

          {enviadoExito ? (
            <div className={`p-8 rounded-2xl border border-emerald-500/50 text-center space-y-3 ${
              esOscuro ? 'bg-[#040914]' : 'bg-emerald-50'
            }`}>
              <Check className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className={`text-xl font-black ${esOscuro ? 'text-white' : 'text-slate-900'}`}>¡Postulación Enviada con Éxito!</h4>
              <p className={`text-xs max-w-md mx-auto ${esOscuro ? 'text-slate-300' : 'text-slate-600'}`}>
                Hemos recibido tu postulación para <strong>{puestoElegido}</strong>. Si tu perfil calza con lo que buscamos, nos comunicaremos contigo.
              </p>
            </div>
          ) : (
            <form onSubmit={handlePostular} className="space-y-4 text-xs">
              {errorFormulario && <p role="alert" className="text-red-500 font-bold">{errorFormulario}</p>}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-bold mb-1 ${esOscuro ? 'text-slate-300' : 'text-slate-700'}`}>Nombre Completo *:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    className={`w-full p-3 rounded-xl font-bold border transition-colors ${
                      esOscuro ? 'bg-[#040914] border-slate-800 text-white focus:border-[#00B4A7]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#00B4A7]'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${esOscuro ? 'text-slate-300' : 'text-slate-700'}`}>Teléfono WhatsApp *:</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej. 987654321"
                    value={telefono}
                    onChange={e => setTelefono(e.target.value)}
                    className={`w-full p-3 rounded-xl font-mono font-bold border transition-colors ${
                      esOscuro ? 'bg-[#040914] border-slate-800 text-white focus:border-[#00B4A7]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#00B4A7]'
                    }`}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-bold mb-1 ${esOscuro ? 'text-slate-300' : 'text-slate-700'}`}>Correo Electrónico:</label>
                  <input
                    type="email"
                    placeholder="juan@ejemplo.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={`w-full p-3 rounded-xl border transition-colors ${
                      esOscuro ? 'bg-[#040914] border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${esOscuro ? 'text-slate-300' : 'text-slate-700'}`}>Puesto de Interés:</label>
                  <input
                    type="text"
                    value={puestoElegido}
                    onChange={e => setPuestoElegido(e.target.value)}
                    placeholder="Entrenador de Básquet / Vóley..."
                    className={`w-full p-3 rounded-xl font-bold border transition-colors ${
                      esOscuro ? 'bg-[#040914] border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-bold mb-1 ${esOscuro ? 'text-slate-300' : 'text-slate-700'}`}>Breve Resumen de tu Experiencia:</label>
                <textarea
                  rows={3}
                  placeholder="Cuéntanos dónde has entrenado, qué categorías has manejado..."
                  value={experiencia}
                  onChange={e => setExperiencia(e.target.value)}
                  className={`w-full p-3 rounded-xl border transition-colors ${
                    esOscuro ? 'bg-[#040914] border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${esOscuro ? 'text-slate-300' : 'text-slate-700'}`}>Adjuntar CV (PDF, JPG, PNG o WebP, máx 5 MB):</label>
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  onChange={e => setArchivoCv(e.target.files?.[0] || null)}
                  className={`w-full p-2.5 rounded-xl border text-xs cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[#00B4A7] file:text-slate-950 file:font-black ${
                    esOscuro ? 'bg-[#040914] border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-700'
                  }`}
                />
                {archivoCv && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-500 font-bold">
                    <FileText className="w-4 h-4" />
                    <span>CV retenido: {archivoCv.name} ({(archivoCv.size / 1024).toFixed(0)} KB)</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="w-full py-4 bg-[#F7B52C] hover:bg-[#e6a524] text-slate-950 font-black uppercase tracking-wider text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-[#F7B52C]/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {enviando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Enviar mi Postulación</span>
              </button>
            </form>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
}