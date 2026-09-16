import { useEffect, useState } from 'react';
import { ShieldCheck, Loader2, Save } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from './auth';
import { MODULOS } from '../domain';
import { guardar } from './operaciones';

const VACIO = { email: '', nombre: '', rol: 'Sub', estado: 'activo', permisos: ['sedes', 'prospectos'] };
export default function AdminUsuarios() {
  const { usuario } = useAuth();
  const [cuentas, setCuentas] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let activo = true;
    supabase.from('admin_usuarios').select('id,user_id,email,nombre,rol,estado,permisos').order('created_at').then(({ data, error }) => {
      if (!activo) return;
      if (error) setError(error.message); else setCuentas(data || []);
      setCargando(false);
    });
    return () => { activo = false; };
  }, []);
  async function guardarCuenta(e) {
    e.preventDefault();
    setGuardando(true);
    try {
      if (!await guardar(supabase.rpc('ccl_guardar_admin', { correo: form.email.trim(), nombre_admin: form.nombre.trim(), rol_admin: form.rol, permisos_admin: form.permisos, estado_admin: form.estado }))) return;
      const { data, error } = await supabase.from('admin_usuarios').select('id,user_id,email,nombre,rol,estado,permisos').order('created_at');
      if (error) { setError('Acceso guardado, pero no se pudo actualizar la lista. Recarga el panel.'); return; }
      setCuentas(data || []); setForm(VACIO); setError('');
      alert('Acceso administrativo guardado.');
    } finally { setGuardando(false); }
  }
  if (cargando) return <Loader2 className="animate-spin" aria-label="Cargando accesos" />;
  return <div className="max-w-5xl space-y-6">
    <h2 className="text-2xl font-black flex gap-2"><ShieldCheck /> Roles y cuentas secundarias</h2>
    <p className="text-sm text-slate-300">Autoriza una cuenta existente y confirmada de Authentication. Las cuentas nuevas se crean o invitan desde Supabase → Authentication → Users; aquí se asignan sus permisos.</p>
    {error && <p role="alert" className="text-red-300">{error}</p>}
    <form onSubmit={guardarCuenta} className="bg-[#071527] border border-slate-800 p-6 rounded-2xl space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="text-sm">Nombre<input required value={form.nombre} onChange={e => setForm({...form,nombre:e.target.value})} className="block w-full bg-[#040914] p-3 rounded-xl" /></label>
        <label className="text-sm">Correo<input required type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} className="block w-full bg-[#040914] p-3 rounded-xl" /></label>
        <label className="text-sm">Rol<select value={form.rol} onChange={e => setForm({...form,rol:e.target.value})} className="block w-full bg-[#040914] p-3 rounded-xl"><option>Sub</option><option>Principal</option></select></label>
        <label className="text-sm">Estado<select value={form.estado} onChange={e => setForm({...form,estado:e.target.value})} className="block w-full bg-[#040914] p-3 rounded-xl"><option value="activo">Activo</option><option value="inactivo">Acceso suspendido</option></select></label>
      </div>
      {form.rol === 'Sub' && <fieldset className="grid grid-cols-2 sm:grid-cols-3 gap-3"><legend className="mb-2">Módulos permitidos</legend>{MODULOS.map(m => <label key={m} className="flex gap-2 text-sm"><input type="checkbox" checked={form.permisos.includes(m)} onChange={e => setForm({...form,permisos:e.target.checked ? [...form.permisos,m] : form.permisos.filter(x=>x!==m)})} />{m}</label>)}</fieldset>}
      <button disabled={guardando} className="bg-[#00B4A7] text-slate-950 px-5 py-3 rounded-xl font-bold flex gap-2"><Save className="w-5" />{guardando ? 'Guardando...' : 'Guardar acceso'}</button>
    </form>
    <div className="grid sm:grid-cols-2 gap-4">{cuentas.map(c => <div key={c.id} className="bg-[#071527] border border-slate-800 p-4 rounded-xl space-y-2"><strong>{c.nombre}</strong><p className="text-sm break-all">{c.email}</p><p className="text-sm text-slate-400">{c.rol} · {c.estado}{!c.user_id ? ' · Pendiente de vincular' : ''}</p><button className="text-[#00B4A7]" onClick={() => setForm({email:c.email,nombre:c.nombre,rol:c.rol==='Principal'?'Principal':'Sub',estado:c.estado==='activo'?'activo':'inactivo',permisos:c.permisos||[]})}>{c.user_id===usuario.user_id ? 'Editar mi perfil' : 'Editar permisos / suspender'}</button></div>)}</div>
  </div>;
}
