import Postulaciones from './Postulaciones';
import { subirArchivoStorage } from './adminUtils';
import React, { useState, useEffect } from 'react';
import { useToast } from '../toast';
import ModalConfirmacion from './ModalConfirmacion';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Upload, 
  Loader2, 
  Save, 
  MapPin, 
  Clock, 
  CheckCircle2,
  Sparkles,
  FileText,
  Pencil,
  X
} from 'lucide-react';
import { supabase } from '../supabase';

export default function AdminTrabaja() {
  const { mostrarToast } = useToast();
  const [confirmacion, setConfirmacion] = useState(null);
  const [convocatorias, setConvocatorias] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [errorCarga, setErrorCarga] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  // Formulario vacante
  const [nuevoPuesto, setNuevoPuesto] = useState('');
  const [nuevaSede, setNuevaSede] = useState('');
  const [nuevaJornada, setNuevaJornada] = useState('Tiempo Parcial');
  const [nuevaDesc, setNuevaDesc] = useState('');
  const [requisitosTexto, setRequisitosTexto] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [fotoVisible, setFotoVisible] = useState(true);

  useEffect(() => {
  async function cargarDatos() {
    try {
      const [resConvocatorias, resSedes] = await Promise.all([
        supabase.from('convocatorias').select('*').order('created_at', { ascending: false }),
        supabase.from('sedes').select('nombre').order('nombre', { ascending: true })
      ]);
      for (const respuesta of [resConvocatorias, resSedes]) { if (respuesta.error) throw respuesta.error; }

      if (resConvocatorias.data) setConvocatorias(resConvocatorias.data);
      if (resSedes.data && resSedes.data.length > 0) {
        setSedes(resSedes.data);
        setNuevaSede(resSedes.data[0].nombre);
      }
    } catch (err) {
      console.error("Error al cargar convocatorias:", err);
      setErrorCarga('No se pudo cargar la información. Recarga para reintentar.');
    } finally {
      setCargando(false);
    }
  }
    cargarDatos();
  }, []);



  const handleSubirFoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const publicUrl = await subirArchivoStorage(file, 'trabaja');
    if (!publicUrl) return mostrarToast("Error al subir foto", "error");
    setFotoUrl(publicUrl);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNuevoPuesto('');
    setNuevaSede(sedes[0]?.nombre || 'Todas las Sedes');
    setNuevaJornada('Tiempo Parcial');
    setNuevaDesc('');
    setRequisitosTexto('');
    setFotoUrl('');
    setFotoVisible(true);
  };

  const handleEditarConvocatoria = (c) => {
    setEditandoId(c.id);
    setNuevoPuesto(c.puesto || '');
    setNuevaSede(c.sede || (sedes[0]?.nombre || 'Todas las Sedes'));
    setNuevaJornada(c.tipo_jornada || 'Tiempo Parcial');
    setNuevaDesc(c.descripcion || '');
    setRequisitosTexto(Array.isArray(c.requisitos) ? c.requisitos.join('\n') : (c.requisitos || ''));
    setFotoUrl(c.foto || '');
    setFotoVisible(c.foto_visible !== false);

    // Desplazamiento suave hacia el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGuardarConvocatoria = async (e) => {
    e.preventDefault();
    if (!nuevoPuesto.trim()) return mostrarToast("Ingresa el título del puesto.", "error");

    setGuardando(true);
    try {
      const requisitosArray = requisitosTexto
        .split('\n')
        .map(r => r.trim())
        .filter(Boolean);

      const payload = {
        puesto: nuevoPuesto.trim(),
        sede: nuevaSede || (sedes[0]?.nombre || 'Todas las Sedes'),
        tipo_jornada: nuevaJornada,
        descripcion: nuevaDesc.trim(),
        requisitos: requisitosArray,
        foto: fotoUrl || null,
        foto_visible: fotoVisible,
        activa: true
      };

      if (editandoId) {
        // ACTUALIZAR CONVOCATORIA EXISTENTE
        const { error } = await supabase.from('convocatorias').update(payload).eq('id', editandoId);
        if (error) throw error;

        setConvocatorias(convocatorias.map(c => c.id === editandoId ? { ...c, ...payload } : c));
        cancelarEdicion();
        mostrarToast("Convocatoria actualizada exitosamente.", "exito");
      } else {
        // CREAR NUEVA CONVOCATORIA
        const { data, error } = await supabase.from('convocatorias').insert([payload]).select();
        if (error) throw error;

        if (data && data[0]) {
          setConvocatorias([data[0], ...convocatorias]);
          cancelarEdicion();
          mostrarToast("Convocatoria publicada exitosamente en Supabase.", "exito");
        }
      }
    } catch (err) {
      mostrarToast('No se pudo guardar la convocatoria: ' + (err.message || ''), "error");
    } finally {
      setGuardando(false);
    }
  };

  // Alternar estado activa/pausada
  const handleToggleActiva = async (id, estadoActual) => {
    const nuevoEstado = !estadoActual;
    const { error } = await supabase.from('convocatorias').update({ activa: nuevoEstado }).eq('id', id);
    if (error) mostrarToast('No se pudo guardar el cambio: ' + error.message, "error");
    if (!error) {
      setConvocatorias(convocatorias.map(c => c.id === id ? { ...c, activa: nuevoEstado } : c));
      mostrarToast(nuevoEstado ? "Convocatoria activada." : "Convocatoria pausada.", "exito");
    }
  };

  // Alternar visibilidad de foto en vivo
  const handleToggleVisibilidadFoto = async (id, estadoActual) => {
    const nuevoEstado = !estadoActual;
    const { error } = await supabase.from('convocatorias').update({ foto_visible: nuevoEstado }).eq('id', id);
    if (error) mostrarToast('No se pudo guardar el cambio: ' + error.message, "error");
    if (!error) {
      setConvocatorias(convocatorias.map(c => c.id === id ? { ...c, foto_visible: nuevoEstado } : c));
    }
  };

  // Quitar foto de una convocatoria
  const handleQuitarFoto = async (id) => {
    setConfirmacion({
      mensaje: "¿Deseas quitar la foto de esta convocatoria?",
      peligroso: true,
      onConfirmar: async () => {
        setConfirmacion(null);
        const { error } = await supabase.from('convocatorias').update({ foto: null, foto_visible: false }).eq('id', id);
        if (error) mostrarToast('No se pudo guardar el cambio: ' + error.message, "error");
        if (!error) {
          setConvocatorias(convocatorias.map(c => c.id === id ? { ...c, foto: null, foto_visible: false } : c));
          if (editandoId === id) setFotoUrl('');
        }
      }
    });
  };

  // Eliminar convocatoria de inmediato en Supabase (no vuelve a aparecer al recargar)
  const handleEliminarConvocatoria = async (id) => {
    setConfirmacion({
      mensaje: "¿Deseas eliminar definitivamente esta convocatoria de la base de datos?",
      peligroso: true,
      onConfirmar: async () => {
        setConfirmacion(null);
        const { error } = await supabase.from('convocatorias').delete().eq('id', id);
        if (error) mostrarToast('No se pudo guardar el cambio: ' + error.message, "error");
        if (!error) {
          setConvocatorias(convocatorias.filter(c => c.id !== id));
          if (editandoId === id) cancelarEdicion();
          mostrarToast("Convocatoria eliminada definitivamente.", "exito");
        }
      }
    });
  };

  const cantidadRequisitos = requisitosTexto.split('\n').map(r => r.trim()).filter(Boolean).length;

  if (errorCarga) return <div role="alert" className="p-6 text-red-300 space-y-3"><p>{errorCarga}</p><button type="button" onClick={() => window.location.reload()} className="underline">Reintentar carga</button></div>;

  if (cargando) {
    return (
      <div className="p-12 text-center space-y-3">
        <Loader2 className="w-10 h-10 text-[#00B4A7] animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cargando Convocatorias...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl animate-in fade-in duration-300">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-[#00B4A7]" /> Convocatorias & Trabaja con Nosotros
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Publica, edita y gestiona las vacantes laborales para entrenadores, coordinadores y staff.
          </p>
        </div>
      </div>

      {/* FORMULARIO AGREGAR / EDITAR CONVOCATORIA */}
      <div className={`bg-[#071527] border ${editandoId ? 'border-[#00B4A7] ring-1 ring-[#00B4A7]/50 shadow-[#00B4A7]/10' : 'border-slate-800'} p-6 sm:p-8 rounded-3xl space-y-5 shadow-2xl transition-all`}>
        
        {/* BANNER INFORMATIVO EN MODO EDICIÓN */}
        {editandoId && (
          <div className="p-3.5 rounded-2xl bg-[#00B4A7]/15 border border-[#00B4A7]/40 flex items-center justify-between gap-3 text-xs text-cyan-200">
            <div className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-[#00B4A7] shrink-0" />
              <span>Estás editando: <strong className="text-white font-black">{nuevoPuesto || 'Sin título'}</strong></span>
            </div>
            <button
              type="button"
              onClick={cancelarEdicion}
              className="text-xs font-bold text-slate-300 hover:text-white underline cursor-pointer shrink-0"
            >
              Cancelar y crear nueva
            </button>
          </div>
        )}

        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            {editandoId ? (
              <>
                <Pencil className="w-5 h-5 text-[#00B4A7]" /> Editar Vacante Laboral
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 text-[#F7B52C]" /> Publicar Nueva Vacante Laboral
              </>
            )}
          </h2>
          {editandoId && (
            <button
              type="button"
              onClick={cancelarEdicion}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-bold cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Descartar cambios</span>
            </button>
          )}
        </div>

        <form onSubmit={handleGuardarConvocatoria} className="space-y-4 text-xs">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-slate-300 font-bold mb-1">Título del Puesto *:</label>
              <input
                type="text"
                required
                placeholder="Ej. Entrenador de Básquetbol Formativo"
                value={nuevoPuesto}
                onChange={e => setNuevoPuesto(e.target.value)}
                className="w-full bg-[#040914] border border-slate-800 focus:border-[#00B4A7] p-3 rounded-xl text-white font-bold focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Sede de Trabajo:</label>
              <select
                value={nuevaSede}
                onChange={e => setNuevaSede(e.target.value)}
                className="w-full bg-[#040914] border border-slate-800 focus:border-[#00B4A7] p-3 rounded-xl text-white font-bold cursor-pointer focus:outline-none transition-colors"
              >
                {sedes.map((s, i) => (
                  <option key={i} value={s.nombre}>{s.nombre}</option>
                ))}
                <option value="Todas las Sedes">Todas las Sedes / Rotativo</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Jornada:</label>
              <select
                value={nuevaJornada}
                onChange={e => setNuevaJornada(e.target.value)}
                className="w-full bg-[#040914] border border-slate-800 focus:border-[#00B4A7] p-3 rounded-xl text-white font-bold cursor-pointer focus:outline-none transition-colors"
              >
                <option value="Tiempo Parcial">Tiempo Parcial (Tardes)</option>
                <option value="Fines de Semana">Solo Fines de Semana (Sáb/Dom)</option>
                <option value="Tiempo Completo">Tiempo Completo</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-300 font-bold">Descripción y Horarios:</label>
              <span className="text-[11px] text-slate-400">Puedes incluir emojis, días y turnos</span>
            </div>
            <textarea
              rows={4}
              placeholder="Ej: Estamos en búsqueda de ENTRENADOR(A) para formación de niños de 9 a 17 años.&#10;🗓️ Días: Martes y jueves.&#10;⏰ Horario: De 6:00 p. m. a 9:00 p. m."
              value={nuevaDesc}
              onChange={e => setNuevaDesc(e.target.value)}
              className="w-full bg-[#040914] border border-slate-800 focus:border-[#00B4A7] p-3 rounded-xl text-white font-medium focus:outline-none leading-relaxed transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-300 font-bold">Requisitos del Puesto:</label>
              <span className="text-[11px] text-[#00B4A7] font-bold">
                {cantidadRequisitos > 0 ? `✓ ${cantidadRequisitos} requisitos agregados` : 'Escribe un requisito por cada línea'}
              </span>
            </div>
            <textarea
              rows={4}
              placeholder={`Experiencia mínima de 2 años en academias formativas\nEstudiante o egresado de Educación Física / Deportes\nDisponibilidad por las tardes`}
              value={requisitosTexto}
              onChange={e => setRequisitosTexto(e.target.value)}
              className="w-full bg-[#040914] border border-slate-800 focus:border-[#00B4A7] p-3 rounded-xl text-white font-mono focus:outline-none leading-relaxed transition-colors"
            />
          </div>

          {/* FOTO CON PREVISUALIZACIÓN REAL */}
          <div className="p-4 rounded-2xl bg-[#040914] border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {fotoUrl ? (
                  <div className="relative group w-20 h-14 rounded-xl overflow-hidden border border-slate-700 bg-black shrink-0">
                    <img src={fotoUrl} alt="Vista previa" className="w-full h-full object-cover" />
                  </div>
                ) : null}

                <div className="space-y-1">
                  <label className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer border border-slate-700 inline-flex items-center gap-1.5 shadow transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#00B4A7]" />
                    <span>{fotoUrl ? "Cambiar foto" : "Subir Foto del Puesto (Opcional)"}</span>
                    <input type="file" accept="image/*" onChange={handleSubirFoto} className="hidden" />
                  </label>
                  {fotoUrl && (
                    <button
                      type="button"
                      onClick={() => setFotoUrl('')}
                      className="block text-[11px] text-red-400 hover:underline cursor-pointer"
                    >
                      Quitar foto
                    </button>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={fotoVisible}
                  onChange={e => setFotoVisible(e.target.checked)}
                  className="w-4 h-4 accent-[#00B4A7] cursor-pointer"
                />
                <span className="text-slate-300 font-bold">Mostrar foto en la web</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            {editandoId && (
              <button
                type="button"
                onClick={cancelarEdicion}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={guardando}
              className={`font-black px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-all active:scale-98 ${
                editandoId 
                  ? 'bg-[#F7B52C] hover:bg-[#ffc247] text-slate-950 shadow-[#F7B52C]/20' 
                  : 'bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 shadow-[#00B4A7]/20'
              }`}
            >
              {guardando ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editandoId ? (
                <Save className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>{editandoId ? 'Guardar Cambios' : 'Publicar Convocatoria'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* LISTADO DE CONVOCATORIAS PUBLICADAS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <span>Convocatorias Activas</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold font-mono">
              {convocatorias.length}
            </span>
          </h2>
        </div>

        {convocatorias.length === 0 ? (
          <div className="p-12 text-center bg-[#071527] rounded-3xl border border-dashed border-slate-800 text-slate-500 text-xs">
            No hay convocatorias registradas en la base de datos.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {convocatorias.map(c => {
              const estaEditando = editandoId === c.id;
              const estaActiva = c.activa !== false;

              return (
                <div 
                  key={c.id} 
                  className={`p-5 bg-[#071527] border ${estaEditando ? 'border-[#00B4A7] ring-2 ring-[#00B4A7]/40 shadow-xl shadow-[#00B4A7]/10' : 'border-slate-800'} rounded-3xl space-y-4 flex flex-col justify-between shadow-xl transition-all relative overflow-hidden`}
                >
                  {/* BADGE DE MODO EDITANDO */}
                  {estaEditando && (
                    <div className="absolute top-0 right-0 bg-[#00B4A7] text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                      Editando ahora
                    </div>
                  )}

                  <div className="space-y-3">
                    {c.foto && c.foto_visible !== false && (
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 mb-3 border border-slate-800">
                        <img loading="lazy" src={c.foto} alt={c.puesto} className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2 pr-20">
                        <h3 className="font-black text-white text-base leading-snug">{c.puesto}</h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#F7B52C]/20 text-[#F7B52C] border border-[#F7B52C]/30">
                          {c.tipo_jornada}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                          estaActiva ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}>
                          {estaActiva ? '● Activa en web' : '○ Pausada'}
                        </span>
                        <span className="text-xs text-[#00B4A7] font-bold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> Sede: {c.sede}
                        </span>
                      </div>

                      {c.descripcion && (
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line pt-1 bg-[#040914]/60 p-3 rounded-2xl border border-slate-800/80">
                          {c.descripcion}
                        </p>
                      )}

                      {/* REQUISITOS VISIBLES EN LA TARJETA */}
                      {c.requisitos && c.requisitos.length > 0 && (
                        <div className="pt-2 space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Requisitos ({c.requisitos.length}):
                          </span>
                          <ul className="space-y-1">
                            {c.requisitos.map((req, idx) => (
                              <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#00B4A7] shrink-0 mt-0.5" />
                                <span className="leading-snug">{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CONTROLES INFERIORES */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800 text-xs">
                    {c.foto ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleVisibilidadFoto(c.id, c.foto_visible !== false)}
                          className={`p-1.5 rounded-xl border flex items-center gap-1 font-bold cursor-pointer transition-colors ${
                            c.foto_visible !== false ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-slate-400 border-slate-700 bg-slate-800/40'
                          }`}
                          title="Ocultar o mostrar foto"
                        >
                          {c.foto_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span className="text-[10px]">{c.foto_visible !== false ? 'Foto visible' : 'Foto oculta'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuitarFoto(c.id)}
                          className="text-[10px] text-red-400 hover:underline cursor-pointer"
                        >
                          Quitar foto
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-bold font-mono">Sin foto</span>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        type="button"
                        onClick={() => handleToggleActiva(c.id, estaActiva)}
                        className={`px-2 py-1 rounded-xl border text-[10px] font-bold cursor-pointer transition-colors ${
                          estaActiva ? 'text-slate-300 border-slate-700 hover:bg-slate-800' : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                        }`}
                        title={estaActiva ? "Pausar vacante (ocultar de la web)" : "Activar vacante (mostrar en web)"}
                      >
                        {estaActiva ? "Pausar" : "Reactivar"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEditarConvocatoria(c)}
                        className="px-2.5 py-1 rounded-xl bg-[#00B4A7]/15 hover:bg-[#00B4A7]/25 text-[#00B4A7] border border-[#00B4A7]/30 flex items-center gap-1 font-bold cursor-pointer transition-colors text-[11px]"
                        title="Editar esta convocatoria"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEliminarConvocatoria(c.id)}
                        className="p-1 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-1 font-bold cursor-pointer transition-colors"
                        title="Eliminar convocatoria"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Postulaciones />

      <ModalConfirmacion
        abierto={!!confirmacion}
        mensaje={confirmacion?.mensaje || ''}
        textoConfirmar={confirmacion?.textoConfirmar || 'Confirmar'}
        peligroso={confirmacion?.peligroso || false}
        conInput={confirmacion?.conInput || false}
        valorInicial={confirmacion?.valorInicial || ''}
        placeholderInput={confirmacion?.placeholderInput || ''}
        onConfirmar={confirmacion?.onConfirmar || (() => setConfirmacion(null))}
        onCancelar={() => setConfirmacion(null)}
      />
    </div>
  );
}