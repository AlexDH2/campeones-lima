import { createContext, useContext } from 'react';
// VALORES POR DEFECTO PARA QUE NUNCA DEVUELVA UNDEFINED NI ROMPA LA PANTALLA
const valoresPorDefecto = {
  tema: 'oscuro',
  esOscuro: true,
  alternarTema: () => {}
};

export const ThemeContext = createContext(valoresPorDefecto);

// HOOK BLINDADO: SI SE LLAMA FUERA DEL PROVIDER, DEVUELVE VALORES SEGUROS
export function useTheme() {
  const context = useContext(ThemeContext);
  return context || valoresPorDefecto;
}