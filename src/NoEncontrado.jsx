import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
export default function NoEncontrado() {
  return <div className="min-h-screen bg-[#040914] text-white"><Navbar /><main className="min-h-[70vh] pt-36 pb-20 px-6 text-center space-y-6"><h1 className="text-4xl font-black">Página no encontrada</h1><p>El enlace puede haber cambiado. Puedes volver al inicio o buscar una sede.</p><div className="flex justify-center gap-5"><Link className="text-[#00B4A7] underline" to="/">Ir al inicio</Link><Link className="text-[#F7B52C] underline" to="/sedes">Ver sedes</Link></div></main><Footer /></div>;
}
