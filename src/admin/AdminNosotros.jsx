import { guardar } from './operaciones';
import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Plus, 
  Trash2, 
  Save, 
  Loader2, 
  Crop, 
  Upload, 
  Camera, 
  Sparkles,
  CheckCircle2,
  Medal,
  X
} from 'lucide-react';
import { supabase } from '../supabase';
import ModalEncuadre from './ModalEncuadre';

export default function AdminNosotros() {
  const [errorCarga, setErrorCarga] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Estados de datos
  const [fotoBasquet, setFotoBasquet] = useState("");
  const [fotoVoley, setFotoVoley] = useState("");
  const [posicionBasquet, setPosicionBasquet] = useState(50);
  const [posicionVoley, setPosicionVoley] = useState(50);
  const [logros, setLogros] = useState([]);
  const [galeria, setGaleria] = useState([]);

  // Formulario nuevo trofeo
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [nuevaDesc, setNuevaDesc] = useState('');
  const [nuevaFotoLogro, setNuevaFotoLogro] = useState('');
  const [subiendoFotoLogro, setSubiendoFotoLogro] = useState(false);

  // Modal Encuadre interactivo estilo WhatsApp
  const [modalEncuadreAbierto, setModalEncuadreAbierto] = useState(false);
  const [itemAEncuadrar, setItemAEncuadrar] = useState(null);

  // CARGA SEGURA: NO ELIMINA NINGÚN LOGRO LEGÍTIMO
  useEffect(() => {
    async function cargarDatos() {
      try {
        const { data } = await supabase
          .from('configuracion_web')
          .select('valor')
          .eq('clave', 'nosotros_contenido')
          .maybeSingle().throwOnError();

        if (data?.valor) {
          const val = data.valor;
          setFotoBasquet(val.foto_basquet || "");
          setFotoVoley(val.foto_voley || "");
          setPosicionBasquet(val.posicion_basquet ?? 50);
          setPosicionVoley(val.posicion_voley ?? 50);
          setLogros(Array.isArray(val.logros) ? val.logros : []);
          setGaleria(Array.isArray(val.galeria) ? val.galeria : []);
        } else {
          setLogros([]);
        }
      } catch (err) {
        console.error("Error al cargar datos de Nosotros:", err);
      setErrorCarga('No se pudo cargar la información. Recarga para reintentar.');
      } finally {
        setCargando(false);
      }
    }
    cargarDatos();
  }, []);

  const persistirEnSupabase = async (objetoActualizado) => {
    setGuardando(true);
    try {
      return await guardar(supabase.from('configuracion_web').upsert({
        clave: 'nosotros_contenido',
        valor: objetoActualizado
      }));
    } catch (err) {
      alert("Error al guardar en Supabase: " + err.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleSubirFotoDisciplina = async (tipo, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const nombreLimpio = `disc_${tipo}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const { error } = await supabase.storage.from('imagenes_web').upload(
      `nosotros/${nombreLimpio}`, 
      file, 
      { upsert: true, contentType: file.type || 'image/png' }
    );

    if (error) return alert("Error al subir foto: " + error.message);

    const { data } = supabase.storage.from('imagenes_web').getPublicUrl(`nosotros/${nombreLimpio}`);
    const urlFinal = data.publicUrl;

    if (tipo === 'basquet') {
      if (!await persistirEnSupabase({
        foto_basquet: urlFinal,
        foto_voley: fotoVoley,
        posicion_basquet: posicionBasquet,
        posicion_voley: posicionVoley,
        logros,
        galeria
      })) return;
      setFotoBasquet(urlFinal);
    } else {
      if (!await persistirEnSupabase({
        foto_basquet: fotoBasquet,
        foto_voley: urlFinal,
        posicion_basquet: posicionBasquet,
        posicion_voley: posicionVoley,
        logros,
        galeria
      })) return;
      setFotoVoley(urlFinal);
    }
    alert("✓ Foto subida y guardada exitosamente.");
  };

  const handleSubirFotoLogro = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoFotoLogro(true);
    try {
      const nombreLimpio = `trofeo_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      const { error } = await supabase.storage.from('imagenes_web').upload(
        `nosotros/${nombreLimpio}`, 
        file, 
        { upsert: true, contentType: file.type || 'image/png' }
      );

      if (error) {
        alert("Error al subir foto: " + error.message);
        return;
      }

      const { data } = supabase.storage.from('imagenes_web').getPublicUrl(`nosotros/${nombreLimpio}`);
      setNuevaFotoLogro(data.publicUrl);
    } finally {
      setSubiendoFotoLogro(false);
    }
  };

  const handleAgregarLogro = async (e) => {
    e.preventDefault();
    if (!nuevoTitulo.trim()) return alert("Ingresa el título del trofeo o logro.");

    const nuevoLogro = {
      id: Date.now(),
      titulo: nuevoTitulo.trim(),
      categoria: nuevaCategoria.trim(),
      descripcion: nuevaDesc.trim(),
      foto: nuevaFotoLogro,
      posicionY: 50,
      posicionX: 50
    };

    const nuevosLogros = [nuevoLogro, ...logros];
    if (!await persistirEnSupabase({
      foto_basquet: fotoBasquet,
      foto_voley: fotoVoley,
      posicion_basquet: posicionBasquet,
      posicion_voley: posicionVoley,
      logros: nuevosLogros,
      galeria
    })) return;
    setLogros(nuevosLogros);

    setNuevoTitulo('');
    setNuevaCategoria('');
    setNuevaDesc('');
    setNuevaFotoLogro('');
    alert("✓ ¡Trofeo registrado y publicado en Supabase!");
  };

  const handleEliminarLogro = async (id) => {
    if (!confirm("¿Deseas eliminar este trofeo?")) return;

    const nuevosLogros = logros.filter(l => l.id !== id);
    if (!await persistirEnSupabase({
      foto_basquet: fotoBasquet,
      foto_voley: fotoVoley,
      posicion_basquet: posicionBasquet,
      posicion_voley: posicionVoley,
      logros: nuevosLogros,
      galeria
    })) return;
    setLogros(nuevosLogros);
  };

  const handleSubirGaleria = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setGuardando(true);
    const nuevasUrls = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const nombreLimpio = `gal_${Date.now()}_${i}_${f.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      const { error } = await supabase.storage.from('imagenes_web').upload(
        `galeria/${nombreLimpio}`, 
        f, 
        { upsert: true, contentType: f.type || 'image/png' }
      );
      if (!error) {
        const { data } = supabase.storage.from('imagenes_web').getPublicUrl(`galeria/${nombreLimpio}`);
        nuevasUrls.push(data.publicUrl);
      }
    }

    const galeriaActualizada = [...galeria, ...nuevasUrls];
    if (!await persistirEnSupabase({
      foto_basquet: fotoBasquet,
      foto_voley: fotoVoley,
      posicion_basquet: posicionBasquet,
      posicion_voley: posicionVoley,
      logros,
      galeria: galeriaActualizada
    })) return;
    setGaleria(galeriaActualizada);

    alert(`✓ Se subieron ${nuevasUrls.length} fotos a la galería.`);
  };

  const handleEliminarFotoGaleria = async (idx) => {
    const galeriaActualizada = galeria.filter((_, i) => i !== idx);
    if (!await persistirEnSupabase({
      foto_basquet: fotoBasquet,
      foto_voley: fotoVoley,
      posicion_basquet: posicionBasquet,
      posicion_voley: posicionVoley,
      logros,
      galeria: galeriaActualizada
    })) return;
    setGaleria(galeriaActualizada);
  };

  const handleGuardarEncuadre = async (posY, posX = 50, nuevaUrl = null) => {
    if (!itemAEncuadrar) return;

    let objFinal = {
      foto_basquet: fotoBasquet,
      foto_voley: fotoVoley,
      posicion_basquet: posicionBasquet,
      posicion_voley: posicionVoley,
      logros,
      galeria
    };

    if (itemAEncuadrar.tipo === 'basquet') {
      const urlFinal = nuevaUrl || fotoBasquet;
      setPosicionBasquet(posY);
      setFotoBasquet(urlFinal);
      objFinal.posicion_basquet = posY;
      objFinal.foto_basquet = urlFinal;
    } else if (itemAEncuadrar.tipo === 'voley') {
      const urlFinal = nuevaUrl || fotoVoley;
      setPosicionVoley(posY);
      setFotoVoley(urlFinal);
      objFinal.posicion_voley = posY;
      objFinal.foto_voley = urlFinal;
    } else if (itemAEncuadrar.tipo === 'logro') {
      const nuevosLogros = logros.map(l => {
        if (l.id === itemAEncuadrar.id) {
          return {
            ...l,
            posicionY: posY,
            posicionX: posX,
            foto: nuevaUrl || l.foto
          };
        }
        return l;
      });
      setLogros(nuevosLogros);
      objFinal.logros = nuevosLogros;
    }

    if (!await persistirEnSupabase(objFinal)) return;
    setModalEncuadreAbierto(false);
    setItemAEncuadrar(null);
  };

  if (errorCarga) return <div role="alert" className="p-6 text-red-300 space-y-3"><p>{errorCarga}</p><button type="button" onClick={() => window.location.reload()} className="underline">Reintentar carga</button></div>;

  if (cargando) {
    return (
      <div className="p-12 text-center space-y-3">
        <Loader2 className="w-10 h-10 text-[#00B4A7] animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cargando Nosotros & Galería...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-5xl animate-in fade-in duration-300">
      
      {modalEncuadreAbierto && itemAEncuadrar && (
        <ModalEncuadre
          abierto={modalEncuadreAbierto}
          alCerrar={() => {
            setModalEncuadreAbierto(false);
            setItemAEncuadrar(null);
          }}
          imagenUrl={itemAEncuadrar.url}
          posicionInicial={itemAEncuadrar.posY || 50}
          posicionInicialX={itemAEncuadrar.posX || 50}
          alGuardar={handleGuardarEncuadre}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-[#F7B52C]" /> Gestión de Fotos: Nosotros & Galería
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Controla las portadas de disciplinas, las copas ganadas y los momentos en coliseo para la página /nosotros.
          </p>
        </div>

        {guardando && (
          <div className="flex items-center gap-2 text-xs text-[#00B4A7] font-bold">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Guardando en Supabase...</span>
          </div>
        )}
      </div>

      {/* 1. PORTADAS DE DISCIPLINAS (16:10) */}
      <div className="p-6 bg-[#071527] border border-slate-800 rounded-3xl space-y-5 shadow-xl">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#F7B52C]" /> Portadas de Disciplinas (16:10)
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="p-4 bg-[#040914] rounded-2xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-[#F7B52C] uppercase flex items-center gap-1">
                🏀 BÁSQUETBOL
              </span>
              <label className="bg-[#F7B52C] hover:bg-[#e6a524] text-slate-950 font-black px-3 py-1 rounded-lg text-xs cursor-pointer transition-colors shadow">
                <span>Subir Nueva</span>
                <input type="file" accept="image/*" onChange={e => handleSubirFotoDisciplina('basquet', e)} className="hidden" />
              </label>
            </div>

            <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              {fotoBasquet ? (
                <img
                  src={fotoBasquet}
                  alt="Básquetbol"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: `center ${posicionBasquet}%` }}
                />
              ) : (
                <span className="text-xs text-slate-500 font-bold">Sin foto asignada</span>
              )}
            </div>

            {fotoBasquet && (
              <button
                type="button"
                onClick={() => {
                  setItemAEncuadrar({ tipo: 'basquet', url: fotoBasquet, posY: posicionBasquet, posX: 50 });
                  setModalEncuadreAbierto(true);
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <Crop className="w-3.5 h-3.5" />
                <span>Acomodar Encuadre</span>
              </button>
            )}
          </div>

          <div className="p-4 bg-[#040914] rounded-2xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-[#00B4A7] uppercase flex items-center gap-1">
                🏐 VOLEIBOL
              </span>
              <label className="bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 font-black px-3 py-1 rounded-lg text-xs cursor-pointer transition-colors shadow">
                <span>Subir Nueva</span>
                <input type="file" accept="image/*" onChange={e => handleSubirFotoDisciplina('voley', e)} className="hidden" />
              </label>
            </div>

            <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              {fotoVoley ? (
                <img
                  src={fotoVoley}
                  alt="Voleibol"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: `center ${posicionVoley}%` }}
                />
              ) : (
                <span className="text-xs text-slate-500 font-bold">Sin foto asignada</span>
              )}
            </div>

            {fotoVoley && (
              <button
                type="button"
                onClick={() => {
                  setItemAEncuadrar({ tipo: 'voley', url: fotoVoley, posY: posicionVoley, posX: 50 });
                  setModalEncuadreAbierto(true);
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <Crop className="w-3.5 h-3.5" />
                <span>Acomodar Encuadre</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. PALMARÉS & LOGROS */}
      <div className="p-6 bg-[#071527] border border-slate-800 rounded-3xl space-y-5 shadow-xl">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Medal className="w-5 h-5 text-[#F7B52C]" /> Palmarés & Logros con Encuadre ({logros.length})
          </h2>
        </div>

        <form onSubmit={handleAgregarLogro} className="p-5 bg-[#040914] rounded-2xl border border-slate-800 space-y-3.5 text-xs">
          <span className="text-[11px] font-black uppercase text-[#F7B52C] block">
            + AGREGAR TROFEO / MEDALLA
          </span>

          <div className="grid sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Título (ej. Campeones Copa Lima)..."
              value={nuevoTitulo}
              onChange={e => setNuevoTitulo(e.target.value)}
              className="bg-[#071527] border border-slate-800 p-2.5 rounded-xl text-white font-bold"
            />

            <input
              type="text"
              placeholder="Categoría (ej. Básquet U14)..."
              value={nuevaCategoria}
              onChange={e => setNuevaCategoria(e.target.value)}
              className="bg-[#071527] border border-slate-800 p-2.5 rounded-xl text-white"
            />
          </div>

          <textarea
            rows={2}
            placeholder="Descripción breve del campeonato o torneo..."
            value={nuevaDesc}
            onChange={e => setNuevaDesc(e.target.value)}
            className="w-full bg-[#071527] border border-slate-800 p-2.5 rounded-xl text-white"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <label className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-2 rounded-xl text-xs cursor-pointer border border-slate-700">
                <span>{nuevaFotoLogro ? "✓ Foto seleccionada" : "Seleccionar Foto del Trofeo"}</span>
                <input type="file" accept="image/*" onChange={handleSubirFotoLogro} className="hidden" />
              </label>
              {subiendoFotoLogro && <Loader2 className="w-4 h-4 text-[#00B4A7] animate-spin" />}
            </div>

            <button
              type="submit"
              disabled={guardando || subiendoFotoLogro}
              className="bg-[#F7B52C] hover:bg-[#e6a524] text-slate-950 font-black px-6 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ Agregar Logro</span>
            </button>
          </div>
        </form>

        {logros.length === 0 ? (
          <div className="p-8 text-center bg-[#040914] rounded-2xl border border-dashed border-slate-800 text-xs text-slate-500">
            No hay trofeos ni logros registrados.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {logros.map(logro => (
              <div key={logro.id} className="p-4 bg-[#040914] rounded-2xl border border-slate-800 space-y-3 relative flex flex-col justify-between">
                <button
                  type="button"
                  onClick={() => handleEliminarLogro(logro.id)}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center cursor-pointer transition-transform active:scale-95 shadow-lg z-10"
                  title="Eliminar este trofeo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div>
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 mb-2.5">
                    {logro.foto ? (
                      <img
                        src={logro.foto}
                        alt={logro.titulo}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: `${logro.posicionX || 50}% ${logro.posicionY || 50}%` }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 font-bold">
                        🏆 Trofeo oficial
                      </div>
                    )}
                  </div>

                  <span className="bg-[#F7B52C] text-slate-950 font-black text-[10px] px-2 py-0.5 rounded shadow inline-block">
                    {logro.categoria || "Oficial"}
                  </span>
                  <h3 className="font-bold text-white text-sm mt-1">{logro.titulo}</h3>
                  {logro.descripcion && <p className="text-xs text-slate-400 mt-0.5">{logro.descripcion}</p>}
                </div>

                {logro.foto && (
                  <button
                    type="button"
                    onClick={() => {
                      setItemAEncuadrar({ 
                        tipo: 'logro', 
                        id: logro.id, 
                        url: logro.foto, 
                        posY: logro.posicionY || 50,
                        posX: logro.posicionX || 50 
                      });
                      setModalEncuadreAbierto(true);
                    }}
                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Crop className="w-3 h-3" />
                    <span>Acomodar Encuadre</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. GALERÍA DE MOMENTOS */}
      <div className="p-6 bg-[#071527] border border-slate-800 rounded-3xl space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#00B4A7]" /> Galería de Fotos del Club ({galeria.length})
            </h2>
          </div>

          <label className="bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 font-black px-4 py-2 rounded-xl text-xs cursor-pointer shadow transition-all self-start sm:self-auto">
            <span>+ Subir Fotos</span>
            <input type="file" multiple accept="image/*" onChange={handleSubirGaleria} className="hidden" />
          </label>
        </div>

        {galeria.length === 0 ? (
          <div className="p-8 text-center bg-[#040914] rounded-2xl border border-dashed border-slate-800 text-xs text-slate-500">
            No hay fotos subidas a la galería.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {galeria.map((foto, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-950 group">
                <img src={foto} alt={`Galería ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleEliminarFotoGaleria(idx)}
                  className="absolute top-2 right-2 p-1.5 bg-red-600/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow"
                  title="Eliminar foto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}