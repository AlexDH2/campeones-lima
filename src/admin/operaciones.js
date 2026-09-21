export async function guardar(operacion) {
  try {
    const { error } = await operacion;
    if (error) throw error;
    return { ok: true, error: null };
  } catch (error) {
    const mensaje = error.message || 'Revisa tu conexión e intenta de nuevo.';
    console.error('Error al guardar:', mensaje);
    return { ok: false, error: mensaje };
  }
}
