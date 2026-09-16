import React, { useState, useEffect } from 'react';
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
  Calendar as CalendarIcon, 
  Layers, 
  Users2, 
  Eye, 
  EyeOff, 
  Infinity as InfinityIcon,
  Image as ImageIcon
} from 'lucide-react';
import { supabase } from '../supabase';

export default function AdminPreciosPromos() {
  const [sedes, setSedes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [seccionAbierta, setSeccionAbierta] = useState({
    promocionesUnificadas: true,
    claseModelo: true,
    ciclosExtra: false,
    planesMensuales: false,
    categorias: false
  });

  const toggleSeccion = (sec) => {
    setSeccionAbierta(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const [preciosClaseModelo, setPreciosClaseModelo] = useState({});
  const [precioMasivo, setPrecioMasivo] = useState(0);
  const [sedesSeleccionadasMasivo, setSedesSeleccionadasMasivo] = useState([]);

  const [ciclosExtra, setCiclosExtra] = useState([]);
  const [nuevoCiclo, setNuevoCiclo] = useState({ nombre: '', precio: 150 });

  const [categoriasEdades, setCategoriasEdades] = useState([]);
  const [nuevaCategoriaTexto, setNuevaCategoriaTexto] = useState('');

  const [_planesSedes, setPlanesSedes] = useState([]);
  const [_sedeSeleccionadaPlanes, setSedeSeleccionadaPlanes] = useState('');

  const fechaHoyStr = new Date().toISOString().split('T')[0];
  const [promociones, setPromociones] = useState([]);
  const [nuevaPromo, setNuevaPromo] = useState({
    titulo: '',
    descripcion: '',
    tipo_beneficio: 'precio',
    valor_beneficio: '',
    es_permanente: true,
    fecha_inicio: fechaHoyStr, 
    valido_hasta: '',
    visible_en_web: true,
    flyer_url: ''
  });

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [resSedes, resConfig] = await Promise.all([
          supabase.from('sedes').select('id, nombre, distrito').order('nombre', { ascending: true }),
          supabase.from('configuracion_web').select('clave, valor').in('clave', [
            'precios_clase_modelo',
            'planes_precios_sedes',
            'promociones_vigentes',
            'ciclos_adicionales',
            'categorias_edades'
          ])
        ]);

        if (resSedes.data && resSedes.data.length > 0) {
          setSedes(resSedes.data);
          setSedeSeleccionadaPlanes(resSedes.data[0].nombre);
          setSedesSeleccionadasMasivo(resSedes.data.map(s => s.nombre));
        }

        if (resConfig.data) {
          resConfig.data.forEach(item => {
            if (item.clave === 'precios_clase_modelo' && typeof item.valor === 'object') setPreciosClaseModelo(item.valor || {});
            if (item.clave === 'planes_precios_sedes' && typeof item.valor === 'object') setPlanesSedes(item.valor || {});
            if (item.clave === 'promociones_vigentes' && Array.isArray(item.valor)) setPromociones(item.valor || []);
            if (item.clave === 'ciclos_adicionales' && Array.isArray(item.valor)) setCiclosExtra(item.valor || []);
            if (item.clave === 'categorias_edades' && Array.isArray(item.valor)) setCategoriasEdades(item.valor || []);
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

  const handleCambiarPrecioSede = (nombreSede, nuevoPrecio) => {
    setPreciosClaseModelo(prev => ({
      ...prev,
      [nombreSede]: Math.max(0, parseFloat(nuevoPrecio) || 0)
    }));
  };

  const toggleSedeMasivo = (nombreSede) => {
    if (sedesSeleccionadasMasivo.includes(nombreSede)) {
      setSedesSeleccionadasMasivo(sedesSeleccionadasMasivo.filter(s => s !== nombreSede));
    } else {
      setSedesSeleccionadasMasivo([...sedesSeleccionadasMasivo, nombreSede]);
    }
  };

  const handleSeleccionarTodasSedes = () => {
    if (sedesSeleccionadasMasivo.length === sedes.length) {
      setSedesSeleccionadasMasivo([]);
    } else {
      setSedesSeleccionadasMasivo(sedes.map(s => s.nombre));
    }
  };

  const handleAplicarPrecioMasivo = () => {
    if (sedesSeleccionadasMasivo.length === 0) return alert("Selecciona al menos una sede.");
    const valorNum = Math.max(0, parseFloat(precioMasivo) || 0);
    const copia = { ...preciosClaseModelo };
    sedesSeleccionadasMasivo.forEach(nombre => { copia[nombre] = valorNum; });
    setPreciosClaseModelo(copia);
    alert(`✓ Tarifa de S/. ${valorNum} asignada a ${sedesSeleccionadasMasivo.length} sedes.`);
  };

  const handleGuardarPreciosClaseModelo = async () => {
    setGuardando(true);
    try {
      const { error } = await supabase.from('configuracion_web').upsert({
        clave: 'precios_clase_modelo',
        valor: preciosClaseModelo
      });
      if (error) throw error;
      alert("✓ Tarifas de Clase Modelo guardadas exitosamente.");
    } catch (err) {
      alert("No se pudieron guardar las tarifas: " + err.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleAgregarPromocionUnificada = async (e) => {
    e.preventDefault();
    if (!nuevaPromo.titulo.trim()) return alert("Ingresa el título de la promoción.");
    if (!nuevaPromo.es_permanente && !nuevaPromo.valido_hasta) {
      return alert("Por favor, selecciona la fecha límite o marca la promoción como Permanente.");
    }

    const nuevaItem = {
      id: Date.now(),
      titulo: nuevaPromo.titulo.trim(),
      descripcion: nuevaPromo.descripcion.trim(),
      tipo_beneficio: nuevaPromo.tipo_beneficio,
      valor_beneficio: nuevaPromo.valor_beneficio.trim(),
      es_permanente: nuevaPromo.es_permanente,
      fecha_inicio: nuevaPromo.fecha_inicio || fechaHoyStr,
      valido_hasta: nuevaPromo.es_permanente ? '' : nuevaPromo.valido_hasta,
      visible_en_web: nuevaPromo.visible_en_web,
      flyer_url: nuevaPromo.flyer_url.trim()
    };

    const listaActualizada = [nuevaItem, ...promociones];

    try {
      const { error } = await supabase.from('configuracion_web').upsert({
        clave: 'promociones_vigentes',
        valor: listaActualizada
      });
      if (error) throw error;

      setPromociones(listaActualizada);
      setNuevaPromo({
        titulo: '',
        descripcion: '',
        tipo_beneficio: 'precio',
        valor_beneficio: '',
        es_permanente: true,
        fecha_inicio: fechaHoyStr,
        valido_hasta: '',
        visible_en_web: true,
        flyer_url: ''
      });
      alert("✓ Promoción agregada y guardada exitosamente.");
    } catch (err) {
      alert("No se pudo agregar la promoción: " + err.message);
    }
  };

  const handleToggleVisibilidadPromo = async (id, visibilidadActual) => {
    const listaActualizada = promociones.map(p => 
      p.id === id ? { ...p, visible_en_web: !visibilidadActual } : p
    );

    try {
      const { error } = await supabase.from('configuracion_web').upsert({
        clave: 'promociones_vigentes',
        valor: listaActualizada
      });
      if (error) throw error;
      setPromociones(listaActualizada);
    } catch (err) {
      alert("No se pudo actualizar visibilidad: " + err.message);
    }
  };

  const handleEliminarPromocion = async (id) => {
    if (!confirm("¿Deseas eliminar definitivamente esta promoción?")) return;
    const listaActualizada = promociones.filter(p => p.id !== id);

    try {
      const { error } = await supabase.from('configuracion_web').upsert({
        clave: 'promociones_vigentes',
        valor: listaActualizada
      });
      if (error) throw error;
      setPromociones(listaActualizada);
      alert("✓ Promoción eliminada.");
    } catch (err) {
      alert("No se pudo eliminar la promoción: " + err.message);
    }
  };

  const handleAgregarCiclo = async (e) => {
    e.preventDefault();
    if (!nuevoCiclo.nombre.trim()) return alert("Ingresa el nombre del ciclo.");

    const nuevo = {
      id: `ciclo_${Date.now()}`,
      nombre: nuevoCiclo.nombre.trim(),
      precio: parseFloat(nuevoCiclo.precio) || 140
    };
    const lista = [...ciclosExtra, nuevo];

    try {
      const { error } = await supabase.from('configuracion_web').upsert({
        clave: 'ciclos_adicionales',
        valor: lista
      });
      if (error) throw error;
      setCiclosExtra(lista);
      setNuevoCiclo({ nombre: '', precio: 140 });
      alert("✓ Ciclo adicional registrado.");
    } catch (err) {
      alert("No se pudo agregar el ciclo: " + err.message);
    }
  };

  const handleEliminarCiclo = async (id) => {
    if (!confirm("¿Eliminar este ciclo?")) return;
    const lista = ciclosExtra.filter(c => c.id !== id);
    try {
      const { error } = await supabase.from('configuracion_web').upsert({
        clave: 'ciclos_adicionales',
        valor: lista
      });
      if (error) throw error;
      setCiclosExtra(lista);
    } catch (err) {
      alert("No se pudo eliminar el ciclo: " + err.message);
    }
  };

  const handleAgregarCategoria = async (e) => {
    e.preventDefault();
    if (!nuevaCategoriaTexto.trim()) return alert("Ingresa la categoría.");

    const nueva = { id: Date.now(), nombre: nuevaCategoriaTexto.trim() };
    const lista = [...categoriasEdades, nueva];

    try {
      const { error } = await supabase.from('configuracion_web').upsert({
        clave: 'categorias_edades',
        valor: lista
      });
      if (error) throw error;
      setCategoriasEdades(lista);
      setNuevaCategoriaTexto('');
      alert("✓ Categoría guardada.");
    } catch (err) {
      alert("No se pudo guardar la categoría: " + err.message);
    }
  };

  const handleEliminarCategoria = async (id) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    const lista = categoriasEdades.filter(c => c.id !== id);
    try {
      const { error } = await supabase.from('configuracion_web').upsert({
        clave: 'categorias_edades',
        valor: lista
      });
      if (error) throw error;
      setCategoriasEdades(lista);
    } catch (err) {
      alert("No se pudo eliminar la categoría: " + err.message);
    }
  };

  if (cargando) {
    return (
      <div className="p-12 text-center space-y-3">
        <Loader2 className="w-10 h-10 text-[#00B4A7] animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cargando Módulo de Precios & Promos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl animate-in fade-in duration-300">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Tag className="w-7 h-7 text-[#F7B52C]" /> Tarifas, Promos & Ciclos
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión unificada de promociones temporales con flyers, tarifas de clase modelo y ciclos formativos.
          </p>
        </div>

        {guardando && (
          <div className="flex items-center gap-2 text-xs text-[#00B4A7] font-bold">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Guardando en Supabase...</span>
          </div>
        )}
      </div>

      {/* 1. PROMOCIONES TEMPORALES */}
      <div className="bg-[#071527] border-2 border-[#F7B52C]/60 rounded-3xl shadow-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSeccion('promocionesUnificadas')}
          className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#F7B52C]/15 text-[#F7B52C]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Promociones con Flyers & Campañas Temporales</h2>
              <p className="text-xs text-slate-400">Activa anuncios automáticos en la web con imágenes de tus flyers y ofertas.</p>
            </div>
          </div>
          {seccionAbierta.promocionesUnificadas ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {seccionAbierta.promocionesUnificadas && (
          <div className="p-5 sm:p-6 pt-0 space-y-6 border-t border-slate-800/80 text-xs">
            <form onSubmit={handleAgregarPromocionUnificada} className="p-5 bg-[#040914] rounded-2xl border border-slate-800 space-y-4">
              <span className="text-[11px] font-black uppercase text-[#F7B52C] tracking-wide block">
                + Publicar Nueva Promoción con Flyer
              </span>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Título de la Promoción *:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. ¡Semana de Clase Gratis! o Promo Matrícula 2x1"
                    value={nuevaPromo.titulo}
                    onChange={e => setNuevaPromo({ ...nuevaPromo, titulo: e.target.value })}
                    className="w-full bg-[#071527] border border-slate-800 p-2.5 rounded-xl text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tipo de Vigencia:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNuevaPromo({ ...nuevaPromo, es_permanente: true })}
                      className={`p-2.5 rounded-xl font-black text-xs border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        nuevaPromo.es_permanente
                          ? 'bg-[#F7B52C] text-slate-950 border-[#F7B52C] shadow'
                          : 'bg-[#071527] text-slate-400 border-slate-800'
                      }`}
                    >
                      <InfinityIcon className="w-4 h-4" />
                      <span>Permanente</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNuevaPromo({ ...nuevaPromo, es_permanente: false })}
                      className={`p-2.5 rounded-xl font-black text-xs border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        !nuevaPromo.es_permanente
                          ? 'bg-[#00B4A7] text-slate-950 border-[#00B4A7] shadow'
                          : 'bg-[#071527] text-slate-400 border-slate-800'
                      }`}
                    >
                      <CalendarIcon className="w-4 h-4" />
                      <span>Con Fecha Límite</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#00B4A7]" />
                  <span>Enlace / URL de la Imagen o Flyer Promocional:</span>
                </label>
                <input
                  type="url"
                  placeholder="https://... (enlace de la imagen o flyer)"
                  value={nuevaPromo.flyer_url}
                  onChange={e => setNuevaPromo({ ...nuevaPromo, flyer_url: e.target.value })}
                  className="w-full bg-[#071527] border border-slate-800 p-2.5 rounded-xl text-white font-mono text-xs"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tipo de Beneficio:</label>
                  <select
                    value={nuevaPromo.tipo_beneficio}
                    onChange={e => setNuevaPromo({ ...nuevaPromo, tipo_beneficio: e.target.value })}
                    className="w-full bg-[#071527] border border-slate-800 p-2.5 rounded-xl text-white font-bold cursor-pointer"
                  >
                    <option value="precio">💰 Precio Promocional (S/.)</option>
                    <option value="porcentaje">% Porcentaje de Descuento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {nuevaPromo.tipo_beneficio === 'precio' ? 'Monto Promocional (S/.):' : 'Porcentaje Descuento (%):'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={nuevaPromo.tipo_beneficio === 'precio' ? 'Ej. S/. 0 Gratis o S/. 15' : 'Ej. 20% OFF'}
                    value={nuevaPromo.valor_beneficio}
                    onChange={e => setNuevaPromo({ ...nuevaPromo, valor_beneficio: e.target.value })}
                    className="w-full bg-[#071527] border border-slate-800 p-2.5 rounded-xl text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#00B4A7]" />
                    <span>Fecha Límite:</span>
                  </label>
                  {nuevaPromo.es_permanente ? (
                    <div className="w-full bg-[#071527] border border-slate-800 p-2.5 rounded-xl text-slate-500 font-bold flex items-center gap-1.5 select-none">
                      <InfinityIcon className="w-4 h-4 text-[#F7B52C]" />
                      <span>Promoción Permanente</span>
                    </div>
                  ) : (
                    <input
                      type="date"
                      required
                      value={nuevaPromo.valido_hasta}
                      onChange={e => setNuevaPromo({ ...nuevaPromo, valido_hasta: e.target.value })}
                      className="w-full bg-[#071527] border border-slate-800 p-2.5 rounded-xl text-white font-mono font-bold cursor-pointer"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Descripción de la Oferta:</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre qué incluye la promoción..."
                  value={nuevaPromo.descripcion}
                  onChange={e => setNuevaPromo({ ...nuevaPromo, descripcion: e.target.value })}
                  className="w-full bg-[#071527] border border-slate-800 p-2.5 rounded-xl text-white"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={nuevaPromo.visible_en_web}
                    onChange={e => setNuevaPromo({ ...nuevaPromo, visible_en_web: e.target.checked })}
                    className="w-4 h-4 accent-[#00B4A7]"
                  />
                  <span className="text-slate-300 font-bold">Mostrar en la página principal inmediatamente</span>
                </label>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#F7B52C] hover:bg-[#e6a524] text-slate-950 font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publicar Promoción</span>
                </button>
              </div>
            </form>

            {/* LISTADO DE PROMOS */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-black text-white">Promociones Activas ({promociones.length})</h3>

              {promociones.length === 0 ? (
                <div className="p-8 text-center bg-[#040914] rounded-2xl border border-dashed border-slate-800 text-slate-500">
                  No hay promociones registradas en el sistema.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {promociones.map(promo => {
                    const esVisible = promo.visible_en_web !== false;
                    const esPermanente = promo.es_permanente === true;

                    return (
                      <div 
                        key={promo.id} 
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                          esVisible 
                            ? 'bg-[#040914] border-slate-800 shadow-lg' 
                            : 'bg-[#040914]/60 border-dashed border-slate-800/80 opacity-75'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex gap-3 items-start">
                            {promo.flyer_url && (
                              <img 
                                src={promo.flyer_url} 
                                alt="Flyer" 
                                className="w-14 h-18 object-cover rounded-lg border border-slate-800 shrink-0" 
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="font-bold text-white text-sm truncate">{promo.titulo}</h4>
                                <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-[#F7B52C]/20 text-[#F7B52C] shrink-0">
                                  {promo.valor_beneficio}
                                </span>
                              </div>
                              {promo.descripcion && (
                                <p className="text-slate-300 text-xs leading-relaxed mt-1 line-clamp-2">{promo.descripcion}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono font-bold">
                            {esPermanente ? (
                              <span className="px-2 py-0.5 rounded bg-[#F7B52C]/15 text-[#F7B52C] flex items-center gap-1 border border-[#F7B52C]/30">
                                <InfinityIcon className="w-3 h-3" /> Permanente
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 flex items-center gap-1 border border-cyan-500/30">
                                <CalendarIcon className="w-3 h-3" /> Vence: {promo.valido_hasta}
                              </span>
                            )}

                            <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                              esVisible ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {esVisible ? '🟢 Visible en Web' : '👁️ Oculta'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80">
                          <button
                            type="button"
                            onClick={() => handleToggleVisibilidadPromo(promo.id, esVisible)}
                            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer border ${
                              esVisible 
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border-emerald-500/40'
                            }`}
                          >
                            {esVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            <span>{esVisible ? 'Sacar de la vista' : 'Mostrar en la Web'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEliminarPromocion(promo.id)}
                            className="px-3 py-1.5 rounded-lg font-bold text-[11px] text-red-400 hover:text-red-300 hover:bg-red-950/40 flex items-center gap-1 cursor-pointer transition-colors"
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

          </div>
        )}
      </div>

      {/* 2. CLASE MODELO */}
      <div className="bg-[#071527] border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSeccion('claseModelo')}
          className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#00B4A7]/15 text-[#00B4A7]">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Tarifas de Clase Modelo por Sede</h2>
              <p className="text-xs text-slate-400">Gratis o de pago, configurable para una o todas las sedes a la vez.</p>
            </div>
          </div>
          {seccionAbierta.claseModelo ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {seccionAbierta.claseModelo && (
          <div className="p-5 sm:p-6 pt-0 space-y-5 border-t border-slate-800/80 text-xs">
            <div className="p-4 bg-[#040914] rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase text-[#F7B52C]">Aplicar Tarifa en Bloque:</span>
                <button
                  type="button"
                  onClick={handleSeleccionarTodasSedes}
                  className="text-[11px] text-[#00B4A7] hover:underline font-bold"
                >
                  {sedesSeleccionadasMasivo.length === sedes.length ? "Deseleccionar todas" : `Marcar todas (${sedes.length})`}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {sedes.map(s => {
                  const sel = sedesSeleccionadasMasivo.includes(s.nombre);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSedeMasivo(s.nombre)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        sel ? 'bg-[#00B4A7] text-slate-950 border-[#00B4A7]' : 'bg-[#071527] text-slate-400 border-slate-800'
                      }`}
                    >
                      {sel ? '✓ ' : '+ '}{s.nombre}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 font-bold">Precio S/.:</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={precioMasivo}
                    onChange={e => setPrecioMasivo(e.target.value)}
                    className="w-24 bg-[#071527] border border-slate-800 p-2 rounded-xl text-white font-mono font-bold text-xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAplicarPrecioMasivo}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#F7B52C] hover:bg-[#e6a524] text-slate-950 font-black text-xs uppercase tracking-wider shadow cursor-pointer"
                >
                  Asignar a las {sedesSeleccionadasMasivo.length} sedes
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              {sedes.map(s => {
                const precio = preciosClaseModelo[s.nombre] !== undefined ? Number(preciosClaseModelo[s.nombre]) : 0;
                return (
                  <div key={s.id} className="p-3 bg-[#040914] rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white text-xs truncate">{s.nombre}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${precio === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#F7B52C]/20 text-[#F7B52C]'}`}>
                        {precio === 0 ? 'GRATIS' : `S/. ${precio}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono">S/.</span>
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={precio}
                        onChange={e => handleCambiarPrecioSede(s.nombre, e.target.value)}
                        className="w-full bg-[#071527] border border-slate-800 p-1.5 rounded-lg text-white font-mono font-bold text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleCambiarPrecioSede(s.nombre, 0)}
                        className="text-[10px] text-[#00B4A7] font-bold px-2 py-1 bg-[#071527] rounded border border-slate-800 shrink-0"
                      >
                        Gratis
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleGuardarPreciosClaseModelo}
                disabled={guardando}
                className="px-6 py-2.5 rounded-xl bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#00B4A7]/20"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Tarifas de Clase Modelo</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. CICLOS ADICIONALES */}
      <div className="bg-[#071527] border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSeccion('ciclosExtra')}
          className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Aumento de Ciclos de Entrenamiento ({ciclosExtra.length})</h2>
              <p className="text-xs text-slate-400">Agrega ciclos adicionales (ej. Dominical, Vacacional) con sus tarifas.</p>
            </div>
          </div>
          {seccionAbierta.ciclosExtra ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {seccionAbierta.ciclosExtra && (
          <div className="p-5 sm:p-6 pt-0 space-y-4 border-t border-slate-800/80 text-xs">
            <form onSubmit={handleAgregarCiclo} className="p-4 bg-[#040914] rounded-2xl border border-slate-800 grid sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nombre del Ciclo:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Ciclo Dominical"
                  value={nuevoCiclo.nombre}
                  onChange={e => setNuevoCiclo({ ...nuevoCiclo, nombre: e.target.value })}
                  className="w-full bg-[#071527] border border-slate-800 p-2.5 rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Tarifa Mensual (S/.):</label>
                <input
                  type="number"
                  required
                  placeholder="140"
                  value={nuevoCiclo.precio}
                  onChange={e => setNuevoCiclo({ ...nuevoCiclo, precio: e.target.value })}
                  className="w-full bg-[#071527] border border-slate-800 p-2.5 rounded-xl text-white font-mono font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 font-black uppercase tracking-wider rounded-xl shadow"
              >
                + Agregar Ciclo
              </button>
            </form>

            <div className="grid sm:grid-cols-2 gap-3">
              {ciclosExtra.map(c => (
                <div key={c.id} className="p-3 bg-[#040914] rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white text-sm">{c.nombre}</h4>
                    <span className="text-slate-400 font-mono text-xs">Tarifa base: S/. {c.precio}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEliminarCiclo(c.id)}
                    className="p-1.5 text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. CATEGORÍAS */}
      <div className="bg-[#071527] border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSeccion('categorias')}
          className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/15 text-purple-400">
              <Users2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Categorías de Edad Centralizadas ({categoriasEdades.length})</h2>
              <p className="text-xs text-slate-400">Modifica las categorías y se actualizarán en toda la web y formularios.</p>
            </div>
          </div>
          {seccionAbierta.categorias ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {seccionAbierta.categorias && (
          <div className="p-5 sm:p-6 pt-0 space-y-4 border-t border-slate-800/80 text-xs">
            <form onSubmit={handleAgregarCategoria} className="p-4 bg-[#040914] rounded-2xl border border-slate-800 flex gap-3 items-center">
              <input
                type="text"
                required
                placeholder="Ej. 10 a 13 años (Intermedio) o U13"
                value={nuevaCategoriaTexto}
                onChange={e => setNuevaCategoriaTexto(e.target.value)}
                className="flex-1 bg-[#071527] border border-slate-800 p-2.5 rounded-xl text-white font-bold"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-black uppercase tracking-wider rounded-xl shadow cursor-pointer whitespace-nowrap"
              >
                + Guardar Categoría
              </button>
            </form>

            <div className="grid sm:grid-cols-2 gap-2.5">
              {categoriasEdades.map(cat => (
                <div key={cat.id} className="p-3 bg-[#040914] rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-white text-xs">{cat.nombre}</span>
                  <button
                    type="button"
                    onClick={() => handleEliminarCategoria(cat.id)}
                    className="p-1.5 text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}