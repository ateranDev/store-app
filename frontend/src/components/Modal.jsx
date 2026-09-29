import { X } from 'lucide-react';

function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header fijo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenido con scroll interno */}
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>

        {/* Footer fijo (opcional) */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 shrink-0">{footer}</div>
        )}
      </div>
    </div>
  );
}

export default Modal;