import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Crop, 
  Loader2, 
  PackageOpen 
} from 'lucide-react';
import { supabase } from '../supabase';
import ModalEncuadre from './ModalEncuadre';

const TALLAS_ROPA = ['4', '6', '8', '10', '12', '14', '16', 'S', 'M', 'L', 'XL'];
const TALLAS_BALON = ['N° 5 (Mini)', 'N° 6 (Femenino / U13)', 'N° 7 (Masculino Oficial)'];
const TALLAS_ACCESORIOS = ['Talla Única', 'S/M', 'L/XL'];

const normalizarCoordenada = (val, defecto = 50) => {
  if (val === null || val === undefined || val === '') return defecto;
  const num = Number(val);
  return Number.isFinite(num) && num >= 0 && num <= 100 ? num : defecto;
};

export default function AdminTienda() {
  const [productos, setProductos] = useState([]);
  const [errorCarga, setErrorCarga] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('Uniformes & Ropa');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [tallasSeleccionadas, setTallasSeleccionadas] = useState([]);

  const [modalEncuadreAbierto, setModalEncuadreAbierto] = useState(false);
  const [productoAEncuadrar, setProductoAEncuadrar] = useState(null);

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
    const file = e.target.files?.[0];
    if (!file) return;

    const nombreLimpio = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const { error } = await supabase.storage.from('imagenes_web').upload(`tienda/${nombreLimpio}`, file);

    if (error) {
      alert("Error al subir imagen: " + error.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from('imagenes_web').getPublicUrl(`tienda/${nombreLimpio}`);
    setFotoUrl(publicUrlData.publicUrl);
  };

  const handleCrearProducto = async (e) => {
    e.preventDefault();
    if (errorCarga) {
      alert("No se pueden guardar productos porque la carga inicial falló. Recarga la página.");
      return;
    }

    if (!nombre.trim() || !precio) {
      return alert("Por favor, ingresa el nombre y el precio del producto.");
    }

    const nuevoItem = {
      id: Date.now(),
      nombre: nombre.trim(),
      categoria,
      precio: parseFloat(precio) || 0,
      descripcion: descripcion.trim(),
      foto: fotoUrl || "",
      tallas: tallasSeleccionadas,
      posicionX: 50,
      posicionY: 50
    };

    const listaActualizada = [nuevoItem, ...productos];

    setGuardando(true);
    try {
      const { error } = await supabase.from('configuracion_web').upsert({
        clave: 'tienda_productos',
        valor: listaActualizada
      });
      if (error) throw error;

      setProductos(listaActualizada);
      setNombre('');
      setPrecio('');
      setDescripcion('');
      setFotoUrl('');
      setTallasSeleccionadas([]);
      alert("✓ Producto agregado a la tienda exitosamente.");
    } catch (err) {
      alert("No se pudo guardar el producto: " + err.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarProducto = async (id) => {
    if (errorCarga) {
      alert("Operación bloqueada por error de carga previa.");
      return;
    }

    if (!confirm("¿Deseas eliminar definitivamente este producto?")) return;

    const listaActualizada = productos.filter(p => p.id !== id);

    try {
      const { error } = await supabase.from('configuracion_web').upsert({
        clave: 'tienda_productos',
        valor: listaActualizada
      });
      if (error) throw error;
      setProductos(listaActualizada);
    } catch (err) {
      alert("No se pudo eliminar el producto: " + err.message);
    }
  };

  const handleVaciarTiendaCompleta = async () => {
    if (errorCarga) {
      alert("Operación bloqueada por error de carga previa.");
      return;
    }

    if (!confirm("¿Deseas BORRAR TODOS los productos existentes para dejar la tienda vacía?")) return;

    try {
      const { error } = await supabase.from('configuracion_web').upsert({
        clave: 'tienda_productos',
        valor: []
      });
      if (error) throw error;
      setProductos([]);
      alert("✓ La tienda ha quedado totalmente limpia.");
    } catch (err) {
      alert("No se pudo vaciar la tienda: " + err.message);
    }
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
      alert("No se pudo guardar el encuadre: " + err.message);
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

      {/* FORMULARIO AGREGAR PRODUCTO */}
      <div className="bg-[#071527] border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#F7B52C]" /> Publicar Nuevo Producto
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ingresa los datos reales de los uniformes o indumentaria que están a la venta en el club.
          </p>
        </div>

        <form onSubmit={handleCrearProducto} className="space-y-4 text-xs">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-slate-300 font-bold mb-1">Nombre del Producto *:</label>
              <input
                type="text"
                required
                placeholder="Ej. Camiseta Oficial de Básquet 2026"
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
            <label className="block text-slate-300 font-bold">Foto del Producto (Formato Cuadrado 1:1):</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleSubirFoto}
              className="w-full bg-[#040914] border border-slate-800 p-2 rounded-xl text-slate-300 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#00B4A7] file:text-slate-950 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={guardando || Boolean(errorCarga)}
            className="bg-[#F7B52C] hover:bg-[#e6a524] text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#F7B52C]/20 transition-all disabled:opacity-50"
          >
            {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Agregar Producto a la Tienda</span>
          </button>
        </form>
      </div>

      {/* LISTADO DE PRODUCTOS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <PackageOpen className="w-5 h-5 text-[#00B4A7]" /> Productos Publicados ({productos.length})
          </h2>
        </div>

        {productos.length === 0 ? (
          <div className="p-12 text-center bg-[#071527] rounded-3xl border border-dashed border-slate-800 text-xs text-slate-400 space-y-2">
            <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="font-bold text-white text-sm">No hay productos registrados en la tienda.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productos.map(p => {
              const posX = normalizarCoordenada(p.posicionX);
              const posY = normalizarCoordenada(p.posicionY);

              return (
                <div key={p.id} className="bg-[#071527] border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group">
                  <div>
                    <div className="relative aspect-square bg-slate-950 overflow-hidden">
                      {p.foto ? (
                        <img
                          src={p.foto}
                          alt={p.nombre}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          style={{ objectPosition: `${posX}% ${posY}%` }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 font-bold">
                          Sin foto
                        </div>
                      )}

                      <span className="absolute top-3 left-3 bg-[#00B4A7] text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded shadow">
                        {p.categoria}
                      </span>

                      {p.foto && (
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

                  <div className="p-5 pt-0 border-t border-slate-800/80 mt-2 flex justify-end">
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

    </div>
  );
}