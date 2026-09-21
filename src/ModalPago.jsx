import React, { useState } from 'react';
import { X, Copy, Check, QrCode, CreditCard, MapPin, MessageCircle } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { normalizarPagos, whatsappNumero } from './domain';
import ModalFrame from './ModalFrame';
import { useToast } from './toast';

export default function ModalPago({ abierto, alCerrar, datosPago, nombreSede, telefonoContacto }) {
  const { esOscuro } = useTheme();
  const [copiado, setCopiado] = useState(null);
  const { mostrarToast } = useToast();

  if (!abierto) return null;

  const datos = normalizarPagos(datosPago);
  const hayMetodos = Boolean(datos.yape_numero || datos.plin_numero || datos.bcp_cuenta || datos.bbva_cuenta);
  const copiarTexto = async (texto, clave) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(clave);
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      mostrarToast('No se pudo copiar. Selecciona y copia el dato manualmente.', 'error');
    }
  };
  const numeroLimpio = whatsappNumero(telefonoContacto, '');
  const mensajeVoucher = encodeURIComponent(`¡Hola Campeones Lima! Acabo de realizar el pago para la sede: ${nombreSede || 'Sede Oficial'}.\n\nAdjunto la captura de mi comprobante para confirmar mi vacante.`);

  return (
    <ModalFrame
      onClose={alCerrar}
      label="Cuentas y Métodos de Pago"
      className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
    >
      <div className={`border rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative my-8 ${
        esOscuro ? 'bg-[#071527] border-[#0D2E4E] text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Cabecera */}
        <div className="flex justify-between items-center border-b pb-4 border-slate-800">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#00B4A7] bg-[#00B4A7]/10 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max">
              <MapPin className="w-3 h-3" /> {nombreSede || "Sede Oficial"}
            </span>
            <h3 className="text-xl font-black mt-1 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#F7B52C]" /> Cuentas & Métodos de Pago
            </h3>
          </div>
          <button 
            type="button"
            onClick={alCerrar} 
            className="p-1.5 rounded-xl hover:bg-slate-800/40 text-slate-400 hover:text-white cursor-pointer"
            aria-label="Cerrar ventana de pago"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!hayMetodos && <p role="status" className="text-sm">Esta sede aún no tiene métodos de pago publicados. Consulta con la sede antes de realizar un abono.</p>}
        {/* YAPE Y PLIN */}
        {['yape', 'plin'].filter(metodo => datos[`${metodo}_numero`]).map(metodo => (
          <div key={metodo} className={`p-4 rounded-2xl border space-y-2.5 ${
            esOscuro ? 'bg-[#040914] border-purple-500/30' : 'bg-purple-50/60 border-purple-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="w-4 h-4" /> {metodo === 'yape' ? 'Yape' : 'Plin'}
              </span>
              {datos[`${metodo}_titular`] && (
                <span className="text-[10px] font-bold text-slate-400">Titular: {datos[`${metodo}_titular`]}</span>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 bg-[#071527] p-2.5 rounded-xl border border-slate-800">
              <div>
                <p className="text-[10px] text-slate-400">Número celular:</p>
                <p className="text-sm font-black text-white font-mono">{datos[`${metodo}_numero`]}</p>
              </div>
              <button
                type="button"
                onClick={() => copiarTexto(datos[`${metodo}_numero`].replace(/\s+/g, ''), metodo)}
                className="bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                {copiado === metodo ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiado === metodo ? "Copiado" : "Copiar"}</span>
              </button>
            </div>
          </div>
        ))}

        {/* TRANSFERENCIAS BANCARIAS */}
        <div className="space-y-2.5">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Cuentas Corrientes Bancarias:</p>

          {/* BCP */}
          {datos.bcp_cuenta && (
            <div className={`p-3.5 rounded-2xl border space-y-1.5 ${
              esOscuro ? 'bg-[#040914] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between items-center text-xs">
                <strong className="text-[#F7B52C] font-black">BCP (Banco de Crédito del Perú)</strong>
                <span className="text-[10px] text-slate-400">Soles</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className={esOscuro ? "text-slate-300" : "text-slate-700"}>N°: {datos.bcp_cuenta}</span>
                <button 
                  type="button"
                  onClick={() => copiarTexto(datos.bcp_cuenta, "bcp")}
                  className="text-[#00B4A7] hover:underline font-bold text-[11px] cursor-pointer"
                >
                  {copiado === "bcp" ? "✓ Copiado" : "Copiar"}
                </button>
              </div>
              {datos.bcp_cci && (
                <div className="flex justify-between items-center text-[11px] font-mono border-t pt-1 border-slate-800">
                  <span className="text-slate-400">CCI: {datos.bcp_cci}</span>
                  <button 
                    type="button"
                    onClick={() => copiarTexto(datos.bcp_cci, "bcp_cci")}
                    className="text-[#00B4A7] hover:underline font-bold text-[11px] cursor-pointer"
                  >
                    {copiado === "bcp_cci" ? "✓ Copiado" : "Copiar"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* BBVA */}
          {datos.bbva_cuenta && (
            <div className={`p-3.5 rounded-2xl border space-y-1.5 ${
              esOscuro ? 'bg-[#040914] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between items-center text-xs">
                <strong className="text-cyan-400 font-black">BBVA Perú</strong>
                <span className="text-[10px] text-slate-400">Soles</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className={esOscuro ? "text-slate-300" : "text-slate-700"}>N°: {datos.bbva_cuenta}</span>
                <button 
                  type="button"
                  onClick={() => copiarTexto(datos.bbva_cuenta, "bbva")}
                  className="text-[#00B4A7] hover:underline font-bold text-[11px] cursor-pointer"
                >
                  {copiado === "bbva" ? "✓ Copiado" : "Copiar"}
                </button>
              </div>
              {datos.bbva_cci && (
                <div className="flex justify-between items-center text-[11px] font-mono border-t pt-1 border-slate-800">
                  <span className="text-slate-400">CCI: {datos.bbva_cci}</span>
                  <button 
                    type="button"
                    onClick={() => copiarTexto(datos.bbva_cci, "bbva_cci")}
                    className="text-[#00B4A7] hover:underline font-bold text-[11px] cursor-pointer"
                  >
                    {copiado === "bbva_cci" ? "✓ Copiado" : "Copiar"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* BOTÓN DIRECTO: ENVIAR VOUCHER POR WHATSAPP */}
        {numeroLimpio && <div className="pt-2 border-t border-slate-800/80 space-y-2 text-center">
          <a
            href={`https://wa.me/${numeroLimpio}?text=${mensajeVoucher}`}
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-black py-3 rounded-xl text-xs sm:text-sm shadow-lg shadow-green-500/25 transition-all transform active:scale-98 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white stroke-none" />
            <span>Ya realicé mi pago: Enviar Voucher por WhatsApp</span>
          </a>
          <p className="text-[10px] text-slate-400">
            {datos.indicaciones || "Envía la captura de tu comprobante para confirmar tu vacante."}
          </p>
        </div>}

      </div>
    </ModalFrame>
  );
}