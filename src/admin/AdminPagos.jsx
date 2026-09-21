import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  Save, 
  Loader2, 
  Smartphone, 
  Building2, 
  Check, 
  RotateCcw
} from 'lucide-react';
import { supabase } from '../supabase';
import { useToast } from '../toast';

export default function AdminPagos() {
  const { mostrarToast } = useToast();
  const [sedes, setSedes] = useState([]);
  const [datosPagos, setDatosPagos] = useState({});
  const [errorCarga, setErrorCarga] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [sedeAbiertaId, setSedeAbiertaId] = useState(null);

  useEffect(() => {
  async function cargarDatosDesdeSupabase() {
    try {
      const [resSedes, resPagos] = await Promise.all([
        supabase.from('sedes').select('id, nombre, distrito, direccion').order('nombre', { ascending: true }),
        supabase.from('configuracion_web').select('valor').eq('clave', 'metodos_pago_sedes').maybeSingle()
      ]);
      for (const respuesta of [resSedes, resPagos]) { if (respuesta.error) throw respuesta.error; }

      if (resSedes.data) {
        setSedes(resSedes.data);
      }

      if (resPagos.data?.valor && typeof resPagos.data.valor === 'object') {
        setDatosPagos(resPagos.data.valor);
      }
    } catch (err) {
      console.error("Error al cargar pagos desde Supabase:", err);
      setErrorCarga('No se pudo cargar la información. Recarga para reintentar.');
    } finally {
      setCargando(false);
    }
  }
    cargarDatosDesdeSupabase();
  }, []);



  // Toggle para abrir o retraer el acordeón de una sede
  const toggleSede = (id) => {
    setSedeAbiertaId(prev => (prev === id ? null : id));
  };

  // Manejar cambios en los campos de una sede
  const handleCambioCampo = (nombreSede, seccion, campo, valor) => {
    setDatosPagos(prev => {
      const sedeData = prev[nombreSede] || {
        yape: { numero: '', titular: '' },
        plin: { numero: '', titular: '' },
        banco_bcp: { numero_cuenta: '', cci: '', titular: '' },
        banco_bbva: { numero_cuenta: '', cci: '', titular: '' }
      };

      return {
        ...prev,
        [nombreSede]: {
          ...sedeData,
          [seccion]: {
            ...(sedeData[seccion] || {}),
            [campo]: valor
          }
        }
      };
    });
  };

  // Guardar todos los cambios en Supabase
  const handleGuardarPagos = async () => {
    setGuardando(true);
    try {
      const { error } = await supabase
        .from('configuracion_web')
        .upsert({
          clave: 'metodos_pago_sedes',
          valor: datosPagos
        });

      if (error) throw error;
      mostrarToast('Métodos de pago guardados exitosamente en Supabase.', 'exito');
    } catch (err) {
      console.error(err);
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
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cargando cuentas desde Supabase...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-300">
      
      {/* CABECERA */}
      <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-[#00B4A7]" /> Métodos de Pago por Sede
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Haz clic sobre cualquier sede para desplegar o retraer sus cuentas bancarias y números de Yape.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGuardarPagos}
          disabled={guardando}
          className="px-6 py-2.5 rounded-xl bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#00B4A7]/25 cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Guardar Cambios</span>
        </button>
      </div>

      {/* LISTADO DE SEDES TIPO ACORDEÓN */}
      <div className="space-y-3">
        {sedes.map((sede) => {
          const abierta = sedeAbiertaId === sede.id;
          const datos = datosPagos[sede.nombre] || {};
          const numeroYape = datos.yape?.numero || 'Sin asignar';

          return (
            <div 
              key={sede.id}
              className="bg-[#071527] border border-slate-800 rounded-2xl overflow-hidden transition-all shadow-md"
            >
              {/* FILA DE CABECERA DE LA SEDE */}
              <div 
                onClick={() => toggleSede(sede.id)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors select-none"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#040914] border border-slate-800 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#00B4A7]" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-[#040914] text-slate-300 border border-slate-800">
                        SEDE · {sede.distrito || 'LIMA'}
                      </span>

                      <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-purple-950/40 text-purple-300 border border-purple-800/50 flex items-center gap-1">
                        <Smartphone className="w-3 h-3 text-purple-400" />
                        <span>Yape: {numeroYape}</span>
                      </span>
                    </div>

                    <h3 className="font-black text-white text-base leading-tight">
                      {sede.nombre}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    type="button" 
                    className="p-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    {abierta ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* CUERPO DESPLEGABLE: EDICIÓN DE CUENTAS */}
              {abierta && (
                <div className="p-5 border-t border-slate-800/80 bg-[#040914]/80 space-y-5 text-xs animate-in fade-in duration-200">
                  
                  {/* SECCIÓN BILLETERAS DIGITALES (YAPE / PLIN) */}
                  <div className="space-y-3">
                    <h4 className="font-black text-white text-xs flex items-center gap-2 text-purple-400 uppercase tracking-wider">
                      <Smartphone className="w-4 h-4" /> Billeteras Digitales (Yape & Plin)
                    </h4>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* YAPE */}
                      <div className="p-3.5 rounded-xl bg-[#071527] border border-slate-800 space-y-2.5">
                        <span className="font-bold text-white block">📱 Número Yape:</span>
                        <input
                          type="text"
                          placeholder="Ej: 941614559"
                          value={datos.yape?.numero || ''}
                          onChange={(e) => handleCambioCampo(sede.nombre, 'yape', 'numero', e.target.value)}
                          className="w-full bg-[#040914] border border-slate-800 p-2 rounded-lg text-white font-mono font-bold"
                        />
                        <input
                          type="text"
                          placeholder="Titular de la cuenta Yape"
                          value={datos.yape?.titular || ''}
                          onChange={(e) => handleCambioCampo(sede.nombre, 'yape', 'titular', e.target.value)}
                          className="w-full bg-[#040914] border border-slate-800 p-2 rounded-lg text-slate-300"
                        />
                      </div>

                      {/* PLIN */}
                      <div className="p-3.5 rounded-xl bg-[#071527] border border-slate-800 space-y-2.5">
                        <span className="font-bold text-white block">💳 Número Plin:</span>
                        <input
                          type="text"
                          placeholder="Ej: 941614559"
                          value={datos.plin?.numero || ''}
                          onChange={(e) => handleCambioCampo(sede.nombre, 'plin', 'numero', e.target.value)}
                          className="w-full bg-[#040914] border border-slate-800 p-2 rounded-lg text-white font-mono font-bold"
                        />
                        <input
                          type="text"
                          placeholder="Titular de la cuenta Plin"
                          value={datos.plin?.titular || ''}
                          onChange={(e) => handleCambioCampo(sede.nombre, 'plin', 'titular', e.target.value)}
                          className="w-full bg-[#040914] border border-slate-800 p-2 rounded-lg text-slate-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN CUENTAS BANCARIAS */}
                  <div className="space-y-3 pt-3 border-t border-slate-800/80">
                    <h4 className="font-black text-white text-xs flex items-center gap-2 text-[#F7B52C] uppercase tracking-wider">
                      <Building2 className="w-4 h-4" /> Cuentas Bancarias y Transferencias
                    </h4>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* BCP */}
                      <div className="p-3.5 rounded-xl bg-[#071527] border border-slate-800 space-y-2">
                        <span className="font-bold text-[#F7B52C] block">Banco de Crédito (BCP):</span>
                        <input
                          type="text"
                          placeholder="Número de Cuenta (ej. 191-XXXXXXXX-0-XX)"
                          value={datos.banco_bcp?.numero_cuenta || ''}
                          onChange={(e) => handleCambioCampo(sede.nombre, 'banco_bcp', 'numero_cuenta', e.target.value)}
                          className="w-full bg-[#040914] border border-slate-800 p-2 rounded-lg text-white font-mono"
                        />
                        <input
                          type="text"
                          placeholder="Código Interbancario CCI (20 dígitos)"
                          value={datos.banco_bcp?.cci || ''}
                          onChange={(e) => handleCambioCampo(sede.nombre, 'banco_bcp', 'cci', e.target.value)}
                          className="w-full bg-[#040914] border border-slate-800 p-2 rounded-lg text-white font-mono text-[11px]"
                        />
                        <input
                          type="text"
                          placeholder="Titular de la Cuenta"
                          value={datos.banco_bcp?.titular || ''}
                          onChange={(e) => handleCambioCampo(sede.nombre, 'banco_bcp', 'titular', e.target.value)}
                          className="w-full bg-[#040914] border border-slate-800 p-2 rounded-lg text-slate-300 text-[11px]"
                        />
                      </div>

                      {/* BBVA */}
                      <div className="p-3.5 rounded-xl bg-[#071527] border border-slate-800 space-y-2">
                        <span className="font-bold text-blue-400 block">Banco BBVA:</span>
                        <input
                          type="text"
                          placeholder="Número de Cuenta BBVA"
                          value={datos.banco_bbva?.numero_cuenta || ''}
                          onChange={(e) => handleCambioCampo(sede.nombre, 'banco_bbva', 'numero_cuenta', e.target.value)}
                          className="w-full bg-[#040914] border border-slate-800 p-2 rounded-lg text-white font-mono"
                        />
                        <input
                          type="text"
                          placeholder="Código Interbancario CCI (20 dígitos)"
                          value={datos.banco_bbva?.cci || ''}
                          onChange={(e) => handleCambioCampo(sede.nombre, 'banco_bbva', 'cci', e.target.value)}
                          className="w-full bg-[#040914] border border-slate-800 p-2 rounded-lg text-white font-mono text-[11px]"
                        />
                        <input
                          type="text"
                          placeholder="Titular de la Cuenta"
                          value={datos.banco_bbva?.titular || ''}
                          onChange={(e) => handleCambioCampo(sede.nombre, 'banco_bbva', 'titular', e.target.value)}
                          className="w-full bg-[#040914] border border-slate-800 p-2 rounded-lg text-slate-300 text-[11px]"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}