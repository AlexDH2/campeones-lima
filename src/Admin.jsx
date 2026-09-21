import { useState } from 'react';
import { ExternalLink, Loader2, Menu, X } from 'lucide-react';
import { AuthProvider } from './admin/AuthContext';
import { useAuth } from './admin/auth';
import { MODULOS, tienePermiso } from './domain';
import Login from './admin/Login';
import AdminSidebar from './admin/AdminSidebar';
import AdminDashboard from './admin/AdminDashboard';
import AdminInicio from './admin/AdminInicio';
import AdminSedes from './admin/AdminSedes';
import AdminEventos from './admin/AdminEventos';
import AdminTienda from './admin/AdminTienda';
import AdminNosotros from './admin/AdminNosotros';
import AdminProspectos from './admin/AdminProspectos';
import AdminPagos from './admin/AdminPagos';
import AdminTrabaja from './admin/AdminTrabaja';
import AdminTerminos from './admin/AdminTerminos';
import AdminPreciosPromos from './admin/AdminPreciosPromos';
import AdminUsuarios from './admin/AdminUsuarios';

const PANELES = { inicio: AdminInicio, sedes: AdminSedes, eventos: AdminEventos, tienda: AdminTienda, nosotros: AdminNosotros, prospectos: AdminProspectos, pagos: AdminPagos, trabaja: AdminTrabaja, terminos: AdminTerminos, precios: AdminPreciosPromos, categorias: AdminPreciosPromos, usuarios: AdminUsuarios };
function PanelAdmin() {
  const { usuario, cargando, errorAcceso } = useAuth();
  const [seleccion, setSeleccion] = useState('dashboard');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const pestañaActiva = tienePermiso(usuario, seleccion) ? seleccion : MODULOS.find(m => tienePermiso(usuario, m));
  const Panel = PANELES[pestañaActiva];
  function cambiarPestaña(modulo) {
    if (tienePermiso(usuario, modulo)) { setSeleccion(modulo); setMenuAbierto(false); }
  }
  if (cargando) return <div className="min-h-screen bg-[#040914] grid place-items-center"><Loader2 className="animate-spin text-[#00B4A7]" aria-label="Verificando acceso" /></div>;
  if (!usuario) return <Login />;
  return <div className="min-h-screen bg-[#040914] text-slate-100 font-sans flex flex-col">
    <header className="border-b border-slate-800 bg-[#071527] sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <button className="lg:hidden" aria-label="Abrir menú administrativo" aria-expanded={menuAbierto} onClick={() => setMenuAbierto(!menuAbierto)}>{menuAbierto ? <X /> : <Menu />}</button>
        <img loading="lazy" src="/logo.png" alt="Campeones Lima" className="w-8 h-8 object-contain" />
        <h1 className="text-sm font-black">CAMPEONES LIMA <span className="text-[#F7B52C]">ADMIN</span></h1>
      </div>
      <a href="/" target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1">Ver Web Pública <ExternalLink className="w-4 h-4" /></a>
    </header>
    {errorAcceso && <p role="alert" className="p-4 text-red-300">{errorAcceso}</p>}
    <div className="flex-1 flex min-w-0">
      <div className={`${menuAbierto ? 'block fixed inset-y-14 left-0 z-40 shadow-2xl' : 'hidden'} lg:block lg:static`}>
        <AdminSidebar pestañaActiva={pestañaActiva} setPestañaActiva={cambiarPestaña} />
      </div>
      <main className="flex-1 min-w-0 p-4 sm:p-8 overflow-x-auto">
        {pestañaActiva === 'dashboard' ? <AdminDashboard alCambiarPestaña={cambiarPestaña} /> : Panel ? <Panel /> : <p>No tienes módulos asignados.</p>}
      </main>
    </div>
  </div>;
}
export default function Admin() { return <AuthProvider><PanelAdmin /></AuthProvider>; }
