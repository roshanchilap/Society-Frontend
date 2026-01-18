import { useEffect } from "react";

export default function Modal({ title, children, onClose, footer }) {
  // Close modal on ESC key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Soft overlay */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div
        className="relative bg-white w-full max-w-sm rounded-xl shadow-2xl 
                   animate-scaleIn max-h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="text-lg font-medium text-gray-800">{title}</h2>

          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg
                       hover:bg-gray-100 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-3 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-3 flex justify-end gap-3 bg-white">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
