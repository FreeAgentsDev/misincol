import { cache } from "react";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  Activity,
  DashboardTeamMetrics,
  DevelopmentPlan,
  Member,
  PlanStatus,
  Team
} from "./types";

type RawRow = Record<string, string>;

const splitCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
};

const parseCsv = (raw: string): RawRow[] => {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return [];
  }

  const headers = splitCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    const row: RawRow = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    return row;
  });
};

const parseMembers = (input: string): Member[] => {
  if (!input) {
    return [];
  }

  return input.split("|").map((chunk) => {
    const [name = "", role = ""] = chunk.split(":");
    return {
      name: name.trim(),
      role: role.trim()
    };
  });
};

const parseNumber = (value: string): number => {
  const normalized = value.replace(/[^0-9.-]/g, "");
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const parsePlanStatus = (value: string): PlanStatus => {
  switch (value) {
    case "Activo":
    case "Finalizado":
    case "Archivado":
      return value;
    default:
      return "Activo";
  }
};

const buildDomain = (rows: RawRow[]): Team[] => {
  const teamsMap = new Map<string, Team>();

  rows.forEach((row) => {
    const teamId = row.team_id;
    if (!teamId) {
      return;
    }

    let team = teamsMap.get(teamId);
    if (!team) {
      team = {
        id: teamId,
        name: row.team_name ?? teamId,
        leader: row.team_leader ?? "",
        members: parseMembers(row.team_members ?? ""),
        budgetAssigned: parseNumber(row.team_budget_assigned ?? "0"),
        budgetLiquidated: 0,
        budgetPending: 0,
        plans: []
      };
      teamsMap.set(teamId, team);
    }

    const planId = row.plan_id;
    if (!planId) {
      return;
    }

    let plan = team.plans.find((entry) => entry.id === planId);
    if (!plan) {
      plan = {
        id: planId,
        teamId,
        name: row.plan_name ?? "",
        category: (row.plan_category as DevelopmentPlan["category"]) ?? "Investigación",
        status: parsePlanStatus(row.plan_status ?? ""),
        startDate: row.plan_start ?? "",
        endDate: row.plan_end ?? "",
        summary: row.plan_summary ?? "",
        activities: []
      };
      team.plans.push(plan);
    }

    const activityId = row.activity_id;
    if (!activityId) {
      return;
    }

    const activity: Activity = {
      id: activityId,
      teamId,
      planId,
      name: row.activity_name ?? "",
      responsable: row.activity_responsable ?? "",
      budgetTotal: parseNumber(row.activity_budget_total ?? "0"),
      budgetLiquidated: parseNumber(row.activity_budget_liquidated ?? "0"),
      status: (row.activity_status as Activity["status"]) ?? "Pendiente",
      stage: row.activity_stage ?? "",
      area: row.activity_area ?? "",
      objective: row.activity_objective ?? "",
      description: row.activity_description ?? "",
      currentSituation: row.activity_current_situation ?? "",
      goalMid: row.activity_goal_mid ?? "",
      goalLong: row.activity_goal_long ?? "",
      frequency: row.activity_frequency ?? "",
      timesPerYear: parseNumber(row.activity_times_year ?? "0"),
      startDate: row.activity_start ?? "",
      endDate: row.activity_end ?? "",
      totalWeeks: parseNumber(row.activity_total_weeks ?? "0"),
      remainingWeeks: parseNumber(row.activity_remaining_weeks ?? "0"),
      obstacles: row.activity_obstacles ?? ""
    };

    plan.activities.push(activity);
  });

  teamsMap.forEach((team) => {
    let liquidated = 0;
    let pending = 0;

    team.plans.forEach((plan) => {
      plan.activities.forEach((activity) => {
        liquidated += activity.budgetLiquidated;
        const remaining = Math.max(activity.budgetTotal - activity.budgetLiquidated, 0);
        if (activity.status === "Pendiente") {
          pending += remaining;
        }
      });
    });

    team.budgetLiquidated = liquidated;
    const calculatedPending = Math.max(team.budgetAssigned - liquidated, 0);
    team.budgetPending = pending > 0 ? pending : calculatedPending;
  });

  return Array.from(teamsMap.values());
};

export const loadTeams = cache(async (): Promise<Team[]> => {
  const filePath = path.join(process.cwd(), "public", "mock-data.csv");
  const rawContent = await readFile(filePath, "utf-8");
  const rows = parseCsv(rawContent);
  return buildDomain(rows);
});

export const loadDashboardMetrics = cache(
  async (): Promise<DashboardTeamMetrics[]> => {
    const teams = await loadTeams();

    return teams.map((team) => {
      const activePlan = team.plans.find((plan) => plan.status === "Activo");
      const completedPlans = team.plans.filter(
        (plan) => plan.status === "Finalizado"
      ).length;
      let pendingActivities = 0;
      let doneActivities = 0;

      team.plans.forEach((plan) => {
        plan.activities.forEach((activity) => {
          if (activity.status === "Hecha") {
            doneActivities += 1;
          } else {
            pendingActivities += 1;
          }
        });
      });

      return {
        teamId: team.id,
        teamName: team.name,
        leader: team.leader,
        activePlan,
        completedPlans,
        pendingActivities,
        doneActivities,
        budgetLiquidated: team.budgetLiquidated,
        budgetPending: team.budgetPending,
        budgetAssigned: team.budgetAssigned
      };
    });
  }
);

export const loadTeamById = cache(async (teamId: string): Promise<Team | null> => {
  const teams = await loadTeams();
  return teams.find((team) => team.id === teamId) ?? null;
});

