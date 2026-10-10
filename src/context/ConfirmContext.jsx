import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Modal from '../components/Modal';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback((opts) => {
    setState({ title: 'Are you sure?', confirmText: 'Delete', danger: true, ...opts });
    return new Promise((resolve) => { resolver.current = resolve; });
  }, []);

  const close = (result) => {
    resolver.current?.(result);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={!!state}
        onClose={() => close(false)}
        title={state?.title}
        size="sm"
        footer={
          <>
            <button className="btn-ghost" onClick={() => close(false)}>Cancel</button>
            <button className={state?.danger ? 'btn-danger' : 'btn-primary'} onClick={() => close(true)} autoFocus>
              {state?.confirmText}
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">{state?.message}</p>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
