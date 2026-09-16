import React, { useState, useEffect } from 'react';
import { 
  Users2, 
  Search, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  X, 
  UserPlus 
} from 'lucide-react';
import { supabase } from '../supabase';

function extraerDatosProspecto(p) {
  const nombreReal = p.nombre_alumno || "Sin nombre registrado";
  const telefonoReal = p.telefono_apoderado || "";
  return { nombreReal, telefonoReal };
}

export default function AdminProspectos() {
  const [prospectos, setProspectos] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroSede, setFiltroSede] = useState('todas');
  const [filtroDeporte, setFiltroDeporte] = useState('todos');

  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
  const [guardandoNuevo, setGuardandoNuevo] = useState(false);
  const [nuevoProspecto, setNuevoProspecto] = useState({
    nombre: '',
    telefono: '',
    sede: '',
    disciplina: 'Básquetbol',
    edad: '6 a 9 años',
    estado: 'Pendiente',
    notas: ''
  });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [resPros, resSedes] = await Promise.all([
        supabase.from('prospectos').select('*').order('created_at', { ascending: false }),
        supabase.from('sedes').select('id, nombre, distrito').order('nombre', { ascending: true })
      ]);

      if (resPros.data) setProspectos(resPros.data);
      if (resSedes.data && resSedes.data.length > 0) {
        setSedes(resSedes.data);
        setNuevoProspecto(prev => ({ ...prev, sede: resSedes.data[0].nombre }));
      }
    } catch (err) {
      console.error("Error al cargar datos:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarDatos();
  }, []);

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      const { error } = await supabase.from('prospectos').update({ estado: nuevoEstado }).eq('id', id);
      if (error) throw error;
      setProspectos(prospectos.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
    } catch (err) {
      alert("No se pudo actualizar el estado: " + (err.message || 'Error en el servidor.'));
    }
  };

  const handleActualizarNotas = async (id, notas) => {
    try {
      const { error } = await supabase.from('prospectos').update({ notas }).eq('id', id);
      if (error) throw error;
      setProspectos(prospectos.map(p => p.id === id ? { ...p, notas } : p));
    } catch (err) {
      alert("No se pudieron guardar las notas: " + (err.message || 'Error en el servidor.'));
    }
  };

  const handleEliminarProspecto = async (id) => {
    if (!confirm("¿Deseas eliminar definitivamente este registro de alumno?")) return;
    try {
      const { error } = await supabase.from('prospectos').delete().eq('id', id);
      if (error) throw error;
      setProspectos(prospectos.filter(p => p.id !== id));
    } catch (err) {
      alert("No se pudo eliminar el prospecto: " + (err.message || 'Error en el servidor.'));
    }
  };

  const handleCrearProspectoManual = async (e) => {
    e.preventDefault();
    if (!nuevoProspecto.nombre.trim() || !nuevoProspecto.telefono.trim()) {
      return alert("Ingresa al menos el nombre y el teléfono de contacto.");
    }

    setGuardandoNuevo(true);
    try {
      const itemAInsertar = {
        nombre_alumno: nuevoProspecto.nombre.trim(),
        telefono_apoderado: nuevoProspecto.telefono.trim(),
        sede: nuevoProspecto.sede || (sedes[0]?.nombre || 'Liceo Naval'),
        disciplina: nuevoProspecto.disciplina,
        edad: nuevoProspecto.edad,
        estado: nuevoProspecto.estado,
        notas: nuevoProspecto.notas
      };

      const { data, error } = await supabase.from('prospectos').insert([itemAInsertar]).select();
      if (error) throw error;

      if (data && data[0]) {
        setProspectos([data[0], ...prospectos]);
        setModalNuevoAbierto(false);
        setNuevoProspecto({
          nombre: '',
          telefono: '',
          sede: sedes[0]?.nombre || '',
          disciplina: 'Básquetbol',
          edad: '6 a 9 años',
          estado: 'Pendiente',
          notas: ''
        });
        alert("✓ Alumno registrado exitosamente en el sistema.");
      }
    } catch (err) {
      alert("No se pudo registrar el alumno: " + (err.message || 'Error en el servidor.'));
    } finally {
      setGuardandoNuevo(false);
    }
  };

  const prospectosFiltrados = prospectos.filter(p => {
    const { nombreReal, telefonoReal } = extraerDatosProspecto(p);
    const textoCompleto = `${nombreReal} ${telefonoReal} ${p.sede || ''} ${p.disciplina || ''} ${p.notas || ''}`.toLowerCase();
    
    const coincideBusqueda = textoCompleto.includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado === 'todos' || (p.estado || 'Pendiente').toLowerCase() === filtroEstado.toLowerCase();
    const coincideSede = filtroSede === 'todas' || (p.sede || '').toLowerCase() === filtroSede.toLowerCase();
    const coincideDeporte = filtroDeporte === 'todos' || (p.disciplina || '').toLowerCase() === filtroDeporte.toLowerCase();
    
    return coincideBusqueda && coincideEstado && coincideSede && coincideDeporte;
  });

  const totalMatriculados = prospectos.filter(p => (p.estado || '').toLowerCase() === 'matriculado').length;
  const totalContactados = prospectos.filter(p => (p.estado || '').toLowerCase() === 'contactado').length;
  const totalPendientes = prospectos.filter(p => (p.estado || 'pendiente').toLowerCase() === 'pendiente').length;

  if (cargando) {
    return (
      <div className="p-12 text-center space-y-3">
        <Loader2 className="w-10 h-10 text-[#00B4A7] animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cargando Gestión de Alumnos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl animate-in fade-in duration-300">
      
      {/* MODAL REGISTRO MANUAL */}
      {modalNuevoAbierto && (
        <div 
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setModalNuevoAbierto(false); }}
        >
          <div className="bg-[#071527] border border-[#0D2E4E] p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-5 shadow-2xl animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#00B4A7] tracking-wider">Registro Interno</span>
                <h3 className="text-lg font-black text-white">Nuevo Alumno o Prospecto</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setModalNuevoAbierto(false)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearProspectoManual} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Nombre del Alumno / Apoderado *:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Lucas Fernández"
                  value={nuevoProspecto.nombre}
                  onChange={e => setNuevoProspecto({ ...nuevoProspecto, nombre: e.target.value })}
                  className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold mb-1 block">Teléfono WhatsApp *:</label>
                  <input
                    type="tel"
                    required
                    placeholder="987654321"
                    value={nuevoProspecto.telefono}
                    onChange={e => setNuevoProspecto({ ...nuevoProspecto, telefono: e.target.value })}
                    className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-1 block">Deporte:</label>
                  <select
                    value={nuevoProspecto.disciplina}
                    onChange={e => setNuevoProspecto({ ...nuevoProspecto, disciplina: e.target.value })}
                    className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white font-bold cursor-pointer"
                  >
                    <option value="Básquetbol">🏀 Básquetbol</option>
                    <option value="Voleibol">🏐 Voleibol</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold mb-1 block">Sede elegida:</label>
                  <select
                    value={nuevoProspecto.sede}
                    onChange={e => setNuevoProspecto({ ...nuevoProspecto, sede: e.target.value })}
                    className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white font-bold cursor-pointer"
                  >
                    {sedes.map(s => (
                      <option key={s.id} value={s.nombre}>{s.nombre} ({s.distrito})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-1 block">Categoría / Edad:</label>
                  <select
                    value={nuevoProspecto.edad}
                    onChange={e => setNuevoProspecto({ ...nuevoProspecto, edad: e.target.value })}
                    className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white font-bold cursor-pointer"
                  >
                    <option value="6 a 9 años">6 a 9 años (Mini)</option>
                    <option value="10 a 13 años">10 a 13 años (Intermedio)</option>
                    <option value="14 a 17 años">14 a 17 años (Juvenil)</option>
                    <option value="18 años a más">18 años a más / Adultos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold mb-1 block">Estado Inicial:</label>
                <select
                  value={nuevoProspecto.estado}
                  onChange={e => setNuevoProspecto({ ...nuevoProspecto, estado: e.target.value })}
                  className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white font-bold cursor-pointer"
                >
                  <option value="Pendiente">⏳ Pendiente (Por contactar)</option>
                  <option value="Contactado">💬 Contactado (En coordinación)</option>
                  <option value="Matriculado">✓ Matriculado (Ya pagó)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold mb-1 block">Notas Privadas:</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre el alumno..."
                  value={nuevoProspecto.notas}
                  onChange={e => setNuevoProspecto({ ...nuevoProspecto, notas: e.target.value })}
                  className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalNuevoAbierto(false)}
                  className="px-4 py-2 text-slate-400 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoNuevo}
                  className="bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 font-black px-6 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
                >
                  {guardandoNuevo ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Guardar Alumno</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Users2 className="w-7 h-7 text-[#00B4A7]" /> Gestión de Alumnos & Prospectos
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Bandeja comercial del club para dar seguimiento y matricular a los interesados que llegan de la web.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalNuevoAbierto(true)}
          className="bg-[#F7B52C] hover:bg-[#e6a524] text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#F7B52C]/20 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Registrar Alumno Manual</span>
        </button>
      </div>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#071527] border border-slate-800 text-center space-y-0.5">
          <span className="text-2xl sm:text-3xl font-black text-[#F7B52C] font-mono">{totalPendientes}</span>
          <span className="text-[10px] sm:text-xs text-slate-400 font-bold block uppercase tracking-wider">
            ⏳ Pendientes
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#071527] border border-slate-800 text-center space-y-0.5">
          <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">{totalContactados}</span>
          <span className="text-[10px] sm:text-xs text-slate-400 font-bold block uppercase tracking-wider">
            💬 Contactados
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#071527] border border-slate-800 text-center space-y-0.5">
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{totalMatriculados}</span>
          <span className="text-[10px] sm:text-xs text-slate-400 font-bold block uppercase tracking-wider">
            ✓ Matriculados
          </span>
        </div>
      </div>

      {/* FILTROS */}
      <div className="grid sm:grid-cols-4 gap-3">
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, cel o notas..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full bg-[#071527] border border-slate-800 pl-10 pr-3 py-2.5 rounded-xl text-white text-xs font-bold focus:border-[#00B4A7] focus:outline-none"
          />
        </div>

        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          className="bg-[#071527] border border-slate-800 px-3 py-2.5 rounded-xl text-white text-xs font-bold cursor-pointer"
        >
          <option value="todos">Todos los Estados</option>
          <option value="Pendiente">⏳ Solo Pendientes</option>
          <option value="Contactado">💬 Solo Contactados</option>
          <option value="Matriculado">✓ Solo Matriculados</option>
        </select>

        <select
          value={filtroSede}
          onChange={e => setFiltroSede(e.target.value)}
          className="bg-[#071527] border border-slate-800 px-3 py-2.5 rounded-xl text-white text-xs font-bold cursor-pointer"
        >
          <option value="todas">Todas las Sedes</option>
          {sedes.map(s => (
            <option key={s.id} value={s.nombre}>{s.nombre} ({s.distrito})</option>
          ))}
        </select>

        <select
          value={filtroDeporte}
          onChange={e => setFiltroDeporte(e.target.value)}
          className="bg-[#071527] border border-slate-800 px-3 py-2.5 rounded-xl text-white text-xs font-bold cursor-pointer"
        >
          <option value="todos">Todos los Deportes</option>
          <option value="Básquetbol">🏀 Básquetbol</option>
          <option value="Voleibol">🏐 Voleibol</option>
        </select>
      </div>

      {/* LISTADO DE ALUMNOS */}
      {prospectosFiltrados.length === 0 ? (
        <div className="p-12 text-center bg-[#071527] rounded-3xl border border-dashed border-slate-800 text-xs text-slate-400 space-y-2">
          <Users2 className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="font-bold text-white text-sm">No hay registros con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {prospectosFiltrados.map((p) => {
            const { nombreReal, telefonoReal } = extraerDatosProspecto(p);
            const telefonoSoloDigitos = telefonoReal.replace(/\D/g, '');

            const mensajePersonalizadoWs = `¡Hola ${encodeURIComponent(nombreReal)}! Te escribimos de la Academia Campeones Lima para coordinar la clase de prueba de tu menor en la sede ${encodeURIComponent(p.sede || 'oficial')} (${encodeURIComponent(p.disciplina || 'entrenamiento')}). ¿Cómo estás?`;
            const estadoActual = p.estado || 'Pendiente';
            const esVoley = (p.disciplina || '').toLowerCase().includes('voley');

            const fechaRegistroTexto = p.created_at 
              ? new Date(p.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
              : 'Reciente';

            return (
              <div 
                key={p.id} 
                className="bg-[#071527] border border-slate-800 hover:border-slate-700 rounded-3xl p-5 space-y-3.5 shadow-xl flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded shadow ${
                          esVoley ? 'bg-[#00B4A7] text-slate-950' : 'bg-[#F7B52C] text-slate-950'
                        }`}>
                          {p.disciplina || 'Básquet / Vóley'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {fechaRegistroTexto}
                        </span>
                      </div>
                      
                      <h3 className="text-base font-black text-white mt-1.5">{nombreReal}</h3>
                    </div>

                    <select
                      value={estadoActual}
                      onChange={e => handleCambiarEstado(p.id, e.target.value)}
                      className={`text-[10px] font-black px-2.5 py-1 rounded-xl border cursor-pointer ${
                        estadoActual === 'Matriculado' 
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                          : estadoActual === 'Contactado'
                            ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                            : 'bg-[#F7B52C]/15 text-[#F7B52C] border-[#F7B52C]/30'
                      }`}
                    >
                      <option value="Pendiente">⏳ Pendiente</option>
                      <option value="Contactado">💬 Contactado</option>
                      <option value="Matriculado">✓ Matriculado</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#F7B52C] shrink-0" /> 
                      <span>Sede:</span> 
                      <strong className="text-white">{p.sede || 'No especificada'}</strong>
                    </p>
                    
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#00B4A7] shrink-0" /> 
                      <span>WhatsApp:</span> 
                      <strong className="text-white font-mono">{telefonoReal || 'Sin teléfono registrado'}</strong>
                    </p>

                    {p.edad && (
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" /> 
                        <span>Edad:</span> 
                        <strong className="text-white">{p.edad}</strong>
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800">
                    <input
                      type="text"
                      placeholder="Notas del alumno (ej. Asiste a prueba el sábado)..."
                      defaultValue={p.notas || ''}
                      onBlur={e => handleActualizarNotas(p.id, e.target.value)}
                      className="w-full bg-[#040914] border border-slate-800/80 p-2 rounded-xl text-white text-[11px] focus:border-[#00B4A7] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  {telefonoSoloDigitos ? (
                    <a
                      href={`https://wa.me/51${telefonoSoloDigitos}?text=${mensajePersonalizadoWs}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Contactar por WhatsApp</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-500">Sin número registrado</span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleEliminarProspecto(p.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-xl cursor-pointer transition-colors"
                    title="Eliminar este alumno"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}