import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { AuthContext } from './auth';

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorAcceso, setErrorAcceso] = useState('');
  useEffect(() => {
    let activo = true;
    let version = 0;
    let usuarioId = null;
    try { localStorage.removeItem('campeones_admin_auth'); } catch { /* Almacenamiento restringido. */ }
    async function cargarPerfil(session) {
      const actual = ++version;
      const cambiaUsuario = usuarioId !== (session?.user?.id ?? null);
      if (cambiaUsuario || !session?.user) {
        setUsuario(null);
        setCargando(Boolean(session?.user));
      }
      usuarioId = session?.user?.id ?? null;
      setErrorAcceso('');
      try {
        if (!session?.user) return;
        const { data, error } = await supabase.from('admin_usuarios')
          .select('id,user_id,email,nombre,rol,estado,permisos')
          .eq('user_id', session.user.id).eq('estado', 'activo').maybeSingle();
        if (error) throw error;
        if (!data) throw new Error('Tu cuenta no tiene acceso administrativo activo. Contacta al administrador principal.');
        if (activo && actual === version) setUsuario(data);
      } catch (error) {
        if (activo && actual === version) {
          setUsuario(null);
          setErrorAcceso(error.message);
        }
      } finally {
        if (activo && actual === version) setCargando(false);
      }
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      queueMicrotask(() => { if (activo) void cargarPerfil(session); });
    });
    return () => { activo = false; version++; subscription.unsubscribe(); };
  }, []);
  async function login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }
  async function logout() {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) { setErrorAcceso('No se pudo cerrar la sesión. Intenta nuevamente.'); return; }
    setUsuario(null);
  }
  return <AuthContext.Provider value={{ usuario, cargando, login, logout, errorAcceso }}>{children}</AuthContext.Provider>;
}
