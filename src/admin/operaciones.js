export async function guardar(operacion) {
  try {
    const { error } = await operacion;
    if (error) throw error;
    return true;
  } catch (error) {
    window.alert(`No se pudo guardar. Tus cambios no se han confirmado. ${error.message || 'Revisa tu conexión e intenta de nuevo.'}`);
    return false;
  }
}
