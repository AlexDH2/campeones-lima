import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Briefcase, 
  Calendar, 
  ArrowRight, 
  ExternalLink, 
  Sparkles, 
  Loader2, 
  RefreshCw 
} from 'lucide-react';
import { supabase } from '../supabase';
import { promocionVigente } from '../domain';

export default function AdminDashboard({ alCambiarPestaña }) {
  const [cargando, setCargando] = useState(true);
  const [actualizandoSede, setActualizandoSede] = useState(null);

  const [sedes, setSedes] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [postulacionesCount, setPostulacionesCount] = useState(0);
  const [eventosCount, setEventosCount] = useState(0);
  const [_productosCount, setProductosCount] = useState(0);

  const cargarMetricas = async () => {
    setCargando(true);
    try {
      const [resSedes, resPromos, resPostulaciones, resEventos, resTienda] = await Promise.all([
        supabase.from('sedes').select('id, nombre, distrito, clases_suspendidas, motivo_suspension').order('nombre', { ascending: true }),
        supabase.from('configuracion_web').select('valor').eq('clave', 'promociones_vigentes').maybeSingle(),
        supabase.from('postulaciones').select('id', { count: 'exact', head: true }),
        supabase.from('eventos').select('id', { count: 'exact', head: true }),
        supabase.from('configuracion_web').select('valor').eq('clave', 'tienda_productos').maybeSingle()
      ]);

      if (resSedes.data) setSedes(resSedes.data);
      if (resPromos.data?.valor && Array.isArray(resPromos.data.valor)) {
        setPromociones(resPromos.data.valor.filter(p => promocionVigente(p)));
      }
      if (resPostulaciones.count !== null && resPostulaciones.count !== undefined) {
        setPostulacionesCount(resPostulaciones.count);
      }
      if (resEventos.count !== null && resEventos.count !== undefined) {
        setEventosCount(resEventos.count);
      }
      if (resTienda.data?.valor && Array.isArray(resTienda.data.valor)) {
        setProductosCount(resTienda.data.valor.length);
      }
    } catch (err) {
      console.error("Error al cargar métricas del dashboard:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarMetricas();
  }, []);

  const handleToggleSuspensionRapida = async (sede) => {
    const nuevoEstado = !sede.clases_suspendidas;
    let motivo = sede.motivo_suspension || '';

    if (nuevoEstado) {
      const motivoIngresado = prompt(
        `Motivo de suspensión para ${sede.nombre} (ej. Lluvia, cancha mojada o falta de profesor):`,
        "Por lluvia y cancha mojada"
      );

      if (motivoIngresado === null) {
        return;
      }

      motivo = motivoIngresado.trim() || "Por lluvia y cancha mojada";
    }

    setActualizandoSede(sede.id);
    try {
      const { error } = await supabase.from('sedes').update({
        clases_suspendidas: nuevoEstado,
        motivo_suspension: nuevoEstado ? motivo : ''
      }).eq('id', sede.id);

      if (error) throw error;
      setSedes(sedes.map(s => s.id === sede.id ? { ...s, clases_suspendidas: nuevoEstado, motivo_suspension: nuevoEstado ? motivo : '' } : s));
    } catch (err) {
      alert("No se pudo actualizar la suspensión: " + (err.message || 'Error en el servidor.'));
    } finally {
      setActualizandoSede(null);
    }
  };

  const sedesSuspendidas = sedes.filter(s => s.clases_suspendidas);
  const sedesNormales = sedes.filter(s => !s.clases_suspendidas);

  const fechaHoyTexto = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (cargando) {
    return (
      <div className="p-12 text-center space-y-3">
        <Loader2 className="w-10 h-10 text-[#00B4A7] animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cargando Tablero de Mando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl animate-in fade-in duration-300">
      
      {/* BIENVENIDA */}
      <div className="bg-gradient-to-r from-[#0A233D] via-[#071527] to-[#040914] border border-[#00B4A7]/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00B4A7]/10 border border-[#00B4A7]/30 text-[11px] font-black text-[#00B4A7] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#F7B52C]" /> Panel de Mando Oficial · Campeones Lima
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">Panel de Administración</h1>
          <p className="text-xs sm:text-sm text-slate-300 capitalize font-medium">
            📅 {fechaHoyTexto}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto relative z-10">
          <button
            type="button"
            onClick={cargarMetricas}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-700"
            title="Actualizar datos"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#00B4A7]/25 transition-all"
          >
            <span>Ver Web en Vivo</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* KPIS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#071527] border border-slate-800 shadow-xl space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-black uppercase tracking-wider">Sedes Activas</span>
            <MapPin className="w-4 h-4 text-[#00B4A7]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{sedes.length}</span>
            <span className="text-xs font-bold text-emerald-400">({sedesNormales.length} normales)</span>
          </div>
          {sedesSuspendidas.length > 0 ? (
            <p className="text-[10px] text-red-400 font-bold flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" /> {sedesSuspendidas.length} suspendida(s) hoy
            </p>
          ) : (
            <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Todas entrenando normal
            </p>
          )}
        </div>

        <div 
          onClick={() => alCambiarPestaña('trabaja')}
          className="p-5 rounded-3xl bg-[#071527] border border-slate-800 shadow-xl space-y-2 cursor-pointer hover:border-[#F7B52C] transition-all group"
        >
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-black uppercase tracking-wider group-hover:text-[#F7B52C]">Postulaciones CV</span>
            <Briefcase className="w-4 h-4 text-[#F7B52C]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{postulacionesCount}</span>
            <span className="text-xs text-slate-400 font-bold">candidatos</span>
          </div>
          <p className="text-[10px] text-slate-400 flex items-center gap-1 group-hover:text-white">
            <span>Revisar bandeja de entrenadores</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        <div 
          onClick={() => alCambiarPestaña('precios')}
          className="p-5 rounded-3xl bg-[#071527] border border-slate-800 shadow-xl space-y-2 cursor-pointer hover:border-cyan-400 transition-all group"
        >
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-black uppercase tracking-wider group-hover:text-cyan-400">Promociones</span>
            <Flame className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{promociones.length}</span>
            <span className="text-xs text-cyan-400 font-bold">vigentes</span>
          </div>
          <p className="text-[10px] text-slate-400 flex items-center gap-1 group-hover:text-white">
            <span>Gestionar tarifas y descuentos</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        <div 
          onClick={() => alCambiarPestaña('eventos')}
          className="p-5 rounded-3xl bg-[#071527] border border-slate-800 shadow-xl space-y-2 cursor-pointer hover:border-purple-400 transition-all group"
        >
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-black uppercase tracking-wider group-hover:text-purple-400">Torneos & Eventos</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{eventosCount}</span>
            <span className="text-xs text-purple-400 font-bold">publicados</span>
          </div>
          <p className="text-[10px] text-slate-400 flex items-center gap-1 group-hover:text-white">
            <span>Ver calendario y bases</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>
      </div>

      {/* ESTADO DE SEDES */}
      <div className="bg-[#071527] border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#00B4A7]" /> Estado de Canchas y Sedes en Vivo
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pausa o reactiva los entrenamientos de hoy de cualquier coliseo con un solo clic.
            </p>
          </div>
          <button
            type="button"
            onClick={() => alCambiarPestaña('sedes')}
            className="text-xs font-bold text-[#00B4A7] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Ver todas las sedes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sedes.map(s => {
            const suspendida = s.clases_suspendidas === true;
            const estaCargando = actualizandoSede === s.id;

            return (
              <div 
                key={s.id} 
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  suspendida 
                    ? 'bg-red-950/20 border-red-500/40 shadow-lg shadow-red-950/20' 
                    : 'bg-[#040914] border-slate-800'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00B4A7]/10 text-[#00B4A7]">
                      {s.distrito}
                    </span>
                    {suspendida ? (
                      <span className="bg-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded shadow flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3 h-3" /> Suspendida
                      </span>
                    ) : (
                      <span className="bg-emerald-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded shadow flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Normal
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-sm mt-1">{s.nombre}</h3>
                  {suspendida && s.motivo_suspension && (
                    <p className="text-[10px] text-red-300 mt-1 font-semibold italic">
                      Motivo: "{s.motivo_suspension}"
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  disabled={estaCargando}
                  onClick={() => handleToggleSuspensionRapida(s)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    suspendida
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                      : 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25'
                  }`}
                >
                  {estaCargando ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : suspendida ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Reactivar Clases Normales</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Suspender Hoy (Lluvia / Motivo)</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}