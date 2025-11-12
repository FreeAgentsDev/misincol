"use client";

import Link from "next/link";
import { Member, Activity } from "@/lib/types";

interface MembersSectionProps {
  members: Member[];
  activities: Activity[];
  teamId: string;
}

export function MembersSection({ members, activities, teamId }: MembersSectionProps) {
  const getAssignments = (member: Member): Activity[] => {
    return activities.filter((activity) => activity.responsable === member.name) ?? [];
  };

  return (
    <div className="mt-5 space-y-4">
      {members.map((member) => {
        const memberAssignments = getAssignments(member);
        
        return (
          <Link
            key={member.name}
            href={`/superadmin/teams/${teamId}/members`}
            className="block rounded-2xl border border-sand-200 bg-white/80 p-4 transition hover:border-brand-200 hover:bg-brand-50/60"
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
                  {memberAssignments.length > 0 ? (
                    memberAssignments.slice(0, 3).map((activity) => (
                      <span
                        key={activity.id}
                        className="rounded-full border border-sand-200 bg-white/90 px-3 py-1 shadow-sm"
                      >
                        {activity.name}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full border border-dashed border-sand-200 bg-white/70 px-3 py-1 text-cocoa-500">
                      Sin actividades asignadas
                    </span>
                  )}
                  {memberAssignments.length > 3 && (
                    <span className="rounded-full border border-sand-200 bg-sand-50/80 px-3 py-1 text-cocoa-600">
                      +{memberAssignments.length - 3} más
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

