import React, { useState } from 'react';
import { ArrowLeft, Check, Share2, MessageCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useWhatsAppGlobal, useSedes } from './queries';
import { useToast } from './toast';

export default function ProductoDetalleVista({ producto, onVolver }) {
  const WHATSAPP_PHONE = useWhatsAppGlobal();
  const { data: sedes = [] } = useSedes();
  const { mostrarToast } = useToast();
  
  const [cantidad, setCantidad] = useState(1);
  const [fotoActiva, setFotoActiva] = useState(0);
  const [tallaElegida, setTallaElegida] = useState(producto.tallas?.[0] || '');
  const [mostrarOpcionesRetiro, setMostrarOpcionesRetiro] = useState(false);

  // Procesar lugares de retiro (compatibilidad string o array)
  let lugaresRetiro = [];
  if (Array.isArray(producto.infoRetiro)) {
    lugaresRetiro = producto.infoRetiro;
  } else if (typeof producto.infoRetiro === 'string' && producto.infoRetiro.trim()) {
    lugaresRetiro = [producto.infoRetiro];
  } else {
    lugaresRetiro = ['Oficina Central'];
  }

  // Mapear cada lugar para ver si tiene link de maps
  const lugaresConInfo = lugaresRetiro.map(lugar => {
    const sedeEncontrada = sedes.find(s => `${s.nombre} (${s.distrito})` === lugar);
    return {
      nombre: lugar,
      maps: sedeEncontrada?.maps || null
    };
  });

  // Compatibilidad de fotos
  let listaFotos = [];
  if (Array.isArray(producto.fotos) && producto.fotos.length > 0) {
    listaFotos = producto.fotos;
  } else if (producto.foto) {
    listaFotos = [producto.foto];
  }

  const incrementar = () => setCantidad(c => c + 1);
  const decrementar = () => setCantidad(c => Math.max(1, c - 1));

  const generarMensajeWhatsApp = () => {
    return `¡Hola Campeones Lima! Deseo adquirir el siguiente producto de la tienda oficial:%0A%0A` +
      `🛍️ *Producto:* ${encodeURIComponent(producto.nombre)}%0A` +
      (producto.sku ? `🏷️ *SKU:* ${encodeURIComponent(producto.sku)}%0A` : '') +
      `💰 *Precio Unitario:* S/. ${producto.precio} soles%0A` +
      `📦 *Cantidad:* ${cantidad}%0A` +
      (tallaElegida ? `📏 *Talla:* ${encodeURIComponent(tallaElegida)}%0A%0A` : `%0A`) +
      `¿Tienen stock disponible para entrega?`;
  };

  const handleCompartir = () => {
    if (navigator.share) {
      navigator.share({
        title: producto.nombre,
        text: `Mira este producto: ${producto.nombre}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      mostrarToast("Enlace copiado al portapapeles", "exito");
    }
  };

  return (
    <div className="animate-fade-in text-white pb-12">
      {/* Botón Volver */}
      <button 
        onClick={onVolver}
        className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer text-sm font-bold"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a la tienda
      </button>

      <div className="grid md:grid-cols-2 gap-10">
        
        {/* Columna Izquierda: Fotos */}
        <div className="space-y-4">
          <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
            {listaFotos.length > 0 ? (
              <img 
                src={listaFotos[fotoActiva]} 
                alt={producto.nombre} 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            ) : (
              <span className="text-slate-400 font-bold">Sin foto</span>
            )}
          </div>
          
          {listaFotos.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {listaFotos.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setFotoActiva(idx)}
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-white ${
                    fotoActiva === idx ? 'border-[#00B4A7] ring-2 ring-[#00B4A7]/30' : 'border-transparent hover:border-slate-300'
                  }`}
                >
                  <img src={url} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Columna Derecha: Detalles */}
        <div className="space-y-6 flex flex-col justify-start pt-4">
          
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black leading-tight text-white">
              {producto.nombre}
            </h1>
            {producto.sku && (
              <p className="text-sm text-slate-400 font-mono">
                {producto.sku}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <div className="text-3xl font-black text-[#F7B52C]">
              S/. {parseFloat(producto.precio).toFixed(2)}
            </div>
            <p className="text-xs text-slate-400">Impuestos incluidos.</p>
          </div>

          {/* Tallas si existen */}
          {producto.tallas && producto.tallas.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 block">Talla</label>
              <div className="flex flex-wrap gap-2">
                {producto.tallas.map(t => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setTallaElegida(t)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors cursor-pointer ${
                      tallaElegida === t
                        ? 'bg-[#00B4A7] text-slate-950 border-[#00B4A7]'
                        : 'bg-[#040914] text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 block">Cantidad</label>
            <div className="flex items-center w-32 bg-[#040914] border border-slate-700 rounded-lg overflow-hidden">
              <button onClick={decrementar} className="px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 font-black cursor-pointer">−</button>
              <div className="flex-1 text-center font-black text-white">{cantidad}</div>
              <button onClick={incrementar} className="px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 font-black cursor-pointer">+</button>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=${generarMensajeWhatsApp()}`}
              target="_blank"
              rel="noreferrer"
              className="block text-center w-full py-4 rounded-xl bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-[#00B4A7]/20 transition-all cursor-pointer"
            >
              Comprar ahora
            </a>
          </div>

          <div className="pt-4">
            {lugaresConInfo.length === 1 ? (
              // Caso 1: Solo una sede
              <div className="flex items-start gap-2 text-sm">
                <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-300">
                    <span className="font-bold text-white">Retiro disponible en </span> 
                    {lugaresConInfo[0].nombre}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">Normalmente está listo en 24 horas</p>
                  {lugaresConInfo[0].maps && (
                    <a 
                      href={lugaresConInfo[0].maps}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-xs underline text-slate-400 hover:text-white mt-1 cursor-pointer"
                    >
                      Ver ubicación en mapa
                    </a>
                  )}
                </div>
              </div>
            ) : (
              // Caso 2: Múltiples sedes, hacerlo desglosable
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#071527]">
                <button
                  type="button"
                  onClick={() => setMostrarOpcionesRetiro(!mostrarOpcionesRetiro)}
                  className="w-full px-4 py-3 flex items-center justify-between text-sm hover:bg-[#0a1e35] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                    <p className="text-slate-300 font-bold">
                      Retiro disponible en <span className="text-white">{lugaresConInfo.length} ubicaciones</span>
                    </p>
                  </div>
                  {mostrarOpcionesRetiro ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                
                {mostrarOpcionesRetiro && (
                  <div className="px-4 pb-3 pt-1 space-y-4 border-t border-slate-800 bg-[#040914]/50">
                    {lugaresConInfo.map((lugar, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                        <div>
                          <p className="text-white font-bold">{lugar.nombre}</p>
                          <p className="text-slate-400 text-xs mt-0.5">Normalmente está listo en 24 horas</p>
                          {lugar.maps && (
                            <a 
                              href={lugar.maps}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block text-xs underline text-slate-400 hover:text-white mt-1 cursor-pointer"
                            >
                              Ver ubicación en mapa
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4">
            <a 
              href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent('Hola, deseo cotizar compras al por mayor del producto: ' + producto.nombre)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block w-full text-center bg-[#F7B52C] hover:bg-[#e6a524] text-slate-950 font-black px-4 py-3 rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              👉 Compras al por mayor aquí 👈
            </a>
          </div>

          {producto.descripcion && (
            <div className="pt-4 border-t border-slate-800 text-sm text-slate-300 leading-relaxed space-y-4">
              <p className="whitespace-pre-wrap">{producto.descripcion}</p>
            </div>
          )}

          <div className="pt-2">
            <button 
              onClick={handleCompartir}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              Comparte este producto
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
