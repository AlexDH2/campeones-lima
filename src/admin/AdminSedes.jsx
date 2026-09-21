import { precioValido } from '../domain';
import { guardar } from './operaciones';
import React, { useState, useEffect } from 'react';
import { useToast } from '../toast';
import ModalConfirmacion from './ModalConfirmacion';
import { 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  Loader2, 
  Upload, 
  Crop, 
  Clock, 
  X, 
  Image as ImageIcon,
  Trophy,
  Copy,
  Phone,
  Sparkles
} from 'lucide-react';
import { supabase } from '../supabase';
import ModalEncuadre from './ModalEncuadre';

function parsearHora(strHora) {
  if (!strHora || typeof strHora !== 'string') {
    return { h: '05', m: '00', p: 'PM' };
  }
  const match = strHora.match(/(\d{1,2})\s*:\s*(\d{1,2})(?:\s*([aApP][mM]))?/);
  if (!match) {
    return { h: '05', m: '00', p: 'PM' };
  }
  const [, h, m, p] = match;
  return {
    h: h.padStart(2, '0'),
    m: m.padStart(2, '0'),
    p: p ? p.toUpperCase() : (strHora.toUpperCase().includes('PM') ? 'PM' : 'AM')
  };
}

const normalizarCoordenada = (val, defecto = 50) => {
  if (val === null || val === undefined || val === '') return defecto;
  const num = Number(val);
  return Number.isFinite(num) && num >= 0 && num <= 100 ? num : defecto;
};

// Función que limpia distrito: todo a minúsculas, sin números ni símbolos
const sanitizarDistrito = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[0-9]/g, '')
    .replace(/[^a-záéíóúüñ\s]/gi, '')
    .trim()
    .replace(/\s+/g, ' ');
};

export default function AdminSedes() {
  const { mostrarToast } = useToast();
  const [confirmacion, setConfirmacion] = useState(null);
  const [sedes, setSedes] = useState([]);
  const [errorCarga, setErrorCarga] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [sedeEnEdicion, setSedeEnEdicion] = useState(null);

  const [categoriasCentrales, setCategoriasCentrales] = useState([]);
  const [disciplinasGlobales, setDisciplinasGlobales] = useState(['Básquetbol', 'Voleibol']);

  const [canchasPanoramicas, setCanchasPanoramicas] = useState([]);
  const [guardandoPanoramicas, setGuardandoPanoramicas] = useState(false);

  const [formSede, setFormSede] = useState({
    nombre: '',
    distrito: '',
    direccion: '',
    referencia: '',
    maps: '',
    telefono_contacto: '',
    foto_principal: '',
    imagenes: [],
    posiciones_fotos: {},
    disciplinas: ['Básquetbol', 'Voleibol'],
    horarios: []
  });

  const [turnoEnEdicionIdx, setTurnoEnEdicionIdx] = useState(null);
  const [formTurno, setFormTurno] = useState({
    deporte: 'Básquetbol',
    otraDisciplina: '',
    tipo: 'Mixto',
    categoria: '',
    dias: 'Lunes, Miércoles y Viernes',
    horaInicioH: '05',
    horaInicioM: '00',
    horaInicioP: 'PM',
    horaFinH: '06',
    horaFinM: '00',
    horaFinP: 'PM',
    precio_mes: 180,
    precio_x2: 270,
    precio_x2_u: 340,
    precio_clase: 20
  });

  const [modalEncuadreAbierto, setModalEncuadreAbierto] = useState(false);
  const [fotoParaEncuadrar, setFotoParaEncuadrar] = useState(null);

  useEffect(() => {
    async function cargarDatosIniciales() {
      try {
        const [resSedes, resConfig] = await Promise.all([
          supabase.from('sedes').select('*').order('nombre', { ascending: true }),
          supabase.from('configuracion_web').select('clave, valor').in('clave', [
            'categorias_edades',
            'inicio_disciplinas',
            'tarjetas_disciplina',
            'banner_canchas_sedes'
          ])
        ]);
        for (const respuesta of [resSedes, resConfig]) { if (respuesta.error) throw respuesta.error; }

        if (resSedes.data) setSedes(resSedes.data);

        if (resConfig.data) {
          resConfig.data.forEach(item => {
            if (item.clave === 'categorias_edades' && Array.isArray(item.valor)) {
              setCategoriasCentrales(item.valor);
            }
            if ((item.clave === 'inicio_disciplinas' || item.clave === 'tarjetas_disciplina') && Array.isArray(item.valor)) {
              const nombres = item.valor.map(d => d.nombre || d.titulo).filter(Boolean);
              if (nombres.length > 0) {
                setDisciplinasGlobales(Array.from(new Set(['Básquetbol', 'Voleibol', ...nombres])));
              }
            }
            if (item.clave === 'banner_canchas_sedes' && Array.isArray(item.valor)) {
              setCanchasPanoramicas(item.valor);
            }
          });
        }
      } catch (err) {
        console.error("Error al cargar sedes:", err);
        setErrorCarga('No se pudo cargar la información. Recarga para reintentar.');
      } finally {
        setCargando(false);
      }
    }
    cargarDatosIniciales();
  }, []);

  const handleSubirFotoPanoramica = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const nombreLimpio = `panoramica_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const { error } = await supabase.storage.from('imagenes_web').upload(`sedes/${nombreLimpio}`, file, {
      upsert: true,
      contentType: file.type || 'image/png'
    });

    if (error) return mostrarToast("Error al subir foto panorámica: " + error.message, "error");

    const { data } = supabase.storage.from('imagenes_web').getPublicUrl(`sedes/${nombreLimpio}`);
    const nuevoItem = {
      id: Date.now(),
      url: data.publicUrl,
      sedeNombre: 'Nueva Cancha Techada',
      distrito: 'lima',
      posX: 50,
      posY: 50
    };

    const nuevaLista = [...canchasPanoramicas, nuevoItem];
    const res = await guardar(supabase.from('configuracion_web').upsert({
      clave: 'banner_canchas_sedes',
      valor: nuevaLista
    }));
    if (!res.ok) {
      mostrarToast(res.error, "error");
      return;
    }
    setCanchasPanoramicas(nuevaLista);
  };

  const handleCambiarTextoPanoramica = (idx, campo, valor) => {
    const nuevaLista = [...canchasPanoramicas];
    nuevaLista[idx] = { 
      ...nuevaLista[idx], 
      [campo]: campo === 'distrito' ? sanitizarDistrito(valor) : valor 
    };
    setCanchasPanoramicas(nuevaLista);
  };

  const handleEliminarFotoPanoramica = async (idx) => {
    setConfirmacion({
      mensaje: "¿Deseas quitar esta foto del fondo panorámico?",
      peligroso: true,
      onConfirmar: async () => {
        setConfirmacion(null);
        const nuevaLista = canchasPanoramicas.filter((_, i) => i !== idx);
        const res = await guardar(supabase.from('configuracion_web').upsert({
          clave: 'banner_canchas_sedes',
          valor: nuevaLista
        }));
        if (!res.ok) {
          mostrarToast(res.error, "error");
          return;
        }
        setCanchasPanoramicas(nuevaLista);
      }
    });
  };

  const handleGuardarTodasPanoramicas = async () => {
    setGuardandoPanoramicas(true);
    try {
      const res = await guardar(supabase.from('configuracion_web').upsert({
        clave: 'banner_canchas_sedes',
        valor: canchasPanoramicas
      }));
      if (!res.ok) {
        mostrarToast(res.error, "error");
        return;
      }
      mostrarToast("Fondo panorámico guardado exitosamente.", "exito");
    } finally {
      setGuardandoPanoramicas(false);
    }
  };

  const abrirModalNuevaSede = () => {
    setSedeEnEdicion(null);
    setFormSede({
      nombre: '',
      distrito: 'san miguel',
      direccion: '',
      referencia: '',
      maps: '',
      telefono_contacto: '',
      foto_principal: '',
      imagenes: [],
      posiciones_fotos: {},
      disciplinas: ['Básquetbol', 'Voleibol'],
      horarios: []
    });
    setTurnoEnEdicionIdx(null);
    setModalAbierto(true);
  };

  const abrirModalEditarSede = (sede) => {
    setSedeEnEdicion(sede);
    let fotosArray = Array.isArray(sede.imagenes) ? [...sede.imagenes] : [];
    if (fotosArray.length === 0 && sede.foto_principal) fotosArray = [sede.foto_principal];

    setFormSede({
      nombre: sede.nombre || '',
      distrito: sanitizarDistrito(sede.distrito) || '',
      direccion: sede.direccion || '',
      referencia: sede.referencia || '',
      maps: sede.maps || sede.mapa || sede.mapa_url || '',
      telefono_contacto: sede.telefono_contacto || '',
      foto_principal: sede.foto_principal || (fotosArray.slice(0).shift() || ''),
      imagenes: fotosArray,
      posiciones_fotos: sede.posiciones_fotos || {},
      disciplinas: Array.isArray(sede.disciplinas) && sede.disciplinas.length > 0
        ? sede.disciplinas
        : (Array.isArray(sede.disciplinas_disponibles) && sede.disciplinas_disponibles.length > 0 ? sede.disciplinas_disponibles : ['Básquetbol', 'Voleibol']),
      horarios: Array.isArray(sede.horarios) ? sede.horarios : []
    });

    setTurnoEnEdicionIdx(null);
    setModalAbierto(true);
  };

  const handleSubirFotoSede = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const nombreLimpio = `sede_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const { error } = await supabase.storage.from('imagenes_web').upload(`sedes/${nombreLimpio}`, file, {
      upsert: true,
      contentType: file.type || 'image/png'
    });

    if (error) return mostrarToast("Error al subir foto: " + error.message, "error");

    const { data } = supabase.storage.from('imagenes_web').getPublicUrl(`sedes/${nombreLimpio}`);
    const nuevasFotos = [...formSede.imagenes, data.publicUrl];
    const esPrimera = nuevasFotos.length === 1;

    setFormSede(prev => ({
      ...prev,
      imagenes: nuevasFotos,
      foto_principal: esPrimera || !prev.foto_principal ? data.publicUrl : prev.foto_principal
    }));
  };

  const handleMarcarFotoPrincipal = (url) => {
    setFormSede(prev => ({ ...prev, foto_principal: url }));
  };

  const handleEliminarFoto = (urlAEliminar) => {
    const nuevasFotos = formSede.imagenes.filter(url => url !== urlAEliminar);
    let nuevaPrincipal = formSede.foto_principal;
    if (formSede.foto_principal === urlAEliminar) {
      nuevaPrincipal = nuevasFotos.slice(0).shift() || '';
    }
    setFormSede(prev => ({
      ...prev,
      imagenes: nuevasFotos,
      foto_principal: nuevaPrincipal
    }));
  };

  const handleGuardarEncuadreFoto = async (posOValorY, posObjeto) => {
    if (!fotoParaEncuadrar) return;

    let posX = 50;
    let posY = 50;

    if (typeof posOValorY === 'object' && posOValorY !== null) {
      posX = normalizarCoordenada(posOValorY.x);
      posY = normalizarCoordenada(posOValorY.y);
    } else if (typeof posObjeto === 'object' && posObjeto !== null) {
      posX = normalizarCoordenada(posObjeto.x);
      posY = normalizarCoordenada(posObjeto.y);
    } else {
      posY = normalizarCoordenada(posOValorY);
      posX = normalizarCoordenada(posObjeto);
    }

    if (fotoParaEncuadrar.esFondoPanoramico) {
      const idx = fotoParaEncuadrar.idx;
      const nuevaLista = [...canchasPanoramicas];
      nuevaLista[idx] = { ...nuevaLista[idx], posX, posY };
      const res = await guardar(supabase.from('configuracion_web').upsert({
        clave: 'banner_canchas_sedes',
        valor: nuevaLista
      }));
      if (!res.ok) {
        mostrarToast(res.error, "error");
        return;
      }
      setCanchasPanoramicas(nuevaLista);
    } else {
      const urlTarget = fotoParaEncuadrar.url;
      setFormSede(prev => ({
        ...prev,
        posiciones_fotos: {
          ...(prev.posiciones_fotos || {}),
          [urlTarget]: { x: posX, y: posY }
        }
      }));
    }

    setModalEncuadreAbierto(false);
    setFotoParaEncuadrar(null);
  };

  // --- GESTIÓN DE TURNOS ---
  const handleAgregarOActualizarTurno = () => {
    const deporteFinal = formTurno.deporte === 'OTRA' 
      ? (formTurno.otraDisciplina.trim() || 'Deporte General')
      : formTurno.deporte;

    const categoriaFinal = formTurno.categoria.trim() || (categoriasCentrales[0]?.nombre || 'Todas las edades');
    const horaInicioTexto = `${formTurno.horaInicioH}:${formTurno.horaInicioM} ${formTurno.horaInicioP}`;
    const horaFinTexto = `${formTurno.horaFinH}:${formTurno.horaFinM} ${formTurno.horaFinP}`;

    const nuevoTurno = {
      id: turnoEnEdicionIdx !== null ? formSede.horarios[turnoEnEdicionIdx].id : Date.now(),
      deporte: deporteFinal,
      tipo: formTurno.tipo || 'Mixto',
      categoria: categoriaFinal,
      dias: formTurno.dias,
      horaInicio: horaInicioTexto,
      horaFin: horaFinTexto,
      precio_mes: precioValido(formTurno.precio_mes),
      precio_x2: precioValido(formTurno.precio_x2),
      precio_x2_u: precioValido(formTurno.precio_x2_u),
      precio_x3: null,
      precio_x3_u: null,
      precio_clase: precioValido(formTurno.precio_clase)
    };

    let nuevosHorarios = [...formSede.horarios];
    if (turnoEnEdicionIdx !== null) {
      nuevosHorarios[turnoEnEdicionIdx] = nuevoTurno;
    } else {
      nuevosHorarios.push(nuevoTurno);
    }

    setFormSede(prev => ({ ...prev, horarios: nuevosHorarios }));
    setTurnoEnEdicionIdx(null);
    setFormTurno({
      deporte: 'Básquetbol',
      otraDisciplina: '',
      tipo: 'Mixto',
      categoria: '',
      dias: 'Lunes, Miércoles y Viernes',
      horaInicioH: '05',
      horaInicioM: '00',
      horaInicioP: 'PM',
      horaFinH: '06',
      horaFinM: '00',
      horaFinP: 'PM',
      precio_mes: 180,
      precio_x2: 270,
      precio_x2_u: 340,
      precio_clase: 20
    });
  };

  const handleEditarTurno = (idx) => {
    const turno = formSede.horarios.slice(idx).shift();
    if (!turno) return;
    setTurnoEnEdicionIdx(idx);

    const esConocido = disciplinasGlobales.includes(turno.deporte) || turno.deporte === 'Ambos (Básquet & Vóley)';
    const inicio = parsearHora(turno.horaInicio);
    const fin = parsearHora(turno.horaFin);

    setFormTurno({
      deporte: esConocido ? turno.deporte : 'OTRA',
      otraDisciplina: esConocido ? '' : (turno.deporte || ''),
      tipo: turno.tipo || 'Mixto',
      categoria: turno.categoria || '',
      dias: turno.dias || 'Lunes, Miércoles y Viernes',
      horaInicioH: inicio.h,
      horaInicioM: inicio.m,
      horaInicioP: inicio.p,
      horaFinH: fin.h,
      horaFinM: fin.m,
      horaFinP: fin.p,
      precio_mes: turno.precio_mes ?? '',
      precio_x2: turno.precio_x2 ?? '',
      precio_x2_u: turno.precio_x2_u ?? '',
      precio_clase: turno.precio_clase ?? ''
    });
  };

  const handleDuplicarTurno = (idx) => {
    const turnoOriginal = formSede.horarios.slice(idx).shift();
    if (!turnoOriginal) return;

    const turnoClonado = { ...turnoOriginal, id: crypto.randomUUID() };
    const nuevosHorarios = [...formSede.horarios];
    nuevosHorarios.splice(idx + 1, 0, turnoClonado);
    setFormSede(prev => ({ ...prev, horarios: nuevosHorarios }));
  };

  const handleEliminarTurno = (idx) => {
    setFormSede(prev => ({
      ...prev,
      horarios: prev.horarios.filter((_, i) => i !== idx)
    }));
  };

  const handleGuardarSede = async (e) => {
    e.preventDefault();
    if (!formSede.nombre.trim()) return mostrarToast("Ingresa el nombre de la sede.", "error");

    const distritoLimpio = sanitizarDistrito(formSede.distrito);

    setGuardando(true);
    try {
      const payload = {
        nombre: formSede.nombre.trim(),
        distrito: distritoLimpio,
        direccion: formSede.direccion.trim(),
        referencia: formSede.referencia.trim(),
        maps: formSede.maps.trim(),
        telefono_contacto: formSede.telefono_contacto ? formSede.telefono_contacto.trim() : null,
        disciplinas: formSede.disciplinas,
        foto_principal: formSede.foto_principal || formSede.imagenes.slice(0).shift() || '',
        imagenes: formSede.imagenes,
        posiciones_fotos: formSede.posiciones_fotos,
        horarios: formSede.horarios
      };

      if (sedeEnEdicion) {
        const { error } = await supabase.from('sedes').update(payload).eq('id', sedeEnEdicion.id);
        if (error) throw error;
        setSedes(sedes.map(s => s.id === sedeEnEdicion.id ? { ...s, ...payload } : s));
      } else {
        const { data, error } = await supabase.from('sedes').insert([payload]).select();
        if (error) throw error;
        if (data && data[0]) setSedes([...sedes, data[0]]);
      }

      setModalAbierto(false);
      mostrarToast("¡Sede, tarifas y horarios guardados exitosamente!", "exito");
    } catch (err) {
      mostrarToast("Error al guardar: " + err.message, "error");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarSede = async (id, nombre) => {
    setConfirmacion({
      mensaje: `¿Eliminar definitivamente la ${nombre}?`,
      peligroso: true,
      onConfirmar: async () => {
        setConfirmacion(null);
        const { error } = await supabase.from('sedes').delete().eq('id', id);
        if (!error) {
          setSedes(sedes.filter(s => s.id !== id));
          mostrarToast("Sede eliminada.", "exito");
        }
      }
    });
  };

  if (errorCarga) return <div role="alert" className="p-6 text-red-300 space-y-3"><p>{errorCarga}</p><button type="button" onClick={() => window.location.reload()} className="underline">Reintentar carga</button></div>;

  if (cargando) {
    return (
      <div className="p-12 text-center space-y-3">
        <Loader2 className="w-10 h-10 text-[#00B4A7] animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cargando Módulo de Sedes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl animate-in fade-in duration-300">
      
      {/* MODAL DE ENCUADRE LIBRE */}
      {modalEncuadreAbierto && fotoParaEncuadrar && (
        <ModalEncuadre
          abierto={modalEncuadreAbierto}
          alCerrar={() => { setModalEncuadreAbierto(false); setFotoParaEncuadrar(null); }}
          imagenUrl={fotoParaEncuadrar.url}
          posicionInicial={{ x: fotoParaEncuadrar.posX ?? 50, y: fotoParaEncuadrar.posY ?? 50 }}
          alGuardar={handleGuardarEncuadreFoto}
          esSede={true}
          sedeData={{
            nombre: fotoParaEncuadrar.sedeNombre || formSede.nombre || 'SEDE OFICIAL',
            distrito: fotoParaEncuadrar.distrito || formSede.distrito || 'lima'
          }}
        />
      )}

      {/* CABECERA PRINCIPAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <MapPin className="w-7 h-7 text-[#00B4A7]" /> Sedes, Canchas & Horarios
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestiona la cabecera panorámica de /sedes, turnos fijos y fotos oficiales de cada coliseo.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirModalNuevaSede}
          className="px-5 py-2.5 rounded-xl bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#00B4A7]/25 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nueva Sede</span>
        </button>
      </div>

      {/* FONDO PANORÁMICO DE CANCHAS */}
      <div className="bg-[#071527] border-2 border-[#00B4A7]/50 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#00B4A7]/15 text-[#00B4A7]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                Fondo Panorámico de Canchas (/sedes) ({canchasPanoramicas.length} fotos)
              </h2>
              <p className="text-xs text-slate-400">
                Sube fotos de coliseos y encuádralas libremente para el banner de la web pública.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 font-black px-4 py-2 rounded-xl text-xs cursor-pointer shadow flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              <span>+ Subir Foto</span>
              <input type="file" accept="image/*" onChange={handleSubirFotoPanoramica} className="hidden" />
            </label>

            {canchasPanoramicas.length > 0 && (
              <button
                type="button"
                onClick={handleGuardarTodasPanoramicas}
                disabled={guardandoPanoramicas}
                className="bg-[#F7B52C] hover:bg-[#e6a524] text-slate-950 font-black px-4 py-2 rounded-xl text-xs cursor-pointer shadow flex items-center gap-1.5"
              >
                {guardandoPanoramicas ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Guardar Textos</span>
              </button>
            )}
          </div>
        </div>

        {canchasPanoramicas.length === 0 ? (
          <div className="p-8 text-center bg-[#040914] rounded-2xl border border-dashed border-slate-800 text-xs text-slate-400">
            No has configurado fotos independientes para el fondo de /sedes.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {canchasPanoramicas.map((cancha, idx) => (
              <div key={cancha.id || idx} className="bg-[#040914] border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-800">
                    <img
                      src={cancha.url}
                      alt={cancha.sedeNombre}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: `${normalizarCoordenada(cancha.posX)}% ${normalizarCoordenada(cancha.posY)}%` }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFotoParaEncuadrar({
                          esFondoPanoramico: true,
                          url: cancha.url,
                          idx,
                          posX: cancha.posX ?? 50,
                          posY: cancha.posY ?? 50,
                          sedeNombre: cancha.sedeNombre,
                          distrito: sanitizarDistrito(cancha.distrito)
                        });
                        setModalEncuadreAbierto(true);
                      }}
                      className="absolute bottom-2 right-2 bg-black/80 hover:bg-[#F7B52C] hover:text-slate-950 text-white font-bold text-[10px] px-2 py-1 rounded-lg border border-white/20 flex items-center gap-1 cursor-pointer"
                    >
                      <Crop className="w-3 h-3" />
                      <span>Encuadrar</span>
                    </button>
                  </div>

                  <div className="space-y-2 pt-2 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Nombre en Pantalla:</label>
                      <input
                        type="text"
                        value={cancha.sedeNombre || ''}
                        onChange={(e) => handleCambiarTextoPanoramica(idx, 'sedeNombre', e.target.value)}
                        className="w-full bg-[#071527] border border-slate-800 p-2 rounded-xl text-white font-bold text-xs uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Distrito (en minúsculas):</label>
                      <input
                        type="text"
                        value={cancha.distrito || ''}
                        onChange={(e) => handleCambiarTextoPanoramica(idx, 'distrito', e.target.value)}
                        className="w-full bg-[#071527] border border-slate-800 p-2 rounded-xl text-white text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleEliminarFotoPanoramica(idx)}
                    className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Quitar foto</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CATÁLOGO DE SEDES INDIVIDUALES */}
      <div className="space-y-4 pt-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#F7B52C]" /> Sedes Registradas ({sedes.length})
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sedes.map(s => {
            const fotos = Array.isArray(s.imagenes) && s.imagenes.length > 0 ? s.imagenes : [s.foto_principal].filter(Boolean);
            const fotoPortada = s.foto_principal || fotos.slice(0).shift() || '';
            const pos = s.posiciones_fotos?.[fotoPortada];
            const posX = typeof pos === 'object' && pos !== null ? normalizarCoordenada(pos.x) : 50;
            const posY = typeof pos === 'object' && pos !== null ? normalizarCoordenada(pos.y) : normalizarCoordenada(pos);

            return (
              <div key={s.id} className="bg-[#071527] border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group">
                <div>
                  <div className="relative aspect-video bg-slate-950 overflow-hidden">
                    {fotoPortada ? (
                      <img 
                        src={fotoPortada} 
                        alt={s.nombre} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        style={{ objectPosition: `${posX}% ${posY}%` }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 font-bold">
                        Sin fotos cargadas
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-[#00B4A7] text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded shadow">
                      📍 {sanitizarDistrito(s.distrito)}
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-black text-white text-base leading-tight">{s.nombre}</h3>
                    <p className="text-xs text-slate-400 truncate">{s.direccion}</p>
                    <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 pt-0.5">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>{s.telefono_contacto ? `WhatsApp: ${s.telefono_contacto}` : 'WhatsApp General'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex gap-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => abrirModalEditarSede(s)}
                    className="flex-1 py-2 rounded-xl bg-[#040914] hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#00B4A7]" />
                    <span>Editar Sede & Turnos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEliminarSede(s.id, s.nombre)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL CREAR / EDITAR SEDE */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#071527] border-2 border-[#00B4A7]/60 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-[#040914]">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#F7B52C]" />
                  {sedeEnEdicion ? `Editando ${formSede.nombre || 'Sede'}` : 'Nueva Sede Deportiva'}
                </h3>
                <p className="text-xs text-slate-400">Configura datos, galería de fotos y tarifas regulares de la sede.</p>
              </div>
              <button type="button" onClick={() => setModalAbierto(false)} className="p-2 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarSede} className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nombre Oficial de la Sede *:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sede Liceo Naval"
                    value={formSede.nombre}
                    onChange={e => setFormSede({ ...formSede, nombre: e.target.value })}
                    className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Distrito (se guardará en minúsculas) *:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. san miguel / cercado de lima"
                    value={formSede.distrito}
                    onChange={e => setFormSede({ ...formSede, distrito: e.target.value })}
                    className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white font-bold lowercase"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Dirección Exacta:</label>
                  <input
                    type="text"
                    value={formSede.direccion}
                    onChange={e => setFormSede({ ...formSede, direccion: e.target.value })}
                    className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> WhatsApp de Atención de la Sede:
                  </label>
                  <input
                    type="text"
                    value={formSede.telefono_contacto}
                    onChange={e => setFormSede({ ...formSede, telefono_contacto: e.target.value })}
                    className="w-full bg-[#040914] border border-emerald-500/40 p-2.5 rounded-xl text-white font-mono font-bold"
                  />
                </div>
              </div>

              {/* GALERÍA DE FOTOS */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#040914] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <h4 className="font-black text-white text-xs flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#00B4A7]" />
                      Galería de Fotos ({formSede.imagenes.length} fotos)
                    </h4>
                    <p className="text-[11px] text-slate-400">Sube fotos y encuadra cada imagen arrastrando libremente con el ratón.</p>
                  </div>

                  <label className="bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 font-black px-4 py-2 rounded-xl text-xs cursor-pointer shadow flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>+ Subir Foto</span>
                    <input type="file" accept="image/*" onChange={handleSubirFotoSede} className="hidden" />
                  </label>
                </div>

                {formSede.imagenes.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                    No hay fotos subidas. Haz clic en "+ Subir Foto".
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {formSede.imagenes.map((url, idx) => {
                      const esPrincipal = formSede.foto_principal === url;
                      const pos = formSede.posiciones_fotos?.[url];
                      const posX = typeof pos === 'object' && pos !== null ? normalizarCoordenada(pos.x) : 50;
                      const posY = typeof pos === 'object' && pos !== null ? normalizarCoordenada(pos.y) : normalizarCoordenada(pos);

                      return (
                        <div key={idx} className={`relative rounded-xl overflow-hidden border-2 bg-slate-950 flex flex-col justify-between group ${
                          esPrincipal ? 'border-[#F7B52C]' : 'border-slate-800'
                        }`}>
                          <div className="relative aspect-video">
                            <img
                              src={url}
                              alt="Cancha"
                              className="w-full h-full object-cover"
                              style={{ objectPosition: `${posX}% ${posY}%` }}
                            />
                            {esPrincipal && (
                              <span className="absolute top-1.5 left-1.5 bg-[#F7B52C] text-slate-950 font-black text-[9px] px-2 py-0.5 rounded shadow">
                                ★ Portada
                              </span>
                            )}
                          </div>

                          <div className="p-2 bg-[#071527] flex items-center justify-between gap-1 border-t border-slate-800">
                            <button
                              type="button"
                              onClick={() => {
                                setFotoParaEncuadrar({
                                  esFondoPanoramico: false,
                                  url,
                                  posX,
                                  posY,
                                  sedeNombre: formSede.nombre,
                                  distrito: sanitizarDistrito(formSede.distrito)
                                });
                                setModalEncuadreAbierto(true);
                              }}
                              className="p-1 rounded bg-black/60 hover:bg-[#00B4A7] hover:text-slate-950 text-slate-300 text-[10px] font-bold flex items-center gap-1 border border-slate-700 cursor-pointer"
                            >
                              <Crop className="w-3 h-3" />
                              <span>Encuadrar</span>
                            </button>

                            {!esPrincipal && (
                              <button
                                type="button"
                                onClick={() => handleMarcarFotoPrincipal(url)}
                                className="text-[10px] text-[#F7B52C] hover:underline font-bold"
                              >
                                Hacer Portada
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleEliminarFoto(url)}
                              className="p-1 text-red-400 hover:text-red-300 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* HORARIOS Y TARIFAS REGULARES */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#040914] border border-slate-800 space-y-4">
                
                <div className="border-b border-slate-800/80 pb-2">
                  <h4 className="font-black text-white text-xs flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#F7B52C]" />
                    Horarios de Entrenamiento & Tarifas Regulares ({formSede.horarios.length} turnos)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Configura las tarifas habituales (Mes, X2 y Clase).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#071527] border border-slate-800 space-y-4">
                  <span className="text-[11px] font-black uppercase text-[#00B4A7] tracking-wider block">
                    {turnoEnEdicionIdx !== null ? '✏️ Editando Turno' : '+ Agregar Turno a la Sede'}
                  </span>

                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Deporte / Disciplina:</label>
                      <select
                        value={formTurno.deporte}
                        onChange={e => setFormTurno({ ...formTurno, deporte: e.target.value })}
                        className="w-full bg-[#040914] border border-slate-800 p-2 rounded-xl text-white font-bold cursor-pointer"
                      >
                        <option value="Básquetbol">🏀 Básquetbol</option>
                        <option value="Voleibol">🏐 Voleibol</option>
                        <option value="Básquetbol Femenino">🏀 Básquetbol Femenino</option>
                        <option value="Pre-Selección Vóley">⭐ Pre-Selección Vóley</option>
                        <option value="Pre-Selección Básquet">⭐ Pre-Selección Básquet</option>
                        {disciplinasGlobales
                          .filter(d => !['Básquetbol', 'Voleibol', 'Básquetbol Femenino', 'Pre-Selección Vóley'].includes(d))
                          .map((d, i) => (
                            <option key={i} value={d}>🏆 {d}</option>
                          ))}
                        <option value="OTRA">+ Otra disciplina...</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Categoría / Edades:</label>
                      <input
                        type="text"
                        list="categorias-sugeridas"
                        placeholder="Ej. 10 a 13 años / Sub-15"
                        value={formTurno.categoria}
                        onChange={e => setFormTurno({ ...formTurno, categoria: e.target.value })}
                        className="w-full bg-[#040914] border border-slate-800 p-2 rounded-xl text-white font-bold"
                      />
                      <datalist id="categorias-sugeridas">
                        {categoriasCentrales.map(c => (
                          <option key={c.id} value={c.nombre} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Días de Clase:</label>
                      <input
                        type="text"
                        placeholder="Ej. Lunes, Miércoles y Viernes"
                        value={formTurno.dias}
                        onChange={e => setFormTurno({ ...formTurno, dias: e.target.value })}
                        className="w-full bg-[#040914] border border-slate-800 p-2 rounded-xl text-white"
                      />
                    </div>
                  </div>

                  {/* HORAS */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Rango de Horas:</label>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-bold">Inicio:</span>
                      <input
                        type="text"
                        maxLength={2}
                        value={formTurno.horaInicioH}
                        onChange={e => setFormTurno({ ...formTurno, horaInicioH: e.target.value })}
                        className="w-12 bg-[#040914] border border-slate-800 p-1.5 rounded-lg text-center text-white font-mono font-bold"
                      />
                      <span className="text-slate-400 font-bold">:</span>
                      <input
                        type="text"
                        maxLength={2}
                        value={formTurno.horaInicioM}
                        onChange={e => setFormTurno({ ...formTurno, horaInicioM: e.target.value })}
                        className="w-12 bg-[#040914] border border-slate-800 p-1.5 rounded-lg text-center text-white font-mono font-bold"
                      />
                      <select
                        value={formTurno.horaInicioP}
                        onChange={e => setFormTurno({ ...formTurno, horaInicioP: e.target.value })}
                        className="bg-[#040914] border border-slate-800 p-1.5 rounded-lg text-white font-bold cursor-pointer"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>

                      <span className="text-slate-500 font-bold px-1">➜</span>

                      <span className="text-[11px] text-slate-400 font-bold">Fin:</span>
                      <input
                        type="text"
                        maxLength={2}
                        value={formTurno.horaFinH}
                        onChange={e => setFormTurno({ ...formTurno, horaFinH: e.target.value })}
                        className="w-12 bg-[#040914] border border-slate-800 p-1.5 rounded-lg text-center text-white font-mono font-bold"
                      />
                      <span className="text-slate-400 font-bold">:</span>
                      <input
                        type="text"
                        maxLength={2}
                        value={formTurno.horaFinM}
                        onChange={e => setFormTurno({ ...formTurno, horaFinM: e.target.value })}
                        className="w-12 bg-[#040914] border border-slate-800 p-1.5 rounded-lg text-center text-white font-mono font-bold"
                      />
                      <select
                        value={formTurno.horaFinP}
                        onChange={e => setFormTurno({ ...formTurno, horaFinP: e.target.value })}
                        className="bg-[#040914] border border-slate-800 p-1.5 rounded-lg text-white font-bold cursor-pointer"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>

                  {/* TARIFAS REGULARES */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <label className="text-slate-300 font-bold text-xs block">
                      💰 Tarifas Regulares del Turno (Soles):
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                      <div className="p-2.5 rounded-xl bg-[#040914] border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">1 Mes Regular</span>
                        <input
                          type="number"
                          value={formTurno.precio_mes}
                          onChange={e => setFormTurno({ ...formTurno, precio_mes: e.target.value })}
                          className="w-full bg-[#071527] border border-slate-800 p-1.5 rounded-lg text-center text-white font-mono font-bold text-sm"
                        />
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#040914] border border-[#F7B52C]/40">
                        <span className="text-[10px] text-[#F7B52C] uppercase font-bold block mb-1">Promo X2</span>
                        <input
                          type="number"
                          value={formTurno.precio_x2}
                          onChange={e => setFormTurno({ ...formTurno, precio_x2: e.target.value })}
                          className="w-full bg-[#071527] border border-slate-800 p-1.5 rounded-lg text-center text-[#F7B52C] font-mono font-bold text-sm"
                        />
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#040914] border border-[#00B4A7]/50">
                        <span className="text-[10px] text-[#00B4A7] uppercase font-bold block mb-1">X2 + Uniforme</span>
                        <input
                          type="number"
                          value={formTurno.precio_x2_u}
                          onChange={e => setFormTurno({ ...formTurno, precio_x2_u: e.target.value })}
                          className="w-full bg-[#071527] border border-slate-800 p-1.5 rounded-lg text-center text-[#00B4A7] font-mono font-bold text-sm"
                        />
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#040914] border border-cyan-500/40">
                        <span className="text-[10px] text-cyan-400 uppercase font-bold block mb-1">Clase</span>
                        <input
                          type="number"
                          value={formTurno.precio_clase}
                          onChange={e => setFormTurno({ ...formTurno, precio_clase: e.target.value })}
                          className="w-full bg-[#071527] border border-slate-800 p-1.5 rounded-lg text-center text-cyan-400 font-mono font-bold text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleAgregarOActualizarTurno}
                      className="px-6 py-2.5 rounded-xl bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer shadow"
                    >
                      {turnoEnEdicionIdx !== null ? 'Guardar Cambios del Turno' : '+ Agregar Turno'}
                    </button>
                  </div>
                </div>

                {/* LISTA DE TURNOS */}
                <div className="space-y-2 pt-1">
                  {formSede.horarios.map((t, idx) => {
                    const esVoley = t.deporte?.toLowerCase().includes('voley');
                    const esPre = t.deporte?.toLowerCase().includes('pre-selección');
                    const textoHoras = (t.horaInicio && t.horaFin) 
                      ? `${t.horaInicio} - ${t.horaFin}` 
                      : (t.horario || t.hora || 'Horario por definir');

                    return (
                      <div key={idx} className="p-3 bg-[#071527] rounded-xl border border-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between items-start">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                esPre ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : esVoley ? 'bg-[#00B4A7]/20 text-[#00B4A7] border border-[#00B4A7]/30' : 'bg-[#F7B52C]/20 text-[#F7B52C] border border-[#F7B52C]/30'
                              }`}>
                                {t.deporte || 'Básquetbol'}
                              </span>
                              <strong className="text-white text-sm">{t.categoria || 'Todas las edades'}</strong>
                            </div>
                            <p className="text-slate-400 text-[11px]">
                              {t.dias || 'Días regulares'} · <span className="font-mono text-slate-300 font-bold">{textoHoras}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDuplicarTurno(idx)}
                              className="text-[#F7B52C] hover:underline font-bold px-2 py-1 flex items-center gap-1 cursor-pointer"
                              title="Duplicar horario"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Duplicar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleEditarTurno(idx)}
                              className="text-[#00B4A7] hover:underline font-bold px-2 py-1 cursor-pointer"
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() => handleEliminarTurno(idx)}
                              className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80 text-[10px] font-mono">
                          <span className="text-slate-400 font-sans">Tarifas:</span>
                          <span className="px-2 py-0.5 rounded bg-[#040914] text-white">
                            {(() => {
                              const p = precioValido(t.precio_mes);
                              return p !== null ? `Mes: S/.${p}` : 'Mes: Por definir';
                            })()}
                          </span>
                          {t.precio_x2 && <span className="px-2 py-0.5 rounded bg-[#040914] text-[#F7B52C] font-bold">X2: S/.{t.precio_x2}</span>}
                          {t.precio_x2_u && <span className="px-2 py-0.5 rounded bg-[#040914] text-[#00B4A7] font-bold">X2+U: S/.{t.precio_x2_u}</span>}
                          {t.precio_clase && <span className="px-2 py-0.5 rounded bg-[#040914] text-cyan-400">Clase: S/.{t.precio_clase}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BOTONES GUARDAR SEDE */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-7 py-2.5 rounded-xl bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#00B4A7]/25 cursor-pointer"
                >
                  {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Guardar Cambios de la Sede</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

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