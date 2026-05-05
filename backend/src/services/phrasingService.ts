import type { Database as SqliteDatabase } from "better-sqlite3";
import { createSubmissionRepository } from "../repositories/submissionRepository.js";
import { buildPhrasingPrompt } from "./phrasingPrompt.js";
import {
  ConfigurationError,
  createOpenAIResponsesClient,
  UpstreamGenerationError
} from "./openaiResponsesClient.js";
import type {
  PhrasingMeta,
  PhrasingModelClient,
  PhrasingRequestPayload,
  PhrasingResponse,
  PhrasingScenario
} from "../types/phrasing.js";

const SCENARIOS: PhrasingScenario[] = [
  { id: "anniversary", label: "纪念日" },
  { id: "first-stay", label: "首次入住" },
  { id: "late-arrival", label: "晚到" },
  { id: "one-night", label: "只住一晚" },
  { id: "quiet", label: "想要安静" },
  { id: "better-view", label: "更好景观" }
];

const GOAL_REQUESTS = ["房型升级", "更高楼层", "更好景观"] as const;
const TONES = ["礼貌自然", "稍微主动", "商务正式"] as const;

function withGuestTier(memberTiers: string[]) {
  return Array.from(new Set(["无会员", ...memberTiers]));
}

function isValidScenarioIds(ids: string[]) {
  const allowed = new Set(SCENARIOS.map((scenario) => scenario.id));
  return ids.every((id) => allowed.has(id));
}

export class InvalidPhrasingRequestError extends Error {}

export { ConfigurationError, UpstreamGenerationError };

export function createPhrasingService(
  db: SqliteDatabase,
  client: PhrasingModelClient = createOpenAIResponsesClient()
) {
  const repository = createSubmissionRepository(db);

  return {
    getMeta(): PhrasingMeta {
      return {
        member_tiers: withGuestTier(repository.getMemberTiers()),
        scenarios: SCENARIOS,
        goal_requests: [...GOAL_REQUESTS],
        tones: [...TONES]
      };
    },

    async generate(payload: PhrasingRequestPayload): Promise<PhrasingResponse> {
      const hotel = repository.findHotelById(payload.hotel_id);
      const memberTiers = withGuestTier(repository.getMemberTiers());

      if (
        !hotel ||
        !memberTiers.includes(payload.membership_level) ||
        !GOAL_REQUESTS.includes(payload.goal_request as (typeof GOAL_REQUESTS)[number]) ||
        !TONES.includes(payload.tone as (typeof TONES)[number]) ||
        !Array.isArray(payload.scenario_ids) ||
        !isValidScenarioIds(payload.scenario_ids)
      ) {
        throw new InvalidPhrasingRequestError("Invalid phrasing request");
      }

      const prompt = buildPhrasingPrompt({
        hotelName: hotel.hotel_name,
        payload: {
          ...payload,
          additional_context: payload.additional_context?.trim() || ""
        },
        scenarios: SCENARIOS
      });
      const message = (await client.generateText(prompt)).trim();

      if (!message) {
        throw new ConfigurationError("Empty phrasing response");
      }

      return {
        hotel_name: hotel.hotel_name,
        message
      };
    }
  };
}
