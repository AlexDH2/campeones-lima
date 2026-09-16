import { useEffect, useState } from 'react';
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
    <h2 className="text-xl font-black text-white">Postulaciones recibidas</h2>
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
