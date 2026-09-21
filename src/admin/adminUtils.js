import { supabase } from '../supabase';

export const subirArchivoStorage = async (file, carpeta = 'general') => {
  try {
    const extension = file.name.split('.').pop();
    const nombreLimpio = `${carpeta}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;

    // Bucket homologado: 'imagenes_web'
    const { data, error } = await supabase.storage
      .from('imagenes_web')
      .upload(nombreLimpio, file, { cacheControl: '3600', upsert: true });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('imagenes_web')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (err) {
    console.warn("Storage no disponible, usando compresión local:", err);
    return procesarArchivoImagen(file);
  }
};

export const procesarArchivoImagen = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
        const sizeKB = Math.round(dataUrl.length / 1024);
        console.warn(`⚠️ Imagen almacenada como base64 (${sizeKB} KB). Esto incrementa el tamaño de la base de datos. Verifica que Supabase Storage esté operativo.`);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export const formatearFecha = (fechaStr) => {
  if (!fechaStr) return "Por coordinar";
  try {
    const partes = fechaStr.split('-');
    const year = parseInt(partes.shift());
    const month = parseInt(partes.shift());
    const day = parseInt(partes.shift());
    return new Date(year, month - 1, day).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return fechaStr; }
};