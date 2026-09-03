import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  ShoppingBag, 
  Calendar as CalendarIcon, 
  MapPin, 
  Briefcase, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  X, 
  Save, 
  Tag, 
  Clock, 
  Loader2, 
  Image as ImageIcon, 
  UploadCloud, 
  Navigation, 
  FileText, 
  MessageCircle, 
  Award, 
  Users, 
  FileSpreadsheet, 
  Lock, 
  LogOut,
  Mail,
  CheckCircle2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from './supabase';

const CATEGORIAS_FIBA = [
  "U10 (Mini Básquet)", "U12 (Mini Básquet)", "U13", "U14", "U15", "U16", "U17", "U18", "U19", "U20", "U23", "Mayores / Senior (Libre)", "Master (+35)", "Master (+45)"
];

const procesarArchivoImagen = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

const procesarArchivoCV = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({ nombre: file.name, dataUrl: e.target.result });
    };
    reader.readAsDataURL(file);
  });
};

export default function AdminDashboard() {
  // ==========================================
  // AUTENTICACIÓN REAL CON SUPABASE AUTH
  // ==========================================
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorLogin, setErrorLogin] = useState('');
  const [iniciandoSesion, setIniciandoSesion] = useState(false);

  useEffect(() => {
    // 1. Obtener la sesión activa de Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user ?? null);
      setCargandoSesion(false);
    });

    // 2. Escuchar cambios de sesión (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null);
      setCargandoSesion(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorLogin('');
    setIniciandoSesion(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailInput,
      password: passwordInput,
    });

    if (error) {
      setErrorLogin("Correo o contraseña incorrectos. Verifica tus credenciales.");
    } else {
      setUsuario(data.user);
    }
    setIniciandoSesion(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUsuario(null);
  };

  // ==========================================
  // ESTADOS DEL PANEL
  // ==========================================
  const [seccionActiva, setSeccionActiva] = useState('prospectos');
  const [cargando, setCargando] = useState(false);
  const [subiendoImagenes, setSubiendoImagenes] = useState(false);

  const [eventos, setEventos] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [postulaciones, setPostulaciones] = useState([]);
  const [prospectos, setProspectos] = useState([]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [resEv, resSed, resProd, resPost, resProsp] = await Promise.all([
        supabase.from('eventos').select('*').order('created_at', { ascending: false }),
        supabase.from('sedes').select('*').order('created_at', { ascending: true }),
        supabase.from('tienda_productos').select('*').order('created_at', { ascending: false }),
        supabase.from('postulaciones').select('*').order('created_at', { ascending: false }),
        supabase.from('prospectos').select('*').order('created_at', { ascending: false })
      ]);

      if (resEv.data) setEventos(resEv.data);
      if (resSed.data) setSedes(resSed.data);
      if (resProd.data) setProductos(resProd.data);
      if (resPost.data) setPostulaciones(resPost.data);
      if (resProsp.data) setProspectos(resProsp.data);
    } catch (err) {
      console.error("Error al cargar datos:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (usuario) {
      cargarDatos();
    }
  }, [usuario]);

  // ==========================================
  // PROSPECTOS & EXPORTAR EXCEL
  // ==========================================
  const handleExportarExcel = () => {
    if (prospectos.length === 0) {
      alert("No hay registros para exportar.");
      return;
    }

    const datosExcel = prospectos.map((p, idx) => ({
      "N°": idx + 1,
      "Fecha Registro": new Date(p.created_at).toLocaleDateString('es-PE'),
      "Alumno": p.nombre_alumno,
      "Edad": p.edad ? `${p.edad} años` : "-",
      "Disciplina": p.disciplina,
      "Sede Preferida": p.sede,
      "Teléfono WhatsApp": p.telefono_apoderado,
      "Estado": p.estado || "Pendiente",
      "Notas": p.notas || ""
    }));

    const hoja = XLSX.utils.json_to_sheet(datosExcel);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Clases de Prueba");

    const fechaHoy = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(libro, `Campeones_Lima_Clases_Prueba_${fechaHoy}.xlsx`);
  };

  const handleCambiarEstadoProspecto = async (id, nuevoEstado) => {
    await supabase.from('prospectos').update({ estado: nuevoEstado }).eq('id', id);
    setProspectos(prospectos.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
  };

  const handleEliminarProspecto = async (id) => {
    if (confirm("¿Eliminar este alumno de la lista?")) {
      await supabase.from('prospectos').delete().eq('id', id);
      setProspectos(prospectos.filter(p => p.id !== id));
    }
  };

  // ==========================================
  // EVENTOS (CON FIBA, NIVEL, SEDES Y FOTOS)
  // ==========================================
  const [eventoEnEdicion, setEventoEnEdicion] = useState(null);
  const [mostrarManualNuevo, setMostrarManualNuevo] = useState(false);
  const [categoriaManualTexto, setCategoriaManualTexto] = useState('');

  const [nuevoEvento, setNuevoEvento] = useState({
    titulo: '', tipo: 'basquet', nivel: 'Formativo', fechaRaw: '', horaInicio: '09:00', horaFin: '18:00', sede: '', ubicacion: '', maps: '', imagenes: [], categorias: ["U14", "U16"], descripcion: '', estado: 'Inscripciones Abiertas'
  });

  const handleToggleCategoriaFIBA = (cat, esEdicion = false) => {
    if (esEdicion) {
      const actuales = eventoEnEdicion.categorias || [];
      const nuevas = actuales.includes(cat) ? actuales.filter(c => c !== cat) : [...actuales, cat];
      setEventoEnEdicion(prev => ({ ...prev, categorias: nuevas }));
    } else {
      const actuales = nuevoEvento.categorias || [];
      const nuevas = actuales.includes(cat) ? actuales.filter(c => c !== cat) : [...actuales, cat];
      setNuevoEvento(prev => ({ ...prev, categorias: nuevas }));
    }
  };

  const handleAgregarCategoriaManual = (esEdicion = false) => {
    if (!categoriaManualTexto.trim()) return;
    const catLimpia = categoriaManualTexto.trim();
    if (esEdicion) {
      const actuales = eventoEnEdicion.categorias || [];
      if (!actuales.includes(catLimpia)) setEventoEnEdicion(prev => ({ ...prev, categorias: [...actuales, catLimpia] }));
    } else {
      const actuales = nuevoEvento.categorias || [];
      if (!actuales.includes(catLimpia)) setNuevoEvento(prev => ({ ...prev, categorias: [...actuales, catLimpia] }));
    }
    setCategoriaManualTexto('');
  };

  const handleSeleccionarSedeEnEvento = (nombreSede, esEdicion = false) => {
    const sedeEncontrada = sedes.find(s => s.nombre === nombreSede);
    if (sedeEncontrada) {
      const datos = { sede: sedeEncontrada.nombre, ubicacion: sedeEncontrada.direccion || '', maps: sedeEncontrada.maps || '' };
      if (esEdicion) setEventoEnEdicion(prev => ({ ...prev, ...datos }));
      else setNuevoEvento(prev => ({ ...prev, ...datos }));
    } else {
      if (esEdicion) setEventoEnEdicion(prev => ({ ...prev, sede: nombreSede }));
      else setNuevoEvento(prev => ({ ...prev, sede: nombreSede }));
    }
  };

  const handleImagenesDesdePC = async (e, esEdicion = false) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setSubiendoImagenes(true);
    try {
      const fotos = await Promise.all(files.map(file => procesarArchivoImagen(file)));
      if (esEdicion) setEventoEnEdicion(prev => ({ ...prev, imagenes: [...(prev.imagenes || []), ...fotos] }));
      else setNuevoEvento(prev => ({ ...prev, imagenes: [...prev.imagenes, ...fotos] }));
    } finally {
      setSubiendoImagenes(false);
    }
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "Por coordinar";
    try {
      const [year, month, day] = fechaStr.split('-');
      return new Date(year, month - 1, day).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch { return fechaStr; }
  };

  const handleCrearEvento = async (e) => {
    e.preventDefault();
    if (!nuevoEvento.titulo || !nuevoEvento.fechaRaw) return;

    const nuevo = {
      titulo: nuevoEvento.titulo,
      tipo: nuevoEvento.tipo,
      nivel: nuevoEvento.nivel,
      estado: nuevoEvento.estado,
      fecha: formatearFecha(nuevoEvento.fechaRaw),
      hora: `${nuevoEvento.horaInicio} - ${nuevoEvento.horaFin}`,
      sede: nuevoEvento.sede || "Por confirmar",
      ubicacion: nuevoEvento.ubicacion || "",
      maps: nuevoEvento.maps || "",
      imagenes: nuevoEvento.imagenes,
      categorias: nuevoEvento.categorias.length > 0 ? nuevoEvento.categorias : ["Todas"],
      descripcion: nuevoEvento.descripcion || "Evento oficial Campeones Lima.",
      cupos: "Vacantes abiertas",
      visible: true
    };

    const { data, error } = await supabase.from('eventos').insert([nuevo]).select();
    if (!error && data) {
      setEventos([data[0], ...eventos]);
      setNuevoEvento({
        titulo: '', tipo: 'basquet', nivel: 'Formativo', fechaRaw: '', horaInicio: '09:00', horaFin: '18:00', sede: '', ubicacion: '', maps: '', imagenes: [], categorias: ["U14", "U16"], descripcion: '', estado: 'Inscripciones Abiertas'
      });
    }
  };

  const handleGuardarEdicionEvento = async (e) => {
    e.preventDefault();
    const fechaFinal = eventoEnEdicion.fechaRaw ? formatearFecha(eventoEnEdicion.fechaRaw) : eventoEnEdicion.fecha;
    const horaFinal = (eventoEnEdicion.horaInicio && eventoEnEdicion.horaFin) ? `${eventoEnEdicion.horaInicio} - ${eventoEnEdicion.horaFin}` : eventoEnEdicion.hora;

    const { error } = await supabase.from('eventos').update({
      titulo: eventoEnEdicion.titulo,
      nivel: eventoEnEdicion.nivel,
      fecha: fechaFinal,
      hora: horaFinal,
      sede: eventoEnEdicion.sede,
      ubicacion: eventoEnEdicion.ubicacion,
      maps: eventoEnEdicion.maps,
      imagenes: eventoEnEdicion.imagenes,
      categorias: eventoEnEdicion.categorias,
      estado: eventoEnEdicion.estado
    }).eq('id', eventoEnEdicion.id);

    if (!error) {
      setEventos(eventos.map(ev => ev.id === eventoEnEdicion.id ? { ...eventoEnEdicion, fecha: fechaFinal, hora: horaFinal } : ev));
      setEventoEnEdicion(null);
    }
  };

  const handleToggleVisibilidadEvento = async (ev) => {
    const nuevaVisibilidad = !ev.visible;
    await supabase.from('eventos').update({ visible: nuevaVisibilidad }).eq('id', ev.id);
    setEventos(eventos.map(item => item.id === ev.id ? { ...item, visible: nuevaVisibilidad } : item));
  };

  const handleEliminarEvento = async (id) => {
    if (confirm("¿Eliminar este evento?")) {
      await supabase.from('eventos').delete().eq('id', id);
      setEventos(eventos.filter(ev => ev.id !== id));
    }
  };

  // ==========================================
  // SEDES CON FOTOS DESDE PC
  // ==========================================
  const [nuevaSede, setNuevaSede] = useState({ nombre: '', distrito: '', direccion: '', maps: '', imagenes: [] });
  const [sedeSeleccionadaId, setSedeSeleccionadaId] = useState(null);
  const [nuevaDisciplina, setNuevaDisciplina] = useState('');
  const [nuevoHorario, setNuevoHorario] = useState({ dias: '', horas: '', grupo: '' });

  const handleImagenesSedeDesdePC = async (e, sedeId = null) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setSubiendoImagenes(true);
    try {
      const fotos = await Promise.all(files.map(file => procesarArchivoImagen(file)));
      if (sedeId) {
        const sedeActual = sedes.find(s => s.id === sedeId);
        const actualizadas = [...(sedeActual.imagenes || []), ...fotos];
        await supabase.from('sedes').update({ imagenes: actualizadas }).eq('id', sedeId);
        setSedes(sedes.map(s => s.id === sedeId ? { ...s, imagenes: actualizadas } : s));
      } else {
        setNuevaSede(prev => ({ ...prev, imagenes: [...prev.imagenes, ...fotos] }));
      }
    } finally {
      setSubiendoImagenes(false);
    }
  };

  const handleCrearSede = async (e) => {
    e.preventDefault();
    if (!nuevaSede.nombre || !nuevaSede.distrito) return;

    const item = {
      nombre: nuevaSede.nombre,
      distrito: nuevaSede.distrito,
      direccion: nuevaSede.direccion || "Por definir",
      disciplinas: ["Básquetbol", "Voleibol"],
      horarios: [],
      maps: nuevaSede.maps || "",
      imagenes: nuevaSede.imagenes
    };

    const { data, error } = await supabase.from('sedes').insert([item]).select();
    if (!error && data) {
      setSedes([...sedes, data[0]]);
      setNuevaSede({ nombre: '', distrito: '', direccion: '', maps: '', imagenes: [] });
    }
  };

  const handleAgregarDisciplina = async (sede) => {
    if (!nuevaDisciplina.trim()) return;
    const actualizadas = [...(sede.disciplinas || []), nuevaDisciplina.trim()];
    await supabase.from('sedes').update({ disciplinas: actualizadas }).eq('id', sede.id);
    setSedes(sedes.map(s => s.id === sede.id ? { ...s, disciplinas: actualizadas } : s));
    setNuevaDisciplina('');
  };

  const handleEliminarDisciplina = async (sede, disc) => {
    const actualizadas = (sede.disciplinas || []).filter(d => d !== disc);
    await supabase.from('sedes').update({ disciplinas: actualizadas }).eq('id', sede.id);
    setSedes(sedes.map(s => s.id === sede.id ? { ...s, disciplinas: actualizadas } : s));
  };

  const handleAgregarHorario = async (sede) => {
    if (!nuevoHorario.dias || !nuevoHorario.horas) return;
    const actualizados = [...(sede.horarios || []), nuevoHorario];
    await supabase.from('sedes').update({ horarios: actualizados }).eq('id', sede.id);
    setSedes(sedes.map(s => s.id === sede.id ? { ...s, horarios: actualizados } : s));
    setNuevoHorario({ dias: '', horas: '', grupo: '' });
  };

  const handleEliminarHorario = async (sede, index) => {
    const actualizados = (sede.horarios || []).filter((_, idx) => idx !== index);
    await supabase.from('sedes').update({ horarios: actualizados }).eq('id', sede.id);
    setSedes(sedes.map(s => s.id === sede.id ? { ...s, horarios: actualizados } : s));
  };

  const handleEliminarSede = async (id) => {
    if (confirm("¿Eliminar esta sede?")) {
      await supabase.from('sedes').delete().eq('id', id);
      setSedes(sedes.filter(s => s.id !== id));
    }
  };

  // ==========================================
  // TIENDA
  // ==========================================
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '', categoria: 'uniformes', precio: '', tallas: '', descripcion: '', imagenes: []
  });

  const handleImagenesProductoDesdePC = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const procesadas = await Promise.all(files.map(file => procesarArchivoImagen(file)));
    setNuevoProducto(prev => ({ ...prev, imagenes: [...prev.imagenes, ...procesadas] }));
  };

  const handleCrearProducto = async (e) => {
    e.preventDefault();
    if (!nuevoProducto.nombre || !nuevoProducto.precio) return;

    const item = {
      nombre: nuevoProducto.nombre,
      categoria: nuevoProducto.categoria,
      precio: parseFloat(nuevoProducto.precio),
      tallas: nuevoProducto.tallas || "Estándar",
      descripcion: nuevoProducto.descripcion || "Producto oficial.",
      imagenes: nuevoProducto.imagenes.length > 0 ? nuevoProducto.imagenes : ["https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80"],
      destacado: true
    };

    const { data, error } = await supabase.from('tienda_productos').insert([item]).select();
    if (!error && data) {
      setProductos([data[0], ...productos]);
      setNuevoProducto({ nombre: '', categoria: 'uniformes', precio: '', tallas: '', descripcion: '', imagenes: [] });
    }
  };

  const handleEliminarProducto = async (id) => {
    if (confirm("¿Eliminar este producto?")) {
      await supabase.from('tienda_productos').delete().eq('id', id);
      setProductos(productos.filter(p => p.id !== id));
    }
  };

  // ==========================================
  // POSTULANTES MANUALES + CV
  // ==========================================
  const [nuevoPostulante, setNuevoPostulante] = useState({
    nombre: '', telefono: '', email: '', puesto: 'Entrenador(a) de Básquetbol', experiencia: '1 a 3 años', sede_interes: 'Cualquier Sede en Lima', resumen: '', cv_url: '', cv_nombre: ''
  });

  const handleSubirCVDesdePC = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const cv = await procesarArchivoCV(file);
      setNuevoPostulante(prev => ({ ...prev, cv_url: cv.dataUrl, cv_nombre: cv.nombre }));
    } catch (err) { console.error(err); }
  };

  const handleCrearPostulanteManual = async (e) => {
    e.preventDefault();
    if (!nuevoPostulante.nombre || !nuevoPostulante.telefono) return;

    const item = {
      nombre: nuevoPostulante.nombre,
      telefono: nuevoPostulante.telefono,
      email: nuevoPostulante.email || "",
      puesto: nuevoPostulante.puesto,
      experiencia: nuevoPostulante.experiencia,
      sede_interes: nuevoPostulante.sede_interes,
      resumen: nuevoPostulante.resumen || "Manual",
      cv_url: nuevoPostulante.cv_url || null,
      estado: 'Pendiente'
    };

    const { data, error } = await supabase.from('postulaciones').insert([item]).select();
    if (!error && data) {
      setPostulaciones([data[0], ...postulaciones]);
      setNuevoPostulante({ nombre: '', telefono: '', email: '', puesto: 'Entrenador(a) de Básquetbol', experiencia: '1 a 3 años', sede_interes: 'Cualquier Sede en Lima', resumen: '', cv_url: '', cv_nombre: '' });
    }
  };

  const handleCambiarEstadoPostulante = async (id, nuevoEstado) => {
    await supabase.from('postulaciones').update({ estado: nuevoEstado }).eq('id', id);
    setPostulaciones(postulaciones.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
  };

  const handleEliminarPostulante = async (id) => {
    if (confirm("¿Eliminar este postulante?")) {
      await supabase.from('postulaciones').delete().eq('id', id);
      setPostulaciones(postulaciones.filter(p => p.id !== id));
    }
  };

  // ========================================================
  // PANTALLA DE LOGIN CON SUPABASE AUTH
  // ========================================================
  if (cargandoSesion) {
    return (
      <div className="min-h-screen bg-[#040812] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-[#040812] flex items-center justify-center p-4 font-sans selection:bg-teal-400 selection:text-slate-950">
        <div className="bg-[#081322] border border-teal-900/50 rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[#0d1f36] border border-teal-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Lock className="w-7 h-7 text-teal-400" />
            </div>
            <h1 className="text-2xl font-black text-white">Acceso Administrador</h1>
            <p className="text-xs text-slate-400 mt-1">Inicia sesión con tu cuenta oficial de Supabase.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-teal-400" /> Correo Electrónico
              </label>
              <input
                type="email"
                required
                placeholder="ejemplo@gmail.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-[#060d19] border border-slate-800 focus:border-teal-400 text-xs text-white rounded-xl px-4 py-3 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" /> Contraseña
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-[#060d19] border border-slate-800 focus:border-teal-400 text-xs text-white rounded-xl px-4 py-3 focus:outline-none transition-colors font-mono"
              />
            </div>

            {errorLogin && (
              <p className="text-xs text-red-400 text-center font-semibold pt-1">{errorLogin}</p>
            )}

            <button
              type="submit"
              disabled={iniciandoSesion}
              className="w-full bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-black py-3.5 rounded-xl text-xs shadow-lg shadow-teal-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {iniciandoSesion ? <Loader2 className="w-4 h-4 animate-spin" /> : "Iniciar Sesión en Supabase"}
            </button>
          </form>

          <div className="text-center mt-6 pt-4 border-t border-slate-800">
            <Link to="/" className="text-xs text-slate-500 hover:text-teal-300 font-semibold">
              ← Volver a la Web Pública
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // PANEL ADMINISTRADOR PRINCIPAL
  // ========================================================
  return (
    <div className="min-h-screen bg-[#040812] text-slate-100 flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#060d19] border-r border-teal-950/60 p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <div>
              <p className="font-black text-white text-base">ADMIN PANEL</p>
              <p className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Campeones Lima</p>
            </div>
          </div>

          {/* Usuario activo de Supabase */}
          <div className="bg-[#081322] border border-teal-950 p-2.5 rounded-xl mb-6 text-[11px]">
            <p className="text-slate-500 font-bold text-[9px] uppercase">Conectado como:</p>
            <p className="text-teal-300 font-semibold truncate">{usuario.email}</p>
          </div>

          <nav className="space-y-1.5 text-xs font-bold">
            <button
              onClick={() => setSeccionActiva('prospectos')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-left cursor-pointer ${
                seccionActiva === 'prospectos' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-amber-400" /> Clases de Prueba ({prospectos.length})
            </button>

            <button
              onClick={() => setSeccionActiva('eventos')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-left cursor-pointer ${
                seccionActiva === 'eventos' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-4 h-4 text-amber-400" /> Eventos & FIBA ({eventos.length})
            </button>

            <button
              onClick={() => setSeccionActiva('sedes')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-left cursor-pointer ${
                seccionActiva === 'sedes' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapPin className="w-4 h-4 text-teal-400" /> Sedes y Fotos ({sedes.length})
            </button>

            <button
              onClick={() => setSeccionActiva('postulantes')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-left cursor-pointer ${
                seccionActiva === 'postulantes' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4 text-teal-300" /> Postulantes CV ({postulaciones.length})
            </button>

            <button
              onClick={() => setSeccionActiva('tienda')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-left cursor-pointer ${
                seccionActiva === 'tienda' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-cyan-400" /> Tienda ({productos.length})
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 mt-6 space-y-3 text-xs">
          <Link to="/" className="flex items-center gap-2 text-teal-400 hover:text-teal-300 font-bold">
            <Eye className="w-4 h-4" /> Ver Web Pública
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 font-bold cursor-pointer w-full text-left"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión Supabase
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        
        {cargando && (
          <div className="flex items-center gap-2 text-xs text-teal-400 mb-4 bg-teal-950/40 p-2.5 rounded-xl border border-teal-900">
            <Loader2 className="w-4 h-4 animate-spin" /> Conectando con Supabase...
          </div>
        )}

        {/* 📋 SECCIÓN 1: PROSPECTOS DE CLASES DE PRUEBA + EXPORTAR EXCEL */}
        {seccionActiva === 'prospectos' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">Alumnos de Clase de Prueba</h1>
                <p className="text-xs text-slate-400 mt-1">Registros guardados en Supabase desde el formulario de la web.</p>
              </div>

              <button
                onClick={handleExportarExcel}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-slate-950 font-black px-5 py-3 rounded-xl text-xs shadow-lg shadow-green-500/20 transition-all cursor-pointer transform active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4" /> Descargar / Actualizar Excel (.xlsx)
              </button>
            </div>

            <div className="bg-[#081322] rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0a182b] text-[11px] uppercase font-bold text-teal-400 border-b border-slate-800">
                  <tr>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Alumno</th>
                    <th className="p-4">Edad</th>
                    <th className="p-4">Deporte</th>
                    <th className="p-4">Sede</th>
                    <th className="p-4">WhatsApp</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {prospectos.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        Aún no hay alumnos registrados en clases de prueba. En cuanto completen el formulario en la web, aparecerán aquí.
                      </td>
                    </tr>
                  ) : (
                    prospectos.map((p) => (
                      <tr key={p.id} className="hover:bg-[#0a182b]/40 transition-colors">
                        <td className="p-4 text-slate-400">{new Date(p.created_at).toLocaleDateString('es-PE')}</td>
                        <td className="p-4 font-bold text-white">{p.nombre_alumno}</td>
                        <td className="p-4">{p.edad ? `${p.edad} años` : '-'}</td>
                        <td className="p-4 text-teal-300">{p.disciplina}</td>
                        <td className="p-4 text-slate-300">{p.sede}</td>
                        <td className="p-4 font-mono text-amber-300">{p.telefono_apoderado}</td>
                        <td className="p-4">
                          <select
                            value={p.estado || 'Pendiente'}
                            onChange={(e) => handleCambiarEstadoProspecto(p.id, e.target.value)}
                            className="bg-[#060d19] border border-slate-800 text-[11px] text-white rounded-lg px-2 py-1 focus:outline-none"
                          >
                            <option value="Pendiente">🟡 Pendiente</option>
                            <option value="Confirmado">🔵 Confirmado</option>
                            <option value="Asistió">🟢 Asistió</option>
                            <option value="Matriculado">⭐ Matriculado</option>
                            <option value="No asistió">🔴 No asistió</option>
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`https://wa.me/51${p.telefono_apoderado}?text=Hola,%20nos%20comunicamos%20de%20Campeones%20Lima%20para%20confirmar%20la%20clase%20de%20prueba%20de%20${encodeURIComponent(p.nombre_alumno)}.`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-teal-400 hover:text-teal-300 bg-[#0d1f36] rounded-lg"
                              title="Escribir por WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => handleEliminarProspecto(p.id)}
                              className="p-1.5 text-slate-500 hover:text-red-400 cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. SECCIÓN EVENTOS CON FIBA, NIVEL, SEDES Y FOTOS */}
        {seccionActiva === 'eventos' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center pb-6 border-b border-slate-800">
              <h1 className="text-2xl font-black text-white">Eventos y Torneos (FIBA)</h1>
              <Link to="/eventos?from=admin" className="bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> Ver en Vivo
              </Link>
            </div>

            <form onSubmit={handleCrearEvento} className="bg-[#081322] p-6 sm:p-8 rounded-3xl border border-teal-900/40 space-y-5">
              <p className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4" /> Publicar Nuevo Evento / Torneo
              </p>
              
              <div className="grid sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <input type="text" required placeholder="Nombre del Torneo..." value={nuevoEvento.titulo} onChange={e => setNuevoEvento({...nuevoEvento, titulo: e.target.value})} className="w-full bg-[#060d19] border border-slate-800 text-xs text-white rounded-xl px-3 py-2.5" />
                </div>
                <div>
                  <select value={nuevoEvento.nivel} onChange={e => setNuevoEvento({...nuevoEvento, nivel: e.target.value})} className="w-full bg-[#060d19] border border-amber-500/40 text-xs text-amber-300 font-bold rounded-xl px-3 py-2.5">
                    <option value="Formativo">🌱 Formativo</option>
                    <option value="Intermedio">⚡ Intermedio</option>
                    <option value="Competitivo">🏆 Competitivo</option>
                    <option value="Todos los Niveles">🌟 Todos los Niveles</option>
                  </select>
                </div>
                <div>
                  <select value={nuevoEvento.tipo} onChange={e => setNuevoEvento({...nuevoEvento, tipo: e.target.value})} className="w-full bg-[#060d19] border border-slate-800 text-xs text-white rounded-xl px-3 py-2.5">
                    <option value="basquet">🏀 Básquetbol</option>
                    <option value="voley">🏐 Voleibol</option>
                    <option value="multideporte">⚽ Multideporte</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 border-t border-slate-800/80 pt-4">
                <div>
                  <label className="block text-[11px] font-bold text-amber-400 mb-1">Fecha (Calendario)</label>
                  <input type="date" required value={nuevoEvento.fechaRaw} onChange={e => setNuevoEvento({...nuevoEvento, fechaRaw: e.target.value})} className="w-full bg-[#060d19] border border-slate-800 text-xs text-white rounded-xl px-4 py-2.5 cursor-pointer" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-teal-300 mb-1">Horario</label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input type="time" value={nuevoEvento.horaInicio} onChange={e => setNuevoEvento({...nuevoEvento, horaInicio: e.target.value})} className="w-full bg-[#060d19] border border-slate-800 text-xs text-white rounded-xl px-3 py-2" />
                    <input type="time" value={nuevoEvento.horaFin} onChange={e => setNuevoEvento({...nuevoEvento, horaFin: e.target.value})} className="w-full bg-[#060d19] border border-slate-800 text-xs text-white rounded-xl px-3 py-2" />
                  </div>
                </div>
              </div>

              {/* Sede autocompletada */}
              <div className="border-t border-slate-800/80 pt-4 space-y-3">
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-teal-300 mb-1">Sede Registrada</label>
                    <select value={nuevoEvento.sede} onChange={e => handleSeleccionarSedeEnEvento(e.target.value, false)} className="w-full bg-[#060d19] border border-teal-500/40 text-xs text-white rounded-xl px-3 py-2.5 cursor-pointer">
                      <option value="">-- Elige una sede --</option>
                      {sedes.map(s => (<option key={s.id} value={s.nombre}>📍 {s.nombre} ({s.distrito})</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Dirección</label>
                    <input type="text" value={nuevoEvento.ubicacion} onChange={e => setNuevoEvento({...nuevoEvento, ubicacion: e.target.value})} className="w-full bg-[#060d19] border border-slate-800 text-xs text-white rounded-xl px-3 py-2.5" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Google Maps</label>
                    <input type="url" value={nuevoEvento.maps} onChange={e => setNuevoEvento({...nuevoEvento, maps: e.target.value})} className="w-full bg-[#060d19] border border-slate-800 text-xs text-white rounded-xl px-3 py-2.5" />
                  </div>
                </div>
              </div>

              {/* Categorías FIBA */}
              <div className="border-t border-slate-800/80 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Categorías Oficiales FIBA:</label>
                  <button type="button" onClick={() => setMostrarManualNuevo(!mostrarManualNuevo)} className="text-[11px] text-teal-400 font-bold underline cursor-pointer">
                    {mostrarManualNuevo ? "Cerrar ingreso manual" : "➕ Ingreso manual"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {CATEGORIAS_FIBA.map((cat, idx) => {
                    const activa = nuevoEvento.categorias.includes(cat);
                    return (
                      <button type="button" key={idx} onClick={() => handleToggleCategoriaFIBA(cat, false)} className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${activa ? 'bg-teal-400 text-slate-950 border-teal-300' : 'bg-[#060d19] text-slate-400 border-slate-800'}`}>
                        {activa ? "✓ " : ""}{cat}
                      </button>
                    );
                  })}
                </div>
                {mostrarManualNuevo && (
                  <div className="p-3 bg-[#060d19] rounded-2xl border border-teal-900/60 flex gap-2 mb-3">
                    <input type="text" placeholder="Categoría personalizada..." value={categoriaManualTexto} onChange={e => setCategoriaManualTexto(e.target.value)} className="bg-[#081322] text-xs text-white rounded-xl px-3 py-2 flex-1" />
                    <button type="button" onClick={() => handleAgregarCategoriaManual(false)} className="bg-teal-500 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl">Añadir</button>
                  </div>
                )}
              </div>

              {/* Subir Flyer */}
              <div className="border-t border-slate-800/80 pt-4">
                <label className="block text-[11px] font-bold text-cyan-300 mb-2">Subir Flyer del Torneo (Desde tu PC)</label>
                <input type="file" multiple accept="image/*" onChange={(e) => handleImagenesDesdePC(e, false)} className="text-xs text-slate-400 cursor-pointer" />
                {nuevoEvento.imagenes.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {nuevoEvento.imagenes.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-20 rounded-xl overflow-hidden border border-teal-500/40">
                        <img src={img} alt="Flyer" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => quitarImagen(idx, false)} className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" disabled={subiendoImagenes} className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-6 py-3 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer">
                <Plus className="w-4 h-4" /> Guardar y Publicar Evento
              </button>
            </form>

            {/* Lista Eventos */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white">Eventos Publicados ({eventos.length})</h2>
              <div className="grid gap-4">
                {eventos.map(ev => (
                  <div key={ev.id} className={`p-5 rounded-2xl border flex justify-between items-center gap-4 ${ev.visible ? 'bg-[#081322] border-slate-800' : 'bg-slate-950 opacity-60'}`}>
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">{ev.estado}</span>
                      <h3 className="text-base font-bold text-white mt-1">{ev.titulo}</h3>
                      <p className="text-xs text-slate-400">📅 {ev.fecha} — 📍 {ev.sede}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleToggleVisibilidadEvento(ev)} className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer">{ev.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                      <button onClick={() => setEventoEnEdicion({...ev, fechaRaw: '', horaInicio: '09:00', horaFin: '18:00', imagenes: ev.imagenes || [], categorias: ev.categorias || []})} className="p-2 rounded-lg bg-[#0d1f36] text-teal-300 hover:bg-teal-500 hover:text-slate-950 cursor-pointer"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleEliminarEvento(ev.id)} className="p-2 text-slate-400 hover:text-red-400 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. SECCIÓN SEDES CON FOTOS DESDE PC */}
        {seccionActiva === 'sedes' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center pb-6 border-b border-slate-800">
              <h1 className="text-2xl font-black text-white">Sedes y Fotos de Canchas (Supabase)</h1>
              <Link to="/sedes?from=admin" className="bg-teal-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> Ver en Vivo
              </Link>
            </div>

            <form onSubmit={handleCrearSede} className="bg-[#081322] p-6 rounded-3xl border border-teal-900/40 space-y-3">
              <p className="text-xs font-bold text-teal-300 uppercase">+ Registrar Nueva Sede con Fotos</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <input type="text" required placeholder="Nombre de la sede..." value={nuevaSede.nombre} onChange={e => setNuevaSede({...nuevaSede, nombre: e.target.value})} className="bg-[#060d19] border border-slate-800 text-xs text-white rounded-xl px-3 py-2" />
                <input type="text" required placeholder="Distrito..." value={nuevaSede.distrito} onChange={e => setNuevaSede({...nuevaSede, distrito: e.target.value})} className="bg-[#060d19] border border-slate-800 text-xs text-white rounded-xl px-3 py-2" />
              </div>
              <input type="text" placeholder="Dirección completa..." value={nuevaSede.direccion} onChange={e => setNuevaSede({...nuevaSede, direccion: e.target.value})} className="w-full bg-[#060d19] border border-slate-800 text-xs text-white rounded-xl px-3 py-2" />
              <input type="url" placeholder="Enlace Google Maps..." value={nuevaSede.maps} onChange={e => setNuevaSede({...nuevaSede, maps: e.target.value})} className="w-full bg-[#060d19] border border-slate-800 text-xs text-white rounded-xl px-3 py-2" />
              
              <div>
                <label className="block text-[11px] font-bold text-teal-300 mb-1">Fotos de la Cancha / Coliseo (Desde tu PC):</label>
                <input type="file" multiple accept="image/*" onChange={(e) => handleImagenesSedeDesdePC(e, null)} className="text-xs text-slate-400 cursor-pointer" />
              </div>

              <button type="submit" className="bg-teal-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs cursor-pointer">Guardar Sede</button>
            </form>

            <div className="grid lg:grid-cols-2 gap-6">
              {sedes.map(sede => (
                <div key={sede.id} className="bg-[#081322] border border-slate-800 rounded-3xl p-6 space-y-4">
                  <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-300">{sede.distrito}</span>
                      <h3 className="text-lg font-bold text-white mt-1">{sede.nombre}</h3>
                      <p className="text-xs text-slate-400">{sede.direccion}</p>
                    </div>
                    <button onClick={() => handleEliminarSede(sede.id)} className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  
                  <div className="flex gap-2">
                    <input type="text" placeholder="Nuevo deporte..." value={sedeSeleccionadaId === sede.id ? nuevaDisciplina : ''} onFocus={() => setSedeSeleccionadaId(sede.id)} onChange={e => { setSedeSeleccionadaId(sede.id); setNuevaDisciplina(e.target.value); }} className="bg-[#060d19] text-xs p-1.5 rounded-lg flex-1 text-white" />
                    <button onClick={() => handleAgregarDisciplina(sede)} className="bg-slate-800 text-teal-300 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer">+ Deporte</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. SECCIÓN POSTULANTES CON CV */}
        {seccionActiva === 'postulantes' && (
          <div className="space-y-8">
            <h1 className="text-2xl font-black text-white">Postulaciones y CVs</h1>
            <form onSubmit={handleCrearPostulanteManual} className="bg-[#081322] p-6 rounded-3xl border border-teal-900/40 space-y-4">
              <p className="text-xs font-bold text-teal-300 uppercase">+ Registrar Candidato con CV</p>
              <div className="grid sm:grid-cols-3 gap-3">
                <input type="text" required placeholder="Nombre..." value={nuevoPostulante.nombre} onChange={e => setNuevoPostulante({...nuevoPostulante, nombre: e.target.value})} className="bg-[#060d19] border border-slate-800 text-xs text-white rounded-xl px-3 py-2 sm:col-span-2" />
                <input type="tel" required placeholder="Teléfono..." value={nuevoPostulante.telefono} onChange={e => setNuevoPostulante({...nuevoPostulante, telefono: e.target.value})} className="bg-[#060d19] border border-slate-800 text-xs text-white rounded-xl px-3 py-2" />
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <input type="email" placeholder="Email..." value={nuevoPostulante.email} onChange={e => setNuevoPostulante({...nuevoPostulante, email: e.target.value})} className="bg-[#060d19] border border-slate-800 text-xs text-white rounded-xl px-3 py-2" />
                <select value={nuevoPostulante.puesto} onChange={e => setNuevoPostulante({...nuevoPostulante, puesto: e.target.value})} className="bg-[#060d19] border border-slate-800 text-xs text-white rounded-xl px-3 py-2">
                  <option value="Entrenador(a) de Básquetbol">Entrenador Básquet</option>
                  <option value="Entrenador(a) de Voleibol">Entrenador Vóley</option>
                  <option value="Profesor(a) de Fútbol">Profesor Fútbol</option>
                </select>
                <input type="file" accept=".pdf,image/*" onChange={handleSubirCVDesdePC} className="text-xs text-slate-400 cursor-pointer" />
              </div>
              <button type="submit" className="bg-teal-400 text-slate-950 font-black px-6 py-2 rounded-xl text-xs cursor-pointer">Guardar Candidato</button>
            </form>

            <div className="bg-[#081322] rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0a182b] text-[11px] uppercase font-bold text-teal-400 border-b border-slate-800">
                  <tr><th className="p-4">Postulante</th><th className="p-4">Puesto</th><th className="p-4">CV</th><th className="p-4">Estado</th><th className="p-4 text-right">Contacto</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {postulaciones.map(pos => (
                    <tr key={pos.id}>
                      <td className="p-4 font-bold text-white">{pos.nombre}</td>
                      <td className="p-4">{pos.puesto}</td>
                      <td className="p-4">{pos.cv_url ? <a href={pos.cv_url} target="_blank" rel="noreferrer" download className="text-teal-300 font-bold underline">Descargar CV</a> : "Sin archivo"}</td>
                      <td className="p-4">
                        <select value={pos.estado} onChange={e => handleCambiarEstadoPostulante(pos.id, e.target.value)} className="bg-[#060d19] border border-slate-800 rounded px-2 py-1 text-white">
                          <option value="Pendiente">Pendiente</option><option value="Entrevistado">Entrevistado</option><option value="Aprobado">Aprobado</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <a href={`https://wa.me/51${pos.telefono}`} target="_blank" rel="noreferrer" className="text-teal-400 p-1"><MessageCircle className="w-4 h-4 inline" /></a>
                        <button onClick={() => handleEliminarPostulante(pos.id)} className="text-slate-500 hover:text-red-400 p-1 ml-2 cursor-pointer"><Trash2 className="w-4 h-4 inline" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. SECCIÓN TIENDA */}
        {seccionActiva === 'tienda' && (
          <div className="space-y-8">
            <h1 className="text-2xl font-black text-white">Tienda y Productos</h1>
            <form onSubmit={handleCrearProducto} className="bg-[#081322] p-6 rounded-3xl border border-teal-900/40 space-y-3">
              <div className="grid sm:grid-cols-3 gap-3">
                <input type="text" required placeholder="Producto..." value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} className="bg-[#060d19] border border-slate-800 text-xs text-white rounded-xl px-3 py-2 sm:col-span-2" />
                <input type="number" step="0.5" required placeholder="Precio..." value={nuevoProducto.precio} onChange={e => setNuevoProducto({...nuevoProducto, precio: e.target.value})} className="bg-[#060d19] border border-slate-800 text-xs text-white rounded-xl px-3 py-2" />
              </div>
              <input type="file" multiple accept="image/*" onChange={handleImagenesProductoDesdePC} className="text-xs text-slate-400 cursor-pointer" />
              <button type="submit" className="bg-cyan-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs cursor-pointer">Guardar en Tienda</button>
            </form>
          </div>
        )}

      </main>

    </div>
  );
}