import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, Users } from 'lucide-react';
import { supabase } from '../supabase';

export default function Postulaciones() {
  const [postulaciones, setPostulaciones] = useState([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [documento, setDocumento] = useState(null);
  const [abriendo, setAbriendo] = useState(null);
  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const { data, error } = await supabase.from('postulaciones')
          .select('id,nombre,puesto,telefono,email,experiencia,cv_url,estado,created_at')
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (activo) setPostulaciones(data || []);
      } catch (error) {
        if (activo) setError('No se pudieron cargar las postulaciones. ' + error.message);
      } finally {
        if (activo) setCargando(false);
      }
    }
    cargar();
    return () => { activo = false; };
  }, []);

  const handleExportarExcel = () => {
    if (!postulaciones || postulaciones.length === 0) return;
    const datos = postulaciones.map((p, idx) => ({
      "N°": idx + 1,
      "Fecha": p.created_at ? new Date(p.created_at).toLocaleDateString('es-PE') : '',
      "Postulante": p.nombre || '',
      "Puesto": p.puesto || '',
      "Teléfono / WhatsApp": p.telefono || '',
      "Correo": p.email || '',
      "Estado": p.estado || 'Recibido',
      "Experiencia": p.experiencia || ''
    }));

    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Postulaciones");
    XLSX.writeFile(libro, `CampeonesLima_Postulaciones_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  async function prepararCv(postulacion) {
    setAbriendo(postulacion.id);
    setDocumento(null);
    setError('');
    try {
      if (!/^cv\/[-a-zA-Z0-9.]+$/.test(postulacion.cv_url)) {
        throw new Error('Este CV usa una ubicación antigua. Debe migrarse al bucket privado antes de abrirlo desde aquí.');
      }
      const { data, error } = await supabase.storage.from('postulaciones_cv')
        .createSignedUrl(postulacion.cv_url, 60);
      if (error) throw error;
      setDocumento({ id: postulacion.id, url: data.signedUrl });
    } catch (error) {
      setError(error.message);
    } finally {
      setAbriendo(null);
    }
  }

  return <section className="space-y-4 border-t border-slate-800 pt-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <h2 className="text-xl font-black text-white flex items-center gap-2">
        <Users className="w-5 h-5 text-[#00B4A7]" />
        Postulaciones recibidas ({postulaciones.length})
      </h2>
      {postulaciones.length > 0 && (
        <button
          type="button"
          onClick={handleExportarExcel}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow transition-all self-start sm:self-auto"
          title="Descargar lista de postulantes en Excel"
        >
          <Download className="w-4 h-4" />
          <span>Exportar a Excel</span>
        </button>
      )}
    </div>
    {error && <p role="alert" className="text-red-300 text-sm">{error}</p>}
    {cargando ? <p role="status">Cargando postulaciones…</p> : postulaciones.length === 0 && !error ? <p>No hay postulaciones recibidas.</p> : null}
    {postulaciones.map(p => <article key={p.id} className="rounded-2xl border border-slate-800 bg-[#071527] p-4 space-y-2 text-sm">
      <h3 className="font-bold text-white">{p.nombre} · {p.puesto}</h3>
      <p className="text-slate-300 break-words">{p.telefono} · {p.email} · {p.estado}</p>
      {p.experiencia && <p className="whitespace-pre-wrap text-slate-300">{p.experiencia}</p>}
      {p.cv_url && <button type="button" disabled={abriendo !== null} onClick={() => prepararCv(p)} className="text-[#00B4A7] font-bold disabled:opacity-50">
        {abriendo === p.id ? 'Preparando CV…' : 'Preparar acceso al CV'}
      </button>}
      {documento?.id === p.id && <p><a href={documento.url} target="_blank" rel="noreferrer" className="text-[#F7B52C] underline">Abrir CV (enlace válido durante 60 segundos)</a></p>}
    </article>)}
  </section>;
}
