-- MediFlow 3D Production Supabase Database Schema
-- Run this in Supabase SQL Editor

create extension if not exists "pgcrypto";

-- Drop existing tables if re-running
drop table if exists queue_tokens cascade;
drop table if exists cabins cascade;

-- Cabins Table
create table cabins (
  id uuid primary key default gen_random_uuid(),
  cabin_number text unique not null,
  department text not null,
  doctor_name text not null,
  status text default 'IN_CONSULTATION',
  current_token text
);

-- Queue Tokens Table
create table queue_tokens (
  id uuid primary key default gen_random_uuid(),
  token_number text unique not null,
  patient_name text not null,
  age integer not null,
  department text not null,
  symptoms text not null,
  urgency_level text default 'ROUTINE',
  priority_score integer default 10,
  estimated_mins integer default 10,
  status text default 'WAITING',
  ai_note text,
  created_at timestamptz default now()
);

-- Enable Realtime
alter publication supabase_realtime add table cabins;
alter publication supabase_realtime add table queue_tokens;

-- Enable Row Level Security (RLS)
alter table cabins enable row level security;
alter table queue_tokens enable row level security;

-- Public Access Policies for Demo / Hackathon
create policy "Public access cabins" on cabins for all using (true) with check (true);
create policy "Public access tokens" on queue_tokens for all using (true) with check (true);

-- Seed Initial Doctor Cabins
insert into cabins (cabin_number, department, doctor_name, status, current_token) values
  ('101', 'GENERAL_MEDICINE', 'Dr. Sarah Mitchell, MD', 'IN_CONSULTATION', 'TK-101'),
  ('102', 'CARDIOLOGY', 'Dr. Marcus Vance, FACC', 'IN_CONSULTATION', 'TK-102'),
  ('103', 'ORTHOPEDICS', 'Dr. Elena Rostova, MD', 'AVAILABLE', null)
on conflict (cabin_number) do nothing;

-- Seed Initial Queue Tokens
insert into queue_tokens (token_number, patient_name, age, department, symptoms, urgency_level, priority_score, estimated_mins, status, ai_note) values
  ('TK-101', 'Arthur Dent', 42, 'GENERAL_MEDICINE', 'Persistent high fever (102°F) and deep productive cough for 3 days', 'MODERATE', 55, 12, 'SERVING', 'Auscultation recommended. Monitor respiratory effort.'),
  ('TK-102', 'Clara Oswald', 29, 'CARDIOLOGY', 'Palpitations during light exertion, mild dizziness, resting HR 112 bpm', 'MODERATE', 65, 15, 'SERVING', '12-lead ECG and troponin screening indicated.'),
  ('TK-103', 'Johnathan Davis', 61, 'CARDIOLOGY', 'Substernal chest tightness radiating to left jaw, diaphoresis, acute onset', 'CRITICAL', 98, 5, 'WAITING', 'HIGH PRIORITY: Immediate triage to resuscitation bay or Cabin 102.'),
  ('TK-104', 'Emily Watson', 34, 'ORTHOPEDICS', 'Sudden right ankle inversion twist during marathon training, acute lateral swelling', 'MODERATE', 45, 10, 'WAITING', 'Ottawa Ankle Rules positive; bilateral plain radiographs recommended.'),
  ('TK-105', 'Liam Gallagher', 19, 'GENERAL_MEDICINE', 'Severe seasonal rhinorrhea, sneezing paroxysms, itchy conjunctiva', 'ROUTINE', 15, 8, 'WAITING', 'Standard allergic rhinitis profile; second-generation antihistamine protocol.'),
  ('TK-106', 'Sofia Ramirez', 52, 'GENERAL_MEDICINE', 'Bilateral burning epigastric discomfort exacerbated postprandially', 'ROUTINE', 25, 10, 'WAITING', 'Dyspepsia clinical workup; rule out H. pylori and dietary triggers.'),
  ('TK-107', 'Robert Chen', 70, 'ORTHOPEDICS', 'Chronic progressive right knee osteoarthritis flare with joint stiffness', 'MODERATE', 40, 12, 'WAITING', 'Evaluate joint effusion; consider intra-articular injection or physical therapy.')
on conflict (token_number) do nothing;
