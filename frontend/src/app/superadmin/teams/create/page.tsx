"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";

interface LeaderFormData {
  username: string;
  fullName: string;
  email: string;
  password: string;
}

interface TeamFormData {
  name: string;
  leaderId: string;
  budgetAssigned: string;
  members: Array<{ name: string; role: string }>;
  createNewLeader: boolean;
  newLeader: LeaderFormData;
}

export default function CreateTeam() {
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [teamFormData, setTeamFormData] = useState<TeamFormData>({
    name: "",
    leaderId: "",
    budgetAssigned: "",
    members: [],
    createNewLeader: false,
    newLeader: {
      username: "",
      fullName: "",
      email: "",
      password: ""
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newMember, setNewMember] = useState({ name: "", role: "" });

  // Mock de líderes existentes (en producción vendría de la base de datos)
  // Solo mostrar líderes que NO tienen equipo asignado
  const [existingLeaders] = useState<Array<{ id: string; name: string; hasTeam: boolean }>>([
    { id: "leader-1", name: "Juan Pérez", hasTeam: true },
    { id: "leader-2", name: "María García", hasTeam: true },
    { id: "leader-3", name: "Carlos Rodríguez", hasTeam: false }
  ]);

  const availableLeaders = existingLeaders.filter(l => !l.hasTeam);

  const handleCreateTeam = () => {
    setError(null);
    
    if (!teamFormData.name.trim()) {
      setError("Por favor ingresa un nombre para el equipo.");
      return;
    }

    if (teamFormData.createNewLeader) {
      // Validar datos del nuevo líder
      if (!teamFormData.newLeader.username.trim() || 
          !teamFormData.newLeader.fullName.trim() || 
          !teamFormData.newLeader.email.trim() || 
          !teamFormData.newLeader.password.trim()) {
        setError("Por favor completa todos los campos del líder.");
        return;
      }
      if (teamFormData.newLeader.password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        return;
      }
    } else {
      // Validar que se haya seleccionado un líder
      if (!teamFormData.leaderId) {
        setError("Por favor selecciona un líder para el equipo.");
        return;
      }
    }

    if (!teamFormData.budgetAssigned.trim() || parseFloat(teamFormData.budgetAssigned) <= 0) {
      setError("Por favor ingresa un presupuesto válido para el equipo.");
      return;
    }

    // Simular creación del equipo y líder si es necesario
    const leaderName = teamFormData.createNewLeader 
      ? teamFormData.newLeader.fullName 
      : availableLeaders.find(l => l.id === teamFormData.leaderId)?.name || "Líder";

    setSuccess(`Equipo "${teamFormData.name}" creado exitosamente${teamFormData.createNewLeader ? ` con nuevo líder "${leaderName}"` : ` con líder "${leaderName}"`}.`);
    
    // Resetear formulario
    setTeamFormData({
      name: "",
      leaderId: "",
      budgetAssigned: "",
      members: [],
      createNewLeader: false,
      newLeader: {
        username: "",
        fullName: "",
        email: "",
        password: ""
      }
    });
    setShowTeamForm(false);
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleAddMember = () => {
    if (newMember.name.trim() && newMember.role.trim()) {
      setTeamFormData({
        ...teamFormData,
        members: [...teamFormData.members, { ...newMember }]
      });
      setNewMember({ name: "", role: "" });
    }
  };

  const handleRemoveMember = (index: number) => {
    setTeamFormData({
      ...teamFormData,
      members: teamFormData.members.filter((_, i) => i !== index)
    });
  };

  const handleLeaderOptionChange = (createNew: boolean) => {
    setTeamFormData({
      ...teamFormData,
      createNewLeader: createNew,
      leaderId: createNew ? "" : teamFormData.leaderId,
      newLeader: createNew ? teamFormData.newLeader : {
        username: "",
        fullName: "",
        email: "",
        password: ""
      }
    });
  };

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-500">
            Gestión de equipos
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-cocoa-900">
            Crear nuevo equipo
          </h1>
          <p className="text-lg font-medium text-cocoa-600">
            Crea un nuevo equipo y asigna un líder. Si el líder no existe, puedes crearlo aquí.
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/90 to-amber-100/70 px-4 py-3 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center ring-2 ring-amber-300/50">
              <span className="text-amber-700 text-sm font-bold">!</span>
            </div>
            <p className="text-sm font-semibold text-amber-900 flex-1">{error}</p>
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

      {success && (
        <div className="rounded-2xl border-2 border-emerald-300/80 bg-gradient-to-br from-emerald-50/90 to-emerald-100/70 px-4 py-3 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-400/20 flex items-center justify-center ring-2 ring-emerald-300/50">
              <span className="text-emerald-700 text-sm font-bold">✓</span>
            </div>
            <p className="text-sm font-semibold text-emerald-900 flex-1">{success}</p>
            <button
              type="button"
              onClick={() => setSuccess(null)}
              className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-300/30 hover:bg-emerald-400/40 flex items-center justify-center text-emerald-700 hover:text-emerald-900 transition-all"
            >
              <span className="text-xs font-bold leading-none">×</span>
            </button>
          </div>
        </div>
      )}

      {/* Card para crear equipo */}
      <div className="card-elevated">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-cocoa-900">Crear nuevo equipo</h2>
            <p className="mt-1 text-sm text-cocoa-600">
              Crea un nuevo equipo y asigna un líder. Puedes seleccionar un líder existente sin equipo o crear uno nuevo.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowTeamForm(true)}
            className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 active:scale-95"
          >
            + Crear equipo
          </button>
        </div>
      </div>

      {/* Modal para crear equipo */}
      <Modal
        isOpen={showTeamForm}
        onClose={() => {
          setShowTeamForm(false);
          setError(null);
        }}
        title="Crear nuevo equipo"
        size="large"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateTeam();
          }}
          className="space-y-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-cocoa-400 mb-2.5">
                Nombre del equipo
              </label>
              <input
                type="text"
                value={teamFormData.name}
                onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
                className="w-full rounded-lg border border-sand-300 bg-white px-4 py-3 text-sm font-medium text-cocoa-900 placeholder:text-cocoa-400 transition-all focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                placeholder="Equipo de Evangelización Norte"
                required
              />
            </div>

            {/* Selección de líder */}
            <div className="rounded-lg border border-sand-200 bg-sand-50/50 p-4">
              <h3 className="text-sm font-semibold text-cocoa-900 mb-3">Líder del equipo</h3>
              <div className="space-y-3">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="leaderOption"
                      checked={!teamFormData.createNewLeader}
                      onChange={() => handleLeaderOptionChange(false)}
                      className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm font-medium text-cocoa-700">Seleccionar líder existente</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="leaderOption"
                      checked={teamFormData.createNewLeader}
                      onChange={() => handleLeaderOptionChange(true)}
                      className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm font-medium text-cocoa-700">Crear nuevo líder</span>
                  </label>
                </div>

                {!teamFormData.createNewLeader ? (
                  <div>
                    <select
                      value={teamFormData.leaderId}
                      onChange={(e) => setTeamFormData({ ...teamFormData, leaderId: e.target.value })}
                      className="w-full rounded-lg border border-sand-300 bg-white px-4 py-3 text-sm font-medium text-cocoa-900 transition-all focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      required={!teamFormData.createNewLeader}
                    >
                      <option value="">Selecciona un líder disponible</option>
                      {availableLeaders.map((leader) => (
                        <option key={leader.id} value={leader.id}>
                          {leader.name}
                        </option>
                      ))}
                    </select>
                    {availableLeaders.length === 0 && (
                      <p className="mt-2 text-xs text-cocoa-500">
                        No hay líderes disponibles sin equipo. Por favor crea un nuevo líder.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 rounded-lg border border-sand-200 bg-white p-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-cocoa-400 mb-2.5">
                        Nombre de usuario
                      </label>
                      <input
                        type="text"
                        value={teamFormData.newLeader.username}
                        onChange={(e) => setTeamFormData({
                          ...teamFormData,
                          newLeader: { ...teamFormData.newLeader, username: e.target.value }
                        })}
                        className="w-full rounded-lg border border-sand-300 bg-white px-4 py-3 text-sm font-medium text-cocoa-900 placeholder:text-cocoa-400 transition-all focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                        placeholder="juan.perez"
                        required={teamFormData.createNewLeader}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-cocoa-400 mb-2.5">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        value={teamFormData.newLeader.fullName}
                        onChange={(e) => setTeamFormData({
                          ...teamFormData,
                          newLeader: { ...teamFormData.newLeader, fullName: e.target.value }
                        })}
                        className="w-full rounded-lg border border-sand-300 bg-white px-4 py-3 text-sm font-medium text-cocoa-900 placeholder:text-cocoa-400 transition-all focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                        placeholder="Juan Pérez"
                        required={teamFormData.createNewLeader}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-cocoa-400 mb-2.5">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        value={teamFormData.newLeader.email}
                        onChange={(e) => setTeamFormData({
                          ...teamFormData,
                          newLeader: { ...teamFormData.newLeader, email: e.target.value }
                        })}
                        className="w-full rounded-lg border border-sand-300 bg-white px-4 py-3 text-sm font-medium text-cocoa-900 placeholder:text-cocoa-400 transition-all focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                        placeholder="juan.perez@example.com"
                        required={teamFormData.createNewLeader}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-cocoa-400 mb-2.5">
                        Contraseña
                      </label>
                      <input
                        type="password"
                        value={teamFormData.newLeader.password}
                        onChange={(e) => setTeamFormData({
                          ...teamFormData,
                          newLeader: { ...teamFormData.newLeader, password: e.target.value }
                        })}
                        className="w-full rounded-lg border border-sand-300 bg-white px-4 py-3 text-sm font-medium text-cocoa-900 placeholder:text-cocoa-400 transition-all focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                        placeholder="••••••••"
                        required={teamFormData.createNewLeader}
                        minLength={6}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-cocoa-400 mb-2.5">
                Presupuesto asignado
              </label>
              <input
                type="number"
                value={teamFormData.budgetAssigned}
                onChange={(e) => setTeamFormData({ ...teamFormData, budgetAssigned: e.target.value })}
                className="w-full rounded-lg border border-sand-300 bg-white px-4 py-3 text-sm font-medium text-cocoa-900 placeholder:text-cocoa-400 transition-all focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                placeholder="1000000"
                min="0"
                step="1000"
                required
              />
            </div>

            {/* Sección de miembros */}
            <div className="rounded-lg border border-sand-200 bg-sand-50/50 p-4">
              <h3 className="text-sm font-semibold text-cocoa-900 mb-3">Miembros del equipo (opcional)</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="flex-1 rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm font-medium text-cocoa-900 placeholder:text-cocoa-400 transition-all focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    placeholder="Nombre del miembro"
                  />
                  <input
                    type="text"
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="flex-1 rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm font-medium text-cocoa-900 placeholder:text-cocoa-400 transition-all focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    placeholder="Rol"
                  />
                  <button
                    type="button"
                    onClick={handleAddMember}
                    disabled={!newMember.name.trim() || !newMember.role.trim()}
                    className="rounded-lg border border-brand-300 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Agregar
                  </button>
                </div>
                {teamFormData.members.length > 0 && (
                  <div className="space-y-2">
                    {teamFormData.members.map((member, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border border-sand-200 bg-white px-3 py-2"
                      >
                        <span className="text-sm font-medium text-cocoa-700">
                          {member.name} · {member.role}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(index)}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 transition"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-sand-200">
            <button
              type="button"
              onClick={() => {
                setShowTeamForm(false);
                setError(null);
              }}
              className="inline-flex items-center justify-center rounded-lg border border-sand-300 bg-white px-5 py-2.5 text-sm font-semibold text-cocoa-700 transition-all hover:bg-sand-50 hover:border-sand-400 active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-md active:scale-95"
            >
              Crear equipo
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
