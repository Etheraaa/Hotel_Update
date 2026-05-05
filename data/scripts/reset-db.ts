import type { Database as SqliteDatabase } from "better-sqlite3";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

type HotelSeed = {
  id: string;
  name: string;
  group_name: string;
  brand_name: string;
  city: string;
  logo_url: string | null;
  sample_count: number;
  latest_observed_at: string;
  source_pool_desc: string;
  editorial_note: string;
  summary_text: string;
};

type UpgradeStatSeed = {
  id: string;
  hotel_id: string;
  member_tier: string;
  room_bucket: string;
  success_count: number;
  success_ratio: number;
  tier_success_total: number;
};

type RawUpgradeCaseSeed = {
  id: string;
  hotel_id: string;
  observed_at: string;
  booked_room_raw: string;
  upgraded_room_raw: string;
  member_tier: string;
  stay_context: string | null;
};

type RoomOptionSeed = {
  id: string;
  hotel_id: string;
  room_name: string;
  room_bucket: string | null;
};

const dataDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const requireFromBackend = createRequire(new URL("../../backend/package.json", import.meta.url));
const Database = requireFromBackend("better-sqlite3") as typeof import("better-sqlite3");

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function resetDatabase(db: SqliteDatabase) {
  const schemaSql = readFileSync(join(dataDir, "migrations", "001_init.sql"), "utf8");
  const hotels = readJson<HotelSeed[]>(join(dataDir, "seeds", "hotels.seed.json"));
  const upgradeStats = readJson<UpgradeStatSeed[]>(
    join(dataDir, "seeds", "upgrade-stats.seed.json")
  );
  const rawCases = readJson<RawUpgradeCaseSeed[]>(
    join(dataDir, "seeds", "raw-upgrade-cases.seed.json")
  );
  const roomOptions = readJson<RoomOptionSeed[]>(join(dataDir, "seeds", "room-options.seed.json"));

  db.exec(schemaSql);

  const insertHotel = db.prepare(`
    insert into hotels (
      id, name, group_name, brand_name, city, logo_url, sample_count,
      latest_observed_at, source_pool_desc, editorial_note, summary_text
    ) values (
      @id, @name, @group_name, @brand_name, @city, @logo_url, @sample_count,
      @latest_observed_at, @source_pool_desc, @editorial_note, @summary_text
    )
  `);

  const insertUpgradeStat = db.prepare(`
    insert into upgrade_stats (
      id, hotel_id, member_tier, room_bucket, success_count, success_ratio, tier_success_total
    ) values (
      @id, @hotel_id, @member_tier, @room_bucket, @success_count, @success_ratio, @tier_success_total
    )
  `);

  const insertRawCase = db.prepare(`
    insert into raw_upgrade_cases (
      id, hotel_id, observed_at, booked_room_raw, upgraded_room_raw, member_tier, stay_context
    ) values (
      @id, @hotel_id, @observed_at, @booked_room_raw, @upgraded_room_raw, @member_tier, @stay_context
    )
  `);

  const insertRoomOption = db.prepare(`
    insert into hotel_room_options (
      id, hotel_id, room_name, room_bucket
    ) values (
      @id, @hotel_id, @room_name, @room_bucket
    )
  `);

  const transaction = db.transaction(() => {
    hotels.forEach((hotel) => insertHotel.run(hotel));
    upgradeStats.forEach((stat) => insertUpgradeStat.run(stat));
    rawCases.forEach((rawCase) => insertRawCase.run(rawCase));
    roomOptions.forEach((roomOption) => insertRoomOption.run(roomOption));
  });

  transaction();
}

export function resetDatabaseFile(path: string) {
  const db = new Database(path);

  try {
    resetDatabase(db);
  } finally {
    db.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  resetDatabaseFile(join(dataDir, "app.db"));
}
