export type Department = 'GENERAL_MEDICINE' | 'CARDIOLOGY' | 'ORTHOPEDICS';

export type UrgencyLevel = 'ROUTINE' | 'MODERATE' | 'CRITICAL';

export type CabinStatus = 'IN_CONSULTATION' | 'AVAILABLE' | 'ON_BREAK';

export type TokenStatus = 'WAITING' | 'SERVING' | 'COMPLETED' | 'CANCELLED';

export interface Cabin {
  id: string;
  cabin_number: string;
  department: Department;
  doctor_name: string;
  status: CabinStatus;
  current_token: string | null;
}

export interface QueueToken {
  id: string;
  token_number: string;
  patient_name: string;
  age: number;
  department: Department;
  symptoms: string;
  urgency_level: UrgencyLevel;
  priority_score: number;
  estimated_mins: number;
  status: TokenStatus;
  ai_note: string | null;
  created_at: string;
}

export interface TriageInput {
  patient_name: string;
  age: number;
  department: Department;
  symptoms: string;
}

export interface TriageAiOutput {
  urgency_level: UrgencyLevel;
  priority_score: number;
  estimated_mins: number;
  ai_note: string;
}

export interface ClinicState {
  cabins: Cabin[];
  queue: QueueToken[];
  history: QueueToken[];
  isRealtimeConnected: boolean;
  dataSource: 'supabase' | 'in-memory-fallback';
}
