import { guardar } from './operaciones';
import { subirArchivoStorage } from './adminUtils';
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Upload, 
  Trash2, 
  Save, 
  Loader2, 
  Image as ImageIcon, 
  Video, 
  Plus, 
  Share2, 
  ExternalLink, 
  Crop,
  Trophy
} from 'lucide-react';
import { supabase } from '../supabase';
import ModalEncuadre from './ModalEncuadre';
import { useToast } from '../toast';
import ModalConfirmacion from './ModalConfirmacion';

function obtenerIdYouTube(url) {
  if (!url || typeof url !== 'string') return '';
  if (url.includes('shorts/')) {
    const segmento = url.split('shorts/').pop().split('?').shift();
    return segmento ? segmento.substring(0, 11) : '';
  }
  if (url.includes('watch?v=')) {
    const segmento = url.split('watch?v=').pop().split('&').shift();
    return segmento ? segmento.substring(0, 11) : '';
  }
  if (url.includes('youtu.be/')) {
    const segmento = url.split('youtu.be/').pop().split('?').shift();
    return segmento ? segmento.substring(0, 11) : '';
  }
  if (url.includes('embed/')) {
    const segmento = url.split('embed/').pop().split('?').shift();
    return segmento ? segmento.substring(0, 11) : '';
  }
  return '';
}

const normalizarCoordenada = (val, defecto = 50) => {
  if (val === null || val === undefined || val === '') return defecto;
  const num = Number(val);
  return Number.isFinite(num) && num >= 0 && num <= 100 ? num : defecto;
};

export default function AdminInicio() {
  const { mostrarToast } = useToast();
  const [confirmacion, setConfirmacion] = useState(null);

  const [errorCarga, setErrorCarga] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

          const [banners, setBanners] = useState([]);
  const [bannerPosiciones, setBannerPosiciones] = useState({});
  const [videos, setVideos] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]); // NEW STATE
  const [redes, setRedes] = useState({
    tiktok: '',
    instagram: '',
    facebook: '',
    youtube: ''
  });

  const [nuevoVideoUrl, setNuevoVideoUrl] = useState('');
  const [nuevoVideoTitulo, setNuevoVideoTitulo] = useState('');

  const [nuevaDisciplina, setNuevaDisciplina] = useState({
    nombre: '',
    descripcion: '',
    foto: '',
    activa: true,
    etiqueta: ''
  }); // NEW STATE

  const [modalEncuadreAbierto, setModalEncuadreAbierto] = useState(false);
  const [bannerAEncuadrar, setBannerAEncuadrar] = useState(null);

  useEffect(() => {
    async function cargarDatosInicio() {
      try {
        const { data, error } = await supabase
          .from('configuracion_web')
          .select('clave, valor')
          .in('clave', [
            'banner_hero_inicio', 
            'banner_sedes', 
            'banner_inicio', 
            'banner_posiciones',
            'inicio_videos', 
            'videos_inicio', 
            'videos_shorts', 
            'videos', 
            'redes_sociales',
            'inicio_disciplinas',
            'tarjetas_disciplina'
          ]);

        if (error) throw error;
        if (data) {
          const config = Object.fromEntries(data.map(item => [item.clave, item.valor]));
          const banner = config.banner_hero_inicio ?? config.banner_sedes ?? config.banner_inicio;
          setBanners(Array.isArray(banner) ? banner : []);

          if (config.banner_posiciones && typeof config.banner_posiciones === 'object') {
            setBannerPosiciones(config.banner_posiciones);
          }

          let lista = config.inicio_videos ?? config.videos_inicio ?? config.videos_shorts ?? config.videos;
          if (typeof lista === 'string') lista = [{ id: 1, url: lista, enlace: lista, titulo: 'Video Oficial' }];
          else if (lista && !Array.isArray(lista) && typeof lista === 'object') lista = [lista];
          setVideos(Array.isArray(lista) ? lista : []);

          if (config.redes_sociales && typeof config.redes_sociales === 'object') {
            setRedes(prev => ({ ...prev, ...config.redes_sociales }));
          }

          const discArray = config.inicio_disciplinas ?? config.tarjetas_disciplina;
          setDisciplinas(Array.isArray(discArray) ? discArray : []);
        }
      } catch (err) {
        console.error("Error al cargar configuración de inicio:", err);
        setErrorCarga('No se pudo cargar la información. Recarga para reintentar.');
      } finally {
        setCargando(false);
      }
    }
    cargarDatosInicio();
  }, []);

  const handleSubirBanner = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const publicUrl = await subirArchivoStorage(file, 'banners');
    if (!publicUrl) return mostrarToast("Error al subir banner", "error");
    const nuevosBanners = [...banners, { url: publicUrl }];
    
    if (!await guardar(supabase.from('configuracion_web').upsert({ clave: 'banner_hero_inicio', valor: nuevosBanners }))) return;
    setBanners(nuevosBanners);
  };

  const handleEliminarBanner = async (urlAEliminar, idxEliminar) => {
    setConfirmacion({
      mensaje: "¿Deseas eliminar definitivamente este banner?",
      peligroso: true,
      onConfirmar: async () => {
        setConfirmacion(null);
        const nuevosBanners = banners.filter((_, i) => i !== idxEliminar);
        
        // Re-mapear posiciones para evitar descuadres al cambiar los índices
        const nuevasPosiciones = {};
        nuevosBanners.forEach((_, nuevoIdx) => {
          const oldIdx = nuevoIdx < idxEliminar ? nuevoIdx : nuevoIdx + 1;
          if (bannerPosiciones[oldIdx]) {
            nuevasPosiciones[nuevoIdx] = bannerPosiciones[oldIdx];
          }
        });

        if (!await guardar(supabase.from('configuracion_web').upsert([
          { clave: 'banner_hero_inicio', valor: nuevosBanners },
          { clave: 'banner_posiciones', valor: nuevasPosiciones }
        ]))) return;

        setBanners(nuevosBanners);
        setBannerPosiciones(nuevasPosiciones);
      }
    });
  };

  // Guardar encuadre: devuelve explícitamente true o false
  const handleGuardarEncuadreBanner = async (nuevaPosicion) => {
    if (!bannerAEncuadrar) return false;

    const posX = normalizarCoordenada(nuevaPosicion?.x);
    const posY = normalizarCoordenada(nuevaPosicion?.y);

    if (bannerAEncuadrar.tipo === 'disciplina') {
      const nuevasDisc = [...disciplinas];
      nuevasDisc[bannerAEncuadrar.idx] = {
        ...nuevasDisc[bannerAEncuadrar.idx],
        posicionX: posX,
        posicionY: posY
      };
      const guardado = await guardar(supabase.from('configuracion_web').upsert({ clave: 'inicio_disciplinas', valor: nuevasDisc }));
      if (!guardado) return false;
      setDisciplinas(nuevasDisc);
      return true;
    } else {
      const posFinal = { x: posX, y: posY };
      const nuevasPosiciones = {
        ...bannerPosiciones,
        [bannerAEncuadrar.idx]: posFinal
      };

      const guardadoOk = await guardar(supabase.from('configuracion_web').upsert({
        clave: 'banner_posiciones',
        valor: nuevasPosiciones
      }));

      if (!guardadoOk) return false;

      setBannerPosiciones(nuevasPosiciones);
      return true;
    }
  };

  const handleSubirFotoDisciplina = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const publicUrl = await subirArchivoStorage(file, 'disciplinas');
    if (publicUrl) {
      setNuevaDisciplina(prev => ({ ...prev, foto: publicUrl }));
    }
  };

  const handleAgregarDisciplina = async (e) => {
    e.preventDefault();
    if (!nuevaDisciplina.nombre) return mostrarToast("El nombre de la disciplina es obligatorio", "error");
    
    const nuevoObj = {
      ...nuevaDisciplina,
      titulo: nuevaDisciplina.nombre // para retrocompatibilidad
    };
    
    const nuevasDisc = [...disciplinas, nuevoObj];
    const guardado = await guardar(supabase.from('configuracion_web').upsert({ clave: 'inicio_disciplinas', valor: nuevasDisc }));
    
    if (guardado) {
      setDisciplinas(nuevasDisc);
      setNuevaDisciplina({ nombre: '', descripcion: '', foto: '', activa: true, etiqueta: '' });
      mostrarToast("Disciplina agregada", "exito");
    }
  };

  const handleEliminarDisciplina = async (idxEliminar) => {
    setConfirmacion({
      mensaje: "¿Deseas eliminar esta disciplina?",
      peligroso: true,
      onConfirmar: async () => {
        setConfirmacion(null);
        const nuevasDisc = disciplinas.filter((_, i) => i !== idxEliminar);
        const guardado = await guardar(supabase.from('configuracion_web').upsert({ clave: 'inicio_disciplinas', valor: nuevasDisc }));
        if (guardado) {
          setDisciplinas(nuevasDisc);
          mostrarToast("Disciplina eliminada", "exito");
        }
      }
    });
  };

  const handleToggleActiva = async (idx) => {
    const nuevasDisc = [...disciplinas];
    nuevasDisc[idx].activa = !nuevasDisc[idx].activa;
    const guardado = await guardar(supabase.from('configuracion_web').upsert({ clave: 'inicio_disciplinas', valor: nuevasDisc }));
    if (guardado) setDisciplinas(nuevasDisc);
  };

  const handleGuardarEtiqueta = async (idx, etiqueta) => {
    const nuevasDisc = [...disciplinas];
    nuevasDisc[idx].etiqueta = etiqueta;
    const guardado = await guardar(supabase.from('configuracion_web').upsert({ clave: 'inicio_disciplinas', valor: nuevasDisc }));
    if (guardado) setDisciplinas(nuevasDisc);
  };

  const handleAgregarVideo = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!nuevoVideoUrl.trim()) return mostrarToast("Ingresa el enlace de YouTube.", "error");
    
    const enlaceLimpio = nuevoVideoUrl.trim();
    const tituloFinal = nuevoVideoTitulo.trim() || 'Video Oficial Campeones Lima';

    const nuevoItem = { 
      id: Date.now(), 
      url: enlaceLimpio, 
      enlace: enlaceLimpio, 
      titulo: tituloFinal, 
      red: 'YouTube' 
    };

    const nuevaLista = [...videos, nuevoItem];

    if (!await guardar(supabase.from('configuracion_web').upsert({ clave: 'inicio_videos', valor: nuevaLista }))) return;
    setVideos(nuevaLista);
    setNuevoVideoUrl('');
    setNuevoVideoTitulo('');
  };

  const handleEliminarVideo = async (id) => {
    setConfirmacion({
      mensaje: "¿Deseas eliminar este video?",
      peligroso: true,
      onConfirmar: async () => {
        setConfirmacion(null);
        const nuevaLista = videos.filter(v => v.id !== id);
        if (!await guardar(supabase.from('configuracion_web').upsert({ clave: 'inicio_videos', valor: nuevaLista }))) return;
        setVideos(nuevaLista);
      }
    });
  };

  const handleGuardarCambios = async () => {
    setGuardando(true);
    try {
      if (!await guardar(supabase.from('configuracion_web').upsert([
        { clave: 'banner_hero_inicio', valor: banners },
        { clave: 'banner_posiciones', valor: bannerPosiciones },
        { clave: 'inicio_videos', valor: videos },
        { clave: 'redes_sociales', valor: redes }
      ]))) return;
      mostrarToast('Configuración de Portada, Videos y Redes guardada exitosamente.', 'exito');
    } catch (err) {
      mostrarToast('Error al guardar: ' + err.message, 'error');
    } finally {
      setGuardando(false);
    }
  };

  if (errorCarga) return <div role="alert" className="p-6 text-red-300 space-y-3"><p>{errorCarga}</p><button type="button" onClick={() => window.location.reload()} className="underline">Reintentar carga</button></div>;

  if (cargando) {
    return (
      <div className="p-12 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#00B4A7] animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cargando portada...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl animate-in fade-in duration-300">
      
      {modalEncuadreAbierto && bannerAEncuadrar && (
        <ModalEncuadre
          key={`banner_${bannerAEncuadrar.idx}_${bannerAEncuadrar.url}`}
          abierto={modalEncuadreAbierto}
          alCerrar={() => {
            setModalEncuadreAbierto(false);
            setBannerAEncuadrar(null);
          }}
          imagenUrl={bannerAEncuadrar.url}
          posicionInicial={bannerAEncuadrar.pos}
          alGuardar={handleGuardarEncuadreBanner}
          esHero={true}
        />
      )}

      {/* CABECERA */}
      <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-[#00B4A7]" /> Portada, Videos & Redes
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Administra los banners de fondo con encuadre en vivo, videos de YouTube y enlaces de redes sociales.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGuardarCambios}
          disabled={guardando}
          className="px-6 py-2.5 rounded-xl bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#00B4A7]/25 cursor-pointer disabled:opacity-50"
        >
          {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Guardar Portada</span>
        </button>
      </div>

      {/* BANNERS HERO */}
      <div className="p-5 sm:p-6 bg-[#040914] border border-slate-800 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#00B4A7]" /> Banners del Fondo Hero ({banners.length} fotos)
            </h3>
            <p className="text-[11px] text-slate-400">Fotos que rotan de fondo en la portada. Haz clic en "Encuadrar" para acomodarlas con las letras.</p>
          </div>
          <label className="bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 font-black px-4 py-2 rounded-xl text-xs cursor-pointer shadow flex items-center gap-1.5 self-start sm:self-auto">
            <Upload className="w-3.5 h-3.5" />
            <span>+ Subir Banner</span>
            <input type="file" accept="image/*" onChange={handleSubirBanner} className="hidden" />
          </label>
        </div>

        {banners.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
            No hay banners cargados. Haz clic en "+ Subir Banner".
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.map((b, idx) => {
              const url = typeof b === 'string' ? b : (b?.url || b?.imagen || "");
              const pos = bannerPosiciones[idx] || bannerPosiciones[url] || { x: 50, y: 50 };
              const posX = normalizarCoordenada(pos?.x);
              const posY = normalizarCoordenada(pos?.y);

              return (
                <div 
                  key={idx} 
                  className="bg-[#071527] border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between group transition-all"
                >
                  <div className="relative aspect-video bg-slate-950 overflow-hidden">
                    <img loading="lazy" src={url} 
                      alt={`Banner ${idx + 1}`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      style={{ objectPosition: `${posX}% ${posY}%` }}
                    />

                    <span className="absolute top-2.5 left-2.5 bg-black/80 text-[#F7B52C] font-mono text-[10px] px-2 py-0.5 rounded-md border border-white/10 shadow">
                      X: {posX}% · Y: {posY}%
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setBannerAEncuadrar({ idx, url, pos: { x: posX, y: posY } });
                        setModalEncuadreAbierto(true);
                      }}
                      className="absolute bottom-2.5 right-2.5 bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer"
                    >
                      <Crop className="w-3.5 h-3.5" />
                      <span>Encuadrar</span>
                    </button>
                  </div>

                  <div className="p-3 bg-[#040914] border-t border-slate-800/80 flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">Banner #{idx + 1}</span>
                    
                    <button
                      type="button"
                      onClick={() => handleEliminarBanner(url, idx)}
                      className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DISCIPLINAS DE INICIO */}
      <div className="p-5 sm:p-6 bg-[#040914] border border-slate-800 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#F7B52C]" /> Tarjetas de Disciplinas ({disciplinas.length})
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Las disciplinas que aparecen en la página principal.
            </p>
          </div>
        </div>

        {/* Formulario Nueva Disciplina */}
        <form onSubmit={handleAgregarDisciplina} className="p-4 bg-[#071527] border border-slate-800 rounded-xl space-y-3">
          <span className="text-xs font-black uppercase text-[#00B4A7] block mb-2">+ NUEVA DISCIPLINA</span>
          
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Nombre (Obligatorio)</label>
              <input
                type="text"
                required
                placeholder="Ej. Kpop, Marinera..."
                value={nuevaDisciplina.nombre}
                onChange={e => setNuevaDisciplina({ ...nuevaDisciplina, nombre: e.target.value })}
                className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white font-bold"
              />
            </div>
            
            <div>
              <label className="block text-slate-400 font-bold mb-1">Descripción</label>
              <input
                type="text"
                placeholder="Ej. Clases de baile para jóvenes..."
                value={nuevaDisciplina.descripcion}
                onChange={e => setNuevaDisciplina({ ...nuevaDisciplina, descripcion: e.target.value })}
                className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Etiqueta Especial (Opcional)</label>
              <input
                type="text"
                placeholder="Ej. ¡Preventa!"
                value={nuevaDisciplina.etiqueta}
                onChange={e => setNuevaDisciplina({ ...nuevaDisciplina, etiqueta: e.target.value })}
                className="w-full bg-[#040914] border border-[#F7B52C]/30 p-2.5 rounded-xl text-[#F7B52C] font-bold placeholder:text-slate-600"
              />
            </div>
            
            <div className="flex flex-col justify-end">
              <label className="bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs cursor-pointer shadow flex items-center justify-center gap-1.5 transition-all text-center">
                <span>{nuevaDisciplina.foto ? '✅ Foto Lista (Cambiar)' : '+ Subir Foto'}</span>
                <input type="file" accept="image/*" onChange={handleSubirFotoDisciplina} className="hidden" />
              </label>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
              <input 
                type="checkbox" 
                checked={nuevaDisciplina.activa} 
                onChange={e => setNuevaDisciplina({ ...nuevaDisciplina, activa: e.target.checked })} 
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-[#00B4A7] focus:ring-[#00B4A7]"
              />
              Disciplina Activa Inmediatamente
            </label>
            
            <button
              type="submit"
              className="px-6 py-2 bg-[#F7B52C] hover:bg-[#ffc247] text-slate-950 font-black text-xs uppercase rounded-xl transition-all shadow cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar
            </button>
          </div>
        </form>

        {/* Lista de Disciplinas */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {disciplinas.map((disc, idx) => (
            <div key={idx} className={`rounded-xl border flex flex-col justify-between overflow-hidden shadow-lg transition-all ${
              disc.activa !== false ? 'bg-[#071527] border-slate-700' : 'bg-[#040914] border-slate-800 opacity-80 grayscale-[20%]'
            }`}>
              <div className="relative aspect-[16/10] bg-slate-950">
                {disc.foto ? (
                  <img src={disc.foto} alt={disc.nombre || disc.titulo} className="w-full h-full object-cover" style={{ objectPosition: `${disc.posicionX ?? 50}% ${disc.posicionY ?? 50}%` }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 font-bold">Sin foto</div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#040914] via-transparent to-transparent" />
                
                {disc.etiqueta && (
                  <span className="absolute top-2.5 left-2.5 bg-[#F7B52C] text-slate-950 font-black text-[9px] px-2 py-0.5 rounded shadow">
                    {disc.etiqueta}
                  </span>
                )}
                
                {disc.foto && (
                  <button
                    type="button"
                    onClick={() => {
                      setBannerAEncuadrar({ tipo: 'disciplina', idx, url: disc.foto, posX: disc.posicionX ?? 50, posY: disc.posicionY ?? 50 });
                      setModalEncuadreAbierto(true);
                    }}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1.5 rounded-lg shadow transition-colors cursor-pointer"
                  >
                    <Crop className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="p-3 space-y-2">
                <div>
                  <h4 className="font-black text-white text-sm">{disc.nombre || disc.titulo}</h4>
                  {disc.descripcion && <p className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-2">{disc.descripcion}</p>}
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Etiqueta..."
                    value={disc.etiqueta || ''}
                    onChange={(e) => {
                      const nuevasDisc = [...disciplinas];
                      nuevasDisc[idx].etiqueta = e.target.value;
                      setDisciplinas(nuevasDisc);
                    }}
                    onBlur={(e) => handleGuardarEtiqueta(idx, e.target.value)}
                    className="flex-1 bg-[#040914] border border-slate-700 p-1.5 rounded-md text-[#F7B52C] text-[10px] font-bold"
                  />
                  
                  <button
                    type="button"
                    onClick={() => handleToggleActiva(idx)}
                    className={`px-2 py-1.5 rounded-md text-[10px] font-black cursor-pointer transition-colors ${
                      disc.activa !== false ? 'bg-[#00B4A7] text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {disc.activa !== false ? 'Activa' : 'Pausada'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleEliminarDisciplina(idx)}
                    className="p-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VIDEOS */}
      <div className="p-5 sm:p-6 bg-[#040914] border border-slate-800 rounded-2xl space-y-5">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Video className="w-4 h-4 text-red-500" /> Videos de YouTube ({videos.length})
          </h3>
          <p className="text-[11px] text-slate-400">Agrega enlaces de videos o Shorts oficiales y previsualízalos aquí mismo.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-2.5 max-w-2xl">
          <input
            type="text"
            placeholder="Título del video (ej. Jugadas U14)..."
            value={nuevoVideoTitulo}
            onChange={e => setNuevoVideoTitulo(e.target.value)}
            className="sm:col-span-1 bg-[#071527] border border-slate-800 p-2.5 rounded-xl text-white text-xs font-bold"
          />
          <input
            type="text"
            placeholder="https://youtube.com/watch?v=... o shorts/..."
            value={nuevoVideoUrl}
            onChange={e => setNuevoVideoUrl(e.target.value)}
            className="sm:col-span-1 bg-[#071527] border border-slate-800 p-2.5 rounded-xl text-white text-xs font-mono"
          />
          <button
            type="button"
            onClick={handleAgregarVideo}
            className="px-4 py-2.5 bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Añadir Video</span>
          </button>
        </div>

        {videos.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
            No hay videos registrados. Añade uno arriba.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {videos.map((v, i) => {
              const urlReal = typeof v === 'string' ? v : (v?.enlace || v?.url || v?.link || '');
              const tituloReal = (typeof v === 'object' && (v?.titulo || v?.title)) || `Video ${i + 1}`;
              const idYt = obtenerIdYouTube(urlReal);

              return (
                <div 
                  key={v.id || i} 
                  className="p-4 bg-[#071527] rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between shadow-xl"
                >
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-600/20 text-red-400 font-mono">
                        YouTube
                      </span>
                      <button
                        type="button"
                        onClick={() => handleEliminarVideo(v.id)}
                        className="text-red-400 hover:text-red-300 p-1 cursor-pointer transition-colors"
                        title="Eliminar este video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {idYt ? (
                      <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-black border border-slate-800 shadow-inner max-h-[320px] mx-auto w-full max-w-[180px]">
                        <iframe
                          src={`https://www.youtube.com/embed/${idYt}?autoplay=1&mute=1&loop=1&playlist=${idYt}&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`}
                          title={tituloReal}
                          className="w-full h-full border-0 pointer-events-none"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                        <span className="text-slate-400 text-xs font-bold block">Video directo o enlace:</span>
                        <p className="text-[10px] font-mono text-[#00B4A7] truncate">{urlReal}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-bold text-white text-xs leading-snug">{tituloReal}</h4>
                      <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">{urlReal}</p>
                    </div>
                  </div>

                  <a
                    href={urlReal}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 bg-[#040914] hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                  >
                    <span>Abrir en YouTube</span>
                    <ExternalLink className="w-3 h-3 text-[#00B4A7]" />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* REDES SOCIALES */}
      <div className="p-5 sm:p-6 bg-[#040914] border border-slate-800 rounded-2xl space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#F7B52C]" /> Redes Sociales Oficiales
          </h3>
          <p className="text-[11px] text-slate-400">Enlaces mostrados en el pie de página y botones de contacto.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">TikTok:</label>
            <input
              type="text"
              value={redes.tiktok || ''}
              onChange={e => setRedes({ ...redes, tiktok: e.target.value })}
              className="w-full bg-[#071527] border border-slate-800 p-2.5 rounded-xl text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-bold mb-1">Instagram:</label>
            <input
              type="text"
              value={redes.instagram || ''}
              onChange={e => setRedes({ ...redes, instagram: e.target.value })}
              className="w-full bg-[#071527] border border-slate-800 p-2.5 rounded-xl text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-bold mb-1">Facebook:</label>
            <input
              type="text"
              value={redes.facebook || ''}
              onChange={e => setRedes({ ...redes, facebook: e.target.value })}
              className="w-full bg-[#071527] border border-slate-800 p-2.5 rounded-xl text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-bold mb-1">YouTube:</label>
            <input
              type="text"
              value={redes.youtube || ''}
              onChange={e => setRedes({ ...redes, youtube: e.target.value })}
              className="w-full bg-[#071527] border border-slate-800 p-2.5 rounded-xl text-white font-mono"
            />
          </div>
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