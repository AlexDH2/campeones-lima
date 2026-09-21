import React, { useState, useEffect } from 'react';
import { useToast } from '../toast';
import ModalConfirmacion from './ModalConfirmacion';
import { 
  Tag, 
  Save, 
  Loader2, 
  Sparkles, 
  Ticket, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Users2, 
  Eye, 
  EyeOff, 
  Image as ImageIcon,
  Upload,
  Edit2,
  X,
  Check,
  MapPin,
  Calendar as CalendarIcon,
  Infinity as InfinityIcon,
  Filter
} from 'lucide-react';
import { supabase } from '../supabase';

export default function AdminPreciosPromos() {
  const { mostrarToast } = useToast();
  const [confirmacion, setConfirmacion] = useState(null);
  const [sedes, setSedes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoSede, setSubiendoSede] = useState(null);

  // FILTRO PROMINENTE POR SEDE EN EL ADMIN
  const [filtroSedeAdmin, setFiltroSedeAdmin] = useState('TODAS');

  const [seccionAbierta, setSeccionAbierta] = useState({
    bannersSedes: true,
    tarjetasPromos: true,
    claseModelo: false,
    ciclosExtra: false,
    categorias: false
  });

  const toggleSeccion = (sec) => {
    setSeccionAbierta(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  // 1. BANNERS POR SEDE
  const [bannersSedes, setBannersSedes] = useState({});

  // 2. TARJETAS INDIVIDUALES DE PROMOCIÓN
  const [promociones, setPromociones] = useState([]);
  const [promoEnEdicionId, setPromoEnEdicionId] = useState(null);
  const fechaHoyStr = new Date().toISOString().split('T')[0];

  const [formPromo, setFormPromo] = useState({
    titulo: '',
    descripcion: '',
    tipo_beneficio: 'precio',
    valor_beneficio: '',
    es_permanente: true,
    fecha_inicio: fechaHoyStr, 
    valido_hasta: '',
    visible_en_web: true,
    flyer_url: '',
    sede: ''
  });

  // CLASE MODELO, CICLOS Y CATEGORÍAS
  const [preciosClaseModelo, setPreciosClaseModelo] = useState({});
  const [precioMasivo, setPrecioMasivo] = useState(0);
  const [sedesSeleccionadasMasivo, setSedesSeleccionadasMasivo] = useState([]);
  const [ciclosExtra, setCiclosExtra] = useState([]);
  const [nuevoCiclo, setNuevoCiclo] = useState({ nombre: '', precio: 150 });
  const [categoriasEdades, setCategoriasEdades] = useState([]);
  const [nuevaCategoriaTexto, setNuevaCategoriaTexto] = useState('');

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [resSedes, resConfig] = await Promise.all([
          supabase.from('sedes').select('id, nombre, distrito').order('nombre', { ascending: true }),
          supabase.from('configuracion_web').select('clave, valor').in('clave', [
            'banners_promociones_sedes',
            'promociones_vigentes',
            'precios_clase_modelo',
            'ciclos_adicionales',
            'categorias_edades'
          ])
        ]);

        if (resSedes.data && resSedes.data.length > 0) {
          setSedes(resSedes.data);
          setSedesSeleccionadasMasivo(resSedes.data.map(s => s.nombre));
        }

        if (resConfig.data) {
          resConfig.data.forEach(item => {
            if (item.clave === 'banners_promociones_sedes' && typeof item.valor === 'object') {
              setBannersSedes(item.valor || {});
            }
            if (item.clave === 'promociones_vigentes' && Array.isArray(item.valor)) {
              setPromociones(item.valor || []);
            }
            if (item.clave === 'precios_clase_modelo' && typeof item.valor === 'object') {
              setPreciosClaseModelo(item.valor || {});
            }
            if (item.clave === 'ciclos_adicionales' && Array.isArray(item.valor)) {
              setCiclosExtra(item.valor || []);
            }
            if (item.clave === 'categorias_edades' && Array.isArray(item.valor)) {
              setCategoriasEdades(item.valor || []);
            }
          });
        }
      } catch (err) {
        console.error("Error al cargar configuración:", err);
      } finally {
        setCargando(false);
      }
    }
    cargarDatos();
  }, []);

  // Lógica de coincidencia entre promoción y sede
  const coincideConSede = (promo, nombreSede) => {
    if (!nombreSede || !promo) return false;
    const sLimpia = nombreSede.toLowerCase().replace(/sede\s*/gi, '').trim();
    const cSede = (promo.sede || '').toLowerCase().trim();
    const cTitulo = (promo.titulo || '').toLowerCase().trim();
    const cDesc = (promo.descripcion || '').toLowerCase().trim();

    return cSede.includes(sLimpia) || cTitulo.includes(sLimpia) || cDesc.includes(sLimpia);
  };

  const contarPromosDeSede = (nombreSede) => {
    return promociones.filter(p => coincideConSede(p, nombreSede)).length;
  };

  // --- SUBIDA DE ARCHIVO DE BANNER PARA UNA SEDE ---
  const handleSubirFlyerSede = async (nombreSede, file) => {
    if (!file) return;

    setSubiendoSede(nombreSede);
    try {
      const nombreLimpio = `promo_${nombreSede.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      const { error } = await supabase.storage.from('imagenes_web').upload(`promociones/${nombreLimpio}`, file, {
        upsert: true,
        contentType: file.type || 'image/png'
      });

      if (error) throw error;

      const { data } = supabase.storage.from('imagenes_web').getPublicUrl(`promociones/${nombreLimpio}`);
      const nuevaUrl = data.publicUrl;

      const nuevoMapa = {
        ...bannersSedes,
        [nombreSede]: {
          ...(bannersSedes[nombreSede] || {}),
          flyer_url: nuevaUrl,
          activo: true,
          titulo: bannersSedes[nombreSede]?.titulo || `Promociones Temporada · ${nombreSede}`
        }
      };

      const { error: errUpsert } = await supabase.from('configuracion_web').upsert({
        clave: 'banners_promociones_sedes',
        valor: nuevoMapa
      });
      if (errUpsert) throw errUpsert;

      setBannersSedes(nuevoMapa);
      mostrarToast(`Banner oficial de ${nombreSede} subido exitosamente.`, "exito");
    } catch (err) {
      mostrarToast("Error al subir banner: " + (err.message || err), "error");
    } finally {
      setSubiendoSede(null);
    }
  };

  const handleToggleActivoBanner = async (nombreSede) => {
    const actual = bannersSedes[nombreSede] || {};
    const nuevoEstado = actual.activo === false;

    const nuevoMapa = {
      ...bannersSedes,
      [nombreSede]: { ...actual, activo: nuevoEstado }
    };

    try {
      const { error } = await supabase.from('configuracion_web').upsert({
        clave: 'banners_promociones_sedes',
        valor: nuevoMapa
      });
      if (error) throw error;
      setBannersSedes(nuevoMapa);
    } catch (err) {
      mostrarToast("Error: " + err.message, "error");
    }
  };

  const handleEliminarBannerSede = async (nombreSede) => {
    setConfirmacion({
      mensaje: `¿Eliminar el banner de ${nombreSede}?`,
      peligroso: true,
      onConfirmar: async () => {
        setConfirmacion(null);
        const copia = { ...bannersSedes };
        delete copia[nombreSede];

        try {
          const { error } = await supabase.from('configuracion_web').upsert({
            clave: 'banners_promociones_sedes',
            valor: copia
          });
          if (error) throw error;
          setBannersSedes(copia);
        } catch (err) {
          mostrarToast("Error: " + err.message, "error");
        }
      }
    });
  };

  // --- GESTIÓN DE TEXTOS Y PRECIOS DE LAS TARJETAS ---
  const handleGuardarTarjetaPromo = async (e) => {
    e.preventDefault();
    if (!formPromo.titulo.trim()) return mostrarToast("Ingresa el título de la promoción.", "error");

    const itemDatos = {
      titulo: formPromo.titulo.trim(),
      descripcion: formPromo.descripcion.trim(),
      tipo_beneficio: 'precio',
      valor_beneficio: formPromo.valor_beneficio.trim(),
      es_permanente: formPromo.es_permanente,
      fecha_inicio: formPromo.fecha_inicio || fechaHoyStr,
      valido_hasta: formPromo.es_permanente ? '' : formPromo.valido_hasta,
      visible_en_web: formPromo.visible_en_web,
      sede: formPromo.sede || (filtroSedeAdmin !== 'TODAS' ? filtroSedeAdmin : '')
    };

    let listaActualizada;
    if (promoEnEdicionId) {
      listaActualizada = promociones.map(p => 
        p.id === promoEnEdicionId ? { ...p, ...itemDatos } : p
      );
    } else {
      listaActualizada = [{ id: Date.now(), ...itemDatos }, ...promociones];
    }

    try {
      const { error } = await supabase.from('configuracion_web').upsert({
        clave: 'promociones_vigentes',
        valor: listaActualizada
      });
      if (error) throw error;

      setPromociones(listaActualizada);
      handleCancelarEdicionPromo();
      mostrarToast(promoEnEdicionId ? "Tarjeta actualizada exitosamente." : "Tarjeta creada exitosamente.", "exito");
    } catch (err) {
      mostrarToast("Error al guardar: " + err.message, "error");
    }
  };

  const handleIniciarEditarPromo = (promo) => {
    setPromoEnEdicionId(promo.id);
    setFormPromo({
      titulo: promo.titulo || '',
      descripcion: promo.descripcion || '',
      tipo_beneficio: 'precio',
      valor_beneficio: promo.valor_beneficio || '',
      es_permanente: promo.es_permanente !== false,
      fecha_inicio: promo.fecha_inicio || fechaHoyStr,
      valido_hasta: promo.valido_hasta || '',
      visible_en_web: promo.visible_en_web !== false,
      flyer_url: promo.flyer_url || '',
      sede: promo.sede || ''
    });

    document.getElementById('editor-tarjetas-promos')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelarEdicionPromo = () => {
    setPromoEnEdicionId(null);
    setFormPromo({
      titulo: '',
      descripcion: '',
      tipo_beneficio: 'precio',
      valor_beneficio: '',
      es_permanente: true,
      fecha_inicio: fechaHoyStr,
      valido_hasta: '',
      visible_en_web: true,
      flyer_url: '',
      sede: filtroSedeAdmin !== 'TODAS' ? filtroSedeAdmin : ''
    });
  };

  const handleToggleVisibilidadTarjeta = async (id, estadoActual) => {
    const listaActualizada = promociones.map(p => p.id === id ? { ...p, visible_en_web: !estadoActual } : p);
    try {
      const { error } = await supabase.from('configuracion_web').upsert({
        clave: 'promociones_vigentes',
        valor: listaActualizada
      });
      if (error) throw error;
      setPromociones(listaActualizada);
    } catch (err) {
      mostrarToast("Error: " + err.message, "error");
    }
  };

  const handleEliminarTarjetaPromo = async (id) => {
    setConfirmacion({
      mensaje: "¿Deseas eliminar esta tarjeta de promoción?",
      peligroso: true,
      onConfirmar: async () => {
        setConfirmacion(null);
        const listaActualizada = promociones.filter(p => p.id !== id);
        try {
          const { error } = await supabase.from('configuracion_web').upsert({
            clave: 'promociones_vigentes',
            valor: listaActualizada
          });
          if (error) throw error;
          setPromociones(listaActualizada);
          if (promoEnEdicionId === id) handleCancelarEdicionPromo();
        } catch (err) {
          mostrarToast("Error: " + err.message, "error");
        }
      }
    });
  };

  // Filtrado de tarjetas para la vista del Admin según la sede seleccionada
  const promocionesFiltradasAdmin = promociones.filter(p => {
    if (filtroSedeAdmin === 'TODAS') return true;
    return coincideConSede(p, filtroSedeAdmin);
  });

  // --- GESTIÓN DE CATEGORÍAS DE EDAD ---
  const handleAgregarCategoria = async (e) => {
    e.preventDefault();
    if (!nuevaCategoriaTexto.trim()) return;
    
    const nuevaCategoria = {
      id: crypto.randomUUID(),
      nombre: nuevaCategoriaTexto.trim()
    };
    
    const listaActualizada = [...categoriasEdades, nuevaCategoria];
    try {
      const { error } = await supabase.from('configuracion_web').upsert({
        clave: 'categorias_edades',
        valor: listaActualizada
      });
      if (error) throw error;
      setCategoriasEdades(listaActualizada);
      setNuevaCategoriaTexto('');
      mostrarToast("Categoría agregada exitosamente", "exito");
    } catch (err) {
      mostrarToast("Error al guardar categoría: " + err.message, "error");
    }
  };

  const handleEliminarCategoria = async (id) => {
    setConfirmacion({
      mensaje: "¿Deseas eliminar esta categoría de edad?",
      peligroso: true,
      onConfirmar: async () => {
        setConfirmacion(null);
        const listaActualizada = categoriasEdades.filter(c => c.id !== id);
        try {
          const { error } = await supabase.from('configuracion_web').upsert({
            clave: 'categorias_edades',
            valor: listaActualizada
          });
          if (error) throw error;
          setCategoriasEdades(listaActualizada);
          mostrarToast("Categoría eliminada", "exito");
        } catch (err) {
          mostrarToast("Error al eliminar categoría: " + err.message, "error");
        }
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-300">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Tag className="w-7 h-7 text-[#F7B52C]" /> Promociones: Banners & Tarjetas
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Administra los flyers y botones de WhatsApp por cada sede de forma individual.
          </p>
        </div>
      </div>

      {/* =========================================================================
          🔥 BARRA DE FILTRO POR SEDE ULTRA-PROMINENTE (PESTAÑAS CON CONTADOR)
         ========================================================================= */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#071527] border-2 border-[#00B4A7]/50 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-[#00B4A7] tracking-wider flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-[#F7B52C]" /> Filtrar por Sede Deportiva:
          </span>

          <span className="text-[11px] text-slate-400 font-mono">
            {filtroSedeAdmin === 'TODAS' 
              ? `Mostrando todas (${promociones.length} tarjetas)` 
              : `Sede activa: ${filtroSedeAdmin} (${promocionesFiltradasAdmin.length} tarjetas)`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* BOTÓN TODAS */}
          <button
            type="button"
            onClick={() => setFiltroSedeAdmin('TODAS')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer ${
              filtroSedeAdmin === 'TODAS'
                ? 'bg-[#00B4A7] text-slate-950 border-[#00B4A7] shadow-lg shadow-[#00B4A7]/30 scale-105'
                : 'bg-[#040914] text-slate-300 border-slate-700 hover:text-white hover:border-slate-500'
            }`}
          >
            Todas ({promociones.length})
          </button>

          {/* BOTONES INDIVIDUALES DE CADA SEDE */}
          {sedes.map((s) => {
            const cantidad = contarPromosDeSede(s.nombre);
            const estaActivo = filtroSedeAdmin === s.nombre;
            const tieneBanner = Boolean(bannersSedes[s.nombre]?.flyer_url);

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setFiltroSedeAdmin(s.nombre)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                  estaActivo
                    ? 'bg-[#F7B52C] text-slate-950 border-[#F7B52C] shadow-lg shadow-[#F7B52C]/30 font-black scale-105'
                    : 'bg-[#040914] text-slate-300 border-slate-800 hover:text-white hover:border-slate-600'
                }`}
              >
                <span>📍 {s.nombre}</span>
                
                {/* Contador de tarjetas */}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-black ${
                  estaActivo ? 'bg-slate-950 text-[#F7B52C]' : 'bg-[#071527] text-slate-400 border border-slate-700'
                }`}>
                  {cantidad}
                </span>

                {/* Puntito verde si ya tiene banner subido */}
                {tieneBanner && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" title="Banner oficial cargado" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          1. BANNERS PROMOCIONALES (FILTRADO POR LA SEDE ELEGIDA)
         ========================================================================= */}
      <div className="bg-[#071527] border-2 border-[#F7B52C]/60 rounded-3xl shadow-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSeccion('bannersSedes')}
          className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#F7B52C]/15 text-[#F7B52C]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                Banners Oficiales (Flyers por Sede)
              </h2>
              <p className="text-xs text-slate-400">
                {filtroSedeAdmin === 'TODAS' 
                  ? 'Mostrando flyers de todas las sedes.' 
                  : `Mostrando flyer exclusivo de la sede ${filtroSedeAdmin}.`}
              </p>
            </div>
          </div>
          {seccionAbierta.bannersSedes ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {seccionAbierta.bannersSedes && (
          <div className="p-5 sm:p-6 pt-0 space-y-5 border-t border-slate-800/80 text-xs">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sedes
                .filter(s => filtroSedeAdmin === 'TODAS' || s.nombre === filtroSedeAdmin)
                .map((s) => {
                  const promo = bannersSedes[s.nombre] || {};
                  const tieneFlyer = Boolean(promo.flyer_url);
                  const esActivo = promo.activo !== false && tieneFlyer;
                  const estaSubiendo = subiendoSede === s.nombre;

                  return (
                    <div
                      key={s.id}
                      className={`p-4 rounded-2xl border-2 flex flex-col justify-between space-y-3 transition-all ${
                        esActivo ? 'bg-[#040914] border-slate-700' : 'bg-[#040914]/60 border-dashed border-slate-800 opacity-75'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2.5">
                          <strong className="text-white text-xs font-black uppercase truncate flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#00B4A7]" /> {s.nombre}
                          </strong>

                          {tieneFlyer && (
                            <button
                              type="button"
                              onClick={() => handleToggleActivoBanner(s.nombre)}
                              className="cursor-pointer text-[10px] font-mono font-bold"
                            >
                              {esActivo ? (
                                <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                  Activo
                                </span>
                              ) : (
                                <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                                  Pausado
                                </span>
                              )}
                            </button>
                          )}
                        </div>

                        {tieneFlyer ? (
                          <div className="relative aspect-[3/4] max-h-52 rounded-xl overflow-hidden bg-black border border-slate-800 shadow group">
                            <img src={promo.flyer_url} alt={s.nombre} className="w-full h-full object-cover" />
                            <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white font-bold cursor-pointer text-xs">
                              <Upload className="w-5 h-5 text-[#F7B52C]" />
                              <span>Cambiar Flyer</span>
                              <input
                                type="file"
                                accept="image/*"
                                disabled={estaSubiendo}
                                onChange={(e) => handleSubirFlyerSede(s.nombre, e.target.files?.[0])}
                                className="hidden"
                              />
                            </label>
                          </div>
                        ) : (
                          <label className="aspect-[3/4] max-h-52 rounded-xl border-2 border-dashed border-slate-800 hover:border-[#00B4A7] bg-slate-950/40 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-white transition-all cursor-pointer p-4 text-center">
                            {estaSubiendo ? <Loader2 className="w-6 h-6 animate-spin text-[#00B4A7]" /> : <Upload className="w-6 h-6 text-[#F7B52C]" />}
                            <span className="font-bold text-xs text-white">
                              {estaSubiendo ? 'Subiendo...' : '+ Subir Flyer de Sede'}
                            </span>
                            <span className="text-[10px] text-slate-500">Desde tus archivos</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={estaSubiendo}
                              onChange={(e) => handleSubirFlyerSede(s.nombre, e.target.files?.[0])}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      {tieneFlyer && (
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                          <label className="text-[#00B4A7] hover:underline font-bold flex items-center gap-1 cursor-pointer">
                            <Upload className="w-3 h-3" /> Subir otro
                            <input
                              type="file"
                              accept="image/*"
                              disabled={estaSubiendo}
                              onChange={(e) => handleSubirFlyerSede(s.nombre, e.target.files?.[0])}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => handleEliminarBannerSede(s.nombre)}
                            className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Quitar
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          2. EDITOR DE TEXTOS Y PRECIOS DE LAS TARJETAS (FILTRADO POR SEDE)
         ========================================================================= */}
      <div id="editor-tarjetas-promos" className="bg-[#071527] border-2 border-[#00B4A7]/60 rounded-3xl shadow-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSeccion('tarjetasPromos')}
          className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#00B4A7]/15 text-[#00B4A7]">
              <Edit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                Tarjetas de Promoción ({promocionesFiltradasAdmin.length} mostradas)
              </h2>
              <p className="text-xs text-slate-400">
                {filtroSedeAdmin === 'TODAS'
                  ? 'Mostrando tarjetas de todas las sedes.'
                  : `Filtradas exclusivamente para ${filtroSedeAdmin}.`}
              </p>
            </div>
          </div>
          {seccionAbierta.tarjetasPromos ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {seccionAbierta.tarjetasPromos && (
          <div className="p-5 sm:p-6 pt-0 space-y-6 border-t border-slate-800/80 text-xs">
            
            {/* FORMULARIO EDITAR / CREAR TARJETA */}
            <form onSubmit={handleGuardarTarjetaPromo} className="p-5 bg-[#040914] rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-xs font-black uppercase text-[#F7B52C] flex items-center gap-1.5">
                  {promoEnEdicionId ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  {promoEnEdicionId ? 'Editando Textos de la Tarjeta' : `+ Agregar Tarjeta ${filtroSedeAdmin !== 'TODAS' ? `a ${filtroSedeAdmin}` : ''}`}
                </span>

                {promoEnEdicionId && (
                  <button
                    type="button"
                    onClick={handleCancelarEdicionPromo}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Cancelar Edición
                  </button>
                )}
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">Título de la Tarjeta *:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. PROMO X3 (3 MESES) - LICEO NAVAL"
                    value={formPromo.titulo}
                    onChange={e => setFormPromo({ ...formPromo, titulo: e.target.value })}
                    className="w-full bg-[#071527] border border-slate-800 p-2.5 rounded-xl text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Sede correspondiente *:</label>
                  <select
                    value={formPromo.sede}
                    onChange={e => setFormPromo({ ...formPromo, sede: e.target.value })}
                    className="w-full bg-[#071527] border border-slate-800 p-2.5 rounded-xl text-white font-bold cursor-pointer"
                  >
                    <option value="">Todas las Sedes</option>
                    {sedes.map(s => (
                      <option key={s.id} value={s.nombre}>📍 {s.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Precio / Inversión (S/.) *:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. S/ 450 o S/ 550 con uniforme"
                    value={formPromo.valor_beneficio}
                    onChange={e => setFormPromo({ ...formPromo, valor_beneficio: e.target.value })}
                    className="w-full bg-[#071527] border border-slate-800 p-2.5 rounded-xl text-[#F7B52C] font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Vigencia:</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormPromo({ ...formPromo, es_permanente: !formPromo.es_permanente })}
                      className={`px-3 py-2 rounded-xl font-bold text-xs border cursor-pointer ${
                        formPromo.es_permanente ? 'bg-[#F7B52C] text-slate-950 border-[#F7B52C]' : 'bg-[#071527] text-slate-400 border-slate-800'
                      }`}
                    >
                      {formPromo.es_permanente ? 'Permanente' : 'Con Fecha'}
                    </button>
                    {!formPromo.es_permanente && (
                      <input
                        type="date"
                        value={formPromo.valido_hasta}
                        onChange={e => setFormPromo({ ...formPromo, valido_hasta: e.target.value })}
                        className="w-full bg-[#071527] border border-slate-800 p-2 rounded-xl text-white font-mono"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Descripción (Días, Horas y Qué incluye):
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Plan trimestral para Básquetbol (10 a 13 años). Días: Lunes, Miércoles y Viernes..."
                  value={formPromo.descripcion}
                  onChange={e => setFormPromo({ ...formPromo, descripcion: e.target.value })}
                  className="w-full bg-[#071527] border border-slate-800 p-2.5 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                {promoEnEdicionId && (
                  <button
                    type="button"
                    onClick={handleCancelarEdicionPromo}
                    className="px-4 py-2 text-slate-400 hover:text-white font-bold"
                  >
                    Cancelar
                  </button>
                )}

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 font-black uppercase tracking-wider rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{promoEnEdicionId ? 'Guardar Cambios de la Tarjeta' : '+ Guardar Nueva Tarjeta'}</span>
                </button>
              </div>
            </form>

            {/* LISTADO DE TARJETAS FILTRADAS */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black text-white">
                  Tarjetas de {filtroSedeAdmin === 'TODAS' ? 'todas las sedes' : filtroSedeAdmin} ({promocionesFiltradasAdmin.length})
                </h3>
                {filtroSedeAdmin !== 'TODAS' && (
                  <button
                    type="button"
                    onClick={() => setFiltroSedeAdmin('TODAS')}
                    className="text-[11px] text-[#00B4A7] hover:underline font-bold"
                  >
                    Ver todas las sedes
                  </button>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {promocionesFiltradasAdmin.map(p => (
                  <div
                    key={p.id}
                    className={`p-4 rounded-2xl border-2 flex flex-col justify-between space-y-3 transition-all ${
                      promoEnEdicionId === p.id 
                        ? 'bg-[#071527] border-[#F7B52C] ring-2 ring-[#F7B52C]/40' 
                        : 'bg-[#040914] border-slate-800'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-white text-xs leading-snug">{p.titulo}</h4>
                        <span className="font-mono font-black text-[11px] px-2 py-0.5 rounded bg-[#F7B52C] text-slate-950 shrink-0">
                          {p.valor_beneficio}
                        </span>
                      </div>

                      {p.descripcion && (
                        <p className="text-slate-300 text-[11px] line-clamp-2">{p.descripcion}</p>
                      )}

                      {p.sede && (
                        <span className="inline-block text-[10px] text-[#00B4A7] font-bold">
                          📍 Sede: {p.sede}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                      <button
                        type="button"
                        onClick={() => handleIniciarEditarPromo(p)}
                        className="px-3 py-1.5 rounded-lg bg-[#F7B52C]/15 hover:bg-[#F7B52C]/25 text-[#F7B52C] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar Textos / Precios</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleVisibilidadTarjeta(p.id, p.visible_en_web !== false)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 cursor-pointer"
                          title={p.visible_en_web !== false ? "Visible" : "Oculta"}
                        >
                          {p.visible_en_web !== false ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEliminarTarjetaPromo(p.id)}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 cursor-pointer"
                          title="Eliminar tarjeta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* =========================================================================
          🎯 GESTIÓN DE CATEGORÍAS DE EDAD
         ========================================================================= */}
      <div className="p-4 sm:p-6 rounded-3xl bg-[#071527] border border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-5 h-5 text-[#00B4A7]" />
          <h2 className="text-lg font-black text-white">Categorías de Edad</h2>
        </div>
        <p className="text-xs text-slate-400">
          Estas categorías aparecerán en el formulario de inscripción de la página principal.
        </p>

        <form onSubmit={handleAgregarCategoria} className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
              Nueva Categoría
            </label>
            <input
              type="text"
              value={nuevaCategoriaTexto}
              onChange={e => setNuevaCategoriaTexto(e.target.value)}
              placeholder="Ej: Mini (8 - 10 años)"
              className="w-full bg-[#040914] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#00B4A7] focus:outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={!nuevaCategoriaTexto.trim()}
            className="px-4 py-2.5 rounded-xl font-bold bg-[#00B4A7] text-slate-950 hover:bg-[#00c9ba] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Agregar
          </button>
        </form>

        {categoriasEdades.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 mt-4">
            {categoriasEdades.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-[#040914] border border-slate-800">
                <span className="text-sm font-bold text-slate-200">{cat.nombre}</span>
                <button
                  type="button"
                  onClick={() => handleEliminarCategoria(cat.id)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/40 hover:text-red-300 cursor-pointer transition-colors"
                  title="Eliminar categoría"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#040914] border border-slate-800 border-dashed text-center">
            <p className="text-sm text-slate-500">No hay categorías registradas.</p>
          </div>
        )}
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