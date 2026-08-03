/**
 * Shapes for the BDM Cost Accountability tab.
 * Ported from front-end/src/lib/api-endpoints.ts.
 */

export interface ApiCostAccountabilityData {
  overview: {
    totalMonthlyCost: number;
    salaryPct: number;
    expensesPct: number;
    bonusPct: number;
    bdmCount: number;
    territoryCount: number;
    avgCostPerTerritory: number;
    avgCostPerCase: number;
    totalCasesSold: number;
  };
  breakdown: {
    userId: string;
    name: string;
    email: string;
    monthlySalary: number;
    monthlyExpenses: number;
    bonusPerCase: number;
    totalMonthly: number;
    effectiveFrom: string;
    currency: string;
    estimatedBonus: number;
    totalWithBonus: number;
    casesSold: number;
    cpc: number;
  }[];
  trends:
    | {
        month: string;
        label: string;
        totalCost: number;
        casesSold: number;
        cpc: number;
      }[]
    | null;
  compare: {
    territory: string;
    bdmName: string;
    monthlyCost: number;
    casesSold: number;
    cpc: number;
    cpcGood: boolean;
    venues: number;
    costPerVenue: number;
  }[];
  milestones: {
    id: string;
    title: string;
    metric: string;
    targetValue: number;
    targetDate: string;
    achievedAt: string | null;
    achievedValue: number | null;
    notes: string | null;
    status: "achieved" | "on-track" | "at-risk" | "overdue";
  }[];
}

export interface ApiBdmCost {
  id: string;
  organization_id: string;
  user_id: string;
  monthly_salary: number;
  monthly_expenses: number;
  bonus_per_case: number;
  currency: string;
  effective_from: string;
  notes: string | null;
}

export interface ApiBdmCostRow {
  user_id: string;
  user_email: string;
  user_first_name: string | null;
  user_last_name: string | null;
  cost: ApiBdmCost | null;
}

export interface CreateMilestoneInput {
  title: string;
  metric: string;
  target_value: number;
  target_date: string;
  notes?: string | null;
}

export const MILESTONE_METRICS: Record<string, string> = {
  cpc: "Cost per Case",
  velocity: "Velocity",
  conversion_rate: "Conversion Rate",
  fulfilment_rate: "Fulfilment Rate",
  total_cost: "Total Cost",
  new_listings: "New Listings",
};
