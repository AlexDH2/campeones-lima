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

const NOMBRES_MODULOS = {
  dashboard: 'Tablero de Control',
  sedes: 'Sedes & Horarios',
  precios: 'Precios Clase Modelo',
  categorias: 'Categorías de Edad',
  pagos: 'Métodos de Pago',
  prospectos: 'Prospectos / Leads',
  tienda: 'Tienda Oficial',
  inicio: 'Portada & Inicio',
  eventos: 'Torneos & Eventos',
  nosotros: 'Nosotros & Staff',
  trabaja: 'Trabaja con Nosotros',
  terminos: 'Términos & Políticas',
  usuarios: 'Roles & Accesos'
};

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
    <header className="border-b border-slate-800 bg-[#071527]/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-md">
      <div className="flex items-center gap-3">
        <button className="lg:hidden text-slate-300 hover:text-white p-1 rounded-lg border border-slate-800 hover:border-slate-700" aria-label="Abrir menú administrativo" aria-expanded={menuAbierto} onClick={() => setMenuAbierto(!menuAbierto)}>{menuAbierto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
        <img loading="lazy" src="/logo.png" alt="Campeones Lima" className="w-8 h-8 object-contain drop-shadow" onError={(e) => { e.target.src = '/logo.svg'; }} />
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-black tracking-tight">CAMPEONES LIMA <span className="text-[#F7B52C]">ADMIN</span></h1>
          <span className="hidden sm:inline-block text-slate-600 font-mono">/</span>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-lg bg-[#040914] border border-slate-800 text-[11px] font-bold text-slate-300">
            {NOMBRES_MODULOS[pestañaActiva] || pestañaActiva}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        {usuario?.rol && (
          <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#00B4A7]/15 text-[#00B4A7] border border-[#00B4A7]/30">
            {usuario.rol}
          </span>
        )}
        <a href="/" target="_blank" rel="noreferrer" className="text-xs font-bold text-slate-300 hover:text-white bg-[#040914] hover:bg-[#091830] border border-slate-800 hover:border-[#00B4A7]/50 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm">
          <span>Ver Web Pública</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#00B4A7]" />
        </a>
      </div>
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
