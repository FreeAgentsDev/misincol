"use client";

import { useState, useEffect } from "react";
import { Modal } from "./modal";
import { Member, Activity } from "@/lib/types";

interface MemberViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  assignments: Activity[];
}

export function MemberViewModal({
  isOpen,
  onClose,
  member,
  assignments
}: MemberViewModalProps) {
  if (!member) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalles del miembro">
      <div className="space-y-6">
        {/* Información principal */}
        <div className="rounded-lg border border-sand-200 bg-white p-5 shadow-sm">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-cocoa-400 mb-2">
                Nombre
              </p>
              <p className="text-base font-semibold text-cocoa-900 leading-relaxed">{member.name}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-cocoa-400 mb-2">
                Rol
              </p>
              <p className="text-base font-semibold text-cocoa-900 leading-relaxed">{member.role}</p>
            </div>
            <div className="md:col-span-2 pt-4 border-t border-sand-100">
              <p className="text-xs font-bold uppercase tracking-wider text-cocoa-400 mb-2">
                Actividades asignadas
              </p>
              <div className="inline-flex items-center rounded-lg border border-brand-200 bg-brand-50 px-4 py-2">
                <p className="text-base font-bold text-brand-700">{assignments.length}</p>
              </div>
            </div>
          </div>
        </div>

        {assignments.length > 0 && (
          <div className="rounded-lg border border-sand-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cocoa-400 mb-4">
              Actividades asignadas
            </h3>
            <div className="space-y-3">
              {assignments.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-lg border border-sand-200 bg-white p-4 transition-all hover:border-brand-300 hover:shadow-md"
                >
                  <p className="font-semibold text-cocoa-900 mb-3 text-sm leading-snug">{activity.name}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-md border border-sand-200 bg-sand-50 px-2.5 py-1 text-xs font-medium text-cocoa-700">
                      Área: {activity.area}
                    </span>
                    <span className="inline-flex items-center rounded-md border border-sand-200 bg-sand-50 px-2.5 py-1 text-xs font-medium text-cocoa-700">
                      {activity.startDate} → {activity.endDate}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${
                        activity.status === "Hecha"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                          : "border-amber-300 bg-amber-50 text-amber-800"
                      }`}
                    >
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {assignments.length === 0 && (
          <div className="rounded-lg border border-dashed border-sand-300 bg-sand-50/30 p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-10 w-10 mx-auto mb-3 text-sand-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
              />
            </svg>
            <p className="text-sm font-medium text-cocoa-500">Sin actividades asignadas</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

interface MemberEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onSave: (member: Member) => void;
}

export function MemberEditModal({
  isOpen,
  onClose,
  member,
  onSave
}: MemberEditModalProps) {
  const [name, setName] = useState(member?.name || "");
  const [role, setRole] = useState(member?.role || "");

  useEffect(() => {
    if (member) {
      setName(member.name);
      setRole(member.role);
    }
  }, [member]);

  const handleSave = () => {
    if (member && name.trim() && role.trim()) {
      onSave({ ...member, name: name.trim(), role: role.trim() });
      onClose();
    }
  };

  if (!member) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar miembro">
      <div className="space-y-6">
        <div className="rounded-lg border border-sand-200 bg-white p-5 shadow-sm">
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-cocoa-400 mb-2.5">
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-sand-300 bg-white px-4 py-3 text-sm font-medium text-cocoa-900 placeholder:text-cocoa-400 transition-all focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:ring-offset-0"
                placeholder="Nombre del miembro"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-cocoa-400 mb-2.5">
                Rol
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSave();
                  }
                }}
                className="w-full rounded-lg border border-sand-300 bg-white px-4 py-3 text-sm font-medium text-cocoa-900 placeholder:text-cocoa-400 transition-all focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:ring-offset-0"
                placeholder="Rol del miembro"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-sand-200">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg border border-sand-300 bg-white px-5 py-2.5 text-sm font-semibold text-cocoa-700 transition-all hover:bg-sand-50 hover:border-sand-400 active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim() || !role.trim()}
            className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-600 active:scale-95"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </Modal>
  );
}

