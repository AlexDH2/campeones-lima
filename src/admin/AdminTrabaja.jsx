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
  FileText
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

  // Formulario nueva vacante
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

  const handleCrearConvocatoria = async (e) => {
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

      const { data, error } = await supabase.from('convocatorias').insert([payload]).select();

      if (error) mostrarToast('No se pudo guardar el registro: ' + error.message, "error");
      if (!error && data && data[0]) {
        setConvocatorias([data[0], ...convocatorias]);
        setNuevoPuesto('');
        setNuevaDesc('');
        setRequisitosTexto('');
        setFotoUrl('');
        setFotoVisible(true);
        mostrarToast("Convocatoria publicada exitosamente en Supabase.", "exito");
      }
    } finally {
      setGuardando(false);
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
          mostrarToast("Convocatoria eliminada definitivamente.", "exito");
        }
      }
    });
  };

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
            Publica vacantes de entrenadores, asistentes de cancha y coordinadores con fotos visibles u ocultas.
          </p>
        </div>
      </div>

      {/* FORMULARIO AGREGAR CONVOCATORIA */}
      <div className="bg-[#071527] border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-5 shadow-xl">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#F7B52C]" /> Publicar Nueva Vacante Laboral
          </h2>
        </div>

        <form onSubmit={handleCrearConvocatoria} className="space-y-4 text-xs">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-slate-300 font-bold mb-1">Título del Puesto *:</label>
              <input
                type="text"
                required
                placeholder="Ej. Entrenador de Básquetbol Formativo"
                value={nuevoPuesto}
                onChange={e => setNuevoPuesto(e.target.value)}
                className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Sede de Trabajo:</label>
              <select
                value={nuevaSede}
                onChange={e => setNuevaSede(e.target.value)}
                className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white font-bold cursor-pointer"
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
                className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white font-bold cursor-pointer"
              >
                <option value="Tiempo Parcial">Tiempo Parcial (Tardes)</option>
                <option value="Fines de Semana">Solo Fines de Semana (Sáb/Dom)</option>
                <option value="Tiempo Completo">Tiempo Completo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Descripción del Puesto:</label>
            <textarea
              rows={2}
              placeholder="Responsable de la preparación física y táctica de categorías formativas..."
              value={nuevaDesc}
              onChange={e => setNuevaDesc(e.target.value)}
              className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Requisitos (Un requisito por línea):</label>
            <textarea
              rows={3}
              placeholder={`Experiencia mínima de 2 años en academias formativas\nEstudiante o egresado de Educación Física / Deportes\nDisponibilidad por las tardes`}
              value={requisitosTexto}
              onChange={e => setRequisitosTexto(e.target.value)}
              className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white font-mono"
            />
          </div>

          {/* FOTO Y CONTROL DE VISIBILIDAD */}
          <div className="p-4 rounded-2xl bg-[#040914] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer border border-slate-700 flex items-center gap-1.5 shadow">
                <Upload className="w-3.5 h-3.5 text-[#00B4A7]" />
                <span>{fotoUrl ? "✓ Foto seleccionada" : "Subir Foto Opcional del Puesto"}</span>
                <input type="file" accept="image/*" onChange={handleSubirFoto} className="hidden" />
              </label>

              {fotoUrl && (
                <button
                  type="button"
                  onClick={() => setFotoUrl('')}
                  className="text-xs text-red-400 hover:underline"
                >
                  Quitar foto
                </button>
              )}
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={fotoVisible}
                onChange={e => setFotoVisible(e.target.checked)}
                className="w-4 h-4 accent-[#00B4A7]"
              />
              <span className="text-slate-300 font-bold">Mostrar foto en la web</span>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={guardando}
              className="bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow"
            >
              {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>Publicar Convocatoria</span>
            </button>
          </div>
        </form>
      </div>

      {/* LISTADO DE CONVOCATORIAS PUBLICADAS */}
      <div className="space-y-4">
        <h2 className="text-base font-black text-white">Convocatorias Activas ({convocatorias.length})</h2>

        {convocatorias.length === 0 ? (
          <div className="p-12 text-center bg-[#071527] rounded-3xl border border-dashed border-slate-800 text-slate-500 text-xs">
            No hay convocatorias activas en la base de datos.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {convocatorias.map(c => (
              <div key={c.id} className="p-5 bg-[#071527] border border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between shadow-xl">
                <div>
                  {c.foto && c.foto_visible !== false && (
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 mb-3 border border-slate-800">
                      <img loading="lazy" src={c.foto} alt={c.puesto} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-white text-base leading-snug">{c.puesto}</h3>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#F7B52C]/20 text-[#F7B52C] shrink-0">
                        {c.tipo_jornada}
                      </span>
                    </div>
                    <p className="text-xs text-[#00B4A7] font-bold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Sede: {c.sede}
                    </p>
                    {c.descripcion && <p className="text-xs text-slate-300 leading-relaxed pt-1">{c.descripcion}</p>}
                  </div>
                </div>

                {/* CONTROLES: OCULTAR/MOSTRAR FOTO, QUITAR FOTO Y ELIMINAR */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                  {c.foto ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleVisibilidadFoto(c.id, c.foto_visible !== false)}
                        className={`p-1.5 rounded-lg border flex items-center gap-1 font-bold ${
                          c.foto_visible !== false ? 'text-emerald-400 border-emerald-500/30' : 'text-slate-500 border-slate-700'
                        }`}
                        title="Ocultar o mostrar foto"
                      >
                        {c.foto_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span className="text-[10px]">{c.foto_visible !== false ? 'Visible' : 'Oculta'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuitarFoto(c.id)}
                        className="text-[10px] text-red-400 hover:underline"
                      >
                        Quitar foto
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-bold">Sin foto adjunta</span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleEliminarConvocatoria(c.id)}
                    className="p-1.5 text-red-400 hover:text-red-300 flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            ))}
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