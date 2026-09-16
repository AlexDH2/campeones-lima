import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
export default function ModalFrame({ children, onClose, className, label = 'Detalle' }) {
  const ref = useRef(null);
  const cierre = useRef(onClose);
  useEffect(() => { cierre.current = onClose; }, [onClose]);
  useEffect(() => {
    const anterior = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const panel = ref.current;
    const enfocados = () => [...panel.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select,textarea,[tabindex="0"]')].filter(e=>e.getClientRects().length);
    (enfocados()[0] || panel).focus();
    function teclado(e) {
      if (e.key === 'Escape') { e.preventDefault(); cierre.current?.(); }
      if (e.key === 'Tab') {
        const items = enfocados(); const primero=items[0], ultimo=items.at(-1);
        if (!primero) { e.preventDefault(); panel.focus(); }
        else if (e.shiftKey && (document.activeElement===primero || document.activeElement===panel)) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && document.activeElement===ultimo) { e.preventDefault(); primero.focus(); }
      }
    }
    panel.addEventListener('keydown',teclado);
    return () => { panel.removeEventListener('keydown',teclado); document.body.style.overflow=overflow; if(anterior?.isConnected) anterior.focus(); };
  }, []);
  return createPortal(<div ref={ref} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} className={className}>{children}</div>, document.body);
}
