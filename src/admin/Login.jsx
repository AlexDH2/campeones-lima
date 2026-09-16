import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from './auth';

export default function Login() {
  const { login, errorAcceso } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      return setErrorMsg("Por favor, ingresa tu correo y contraseña.");
    }

    setCargando(true);
    setErrorMsg('');

    try {
      await login(email.trim(), password);
      // Al iniciar sesión exitosamente, AuthContext actualiza el usuario automáticamente
    } catch (err) {
      console.error("Error en login:", err);
      if (err.message?.toLowerCase().includes("invalid login credentials")) {
        setErrorMsg("Correo o contraseña incorrectos. Verifica tus credenciales.");
      } else {
        setErrorMsg(err.message || "Error al iniciar sesión. Intenta nuevamente.");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040914] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans select-none">
      
      {/* DESTELLOS DE FONDO */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00B4A7]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-[#F7B52C]/10 rounded-full blur-3xl pointer-events-none" />

      {/* BOTÓN VOLVER A LA WEB */}
      <div className="w-full max-w-md mb-4 z-10">
        <a 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-[#00B4A7] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la página web</span>
        </a>
      </div>

      {/* TARJETA DE LOGIN */}
      <div className="w-full max-w-md bg-[#071527] border border-[#0D2E4E] rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 space-y-6">
        
        {/* LOGO & CABECERA */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#00B4A7] to-[#F7B52C] flex items-center justify-center shadow-lg shadow-[#00B4A7]/25 mb-3">
            <span className="font-black text-slate-950 text-2xl tracking-tighter">CL</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#00B4A7]/10 border border-[#00B4A7]/30 text-[10px] font-black text-[#00B4A7] uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-[#F7B52C]" /> Acceso Privado
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">Panel de Administración</h1>
          <p className="text-xs text-slate-400">
            Ingresa con tu cuenta autorizada de Campeones Lima.
          </p>
        </div>

        {/* MENSAJE DE ERROR SI FALLA */}
        {(errorMsg || errorAcceso) && (
          <div className="p-3.5 bg-red-950/40 border border-red-500/40 rounded-xl flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span role="alert">{errorMsg || errorAcceso}</span>
          </div>
        )}

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* CAMPO CORREO */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold">Correo Electrónico:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="ejemplo@campeoneslima.pe"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#040914] border border-slate-800 focus:border-[#00B4A7] text-white pl-10 pr-3.5 py-3 rounded-xl font-medium focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* CAMPO CONTRASEÑA */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold">Contraseña:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={mostrarPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#040914] border border-slate-800 focus:border-[#00B4A7] text-white pl-10 pr-10 py-3 rounded-xl font-medium focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                title={mostrarPassword ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* BOTÓN INICIAR SESIÓN */}
          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#00B4A7] to-[#009b8f] hover:from-[#00c9ba] hover:to-[#00B4A7] text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#00B4A7]/25 cursor-pointer transition-all transform active:scale-98 disabled:opacity-50"
          >
            {cargando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando credenciales...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Ingresar al Panel de Control</span>
              </>
            )}
          </button>

        </form>

        {/* PIE DE SEGURIDAD */}
        <div className="pt-2 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3 text-[#F7B52C]" />
            <span>Sistema protegido con encriptación Supabase SSL</span>
          </p>
        </div>

      </div>

    </div>
  );
}
