import Navbar from './Navbar';
import Footer from './Footer';
import { useTerminos } from './queries';
export default function Terminos() {
  const { data: datos, isLoading, isError } = useTerminos();
  const estado = isLoading ? 'Cargando términos y políticas…' : isError ? 'No se pudieron cargar los términos. Recarga la página para reintentar.' : 'Los términos y políticas aún no se han publicado. Consulta las condiciones por WhatsApp antes de inscribirte.';
  return <div className="min-h-screen bg-[#040914] text-white"><Navbar /><main className="max-w-4xl mx-auto px-6 pt-32 pb-20 space-y-6"><h1 className="text-3xl font-black">{datos?.titulo || 'Términos y políticas'}</h1>{datos?.actualizado && <p className="text-slate-300">Actualización: {datos.actualizado}</p>}{datos ? <div className="space-y-6">{(Array.isArray(datos.puntos) ? datos.puntos : []).map((p,i)=><section key={i} className="bg-[#071527] p-6 rounded-2xl">{typeof p==='string' ? <p className="whitespace-pre-wrap">{p}</p> : <><h2 className="font-bold text-xl">{p.titulo}</h2><p className="whitespace-pre-wrap text-slate-300 mt-3">{p.contenido || p.descripcion || p.texto}</p></>}</section>)}</div> : <p role="status">{estado}</p>}</main><Footer /></div>;
}
