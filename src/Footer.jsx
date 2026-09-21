import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, MapPin, Mail, ShieldCheck } from 'lucide-react';
import { useRedesSociales } from './queries';

const REDES_DEFECTO = {
  instagram: "https://instagram.com/campeoneslima_",
  tiktok: "https://tiktok.com/@campeoneslima_",
  facebook: "https://facebook.com/campeoneslima",
  youtube: "https://youtube.com/@campeoneslima",
  whatsapp: "51963896985"
};

export default function Footer() {
  const { data: redesData } = useRedesSociales();
  const redes = { ...REDES_DEFECTO, ...(redesData || {}) };

  return (
    <footer className="bg-[#03060c] text-slate-400 border-t border-slate-800/80 font-sans text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* IDENTIDAD */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <img loading="lazy" src="/logo.png" alt="Campeones Lima" className="w-9 h-9 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
              <div>
                <span className="font-black text-white text-base tracking-tight block">CAMPEONES LIMA</span>
                <span className="text-[9px] text-[#00B4A7] font-bold uppercase tracking-wider block">Club & Academia Deportiva</span>
              </div>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Formando atletas con pasión y valores desde 2015 en coliseos cerrados de Lima Metropolitana.
            </p>
          </div>

          {/* NAVEGACIÓN */}
          <div className="space-y-2.5">
            <p className="font-black text-white text-xs uppercase tracking-wider">Enlaces Rápidos</p>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link to="/terminos" className="hover:text-[#00B4A7]">Términos y políticas</Link></li>
              <li><Link to="/sedes" className="hover:text-[#00B4A7] transition-colors">Sedes & Horarios</Link></li>
              <li><Link to="/nosotros" className="hover:text-[#00B4A7] transition-colors">Nuestra Historia & Palmarés</Link></li>
              <li><Link to="/tienda" className="hover:text-[#00B4A7] transition-colors">Tienda Oficial</Link></li>
              <li><Link to="/eventos" className="hover:text-[#00B4A7] transition-colors">Torneos & Festivales</Link></li>
              <li><Link to="/trabaja" className="hover:text-[#00B4A7] transition-colors">Trabaja con Nosotros</Link></li>
            </ul>
          </div>

          {/* SEDES */}
          <div className="space-y-2.5">
            <p className="font-black text-white text-xs uppercase tracking-wider">Coliseos Oficiales</p>
            <ul className="space-y-1 text-slate-400 text-[11px]">
              <li>📍 Coliseo Liceo Naval (San Miguel)</li>
              <li>📍 Coliseo Cristo Rey (Pueblo Libre)</li>
              <li>📍 Santísima Trinidad (Cercado de Lima)</li>
            </ul>
          </div>

          {/* REDES SOCIALES (CON VECTORES SVG NATIVOS ANTI-ERRORES) */}
          <div className="space-y-3">
            <p className="font-black text-white text-xs uppercase tracking-wider">Síguenos en Redes</p>
            <div className="flex items-center gap-2.5">
              
              {/* INSTAGRAM */}
              {redes.instagram && (
                <a href={redes.instagram} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl bg-[#071527] hover:bg-[#00B4A7] hover:text-slate-950 text-slate-300 border border-slate-800 flex items-center justify-center transition-all" title="Instagram">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
              )}

              {/* TIKTOK */}
              {redes.tiktok && (
                <a href={redes.tiktok} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl bg-[#071527] hover:bg-[#00B4A7] hover:text-slate-950 text-slate-300 border border-slate-800 flex items-center justify-center transition-all" title="TikTok">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.88-4.49v-7a8.16 8.16 0 0 0 4.77 1.52v-3.49h-.88z"/>
                  </svg>
                </a>
              )}

              {/* FACEBOOK */}
              {redes.facebook && (
                <a href={redes.facebook} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl bg-[#071527] hover:bg-[#00B4A7] hover:text-slate-950 text-slate-300 border border-slate-800 flex items-center justify-center transition-all" title="Facebook">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
              )}

              {/* YOUTUBE */}
              {redes.youtube && (
                <a href={redes.youtube} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl bg-[#071527] hover:bg-[#00B4A7] hover:text-slate-950 text-slate-300 border border-slate-800 flex items-center justify-center transition-all" title="YouTube">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                    <polygon points="10 15 15 12 10 9 10 15"/>
                  </svg>
                </a>
              )}

              {/* WHATSAPP */}
              {redes.whatsapp && (
                <a href={`https://wa.me/${redes.whatsapp}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl bg-[#071527] hover:bg-[#25D366] hover:text-white text-slate-300 border border-slate-800 flex items-center justify-center transition-all" title="WhatsApp">
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
            </div>
            <p className="text-[10px] text-slate-500">Atención oficial: +51 963 896 985</p>
          </div>

        </div>

        <div className="border-t border-slate-800/60 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <p>© 2026 Campeones Lima. Todos los derechos reservados.</p>
          <p>Club & Academia Deportiva · Forjando campeones desde 2015</p>
        </div>
      </div>
    </footer>
  );
}