"use client";

import { useState, useEffect } from "react";

interface EditableFieldProps {
  label: string;
  value: string | number;
  onSave: (value: string | number) => void;
  type?: "text" | "number";
  formatValue?: (value: string | number) => string;
  size?: "sm" | "md" | "lg";
}

export function EditableField({
  label,
  value,
  onSave,
  type = "text",
  formatValue,
  size = "lg"
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  useEffect(() => {
    setEditValue(value.toString());
  }, [value]);

  const handleSave = () => {
    const finalValue = type === "number" ? Number(editValue) : editValue;
    onSave(finalValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value.toString());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const textSizeClass =
    size === "sm"
      ? "text-sm"
      : size === "md"
        ? "text-lg"
        : "text-2xl font-bold";

  if (isEditing) {
    return (
      <div className="space-y-2 rounded-2xl border-2 border-brand-300 bg-brand-50/30 p-3 transition-all">
        <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">{label}</p>
        <div className="flex items-center gap-2">
          <input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 rounded-xl border-2 border-brand-300 bg-white px-4 py-2.5 text-sm font-semibold text-cocoa-900 shadow-sm transition-all focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:ring-offset-1"
            autoFocus
          />
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center rounded-xl border-2 border-emerald-300 bg-emerald-50 p-2.5 text-emerald-700 transition-all hover:bg-emerald-100 hover:border-emerald-400 hover:shadow-md active:scale-95"
            title="Guardar (Enter)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center justify-center rounded-xl border-2 border-amber-300 bg-amber-50 p-2.5 text-amber-700 transition-all hover:bg-amber-100 hover:border-amber-400 hover:shadow-md active:scale-95"
            title="Cancelar (Esc)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-500">{label}</p>
      <div className="mt-2 flex items-center justify-between">
        <p className={`${textSizeClass} text-brand-600`}>
          {formatValue ? formatValue(value) : value.toString()}
        </p>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="ml-2 opacity-0 transition group-hover:opacity-100 inline-flex items-center justify-center rounded-lg border border-brand-200 bg-white/90 p-1.5 text-xs text-brand-600 hover:bg-brand-50"
          title="Editar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}


