import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  Loader2, 
  MapPin 
} from 'lucide-react';
import { supabase } from '../supabase';
import { useToast } from '../toast';
import ModalConfirmacion from './ModalConfirmacion';

export default function AdminEventos() {
  const { mostrarToast } = useToast();
  const [confirmacion, setConfirmacion] = useState(null);

  const [eventos, setEventos] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState('Torneo FIBA');
  const [fechaEmergente, setFechaEmergente] = useState('');
  const [horaInicio, setHoraInicio] = useState('09:00 AM');
  const [sedeLugar, setSedeLugar] = useState('');
  const [descripcion, setDescripcion] = useState('');

  async function cargarEventos() {
    setCargando(true);
    try {
      const [resEventos, resSedes] = await Promise.all([
        supabase.from('eventos').select('*').order('created_at', { ascending: false }),
        supabase.from('sedes').select('nombre').order('nombre', { ascending: true })
      ]);

      if (resEventos.data) setEventos(resEventos.data);
      if (resSedes.data && resSedes.data.length > 0) {
        setSedes(resSedes.data);
        setSedeLugar(resSedes.data[0].nombre);
      }
    } catch (err) {
      console.error("Error al cargar eventos:", err);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarEventos();
  }, []);

  const handleCrearEvento = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !fechaEmergente) {
      return mostrarToast("Ingresa el título del evento y la fecha usando el calendario.", "error");
    }

    setGuardando(true);
    try {
      const payload = {
        titulo: titulo.trim(),
        tipo,
        fecha: fechaEmergente,
        hora: horaInicio,
        sede: sedeLugar,
        descripcion: descripcion.trim(),
        visible: true
      };

      const { data, error } = await supabase.from('eventos').insert([payload]).select();
      if (error) throw error;

      if (data && data[0]) {
        setEventos([data[0], ...eventos]);
        setTitulo('');
        setFechaEmergente('');
        setDescripcion('');
        mostrarToast("Evento publicado exitosamente en el calendario.", "exito");
      }
    } catch (err) {
      mostrarToast("No se pudo publicar el evento: " + (err.message || 'Error en el servidor.'), "error");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarEvento = async (id) => {
    setConfirmacion({
      mensaje: "¿Deseas eliminar definitivamente este evento?",
      peligroso: true,
      onConfirmar: async () => {
        setConfirmacion(null);
        try {
          const { error } = await supabase.from('eventos').delete().eq('id', id);
          if (error) throw error;
          setEventos(eventos.filter(e => e.id !== id));
          mostrarToast("Evento eliminado exitosamente.", "exito");
        } catch (err) {
          mostrarToast("No se pudo eliminar el evento: " + (err.message || 'Error en el servidor.'), "error");
        }
      }
    });
  };

  if (cargando) {
    return (
      <div className="p-12 text-center space-y-3">
        <Loader2 className="w-10 h-10 text-[#00B4A7] animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cargando Calendario de Eventos & FIBA...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl animate-in fade-in duration-300">
      
      {/* CABECERA */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
          <CalendarIcon className="w-7 h-7 text-[#F7B52C]" /> Eventos, Torneos & FIBA
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Programa partidos amistosos, inauguraciones y torneos oficiales con selector de calendario emergente.
        </p>
      </div>

      {/* FORMULARIO DE CREACIÓN */}
      <div className="bg-[#071527] border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-5 shadow-xl">
        <h2 className="text-base font-black text-white flex items-center gap-2">
          <Plus className="w-5 h-5 text-[#00B4A7]" /> Programar Nuevo Evento
        </h2>

        <form onSubmit={handleCrearEvento} className="space-y-4 text-xs">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-slate-300 font-bold mb-1">Nombre del Evento *:</label>
              <input
                type="text"
                required
                placeholder="Ej. Copa Inter-Sedes Apertura 2026"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Tipo de Evento:</label>
              <select
                value={tipo}
                onChange={e => setTipo(e.target.value)}
                className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white font-bold cursor-pointer"
              >
                <option value="Torneo FIBA">🏀 Torneo FIBA / Metropolitano</option>
                <option value="Festival de Vóley">🏐 Festival de Vóley Formativo</option>
                <option value="Amistoso Inter-Sedes">⭐ Amistoso Inter-Sedes</option>
                <option value="Clínica Deportiva">📋 Clínica & Capacitación</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-[#00B4A7]" />
                <span>Fecha (Calendario Emergente) *:</span>
              </label>
              <input
                type="date"
                required
                value={fechaEmergente}
                onChange={e => setFechaEmergente(e.target.value)}
                className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white font-mono font-bold cursor-pointer"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Hora de Encuentro:</label>
              <input
                type="text"
                placeholder="09:00 AM"
                value={horaInicio}
                onChange={e => setHoraInicio(e.target.value)}
                className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Sede o Coliseo:</label>
              <select
                value={sedeLugar}
                onChange={e => setSedeLugar(e.target.value)}
                className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white font-bold cursor-pointer"
              >
                {sedes.map((s, i) => (
                  <option key={i} value={s.nombre}>{s.nombre}</option>
                ))}
                <option value="Coliseo Dibós (San Borja)">Coliseo Dibós (San Borja)</option>
                <option value="Por Confirmar">Por Confirmar</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Descripción / Detalles del Partido:</label>
            <textarea
              rows={2}
              placeholder="Categorías convocadas, hora de calentamiento y requisitos de uniforme..."
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={guardando}
              className="bg-[#F7B52C] hover:bg-[#e6a524] text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow"
            >
              {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>Publicar en Calendario</span>
            </button>
          </div>
        </form>
      </div>

      {/* LISTADO DE EVENTOS */}
      <div className="space-y-4">
        <h2 className="text-base font-black text-white">Eventos Registrados ({eventos.length})</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          {eventos.map(ev => (
            <div key={ev.id} className="p-5 bg-[#071527] border border-slate-800 rounded-3xl space-y-3 flex flex-col justify-between shadow-xl">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-white text-base leading-snug">{ev.titulo}</h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#00B4A7]/20 text-[#00B4A7]">
                    {ev.tipo}
                  </span>
                </div>
                <p className="text-xs text-[#F7B52C] font-mono font-bold flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5" /> {ev.fecha}
                </p>
                <p className="text-xs text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#00B4A7]" /> {ev.sede}
                </p>
                {ev.descripcion && <p className="text-xs text-slate-400 leading-relaxed pt-1">{ev.descripcion}</p>}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleEliminarEvento(ev.id)}
                  className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar Evento</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

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