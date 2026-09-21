import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard,
  Sparkles, 
  MapPin, 
  DollarSign, 
  Tag, 
  CreditCard,
  Trophy, 
  ShoppingBag, 
  Users, 
  Briefcase, 
  FileText, 
  UserCheck, 
  ShieldCheck, 
  LogOut,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from './auth';
import { tienePermiso } from '../domain';
import { supabase } from '../supabase';

const GRUPOS_MENU = [
  {
    titulo: 'OPERACIONES',
    items: [
      { id: 'dashboard', label: 'Tablero de Control', icon: LayoutDashboard },
      { id: 'sedes', label: 'Sedes & Horarios', icon: MapPin },
      { id: 'precios', label: 'Precios Clase Modelo', icon: DollarSign },
      { id: 'categorias', label: 'Categorías de Edad', icon: Tag }
    ]
  },
  {
    titulo: 'VENTAS & FINANZAS',
    items: [
      { id: 'pagos', label: 'Métodos de Pago', icon: CreditCard },
      { id: 'prospectos', label: 'Prospectos / Leads', icon: UserCheck },
      { id: 'tienda', label: 'Tienda Oficial', icon: ShoppingBag }
    ]
  },
  {
    titulo: 'CONTENIDO WEB',
    items: [
      { id: 'inicio', label: 'Portada & Inicio', icon: Sparkles },
      { id: 'eventos', label: 'Torneos & Eventos', icon: Trophy },
      { id: 'nosotros', label: 'Nosotros & Staff', icon: Users },
      { id: 'trabaja', label: 'Trabaja con Nosotros', icon: Briefcase },
      { id: 'terminos', label: 'Términos & Políticas', icon: FileText }
    ]
  },
  {
    titulo: 'SISTEMA',
    items: [
      { id: 'usuarios', label: 'Roles & Accesos', icon: ShieldCheck }
    ]
  }
];

export default function AdminSidebar({ pestañaActiva, setPestañaActiva }) {
  const { logout, usuario } = useAuth();

  const [metricas, setMetricas] = useState({
    postulaciones: 0,
    prospectos: 0,
    sedesSuspendidas: 0
  });

  useEffect(() => {
    async function cargarContadoresEnVivo() {
      try {
        const [resPostulaciones, resProspectos, resSedes] = await Promise.all([
          supabase.from('postulaciones').select('id', { count: 'exact', head: true }),
          supabase.from('prospectos').select('id', { count: 'exact', head: true }),
          supabase.from('sedes').select('id, clases_suspendidas')
        ]);

        const suspendidas = resSedes.data ? resSedes.data.filter(s => s.clases_suspendidas).length : 0;

        setMetricas({
          postulaciones: resPostulaciones.count || 0,
          prospectos: resProspectos.count || 0,
          sedesSuspendidas: suspendidas
        });
      } catch (err) {
        console.error("Error al cargar contadores del sidebar:", err);
      }
    }

    cargarContadoresEnVivo();
    const interval = setInterval(cargarContadoresEnVivo, 60000);
    return () => clearInterval(interval);
  }, []);

  const esSuperAdmin = usuario?.rol === 'Principal';

  return (
    <aside className="w-64 bg-[#071527] border-r border-[#0D2E4E] flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none">
      
      <div className="flex flex-col h-full overflow-hidden">
        
        {/* CABECERA LIMPIA */}
        <div className="p-4 border-b border-[#0D2E4E] flex items-center gap-3">
          <img loading="lazy" src="/logo.png" 
            alt="Logo Campeones Lima" 
            className="w-9 h-9 object-contain drop-shadow-[0_2px_10px_rgba(0,180,167,0.3)] shrink-0"
            onError={(e) => {
              if (!e.target.dataset.triedSvg) {
                e.target.dataset.triedSvg = 'true';
                e.target.src = '/logo.svg';
              }
            }}
          />
          <div className="truncate">
            <h2 className="font-black text-white text-sm tracking-tight leading-tight truncate">Campeones Lima</h2>
            <span className="text-[10px] text-[#00B4A7] font-bold uppercase tracking-wider block">Panel de Control</span>
          </div>
        </div>

        {/* LISTADO DE NAVEGACIÓN AGRUPADO */}
        <nav className="p-3 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {GRUPOS_MENU.map((grupo, gIdx) => {
            const itemsVisibles = grupo.items.filter(item => tienePermiso(usuario, item.id));

            if (itemsVisibles.length === 0) return null;

            return (
              <div key={gIdx} className="space-y-1">
                <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase px-3 block mb-1">
                  {grupo.titulo}
                </span>

                {itemsVisibles.map((item) => {
                  const Icon = item.icon;
                  const activo = pestañaActiva === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setPestañaActiva(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-black text-xs transition-all cursor-pointer text-left group ${
                        activo
                          ? 'bg-[#00B4A7] text-slate-950 shadow-md shadow-[#00B4A7]/25'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${activo ? 'text-slate-950' : 'text-[#00B4A7]'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      <div className="flex items-center shrink-0">
                        {item.id === 'sedes' && metricas.sedesSuspendidas > 0 && (
                          <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse" title="Sedes suspendidas hoy">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>{metricas.sedesSuspendidas}</span>
                          </span>
                        )}

                        {item.id === 'trabaja' && metricas.postulaciones > 0 && (
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            activo ? 'bg-slate-950 text-[#00B4A7]' : 'bg-[#00B4A7]/20 text-[#00B4A7]'
                          }`}>
                            {metricas.postulaciones}
                          </span>
                        )}

                        {item.id === 'prospectos' && metricas.prospectos > 0 && (
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            activo ? 'bg-slate-950 text-emerald-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {metricas.prospectos}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>

      {/* INFORMACIÓN DEL USUARIO */}
      <div className="p-3 border-t border-[#0D2E4E] bg-[#040914]/80 space-y-2">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-8 h-8 rounded-full bg-[#F7B52C] text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow">
            {usuario?.nombre?.charAt(0).toUpperCase() || usuario?.email?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-white truncate">{usuario?.nombre || usuario?.email || "Administrador Oficial"}</p>
            <span className="text-[10px] text-[#F7B52C] font-bold block">
              {esSuperAdmin ? 'Administrador Principal' : 'Administrador Sub'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors cursor-pointer border border-red-500/20"
          title="Cerrar Sesión"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>

    </aside>
  );
}
