drop table if exists raw_upgrade_cases;
drop table if exists hotel_room_options;
drop table if exists upgrade_stats;
drop table if exists hotels;

create table hotels (
  id text primary key,
  name text not null,
  group_name text not null,
  brand_name text not null,
  city text not null,
  logo_url text,
  sample_count integer not null,
  latest_observed_at text not null,
  source_pool_desc text not null,
  editorial_note text not null,
  summary_text text not null
);

create table upgrade_stats (
  id text primary key,
  hotel_id text not null,
  member_tier text not null,
  room_bucket text not null,
  success_count integer not null,
  success_ratio real not null,
  tier_success_total integer not null,
  foreign key (hotel_id) references hotels(id)
);

create table raw_upgrade_cases (
  id text primary key,
  hotel_id text not null,
  observed_at text not null,
  booked_room_raw text not null,
  upgraded_room_raw text not null,
  member_tier text not null,
  stay_context text,
  foreign key (hotel_id) references hotels(id)
);

create table hotel_room_options (
  id text primary key,
  hotel_id text not null,
  room_name text not null,
  room_bucket text,
  foreign key (hotel_id) references hotels(id),
  unique (hotel_id, room_name)
);
