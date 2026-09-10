import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from './supabase';

import AdminSidebar from './admin/AdminSidebar';
import AdminInicio from './admin/AdminInicio';
import AdminSedes from './admin/AdminSedes';
import AdminNosotros from './admin/AdminNosotros';
import AdminPreciosPromos from './admin/AdminPreciosPromos';
import AdminPagos from './admin/AdminPagos';
import AdminTienda from './admin/AdminTienda';
import AdminTrabaja from './admin/AdminTrabaja';
import AdminTerminos from './admin/AdminTerminos';
import AdminProspectos from './admin/AdminProspectos';
import AdminEventos from './admin/AdminEventos';
import AdminUsuarios from './admin/AdminUsuarios';

export default function AdminDashboard() {
  const [usuario, setUsuario] = useState(null);
  const [rolUsuario, setRolUsuario] = useState('ministro');
  const [nombreAdmin, setNombreAdmin] = useState('');
  const [cargandoSesion, setCargandoSesion] = useState(true);

  const [seccionActiva, setSeccionActiva] = useState('inicio_web');

  useEffect(() => {
    async function validarAcceso() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        window.location.href = '/login';
        return;
      }

      const emailLimpio = session.user.email.toLowerCase().trim();
      const { data: adminData } = await supabase
        .from('admin_usuarios')
        .select('*')
        .eq('email', emailLimpio)
        .maybeSingle();

      if (adminData) {
        if (adminData.estado === 'inactivo') {
          await supabase.auth.signOut();
          window.location.href = '/login';
          return;
        }
        setRolUsuario(adminData.rol || 'ministro');
        setNombreAdmin(adminData.nombre || adminData.email);
      } else if (emailLimpio === 'diosalexanderjesus@gmail.com') {
        setRolUsuario('rey');
        setNombreAdmin('Alexander Dios (Rey)');
      } else {
        await supabase.auth.signOut();
        window.location.href = '/login';
        return;
      }

      setUsuario(session.user);
      setCargandoSesion(false);
    }
    validarAcceso();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (cargandoSesion) {
    return (
      <div className="min-h-screen bg-[#040812] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#00B4A7] animate-spin" />
      </div>
    );
  }

  const esRey = rolUsuario === 'rey' || usuario?.email?.toLowerCase() === 'diosalexanderjesus@gmail.com';

  return (
    <div className="min-h-screen bg-[#040812] text-slate-100 flex flex-col md:flex-row font-sans">
      <AdminSidebar 
        seccionActiva={seccionActiva}
        setSeccionActiva={setSeccionActiva}
        esRey={esRey}
        nombreAdmin={nombreAdmin}
        usuario={usuario}
        onLogout={handleLogout}
      />

      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        {seccionActiva === 'inicio_web' && <AdminInicio />}
        {seccionActiva === 'sedes' && <AdminSedes />}
        {seccionActiva === 'nosotros' && <AdminNosotros />}
        {seccionActiva === 'precios' && <AdminPreciosPromos />}
        {seccionActiva === 'pagos' && <AdminPagos />}
        {seccionActiva === 'tienda' && <AdminTienda />}
        {seccionActiva === 'trabaja' && <AdminTrabaja />}
        {seccionActiva === 'terminos' && <AdminTerminos />}
        {seccionActiva === 'prospectos' && <AdminProspectos />}
        {seccionActiva === 'eventos' && <AdminEventos />}
        {seccionActiva === 'administradores' && esRey && <AdminUsuarios usuarioActual={usuario} />}
      </main>
    </div>
  );
}