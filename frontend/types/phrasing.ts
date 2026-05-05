export type PhrasingScenario = {
  id: string;
  label: string;
};

export type PhrasingMeta = {
  member_tiers: string[];
  scenarios: PhrasingScenario[];
  goal_requests: string[];
  tones: string[];
};

export type PhrasingPayload = {
  hotel_id: string;
  scenario_ids: string[];
  membership_level: string;
  goal_request: string;
  tone: string;
  additional_context?: string;
};

export type PhrasingResponse = {
  hotel_name: string;
  message: string;
};
