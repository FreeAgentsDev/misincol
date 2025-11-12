"use client";

import { ReactNode, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="fixed inset-0 bg-cocoa-900/60 backdrop-blur-md"
        aria-hidden="true"
      />
      <div
        className="relative z-50 w-full max-w-2xl rounded-2xl border border-sand-300/50 bg-white p-0 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.25)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con fondo sólido */}
        <div className="bg-gradient-to-r from-brand-50 to-sand-50 border-b border-sand-200 px-6 py-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-cocoa-900 tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg border border-sand-300 bg-white p-2 text-cocoa-500 transition-all hover:bg-sand-100 hover:text-cocoa-700 hover:border-sand-400 active:scale-95"
            title="Cerrar (Esc)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {/* Contenido con padding */}
        <div className="max-h-[calc(100vh-16rem)] overflow-y-auto bg-white">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

