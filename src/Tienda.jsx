import React, { useState } from 'react';
import { 
  ShoppingBag, 
  MessageCircle, 
  Sparkles, 
  Loader2 
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useTheme } from './ThemeContext';
import { useTiendaProductos, useWhatsAppGlobal } from './queries';
import CarruselProducto from './CarruselProducto';
import ProductoDetalleVista from './ProductoDetalleVista';

const normalizarCoordenada = (val, defecto = 50) => {
  if (val === null || val === undefined || val === '') return defecto;
  const num = Number(val);
  return Number.isFinite(num) && num >= 0 && num <= 100 ? num : defecto;
};

export default function Tienda() {
  const { esOscuro = true } = useTheme() || {};
  const WHATSAPP_PHONE = useWhatsAppGlobal();

  const { data: productos = [], isLoading: cargando } = useTiendaProductos();
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [deporteActivo, setDeporteActivo] = useState('TODOS');
  const [tallaSeleccionadaPorProducto, setTallaSeleccionadaPorProducto] = useState({});
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const categorias = ['Todas', 'Uniformes & Ropa', 'Balones & Accesorios', 'Protección & Rodilleras'];

  const productosFiltrados = productos.filter(p => {
    const matchCat = categoriaActiva === 'Todas' || p.categoria === categoriaActiva;
    const matchDep = deporteActivo === 'TODOS' || p.deporte === deporteActivo || (!p.deporte && deporteActivo === 'General');
    return matchCat && matchDep;
  });

  const handleSeleccionarTalla = (prodId, talla) => {
    setTallaSeleccionadaPorProducto(prev => ({
      ...prev,
      [prodId]: talla
    }));
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 relative overflow-hidden ${
      esOscuro ? 'bg-[#040914] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <Navbar />

      {/* MARCA DE AGUA */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] select-none overflow-hidden z-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20%" cy="35%" r="260" fill="none" stroke="#F7B52C" strokeWidth="2" strokeDasharray="8 8" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#00B4A7" strokeWidth="2.5" strokeDasharray="6 6" />
          <circle cx="80%" cy="35%" r="200" fill="none" stroke="#00B4A7" strokeWidth="2" strokeDasharray="6 6" />
        </svg>
      </div>

      {!productoSeleccionado && (
        <header className="pt-24 sm:pt-36 pb-12 text-center border-b border-slate-800 bg-[#071527]/70 relative z-10 backdrop-blur-md">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#040914] border border-[#00B4A7]/50 shadow text-xs font-black uppercase text-[#00B4A7]">
              <Sparkles className="w-3.5 h-3.5 text-[#F7B52C]" /> Indumentaria & Accesorios Oficiales
            </div>

            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white italic">
              Tienda Campeones Lima
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              Uniformes oficiales de competencia, balones de entrenamiento y accesorios para atletas de básquetbol y vóley.
            </p>
          </div>
        </header>
      )}

      <main className={`max-w-6xl mx-auto px-4 sm:px-6 ${productoSeleccionado ? 'pt-24 sm:pt-32' : 'py-10'} space-y-8 relative z-10 min-h-[50vh]`}>
        {productoSeleccionado ? (
          <ProductoDetalleVista 
            producto={productoSeleccionado} 
            onVolver={() => setProductoSeleccionado(null)} 
          />
        ) : (
          <>
            {/* FILTRO DE CATEGORÍAS */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {categorias.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoriaActiva(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                      categoriaActiva === cat
                        ? 'bg-[#00B4A7] text-slate-950 border-[#00B4A7] shadow-lg shadow-[#00B4A7]/25'
                        : 'bg-[#071527] text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase mr-1">Deporte:</span>
                {['TODOS', 'General', 'Voleibol', 'Básquetbol'].map(dep => (
                  <button
                    key={dep}
                    onClick={() => setDeporteActivo(dep)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                      deporteActivo === dep
                        ? 'bg-[#F7B52C] text-slate-950 border-[#F7B52C] shadow-lg'
                        : 'bg-[#040914] text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {dep}
                  </button>
                ))}
              </div>
            </div>

            {/* LISTADO DE PRODUCTOS */}
            {cargando ? (
              <div className="p-16 text-center space-y-3">
                <Loader2 className="w-10 h-10 text-[#00B4A7] animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cargando Tienda...</p>
              </div>
            ) : productosFiltrados.length === 0 ? (
              <div className="p-16 text-center bg-[#071527] rounded-3xl border border-dashed border-slate-800 text-xs text-slate-400 space-y-3">
                <ShoppingBag className="w-12 h-12 text-[#00B4A7] mx-auto opacity-70" />
                <p className="font-bold text-white text-base">Próximamente: Colección Oficial Campeones Lima</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Actualmente no hay productos disponibles. Consulta por WhatsApp las próximas novedades de nuestra colección.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productosFiltrados.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => setProductoSeleccionado(p)}
                    className="bg-[#071527] border border-slate-800 hover:border-[#00B4A7] rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group transition-all cursor-pointer"
                  >
                    <div>
                      {/* FOTO 1:1 */}
                      <div className="relative aspect-square bg-slate-950 overflow-hidden">
                        <CarruselProducto producto={p} />
                        <span className="absolute top-3 left-3 bg-[#00B4A7] text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded shadow z-10 pointer-events-none">
                          {p.categoria}
                        </span>
                      </div>

                      <div className="p-6 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-white text-base leading-snug group-hover:text-[#00B4A7] transition-colors">{p.nombre}</h3>
                          <span className="font-mono text-xl font-black text-[#F7B52C] shrink-0">
                            S/. {p.precio}
                          </span>
                        </div>

                        {p.descripcion && (
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                            {p.descripcion}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-6 pt-0">
                      <button className="w-full py-3 rounded-xl bg-slate-800 group-hover:bg-[#00B4A7] text-white group-hover:text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow">
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}