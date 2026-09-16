export const MODULOS = ['dashboard', 'inicio', 'sedes', 'precios', 'categorias', 'pagos', 'eventos', 'tienda', 'nosotros', 'prospectos', 'trabaja', 'terminos'];

export function tienePermiso(usuario, modulo) {
  return Boolean(usuario && usuario.estado === 'activo' && (usuario.rol === 'Principal' || (modulo !== 'usuarios' && usuario.permisos?.includes(modulo))));
}

export function precioValido(valor) {
  if (valor === null || valor === undefined) return null;
  if (typeof valor === 'number') {
    return Number.isFinite(valor) && valor >= 0 ? valor : null;
  }
  if (typeof valor === 'string') {
    const limpio = valor.replace(/[^0-9.]/g, '').trim();
    if (!limpio) return null;
    const numero = Number(limpio);
    return Number.isFinite(numero) && numero >= 0 ? numero : null;
  }
  return null;
}

export function mostrarPrecio(valor) {
  const numero = precioValido(valor);
  return numero === null ? 'Por consultar' : `S/ ${numero.toFixed(2)}`;
}

export function fechaLima(fecha = new Date()) {
  const partes = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(fecha);
  const dato = tipo => partes.find(p => p.type === tipo).value;
  return `${dato('year')}-${dato('month')}-${dato('day')}`;
}

export function promocionVigente(promo, hoy = fechaLima()) {
  if (!promo || promo.visible_en_web === false) return false;
  const inicio = promo.fecha_inicio ? String(promo.fecha_inicio).slice(0, 10) : null;
  const fin = promo.valido_hasta ? String(promo.valido_hasta).slice(0, 10) : null;
  if (inicio && inicio > hoy) return false;
  return Boolean(promo.es_permanente || !fin || fin >= hoy);
}

export function estaSuspendida(sedeOValor) {
  if (!sedeOValor) return false;
  const val = typeof sedeOValor === 'object' ? sedeOValor.clases_suspendidas : sedeOValor;
  return val === true || val === 1 || val === 'true' || val === '1' || val === 't';
}

export function whatsappNumero(valor, defecto = '51963896985') {
  const numero = String(valor || '').replace(/\D/g, '');
  if (!numero) return defecto;
  return numero.length === 9 ? `51${numero}` : numero;
}

export function validarCv(archivo) {
  if (!archivo) return;
  if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)) throw new Error('El CV debe ser PDF, JPG, PNG o WebP.');
  if (archivo.size > 5 * 1024 * 1024) throw new Error('El CV no puede superar 5 MB.');
}

export function normalizarPagos(datos = {}) {
  const limpiarMascara = (texto) => {
    if (!texto) return '';
    const str = String(texto).trim();
    if (/X{3,}/i.test(str)) return '';
    return str;
  };

  return {
    yape_numero: datos?.yape?.numero || datos?.yape_numero || '',
    yape_titular: datos?.yape?.titular || datos?.yape_titular || '',
    plin_numero: datos?.plin?.numero || datos?.plin_numero || '',
    plin_titular: datos?.plin?.titular || datos?.plin_titular || '',
    bcp_cuenta: limpiarMascara(datos?.banco_bcp?.numero_cuenta || datos?.bcp_cuenta),
    bcp_cci: limpiarMascara(datos?.banco_bcp?.cci || datos?.bcp_cci),
    bcp_titular: datos?.banco_bcp?.titular || '',
    bbva_cuenta: limpiarMascara(datos?.banco_bbva?.numero_cuenta || datos?.bbva_cuenta),
    bbva_cci: limpiarMascara(datos?.banco_bbva?.cci || datos?.bbva_cci),
    bbva_titular: datos?.banco_bbva?.titular || '',
    indicaciones: datos?.indicaciones || '',
  };
}

export function validarCatalogoSeguro(nuevoCatalogo, catalogoPrevio = []) {
  if (!Array.isArray(nuevoCatalogo)) throw new Error('Formato de catálogo inválido.');
  if (nuevoCatalogo.length === 0 && Array.isArray(catalogoPrevio) && catalogoPrevio.length > 0) {
    throw new Error('Bloqueo de seguridad: No se permite guardar un catálogo vacío sobre datos existentes.');
  }
  return true;
}