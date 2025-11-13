"use client";

import { useState, useEffect } from "react";
import { AreaObjective, PlanCategory } from "@/lib/types";
import { Modal } from "@/components/ui/modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (objective: Omit<AreaObjective, "id"> | AreaObjective) => void;
  objective?: AreaObjective | null;
  category: PlanCategory;
  planId: string;
}

export function ObjectiveModal({ isOpen, onClose, onSave, objective, category, planId }: Props) {
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (objective) {
      setDescription(objective.description);
    } else {
      setDescription("");
    }
    setError(null);
  }, [objective, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Por favor ingresa una descripción para el objetivo.");
      return;
    }
    setError(null);

    if (objective) {
      // Editar: mantener el id y otros campos
      onSave({
        id: objective.id,
        planId: objective.planId,
        category: objective.category,
        description: description.trim(),
        order: objective.order
      });
    } else {
      // Crear: solo enviar los datos básicos, el id se asignará en el padre
      onSave({
        planId,
        category,
        description: description.trim(),
        order: 0 // Se asignará en el componente padre
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={objective ? "Editar objetivo" : "Crear objetivo"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="relative overflow-hidden rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/90 to-amber-100/70 backdrop-blur-sm px-4 py-3 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-200/20 to-transparent pointer-events-none" />
            <div className="relative flex items-center gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center ring-2 ring-amber-300/50">
                <span className="text-amber-700 text-sm font-bold">!</span>
              </div>
              <p className="text-xs font-semibold text-amber-900 flex-1">
                {error}
              </p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-300/30 hover:bg-amber-400/40 flex items-center justify-center text-amber-700 hover:text-amber-900 transition-all"
              >
                <span className="text-xs font-bold leading-none">×</span>
              </button>
            </div>
          </div>
        )}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-semibold text-cocoa-700">
            Descripción del objetivo
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-sand-200 bg-white/70 px-4 py-3 text-sm text-cocoa-900 shadow-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-200/70"
            placeholder="Describe el objetivo de área..."
            required
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-sand-200 bg-white/70 px-4 py-2 text-sm font-semibold text-cocoa-700 transition hover:bg-sand-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-2xl border border-brand-200 bg-brand-50/70 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
          >
            {objective ? "Guardar cambios" : "Crear objetivo"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

