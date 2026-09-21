import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';

// 1. Configuraciones de la web por conjunto de claves
export function useConfiguracionClaves(claves) {
  const claveOrdenada = [...claves].sort().join(',');
  return useQuery({
    queryKey: ['configuracion_web', claveOrdenada],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuracion_web')
        .select('clave, valor')
        .in('clave', claves)
        .throwOnError();

      if (error) throw error;
      const mapa = {};
      data?.forEach(item => { mapa[item.clave] = item.valor; });
      return mapa;
    },
  });
}

// 2. Catálogo de sedes con columnas específicas (evita select *)
export function useSedes() {
  return useQuery({
    queryKey: ['sedes_catalogo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sedes')
        .select('*')
        .order('nombre', { ascending: true })
        .throwOnError();

      if (error) throw error;
      return data || [];
    },
  });
}

// 3. Detalle completo de una sede (con su información complementaria)
export function useSedeDetalle(id) {
  return useQuery({
    queryKey: ['sede_detalle', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const [resSede, resConfig, resPagos, resPromos, resBanners] = await Promise.all([
        supabase.from('sedes').select('*').eq('id', id).maybeSingle(),
        supabase.from('configuracion_web').select('valor').eq('clave', 'precios_clase_modelo').maybeSingle(),
        supabase.from('configuracion_web').select('valor').eq('clave', 'metodos_pago_sedes').maybeSingle(),
        supabase.from('configuracion_web').select('valor').eq('clave', 'promociones_vigentes').maybeSingle(),
        supabase.from('configuracion_web').select('valor').eq('clave', 'banners_promociones_sedes').maybeSingle()
      ]);

      if (resSede.error) throw resSede.error;

      return {
        sede: resSede.data || null,
        preciosClaseModelo: resConfig.data?.valor || null,
        metodosPago: resPagos.data?.valor || null,
        promociones: Array.isArray(resPromos.data?.valor) ? resPromos.data.valor : [],
        banners: resBanners.data?.valor || null,
      };
    },
  });
}

// 4. Catálogo de productos de la tienda
export function useTiendaProductos() {
  return useQuery({
    queryKey: ['tienda_productos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuracion_web')
        .select('valor')
        .eq('clave', 'tienda_productos')
        .maybeSingle()
        .throwOnError();

      if (error) throw error;
      return Array.isArray(data?.valor) ? data.valor.filter(p => p && p.nombre) : [];
    },
  });
}

// 5. Listado de eventos públicos
export function useEventos() {
  return useQuery({
    queryKey: ['eventos_publicos'],
    queryFn: async () => {
      const [resEv, resDet] = await Promise.all([
        supabase
          .from('eventos')
          .select('*')
          .eq('visible', true)
          .order('id', { ascending: false }),
        supabase
          .from('configuracion_web')
          .select('valor')
          .eq('clave', 'eventos_detalles')
          .maybeSingle()
      ]);

      return {
        eventos: resEv.data || [],
        detallesEventos: resDet.data?.valor || {},
      };
    },
  });
}

// 6. Redes sociales (para Footer, WhatsApp global, etc.)
export function useRedesSociales() {
  return useQuery({
    queryKey: ['redes_sociales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuracion_web')
        .select('valor')
        .eq('clave', 'redes_sociales')
        .maybeSingle()
        .throwOnError();

      if (error) throw error;
      return data?.valor || {};
    },
  });
}

// 7. WhatsApp global — lee el número de redes_sociales con fallback
export function useWhatsAppGlobal() {
  const { data: redes } = useRedesSociales();
  return redes?.whatsapp || '51963896985';
}

// 8. Contenido de "Nosotros"
export function useNosotrosContenido() {
  return useQuery({
    queryKey: ['nosotros_contenido'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuracion_web')
        .select('valor')
        .eq('clave', 'nosotros_contenido')
        .maybeSingle()
        .throwOnError();

      if (error) throw error;
      return data?.valor || null;
    },
  });
}

// 9. Términos y condiciones
export function useTerminos() {
  return useQuery({
    queryKey: ['terminos_condiciones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuracion_web')
        .select('valor')
        .eq('clave', 'terminos_condiciones')
        .maybeSingle()
        .throwOnError();

      if (error) throw error;
      return data?.valor || null;
    },
  });
}

// 10. Convocatorias de trabajo
export function useConvocatorias() {
  return useQuery({
    queryKey: ['convocatorias_activas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('convocatorias')
        .select('*')
        .eq('visible', true)
        .order('id', { ascending: false })
        .throwOnError();

      if (error) throw error;
      return data || [];
    },
  });
}