import { guardar } from './operaciones';
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
  Play
} from 'lucide-react';
import { supabase } from '../supabase';

// EXTRACTOR DE ID DE YOUTUBE (SOPORTA SHORTS, WATCH, YOUUTU.BE Y EMBED)
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

export default function AdminInicio() {
  const [errorCarga, setErrorCarga] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Estados sincronizados con configuracion_web
  const [banners, setBanners] = useState([]);
  const [videos, setVideos] = useState([]);
  const [redes, setRedes] = useState({
    tiktok: '',
    instagram: '',
    facebook: '',
    youtube: ''
  });

  const [nuevoVideoUrl, setNuevoVideoUrl] = useState('');
  const [nuevoVideoTitulo, setNuevoVideoTitulo] = useState('');

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
          'inicio_videos', 
          'videos_inicio', 
          'videos_shorts', 
          'videos', 
          'redes_sociales'
        ]);

      if (error) throw error;
      if (data) {
        const config = Object.fromEntries(data.map(item => [item.clave, item.valor]));
        const banner = config.banner_hero_inicio ?? config.banner_sedes ?? config.banner_inicio;
        setBanners(Array.isArray(banner) ? banner : []);
        let lista = config.inicio_videos ?? config.videos_inicio ?? config.videos_shorts ?? config.videos;
        if (typeof lista === 'string') lista = [{ id: 1, url: lista, enlace: lista, titulo: 'Video Oficial' }];
        else if (lista && !Array.isArray(lista) && typeof lista === 'object') lista = [lista];
        setVideos(Array.isArray(lista) ? lista : []);
        if (config.redes_sociales && typeof config.redes_sociales === 'object') {
          setRedes(prev => ({ ...prev, ...config.redes_sociales }));
        }
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



  // Subir imagen para el banner principal con guardado inmediato
  const handleSubirBanner = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const nombreLimpio = `banner_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const { error } = await supabase.storage.from('imagenes_web').upload(`banners/${nombreLimpio}`, file, {
      upsert: true,
      contentType: file.type || 'image/png'
    });

    if (error) return alert("Error al subir banner: " + error.message);

    const { data } = supabase.storage.from('imagenes_web').getPublicUrl(`banners/${nombreLimpio}`);
    const nuevosBanners = [...banners, { url: data.publicUrl }];
    // Persistencia directa
    if (!await guardar(supabase.from('configuracion_web').upsert({ clave: 'banner_hero_inicio', valor: nuevosBanners }))) return;
    setBanners(nuevosBanners);
  };

  const handleEliminarBanner = async (urlAEliminar) => {
    const nuevosBanners = banners.filter(b => (b.url || b) !== urlAEliminar);
    if (!await guardar(supabase.from('configuracion_web').upsert({ clave: 'banner_hero_inicio', valor: nuevosBanners }))) return;
    setBanners(nuevosBanners);
  };

  // Agregar video con título y URL
  const handleAgregarVideo = async () => {
    if (!nuevoVideoUrl.trim()) return alert("Ingresa el enlace de YouTube.");
    
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

    // Guardado directo
    if (!await guardar(supabase.from('configuracion_web').upsert({ clave: 'inicio_videos', valor: nuevaLista }))) return;
    setVideos(nuevaLista);
    setNuevoVideoUrl('');
    setNuevoVideoTitulo('');

  };

  const handleEliminarVideo = async (id) => {
    const nuevaLista = videos.filter(v => v.id !== id);
    if (!await guardar(supabase.from('configuracion_web').upsert({ clave: 'inicio_videos', valor: nuevaLista }))) return;
    setVideos(nuevaLista);
  };

  // Guardar todos los cambios globales
  const handleGuardarCambios = async () => {
    setGuardando(true);
    try {
      if (!await guardar(supabase.from('configuracion_web').upsert([
        { clave: 'banner_hero_inicio', valor: banners },
        { clave: 'inicio_videos', valor: videos },
        { clave: 'redes_sociales', valor: redes }
      ]))) return;
      alert('✓ Configuración de Portada, Videos y Redes guardada exitosamente.');
    } catch (err) {
      alert('Error al guardar: ' + err.message);
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
      
      {/* CABECERA */}
      <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-[#00B4A7]" /> Portada, Videos & Redes
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Administra los banners de fondo, los videos de YouTube con previsualización en vivo y los enlaces de redes sociales.
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

      {/* 1. BANNERS HERO */}
      <div className="p-5 sm:p-6 bg-[#040914] border border-slate-800 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#00B4A7]" /> Banners del Fondo Hero ({banners.length} fotos)
            </h3>
            <p className="text-[11px] text-slate-400">Fotos que rotan automáticamente de fondo en la portada.</p>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {banners.map((b, idx) => {
              const url = typeof b === 'string' ? b : (b?.url || b?.imagen || "");
              return (
                <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video group">
                  <img src={url} alt={`Banner ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleEliminarBanner(url)}
                      className="p-2 rounded-xl bg-red-600 hover:bg-red-500 text-white cursor-pointer transition-colors"
                      title="Eliminar banner"
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

      {/* 2. VIDEOS DE YOUTUBE CON PREVISUALIZACIÓN */}
      <div className="p-5 sm:p-6 bg-[#040914] border border-slate-800 rounded-2xl space-y-5">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Video className="w-4 h-4 text-red-500" /> Videos de YouTube ({videos.length})
          </h3>
          <p className="text-[11px] text-slate-400">Agrega enlaces de videos o Shorts oficiales y previsualízalos aquí mismo.</p>
        </div>

        {/* FORMULARIO AGREGAR VIDEO */}
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

        {/* LISTA CON PREVISUALIZACIÓN EN VIVO */}
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
                    {/* CABECERA DEL ITEM */}
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

                    {/* PREVISUALIZADOR EN VIVO */}
                    {idYt ? (
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 shadow-inner">
                        <iframe
                          src={`https://www.youtube.com/embed/${idYt}?rel=0&modestbranding=1`}
                          title={tituloReal}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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

      {/* 3. REDES SOCIALES */}
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

    </div>
  );
}