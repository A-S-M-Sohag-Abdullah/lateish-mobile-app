export const ACCOUNT_PLACEHOLDER = "Select a market";

export const INTERACTION_TYPE_PLACEHOLDER = "Select a type";
export const INTERACTION_TYPE_OPTIONS = [
  INTERACTION_TYPE_PLACEHOLDER,
  "Visit",
  "Call",
  "Tasting",
  "Email",
  "Follow-up",
] as const;

export const NEXT_ACTION_PLACEHOLDER = "Select";
export const NEXT_ACTION_OPTIONS = [
  NEXT_ACTION_PLACEHOLDER,
  "Schedule visit",
  "Send samples",
  "Follow-up call",
  "Send pricing",
  "No action",
] as const;

/** Fields the rep frequently forgets, shown in the amber insight banner. */
export const FREQUENTLY_MISSED = [
  "Brand Notes",
  "Case Price",
  "Blocker Type",
  "ROS Estimate",
] as const;
