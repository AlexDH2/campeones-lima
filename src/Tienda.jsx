import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  MessageCircle, 
  Phone, 
  Sparkles, 
  Truck, 
  ShieldCheck, 
  Shirt, 
  Star,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  ArrowLeft,
  LayoutDashboard,
  Loader2
} from 'lucide-react';
import { supabase } from './supabase';

function ImageSlider({ imagenes, nombre }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!imagenes || imagenes.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imagenes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [imagenes]);

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  };

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % imagenes.length);
  };

  if (!imagenes || imagenes.length === 0) {
    return (
      <div className="w-full h-64 bg-[#0d1f36] rounded-2xl flex flex-col items-center justify-center text-slate-500 border border-teal-950">
        <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
        <span className="text-xs">Sin imagen disponible</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 bg-[#0d1f36] rounded-2xl overflow-hidden border border-teal-950 group">
      <img 
        src={imagenes[currentIndex]} 
        alt={`${nombre} - foto ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-all duration-500 transform group-hover:scale-105"
        onError={(e) => {
          e.currentTarget.src = "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&auto=format&fit=crop&q=60";
        }}
      />

      {imagenes.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-slate-950/70 hover:bg-teal-500 hover:text-slate-950 text-white p-1.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-950/70 hover:bg-teal-500 hover:text-slate-950 text-white p-1.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-950/60 px-2 py-1 rounded-full backdrop-blur-sm">
            {imagenes.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentIndex === idx ? 'bg-teal-400 w-4' : 'bg-slate-500'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function TiendaPage() {
  const WHATSAPP_PHONE = "51963896985";
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const location = useLocation();
  const vieneDeAdmin = new URLSearchParams(location.search).get('from') === 'admin';

  // Cargar productos desde Supabase
  useEffect(() => {
    async function obtenerProductos() {
      try {
        const { data, error } = await supabase
          .from('tienda_productos')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setProductos(data);
        }
      } catch (err) {
        console.error("Error al cargar productos:", err);
      } finally {
        setCargando(false);
      }
    }
    obtenerProductos();
  }, []);

  const productosFiltrados = productos.filter((p) => {
    if (categoriaFiltro === 'todos') return true;
    return p.categoria === categoriaFiltro;
  });

  return (
    <div className="min-h-screen bg-[#060d19] text-slate-100 font-sans selection:bg-teal-400 selection:text-slate-950">
      
      {/* MODO PREVISUALIZACIÓN ADMIN */}
      {vieneDeAdmin && (
        <div className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-amber-500 via-teal-500 to-cyan-500 text-slate-950 px-4 py-2 text-xs font-black flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Modo Previsualización de Administrador</span>
          </div>
          <Link 
            to="/admin" 
            className="bg-slate-950 hover:bg-slate-900 text-white px-3.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver al Panel de Admin
          </Link>
        </div>
      )}

      {/* NAVBAR */}
      <nav className={`fixed left-0 w-full z-40 bg-[#060d19]/90 backdrop-blur-md border-b border-teal-950/60 transition-all ${
        vieneDeAdmin ? 'top-8' : 'top-0'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Campeones Lima Logo" 
              className="w-11 h-11 object-contain drop-shadow-[0_0_10px_rgba(20,184,166,0.3)]"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-white">
                  CAMPEONES <span className="text-amber-400">LIMA</span>
                </span>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 font-bold px-1.5 py-0.5 rounded border border-teal-500/30">
                  2015
                </span>
              </div>
              <p className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold">Club & Academia Deportiva</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <Link to="/" className="hover:text-teal-400 transition-colors">Inicio</Link>
            <Link to="/nosotros" className="hover:text-teal-400 transition-colors">Nosotros</Link>
            <Link to="/sedes" className="hover:text-teal-400 transition-colors">Sedes</Link>
            <Link to="/eventos" className="hover:text-teal-400 transition-colors">Eventos</Link>
            <Link to="/tienda" className="text-teal-400 font-bold">Tienda</Link>
            <Link to="/trabaja" className="hover:text-teal-400 transition-colors">Trabaja con Nosotros</Link>
          </div>

          <div className="flex items-center gap-3">
            {vieneDeAdmin && (
              <Link 
                to="/admin" 
                className="hidden sm:inline-flex items-center gap-1.5 bg-[#0a182b] hover:bg-teal-500 hover:text-slate-950 text-teal-300 border border-teal-500/40 text-xs font-bold px-3 py-2 rounded-xl transition-all"
              >
                <LayoutDashboard className="w-4 h-4" /> Admin
              </Link>
            )}

            <a 
              href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola,%20deseo%20hacer%20un%20pedido%20de%20la%20Tienda%20Oficial`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-sm shadow-md shadow-teal-500/20 transition-all"
            >
              <ShoppingBag className="w-4 h-4" /> Hacer Pedido
            </a>
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <section className={`relative pb-20 bg-gradient-to-b from-[#0a182c] to-[#060d19] border-b border-teal-950/60 overflow-hidden ${
        vieneDeAdmin ? 'pt-44' : 'pt-36'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d1f36] border border-teal-500/30 text-teal-300 text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" /> Catálogo & Indumentaria Oficial
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Tienda Oficial <span className="bg-gradient-to-r from-teal-300 via-cyan-400 to-amber-300 bg-clip-text text-transparent">Campeones Lima</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Flyers oficiales, uniformes y ropa deportiva con recojo en tu sede de entrenamiento o delivery.
          </p>
        </div>
      </section>

      {/* FILTROS */}
      <section className={`py-8 bg-[#040812] border-b border-teal-950/40 sticky z-30 backdrop-blur-md bg-opacity-95 ${
        vieneDeAdmin ? 'top-28' : 'top-20'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { id: 'todos', label: '🛍️ Todos los Productos' },
              { id: 'uniformes', label: '🎽 Uniformes Oficiales' },
              { id: 'ropa', label: '🧥 Ropa Deportiva' },
              { id: 'balones', label: '🏀 Balones y Equipamiento' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoriaFiltro(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  categoriaFiltro === cat.id
                    ? 'bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 shadow-md shadow-teal-500/20'
                    : 'bg-[#0a182b] text-slate-400 hover:text-white border border-teal-950'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTOS / FLYERS DESDE SUPABASE */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {cargando ? (
            <div className="text-center py-20">
              <Loader2 className="w-10 h-10 text-teal-400 animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-400">Cargando productos de la tienda...</p>
            </div>
          ) : productosFiltrados.length === 0 ? (
            /* ESTADO VACÍO (SIN DATOS FALSOS) */
            <div className="text-center py-20 bg-[#081322] border border-slate-800 rounded-3xl p-8 max-w-md mx-auto">
              <ShoppingBag className="w-12 h-12 text-teal-400/50 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">Pronto nuevos productos</h3>
              <p className="text-xs text-slate-400 mb-6">Actualmente no hay artículos publicados en esta categoría. Consulta por WhatsApp para pedidos especiales.</p>
              <a 
                href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola%20Campeones%20Lima,%20quisiera%20consultar%20por%20uniformes%20o%20indumentaria`}
                target="_blank"
                rel="noreferrer"
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs"
              >
                Consultar Disponibilidad
              </a>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {productosFiltrados.map((prod) => (
                <div 
                  key={prod.id} 
                  className="bg-[#081322] border border-teal-900/40 hover:border-teal-500/40 rounded-3xl p-6 flex flex-col justify-between shadow-2xl transition-all"
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#0d1f36] text-teal-300 border border-teal-900/50 capitalize">
                        {prod.categoria}
                      </span>
                      {prod.destacado && (
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400" /> Destacado
                        </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <ImageSlider imagenes={prod.imagenes} nombre={prod.nombre} />
                    </div>

                    <h3 className="text-lg font-black text-white mb-2">{prod.nombre}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{prod.descripcion}</p>

                    <div className="bg-[#060d19] p-3 rounded-xl border border-teal-950/60 mb-4">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tallas / Presentación:</p>
                      <p className="text-xs text-teal-300 font-semibold mt-0.5">{prod.tallas || "Estándar"}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase text-slate-500 font-bold">Precio</p>
                      <span className="text-xl font-black text-amber-400">S/. {parseFloat(prod.precio).toFixed(2)}</span>
                    </div>

                    <a 
                      href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola%20Campeones%20Lima,%20deseo%20comprar%20el%20producto:%20${encodeURIComponent(prod.nombre)}%20(S/.%20${prod.precio})`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-md shadow-teal-500/20 transition-all transform active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4 fill-slate-950" /> Pedir
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#03060c] border-t border-teal-950/60 py-10 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <div>
              <p className="font-black text-white text-sm">CAMPEONES LIMA</p>
              <p className="text-[11px] text-slate-500">Club & Academia Deportiva · Desde 2015</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-slate-300">
            <Link to="/" className="hover:text-teal-400">Inicio</Link>
            <Link to="/nosotros" className="hover:text-teal-400">Nosotros</Link>
            <Link to="/sedes" className="hover:text-teal-400">Sedes</Link>
            <Link to="/eventos" className="hover:text-teal-400">Eventos</Link>
            <Link to="/tienda" className="text-teal-400 font-bold">Tienda</Link>
            <a href={`https://wa.me/${WHATSAPP_PHONE}`} target="_blank" rel="noreferrer" className="hover:text-teal-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-teal-400" /> +51 963 896 985
            </a>
          </div>

          <p className="text-slate-600 text-center md:text-right">
            © {new Date().getFullYear()} Campeones Lima. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {/* BOTÓN FLOTANTE */}
      <a
        href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola%20Campeones%20Lima,%20deseo%20consultar%20sobre%20la%20tienda`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba59] text-white p-4 rounded-full shadow-2xl shadow-green-500/30 flex items-center justify-center transition-all transform hover:scale-110 active:scale-95"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-white stroke-none" />
      </a>

    </div>
  );
}