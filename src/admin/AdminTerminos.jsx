import React, { useState, useEffect } from 'react';
import { FileText, Save, Loader2, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabase';

export default function AdminTerminos() {
  const [terminos, setTerminos] = useState({
    titulo: 'Términos, Condiciones & Reglamento Oficial',
    actualizado: 'Septiembre 2026',
    puntos: []
  });
  const [nuevoPunto, setNuevoPunto] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargar() {
      try {
        const { data } = await supabase.from('configuracion_web').select('valor').eq('clave', 'terminos_condiciones').maybeSingle();
        if (data?.valor) {
          setTerminos(data.valor);
        }
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  const handleAgregarPunto = (e) => {
    e.preventDefault();
    if (!nuevoPunto.trim()) return;
    setTerminos(prev => ({
      ...prev,
      puntos: [...(prev.puntos || []), nuevoPunto.trim()]
    }));
    setNuevoPunto('');
  };

  const handleEliminarPunto = (idx) => {
    setTerminos(prev => ({
      ...prev,
      puntos: prev.puntos.filter((_, i) => i !== idx)
    }));
  };

  const handleGuardarEnSupabase = async () => {
    setGuardando(true);
    try {
      const { error } = await supabase.from('configuracion_web').upsert({
        clave: 'terminos_condiciones',
        valor: terminos
      });
      if (error) throw error;
      alert("✓ Reglamento y términos actualizados exitosamente en Supabase.");
    } catch (err) {
      alert("No se pudieron guardar los términos: " + (err.message || 'Error en el servidor.'));
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="p-12 text-center space-y-3">
        <Loader2 className="w-10 h-10 text-[#00B4A7] animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-bold uppercase">Cargando Reglamento...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-[#F7B52C]" /> Términos, Condiciones & Reglamento
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Modifica las reglas oficiales del club que se muestran a los apoderados en las sedes y cotizador.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGuardarEnSupabase}
          disabled={guardando}
          className="px-6 py-2.5 rounded-xl bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"
        >
          {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Guardar Cambios</span>
        </button>
      </div>

      <div className="bg-[#071527] border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-5 shadow-xl text-xs">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Título del Reglamento:</label>
            <input
              type="text"
              value={terminos.titulo || ''}
              onChange={e => setTerminos({ ...terminos, titulo: e.target.value })}
              className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Fecha de Vigencia / Edición:</label>
            <input
              type="text"
              value={terminos.actualizado || ''}
              onChange={e => setTerminos({ ...terminos, actualizado: e.target.value })}
              className="w-full bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white font-mono"
            />
          </div>
        </div>

        <form onSubmit={handleAgregarPunto} className="flex gap-2">
          <input
            type="text"
            placeholder="Escribe una nueva regla o condición oficial..."
            value={nuevoPunto}
            onChange={e => setNuevoPunto(e.target.value)}
            className="flex-1 bg-[#040914] border border-slate-800 p-2.5 rounded-xl text-white"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#F7B52C] hover:bg-[#e6a524] text-slate-950 font-black rounded-xl cursor-pointer shrink-0 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar</span>
          </button>
        </form>

        <div className="space-y-2 pt-2">
          {(terminos.puntos || []).map((punto, idx) => (
            <div key={idx} className="p-3 bg-[#040914] rounded-xl border border-slate-800 flex justify-between items-center gap-3">
              <span className="text-slate-300 font-medium leading-relaxed">
                <strong className="text-[#00B4A7] font-mono mr-2">{idx + 1}.</strong>
                {punto}
              </span>
              <button
                type="button"
                onClick={() => handleEliminarPunto(idx)}
                className="p-1.5 text-red-400 hover:text-red-300 cursor-pointer shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}