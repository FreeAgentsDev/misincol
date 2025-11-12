"use client";

import { useState } from "react";
import { MemberViewModal, MemberEditModal } from "./member-modals";
import { Member, Team, DevelopmentPlan } from "@/lib/types";

interface MembersListProps {
  team: Team;
  activePlan?: DevelopmentPlan;
}

export function MembersList({ team, activePlan }: MembersListProps) {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const handleView = (member: Member) => {
    setSelectedMember(member);
    setViewModalOpen(true);
  };

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setEditModalOpen(true);
  };

  const handleSave = (updatedMember: Member) => {
    // Aquí se agregará la lógica de guardado más adelante
    console.log("Guardar miembro:", updatedMember);
  };

  const handleDelete = (member: Member) => {
    // Aquí se agregará la lógica de eliminación más adelante
    if (confirm(`¿Estás seguro de eliminar a ${member.name}?`)) {
      console.log("Eliminar miembro:", member);
    }
  };

  return (
    <>
      <div className="card-elevated">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-cocoa-900">Miembros actuales</h2>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1 text-xs font-semibold text-cocoa-600">
              {team.members.length} integrantes
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl border border-brand-200 bg-brand-50/70 px-4 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 hover:text-brand-800"
            >
              <span>➕</span>
              <span>Agregar miembro</span>
            </button>
          </div>
        </div>
        <div className="mt-5 space-y-4">
          {team.members.map((member) => {
            const assignments =
              activePlan?.activities.filter(
                (activity) => activity.responsable === member.name
              ) ?? [];

            return (
              <div
                key={member.name}
                className="rounded-2xl border border-sand-200 bg-white/80 p-4 transition hover:border-brand-200 hover:bg-brand-50/70"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-base font-semibold text-cocoa-900">{member.name}</p>
                    <p className="text-xs font-semibold text-cocoa-500">{member.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50/70 px-3 py-1 text-xs font-semibold text-brand-600">
                      Actividades: {assignments.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleView(member)}
                      className="inline-flex items-center justify-center rounded-xl border border-brand-200 bg-white/90 p-2 text-brand-600 transition hover:bg-brand-50 hover:text-brand-700"
                      title="Ver detalles del miembro"
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
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(member)}
                      className="inline-flex items-center justify-center rounded-xl border border-brand-200 bg-white/90 p-2 text-brand-600 transition hover:bg-brand-50 hover:text-brand-700"
                      title="Editar miembro"
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
                    <button
                      type="button"
                      onClick={() => handleDelete(member)}
                      className="inline-flex items-center justify-center rounded-xl border border-amber-200 bg-white/90 p-2 text-amber-600 transition hover:bg-amber-50 hover:text-amber-700"
                      title="Eliminar miembro"
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
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-cocoa-600">
                  {assignments.map((activity) => (
                    <span
                      key={activity.id}
                      className="rounded-full border border-sand-200 bg-white/90 px-3 py-1 shadow-sm"
                    >
                      {activity.name}
                    </span>
                  ))}
                  {assignments.length === 0 ? (
                    <span className="rounded-full border border-dashed border-sand-200 bg-white/70 px-3 py-1 text-cocoa-500">
                      Sin actividades asignadas
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <MemberViewModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        assignments={
          selectedMember
            ? activePlan?.activities.filter(
                (activity) => activity.responsable === selectedMember.name
              ) ?? []
            : []
        }
      />

      <MemberEditModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        onSave={handleSave}
      />
    </>
  );
}


