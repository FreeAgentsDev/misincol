"use client";

import { useState } from "react";
import { Member, Activity } from "@/lib/types";
import { MemberViewModal, MemberEditModal } from "./member-modals";

interface MembersSectionProps {
  members: Member[];
  activities: Activity[];
}

export function MembersSection({ members, activities }: MembersSectionProps) {
  const getAssignments = (member: Member): Activity[] => {
    return activities.filter((activity) => activity.responsable === member.name) ?? [];
  };
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
      <div className="mt-5 space-y-4">
        {members.map((member) => {
          const memberAssignments = getAssignments(member);
          return (
            <div
              key={member.name}
              className="rounded-2xl border border-sand-200 bg-white/80 p-4 transition hover:border-brand-200 hover:bg-brand-50/60"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-base font-semibold text-cocoa-900">{member.name}</p>
                      <p className="text-xs font-semibold text-cocoa-500">{member.role}</p>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1 text-xs font-semibold text-cocoa-600">
                      Actividades asignadas: {memberAssignments.length}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-cocoa-600">
                    {memberAssignments.map((activity) => (
                      <span
                        key={activity.id}
                        className="rounded-full border border-sand-200 bg-white/90 px-3 py-1 shadow-sm"
                      >
                        {activity.name}
                      </span>
                    ))}
                    {memberAssignments.length === 0 ? (
                      <span className="rounded-full border border-dashed border-sand-200 bg-white/70 px-3 py-1 text-cocoa-500">
                        Sin actividades asignadas
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <MemberViewModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        assignments={selectedMember ? getAssignments(selectedMember) : []}
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

