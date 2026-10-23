import { useEffect, useState } from 'react';
import { ShieldCheck, Loader2, Save, KeyRound, Lock, Eye, EyeOff, X, CheckCircle } from 'lucide-react';
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

  // Estados para el modal de cambio de contraseña
  const [modalPass, setModalPass] = useState(null); // { email, nombre }
  const [nuevaClave, setNuevaClave] = useState('');
  const [confirmarClave, setConfirmarClave] = useState('');
  const [mostrarClave, setMostrarClave] = useState(false);
  const [cambiandoClave, setCambiandoClave] = useState(false);
  const [errorClave, setErrorClave] = useState('');
  const [exitoClave, setExitoClave] = useState('');

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

  async function handleCambiarPassword(e) {
    e.preventDefault();
    setErrorClave('');
    setExitoClave('');

    if (nuevaClave.length < 6) {
      return setErrorClave('La contraseña debe tener al menos 6 caracteres.');
    }
    if (nuevaClave !== confirmarClave) {
      return setErrorClave('Las contraseñas no coinciden. Verifica que estén escritas igual.');
    }

    setCambiandoClave(true);
    try {
      const { data, error: rpcError } = await supabase.rpc('ccl_cambiar_password_admin', {
        correo_objetivo: modalPass.email.trim(),
        nueva_password: nuevaClave.trim()
      });

      if (rpcError) {
        throw new Error(rpcError.message || 'Error al actualizar la contraseña en Supabase.');
      }

      setExitoClave(data?.mensaje || `¡Contraseña actualizada con éxito para ${modalPass.email}!`);
      setNuevaClave('');
      setConfirmarClave('');
      setTimeout(() => {
        setModalPass(null);
        setExitoClave('');
      }, 2000);
    } catch (err) {
      setErrorClave(err.message || 'No se pudo cambiar la contraseña. Asegúrate de haber ejecutado el script SQL en Supabase.');
    } finally {
      setCambiandoClave(false);
    }
  }

  if (cargando) return <Loader2 className="animate-spin" aria-label="Cargando accesos" />;

  return (
    <div className="max-w-5xl space-y-6">
      <h2 className="text-2xl font-black flex gap-2"><ShieldCheck className="text-[#00B4A7]" /> Roles y cuentas de administradores</h2>
      <p className="text-sm text-slate-300">
        Gestiona las cuentas de acceso al panel y restablece contraseñas directamente como Administrador Principal.
      </p>

      {error && <p role="alert" className="text-red-300 bg-red-950/40 border border-red-500/40 p-3 rounded-xl text-sm">{error}</p>}

      {/* FORMULARIO DE CREAR / EDITAR PERMISOS */}
      <form onSubmit={guardarCuenta} className="bg-[#071527] border border-slate-800 p-6 rounded-2xl space-y-4">
        <h3 className="font-bold text-white text-base">Asignar o Modificar Permisos de Cuenta</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-sm font-bold text-slate-300">Nombre<input required value={form.nombre} onChange={e => setForm({...form,nombre:e.target.value})} className="block w-full bg-[#040914] border border-slate-800 focus:border-[#00B4A7] text-white p-3 rounded-xl mt-1 font-normal focus:outline-none" /></label>
          <label className="text-sm font-bold text-slate-300">Correo<input required type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} className="block w-full bg-[#040914] border border-slate-800 focus:border-[#00B4A7] text-white p-3 rounded-xl mt-1 font-normal focus:outline-none" /></label>
          <label className="text-sm font-bold text-slate-300">Rol<select value={form.rol} onChange={e => setForm({...form,rol:e.target.value})} className="block w-full bg-[#040914] border border-slate-800 focus:border-[#00B4A7] text-white p-3 rounded-xl mt-1 font-normal focus:outline-none"><option>Sub</option><option>Principal</option></select></label>
          <label className="text-sm font-bold text-slate-300">Estado<select value={form.estado} onChange={e => setForm({...form,estado:e.target.value})} className="block w-full bg-[#040914] border border-slate-800 focus:border-[#00B4A7] text-white p-3 rounded-xl mt-1 font-normal focus:outline-none"><option value="activo">Activo</option><option value="inactivo">Acceso suspendido</option></select></label>
        </div>
        {form.rol === 'Sub' && (
          <fieldset className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <legend className="mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Módulos permitidos</legend>
            {MODULOS.map(m => (
              <label key={m} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input type="checkbox" checked={form.permisos.includes(m)} onChange={e => setForm({...form,permisos:e.target.checked ? [...form.permisos,m] : form.permisos.filter(x=>x!==m)})} className="rounded accent-[#00B4A7]" />
                <span className="capitalize">{m}</span>
              </label>
            ))}
          </fieldset>
        )}
        <button disabled={guardando} className="bg-[#00B4A7] hover:bg-[#00c9ba] text-slate-950 px-5 py-3 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50 text-sm">
          <Save className="w-4 h-4" />
          <span>{guardando ? 'Guardando...' : 'Guardar acceso'}</span>
        </button>
      </form>

      {/* LISTA DE CUENTAS */}
      <div className="space-y-3">
        <h3 className="font-bold text-white text-base">Cuentas Registradas ({cuentas.length})</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {cuentas.map(c => (
            <div key={c.id} className="bg-[#071527] border border-slate-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between shadow-lg">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-white text-base">{c.nombre}</strong>
                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                    c.rol === 'Principal' ? 'bg-[#F7B52C]/20 text-[#F7B52C] border border-[#F7B52C]/30' : 'bg-cyan-900/30 text-cyan-300 border border-cyan-700/30'
                  }`}>
                    {c.rol}
                  </span>
                </div>
                <p className="text-xs text-slate-400 break-all font-mono">{c.email}</p>
                <p className="text-xs text-slate-500">
                  Estado: <span className={c.estado === 'activo' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{c.estado}</span>
                  {!c.user_id && <span className="text-amber-400 ml-1">· Pendiente de vincular</span>}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  className="text-xs font-bold text-[#00B4A7] hover:underline cursor-pointer"
                  onClick={() => setForm({email:c.email,nombre:c.nombre,rol:c.rol==='Principal'?'Principal':'Sub',estado:c.estado==='activo'?'activo':'inactivo',permisos:c.permisos||[]})}
                >
                  {c.user_id === usuario?.user_id ? 'Editar mi perfil' : 'Editar permisos'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setModalPass({ email: c.email, nombre: c.nombre });
                    setErrorClave('');
                    setExitoClave('');
                    setNuevaClave('');
                    setConfirmarClave('');
                    setMostrarClave(false);
                  }}
                  className="text-xs font-bold text-[#F7B52C] hover:text-[#ffc247] flex items-center gap-1.5 ml-auto px-2.5 py-1.5 rounded-lg bg-[#F7B52C]/10 border border-[#F7B52C]/20 cursor-pointer transition-colors"
                  title="Cambiar la contraseña de esta cuenta"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Cambiar contraseña</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL CAMBIAR CONTRASEÑA */}
      {modalPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#071527] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 relative">
            
            {/* CABECERA MODAL */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#F7B52C]/20 border border-[#F7B52C]/30 flex items-center justify-center text-[#F7B52C]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Cambiar Contraseña</h3>
                  <p className="text-xs text-slate-400">Acceso del Administrador Principal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalPass(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* INFO CUENTA */}
            <div className="p-3 bg-[#040914] rounded-xl border border-slate-800/80 space-y-0.5 text-xs">
              <p className="text-slate-400">Modificando contraseña de:</p>
              <p className="text-white font-bold">{modalPass.nombre}</p>
              <p className="text-[#00B4A7] font-mono">{modalPass.email}</p>
            </div>

            {/* MENSAJES */}
            {errorClave && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 font-medium">
                {errorClave}
              </div>
            )}
            {exitoClave && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{exitoClave}</span>
              </div>
            )}

            {/* FORMULARIO */}
            <form onSubmit={handleCambiarPassword} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-bold">Nueva Contraseña:</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={mostrarClave ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="Mínimo 6 caracteres"
                    value={nuevaClave}
                    onChange={e => setNuevaClave(e.target.value)}
                    className="w-full bg-[#040914] border border-slate-800 focus:border-[#00B4A7] text-white pl-9 pr-9 py-2.5 rounded-xl font-medium focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarClave(!mostrarClave)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {mostrarClave ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-300 font-bold">Confirmar Nueva Contraseña:</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={mostrarClave ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="Repite la nueva contraseña"
                    value={confirmarClave}
                    onChange={e => setConfirmarClave(e.target.value)}
                    className="w-full bg-[#040914] border border-slate-800 focus:border-[#00B4A7] text-white pl-9 pr-3.5 py-2.5 rounded-xl font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalPass(null)}
                  className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cambiandoClave}
                  className="flex-1 py-2.5 px-3 bg-[#F7B52C] hover:bg-[#ffc247] text-slate-950 font-black rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-[#F7B52C]/20 cursor-pointer transition-all disabled:opacity-50"
                >
                  {cambiandoClave ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar Contraseña</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

