import { guardar } from './operaciones';
import { subirArchivoStorage } from './adminUtils';
import React, { useState, useEffect } from 'react';
import { useToast } from '../toast';
import ModalConfirmacion from './ModalConfirmacion';
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Crop, 
  Loader2, 
  PackageOpen,
  Edit
} from 'lucide-react';
import { supabase } from '../supabase';
import ModalEncuadre from './ModalEncuadre';
import CarruselProducto from '../CarruselProducto';

const TALLAS_ROPA = ['4', '6', '8', '10', '12', '14', '16', 'S', 'M', 'L', 'XL'];
const TALLAS_BALON = ['N° 5 (Mini)', 'N° 6 (Femenino / U13)', 'N° 7 (Masculino Oficial)'];
const TALLAS_ACCESORIOS = ['Talla Única', 'S/M', 'L/XL'];

const normalizarCoordenada = (val, defecto = 50) => {
  if (val === null || val === undefined || val === '') return defecto;
  const num = Number(val);
  return Number.isFinite(num) && num >= 0 && num <= 100 ? num : defecto;
};

export default function AdminTienda() {
  const { mostrarToast } = useToast();
  const [confirmacion, setConfirmacion] = useState(null);
  const [productos, setProductos] = useState([]);
  const [errorCarga, setErrorCarga] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('Uniformes & Ropa');
  const [deporte, setDeporte] = useState('General'); // Agregado: Deporte
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fotosUrl, setFotosUrl] = useState([]);
  const [tallasSeleccionadas, setTallasSeleccionadas] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  const [modalEncuadreAbierto, setModalEncuadreAbierto] = useState(false);
  const [productoAEncuadrar, setProductoAEncuadrar] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('TODOS');

  useEffect(() => {
    async function cargarProductosReales() {
      try {
        const { data, error } = await supabase
          .from('configuracion_web')
          .select('valor')
          .eq('clave', 'tienda_productos')
          .maybeSingle();

        if (error) throw error;

        if (data?.valor && Array.isArray(data.valor)) {
          setProductos(data.valor);
        } else {
          setProductos([]);
        }
        setErrorCarga('');
      } catch (err) {
        console.error("Error al cargar productos:", err);
        setErrorCarga("No se pudo cargar el catálogo de productos. Recarga para reintentar antes de realizar modificaciones.");
      } finally {
        setCargando(false);
      }
    }
    cargarProductosReales();
  }, []);

  const tallasDisponibles = categoria === 'Uniformes & Ropa' 
    ? TALLAS_ROPA 
    : categoria === 'Balones & Accesorios' 
      ? TALLAS_BALON 
      : TALLAS_ACCESORIOS;

  const toggleTalla = (talla) => {
    if (tallasSeleccionadas.includes(talla)) {
      setTallasSeleccionadas(tallasSeleccionadas.filter(t => t !== talla));
    } else {
      setTallasSeleccionadas([...tallasSeleccionadas, talla]);
    }
  };

  const handleSubirFoto = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setGuardando(true);
    try {
      const urlsNuevas = [];
      for (const file of files) {
        const publicUrl = await subirArchivoStorage(file, 'tienda');
        if (publicUrl) urlsNuevas.push(publicUrl);
      }
      if (urlsNuevas.length === 0) {
         mostrarToast("Error al subir imagen", "error");
      } else {
         setFotosUrl(prev => [...prev, ...urlsNuevas]);
      }
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarFotoFormulario = (idx) => {
    setFotosUrl(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCrearProducto = async (e) => {
    e.preventDefault();
    if (errorCarga) {
      mostrarToast("No se pueden guardar productos porque la carga inicial falló. Recarga la página.", "error");
      return;
    }

    if (!nombre.trim() || !precio) {
      return mostrarToast("Por favor, ingresa el nombre y el precio del producto.", "error");
    }

    let listaActualizada;

    if (editandoId) {
      listaActualizada = productos.map(p => p.id === editandoId ? {
        ...p,
        nombre: nombre.trim(),
        categoria,
        deporte,
        precio: parseFloat(precio) || 0,
        descripcion: descripcion.trim(),
        fotos: fotosUrl,
        foto: fotosUrl[0] || "",
        tallas: tallasSeleccionadas
      } : p);
    } else {
      const nuevoItem = {
        id: Date.now(),
        nombre: nombre.trim(),
        categoria,
        deporte,
        precio: parseFloat(precio) || 0,
        descripcion: descripcion.trim(),
        fotos: fotosUrl,
        foto: fotosUrl[0] || "",
        tallas: tallasSeleccionadas,
        posicionX: 50,
        posicionY: 50
      };
      listaActualizada = [nuevoItem, ...productos];
    }

    setGuardando(true);
    try {
      const { error } = await supabase.from('configuracion_web').upsert({
        clave: 'tienda_productos',
        valor: listaActualizada
      });
      if (error) throw error;

      setProductos(listaActualizada);
      cancelarEdicion();
      mostrarToast(editandoId ? "Producto actualizado correctamente." : "Producto agregado a la tienda exitosamente.", "exito");
    } catch (err) {
      mostrarToast("No se pudo guardar el producto: " + err.message, "error");
    } finally {
      setGuardando(false);
    }
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombre('');
    setPrecio('');
    setCategoria('Uniformes & Ropa');
    setDeporte('General');
    setDescripcion('');
    setFotosUrl([]);
    setTallasSeleccionadas([]);
  };

  const handleEditarProducto = (p) => {
    setEditandoId(p.id);
    setNombre(p.nombre || '');
    setCategoria(p.categoria || 'Uniformes & Ropa');
    setDeporte(p.deporte || 'General');
    setPrecio(p.precio || '');
    setDescripcion(p.descripcion || '');
    setFotosUrl(p.fotos || (p.foto ? [p.foto] : []));
    setTallasSeleccionadas(p.tallas || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminarProducto = async (id) => {
    if (errorCarga) {
      mostrarToast("Operación bloqueada por error de carga previa.", "error");
      return;
    }

    setConfirmacion({
      mensaje: "¿Deseas eliminar definitivamente este producto?",
      peligroso: true,
      onConfirmar: async () => {
        setConfirmacion(null);
        const listaActualizada = productos.filter(p => p.id !== id);

        try {
          const { error } = await supabase.from('configuracion_web').upsert({
            clave: 'tienda_productos',
            valor: listaActualizada
          });
          if (error) throw error;
          setProductos(listaActualizada);
          mostrarToast("Producto eliminado.", "exito");
        } catch (err) {
          mostrarToast("No se pudo eliminar el producto: " + err.message, "error");
        }
      }
    });
  };

  const handleVaciarTiendaCompleta = async () => {
    if (errorCarga) {
      mostrarToast("Operación bloqueada por error de carga previa.", "error");
      return;
    }

    setConfirmacion({
      mensaje: "¿Deseas BORRAR TODOS los productos existentes para dejar la tienda vacía?",
      peligroso: true,
      onConfirmar: async () => {
        setConfirmacion(null);
        try {
          const { error } = await supabase.from('configuracion_web').upsert({
            clave: 'tienda_productos',
            valor: []
          });
          if (error) throw error;
          setProductos([]);
          mostrarToast("La tienda ha quedado totalmente limpia.", "exito");
        } catch (err) {
          mostrarToast("No se pudo vaciar la tienda: " + err.message, "error");
        }
      }
    });
  };

  // Guardar ambas coordenadas x e y
  const handleGuardarEncuadre = async (posicion) => {
    if (!productoAEncuadrar || errorCarga) return false;

    const posX = typeof posicion === 'object' && posicion !== null ? normalizarCoordenada(posicion.x) : 50;
    const posY = typeof posicion === 'object' && posicion !== null ? normalizarCoordenada(posicion.y) : 50;

    const listaActualizada = productos.map(p => 
      p.id === productoAEncuadrar.id ? { ...p, posicionX: posX, posicionY: posY } : p
    );

    try {
      const { error } = await supabase.from('configuracion_web').upsert({
        clave: 'tienda_productos',
        valor: listaActualizada
      });
      if (error) throw error;
      setProductos(listaActualizada);
      setModalEncuadreAbierto(false);
      setProductoAEncuadrar(null);
      return true;
    } catch (err) {
      mostrarToast("No se pudo guardar el encuadre: " + err.message, "error");
      return false;
    }
  };

  if (errorCarga) {
    return (
      <div role="alert" className="p-8 text-center bg-red-950/20 border border-red-500/40 rounded-3xl max-w-5xl space-y-4">
        <p className="text-red-300 font-bold text-sm">{errorCarga}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl cursor-pointer"
        >
          Reintentar carga
        </button>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="p-12 text-center space-y-3">
        <Loader2 className="w-10 h-10 text-[#00B4A7] animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cargando Tienda Oficial...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-5xl animate-in fade-in duration-300">
      
      {modalEncuadreAbierto && productoAEncuadrar && (
        <ModalEncuadre
          key={`prod_${productoAEncuadrar.id}_${productoAEncuadrar.foto}`}
          abierto={modalEncuadreAbierto}
          alCerrar={() => {
            setModalEncuadreAbierto(false);
            setProductoAEncuadrar(null);
          }}
          imagenUrl={productoAEncuadrar.foto}
          posicionInicial={{
            x: normalizarCoordenada(productoAEncuadrar.posicionX),
            y: normalizarCoordenada(productoAEncuadrar.posicionY)
          }}
          alGuardar={handleGuardarEncuadre}
        />
      )}

      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-[#00B4A7]" /> Tienda Oficial del Club
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Administra uniformes de juego, balones oficiales y accesorios para básquetbol y vóley.
          </p>
        </div>

        {productos.length > 0 && (
          <button
            type="button"
            onClick={handleVaciarTiendaCompleta}
            className="text-xs text-red-400 hover:text-red-300 font-bold underline cursor-pointer self-start sm:self-auto"
          >
            Borrar todos los productos
          </button>
        )}
      </div>

      {/* FORMULARIO AGREGAR / EDITAR PRODUCTO */}
      <div className="bg-[#071527] border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Plus className={`w-5 h-5 ${editandoId ? 'text-[#00B4A7]' : 'text-[#F7B52C]'}`} /> 
            {editandoId ? 'Editando Producto Existente' : 'Publicar Nuevo Producto'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {editandoId ? 'Modifica los datos del producto y guarda los cambios.' : 'Ingresa los datos reales de los uniformes o indumentaria que están a la venta en el club.'}
          </p>
        </div>

        <form onSubmit={handleCrearProducto} className="space-y-4 text-xs">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Nombre del Producto *:</label>
              <input
                type="text"
                required
                placeholder="Ej. Camiseta..."
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Categoría:</label>
              <select
                value={categoria}
                onChange={e => {
                  setCategoria(e.target.value);
                  setTallasSeleccionadas([]);
                }}
                className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white font-bold cursor-pointer"
              >
                <option value="Uniformes & Ropa">👕 Uniformes & Ropa</option>
                <option value="Balones & Accesorios">🏀 Balones & Pelotas</option>
                <option value="Protección & Rodilleras">🛡️ Protección & Rodilleras</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Deporte:</label>
              <select
                value={deporte}
                onChange={e => setDeporte(e.target.value)}
                className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white font-bold cursor-pointer"
              >
                <option value="General">General / Todos</option>
                <option value="Voleibol">Voleibol</option>
                <option value="Básquetbol">Básquetbol</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Precio en Soles (S/.) *:</label>
              <input
                type="number"
                step="0.5"
                required
                placeholder="Ej. 65"
                value={precio}
                onChange={e => setPrecio(e.target.value)}
                className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white font-mono font-bold"
              />
            </div>
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl bg-[#040914] border border-slate-800">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#00B4A7] block">
              Tallas Disponibles para este Producto:
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tallasDisponibles.map(talla => {
                const seleccionada = tallasSeleccionadas.includes(talla);
                return (
                  <button
                    type="button"
                    key={talla}
                    onClick={() => toggleTalla(talla)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                      seleccionada
                        ? 'bg-[#00B4A7] text-slate-950 border-[#00B4A7]'
                        : 'bg-[#071527] text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {talla} {seleccionada && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Descripción Breve:</label>
            <textarea
              rows={2}
              placeholder="Material transpirable de alta resistencia..."
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold">Fotos del Producto (Puedes seleccionar varias):</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleSubirFoto}
              className="w-full bg-[#040914] border border-slate-800 p-2 rounded-xl text-slate-300 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#00B4A7] file:text-slate-950 cursor-pointer"
            />
            {fotosUrl.length > 0 && (
              <div className="flex gap-2 flex-wrap pt-2">
                {fotosUrl.map((url, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-800">
                    <img src={url} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleEliminarFotoFormulario(idx)}
                      className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={guardando || Boolean(errorCarga)}
              className={`${editandoId ? 'bg-[#00B4A7] hover:bg-[#00c9ba] shadow-[#00B4A7]/20' : 'bg-[#F7B52C] hover:bg-[#e6a524] shadow-[#F7B52C]/20'} text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg transition-all disabled:opacity-50`}
            >
              {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>{editandoId ? 'Guardar Cambios del Producto' : 'Agregar Producto a la Tienda'}</span>
            </button>
            {editandoId && (
              <button
                type="button"
                onClick={cancelarEdicion}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
              >
                Cancelar Edición
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LISTADO DE PRODUCTOS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <PackageOpen className="w-5 h-5 text-[#00B4A7]" /> Productos Publicados ({productos.length})
          </h2>
          
          {productos.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase mr-1">Filtro:</span>
              <button
                type="button"
                onClick={() => setFiltroCategoria('TODOS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border cursor-pointer ${
                  filtroCategoria === 'TODOS'
                    ? 'bg-[#00B4A7] text-slate-950 border-[#00B4A7]'
                    : 'bg-[#040914] text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                Todos
              </button>
              {Array.from(new Set(productos.map(p => p.categoria).filter(Boolean))).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFiltroCategoria(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border cursor-pointer ${
                    filtroCategoria === cat
                      ? 'bg-[#F7B52C] text-slate-950 border-[#F7B52C]'
                      : 'bg-[#040914] text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {cat.split(' ')[0]} {/* Para que sea más corto */}
                </button>
              ))}
            </div>
          )}
        </div>

        {productos.length === 0 ? (
          <div className="p-12 text-center bg-[#071527] rounded-3xl border border-dashed border-slate-800 text-xs text-slate-400 space-y-2">
            <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="font-bold text-white text-sm">No hay productos registrados en la tienda.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productos.filter(p => filtroCategoria === 'TODOS' || p.categoria === filtroCategoria).map(p => {
              const posX = normalizarCoordenada(p.posicionX);
              const posY = normalizarCoordenada(p.posicionY);

              return (
                <div key={p.id} className="bg-[#071527] border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group">
                  <div>
                    <div className="relative aspect-square bg-slate-950 overflow-hidden">
                      <CarruselProducto producto={p} />

                      <span className="absolute top-3 left-3 bg-[#00B4A7] text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded shadow z-10 pointer-events-none">
                        {p.categoria}
                      </span>

                      {(p.fotos?.length > 0 || p.foto) && (
                        <button
                          type="button"
                          onClick={() => {
                            setProductoAEncuadrar(p);
                            setModalEncuadreAbierto(true);
                          }}
                          className="absolute bottom-3 right-3 bg-black/80 hover:bg-[#F7B52C] hover:text-slate-950 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/20 flex items-center gap-1 cursor-pointer transition-colors shadow"
                        >
                          <Crop className="w-3 h-3" />
                          <span>Encuadrar 1:1</span>
                        </button>
                      )}
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-white text-sm leading-tight">{p.nombre}</h3>
                        <span className="font-mono text-base font-black text-[#F7B52C] shrink-0">
                          S/. {p.precio}
                        </span>
                      </div>

                      {p.descripcion && (
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {p.descripcion}
                        </p>
                      )}

                      {p.tallas && p.tallas.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {p.tallas.map(t => (
                            <span key={t} className="text-[10px] bg-[#040914] text-slate-300 px-2 py-0.5 rounded border border-slate-800 font-mono">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 pt-4 border-t border-slate-800 mt-2 flex justify-between items-center bg-[#040914]">
                    <button
                      type="button"
                      onClick={() => handleEditarProducto(p)}
                      className="text-xs text-[#00B4A7] hover:text-[#00c9ba] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEliminarProducto(p.id)}
                      className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
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