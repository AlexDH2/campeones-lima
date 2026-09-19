import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  tema: 'oscuro',
  alternarTema: () => {}
});

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => {
    return localStorage.getItem('ccl_tema') || 'oscuro';
  });

  useEffect(() => {
    localStorage.setItem('ccl_tema', tema);
    if (tema === 'oscuro') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [tema]);

  const alternarTema = () => {
    setTema(prev => (prev === 'oscuro' ? 'claro' : 'oscuro'));
  };

  return (
    <ThemeContext.Provider value={{ tema, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}