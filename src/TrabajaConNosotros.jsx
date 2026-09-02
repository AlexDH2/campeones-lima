import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Briefcase, 
  CheckCircle2, 
  MessageCircle, 
  Phone, 
  Sparkles, 
  HeartHandshake, 
  Send,
  Award,
  Users,
  Loader2
} from 'lucide-react';
import { supabase } from './supabase';

export default function TrabajaConNosotros() {
  const WHATSAPP_PHONE = "51963896985";
  const [enviando, setEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);

  const [postulacion, setPostulacion] = useState({
    nombre: '',
    telefono: '',
    email: '',
    puesto: 'Entrenador(a) de Básquetbol',
    experiencia: '1 a 3 años',
    sedeInteres: 'Cualquier Sede en Lima',
    resumen: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    try {
      // 1. Guardar en la tabla postulaciones de Supabase
      await supabase.from('postulaciones').insert([{
        nombre: postulacion.nombre,
        telefono: postulacion.telefono,
        email: postulacion.email,
        puesto: postulacion.puesto,
        experiencia: postulacion.experiencia,
        sede_interes: postulacion.sedeInteres,
        resumen: postulacion.resumen,
        estado: 'Pendiente'
      }]);

      setMensajeExito(true);

      // 2. Abrir WhatsApp con el formato preparado
      const mensaje = `¡Hola Campeones Lima! Deseo postular a la convocatoria laboral:%0A%0A` +
        `👤 *Postulante:* ${encodeURIComponent(postulacion.nombre)}%0A` +
        `📱 *Teléfono:* ${postulacion.telefono}%0A` +
        `📧 *Email:* ${encodeURIComponent(postulacion.email)}%0A` +
        `🎯 *Puesto:* ${encodeURIComponent(postulacion.puesto)}%0A` +
        `⏱️ *Experiencia:* ${encodeURIComponent(postulacion.experiencia)}%0A` +
        `📝 *CV/Resumen:* ${encodeURIComponent(postulacion.resumen)}`;

      window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${mensaje}`, '_blank');
    } catch (err) {
      console.error("Error al enviar postulación:", err);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060d19] text-slate-100 font-sans selection:bg-teal-400 selection:text-slate-950">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#060d19]/90 backdrop-blur-md border-b border-teal-950/60">
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
            <Link to="/eventos" className="hover:text-teal-400 transition-colors">Eventos</Link>
            <Link to="/tienda" className="hover:text-teal-400 transition-colors">Tienda</Link>
            <Link to="/trabaja" className="text-teal-400 font-bold">Trabaja con Nosotros</Link>
          </div>

          <a 
            href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola,%20deseo%20enviar%20mi%20CV`}
            target="_blank"
            rel="noreferrer"
            className="bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-sm"
          >
            Enviar CV
          </a>
        </div>
      </nav>

      {/* HEADER */}
      <section className="pt-36 pb-16 text-center">
        <h1 className="text-4xl sm:text-6xl font-black text-white">Únete a <span className="text-teal-300">Campeones Lima</span></h1>
        <p className="mt-4 text-slate-300 text-sm">Buscamos entrenadores y profesores con pasión por la formación deportiva en valores.</p>
      </section>

      {/* FORMULARIO POSTULACIÓN */}
      <section className="py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-[#081322] border border-teal-900/40 rounded-3xl p-8 shadow-2xl">
            
            {mensajeExito && (
              <div className="mb-6 p-4 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Tu postulación fue guardada y enviada con éxito.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej. Carlos Mendoza Ramos"
                  value={postulacion.nombre}
                  onChange={e => setPostulacion({...postulacion, nombre: e.target.value})}
                  className="w-full bg-[#060d19] border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Teléfono / WhatsApp</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="Ej. 987654321"
                    value={postulacion.telefono}
                    onChange={e => setPostulacion({...postulacion, telefono: e.target.value})}
                    className="w-full bg-[#060d19] border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Correo Electrónico</label>
                  <input 
                    type="email" 
                    required
                    placeholder="Ej. carlos@correo.com"
                    value={postulacion.email}
                    onChange={e => setPostulacion({...postulacion, email: e.target.value})}
                    className="w-full bg-[#060d19] border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Puesto de Interés</label>
                  <select 
                    value={postulacion.puesto}
                    onChange={e => setPostulacion({...postulacion, puesto: e.target.value})}
                    className="w-full bg-[#060d19] border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                  >
                    <option value="Entrenador(a) de Básquetbol">Entrenador(a) de Básquetbol</option>
                    <option value="Entrenador(a) de Voleibol">Entrenador(a) de Voleibol</option>
                    <option value="Profesor(a) de Fútbol Menores">Profesor(a) de Fútbol Menores</option>
                    <option value="Asistente / Árbitro">Asistente de Campo / Árbitro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Experiencia</label>
                  <select 
                    value={postulacion.experiencia}
                    onChange={e => setPostulacion({...postulacion, experiencia: e.target.value})}
                    className="w-full bg-[#060d19] border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                  >
                    <option value="Menos de 1 año">Menos de 1 año (Prácticas)</option>
                    <option value="1 a 3 años">1 a 3 años</option>
                    <option value="Más de 3 años">Más de 3 años</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Resumen de Experiencia o Enlace al CV (Drive / LinkedIn)</label>
                <textarea 
                  rows={3}
                  required
                  placeholder="Cuéntanos brevemente tu experiencia o pega un enlace a tu CV..."
                  value={postulacion.resumen}
                  onChange={e => setPostulacion({...postulacion, resumen: e.target.value})}
                  className="w-full bg-[#060d19] border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                />
              </div>

              <button 
                type="submit"
                disabled={enviando}
                className="w-full bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-black py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
              >
                {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Enviar Postulación
              </button>
            </form>

          </div>
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
            <Link to="/eventos" className="hover:text-teal-400">Eventos</Link>
            <Link to="/tienda" className="hover:text-teal-400">Tienda</Link>
            <Link to="/trabaja" className="text-teal-400 font-bold">Trabaja con Nosotros</Link>
          </div>
          <p className="text-slate-600 text-center md:text-right">© {new Date().getFullYear()} Campeones Lima.</p>
        </div>
      </footer>
    </div>
  );
}