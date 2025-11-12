"use client";

import { useState } from "react";
import { PlanCategory, Activity } from "@/lib/types";

interface PlanAreasTabsProps {
  areas: PlanCategory[];
  selectedArea: PlanCategory;
  onAreaChange: (area: PlanCategory) => void;
}

const areaColors: Record<PlanCategory, { text: string; border: string }> = {
  Investigación: { text: "text-blue-600", border: "border-red-600" },
  Encarnación: { text: "text-gray-600", border: "border-green-600" },
  Evangelización: { text: "text-gray-600", border: "border-purple-600" },
  Entrenamiento: { text: "text-gray-600", border: "border-gray-800" },
  Autocuidado: { text: "text-gray-600", border: "border-pink-500" }
};

export function PlanAreasTabs({ areas, selectedArea, onAreaChange }: PlanAreasTabsProps) {
  return (
    <div className="border-b border-sand-200 bg-white">
      <div className="flex space-x-1 overflow-x-auto">
        {areas.map((area) => {
          const isSelected = selectedArea === area;
          const colors = areaColors[area];
          
          return (
            <button
              key={area}
              type="button"
              onClick={() => onAreaChange(area)}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-semibold transition ${
                isSelected ? colors.text : "text-gray-600"
              }`}
            >
              <span>{area}</span>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              {isSelected && (
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${colors.border}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}


