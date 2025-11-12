"use client";

import { useState } from "react";
import { EditableField } from "./editable-field";

interface EditableMetricsProps {
  metrics: {
    population?: number;
    evangelicalCongregations?: number;
    evangelicals?: number;
  };
  onUpdate: (key: string, value: number) => void;
}

export function EditableMetrics({ metrics, onUpdate }: EditableMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <EditableField
        label="Población"
        value={metrics.population || 0}
        type="number"
        formatValue={(v) => (v as number).toLocaleString("es-CO")}
        onSave={(value) => onUpdate("population", Number(value))}
      />
      <EditableField
        label="Congregaciones evangélicas"
        value={metrics.evangelicalCongregations || 0}
        type="number"
        onSave={(value) => onUpdate("evangelicalCongregations", Number(value))}
      />
      <EditableField
        label="Evangélicos"
        value={metrics.evangelicals || 0}
        type="number"
        formatValue={(v) => (v as number).toLocaleString("es-CO")}
        onSave={(value) => onUpdate("evangelicals", Number(value))}
      />
    </div>
  );
}


