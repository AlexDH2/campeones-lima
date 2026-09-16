/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from './theme';

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => {
    try {
      return localStorage.getItem('tema_campeones') || 'oscuro';
    } catch {
      return 'oscuro';
    }
  });

  const esOscuro = tema === 'oscuro';

  useEffect(() => {
    try {
      localStorage.setItem('tema_campeones', tema);
      if (esOscuro) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.warn("No se pudo persistir el tema:", e);
    }
  }, [tema, esOscuro]);

  const alternarTema = () => {
    setTema(prev => (prev === 'oscuro' ? 'claro' : 'oscuro'));
  };

  return (
    <ThemeContext.Provider value={{ tema, esOscuro, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return { tema: 'oscuro', esOscuro: true, alternarTema: () => {} };
  }
  return context;
}