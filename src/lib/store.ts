import { Cabin, QueueToken, TriageAiOutput, TriageInput, TokenStatus, CabinStatus } from './types';
import { initialCabins, initialTokens } from './mockData';
import { supabase, isSupabaseConfigured } from './supabase';

interface MemoryStore {
  cabins: Cabin[];
  tokens: QueueToken[];
  tokenCounter: number;
}

// Global in-memory storage singleton for serverless runtime fallback
declare global {
  // eslint-disable-next-line no-var
  var __mediflowStore: MemoryStore | undefined;
}

function getMemoryStore(): MemoryStore {
  if (!global.__mediflowStore) {
    global.__mediflowStore = {
      cabins: JSON.parse(JSON.stringify(initialCabins)),
      tokens: JSON.parse(JSON.stringify(initialTokens)),
      tokenCounter: 108,
    };
  }
  return global.__mediflowStore;
}

export async function getClinicState() {
  const memStore = getMemoryStore();

  if (isSupabaseConfigured && supabase) {
    try {
      const [cabinsRes, tokensRes] = await Promise.all([
        supabase.from('cabins').select('*').order('cabin_number', { ascending: true }),
        supabase.from('queue_tokens').select('*').order('created_at', { ascending: true }),
      ]);

      if (!cabinsRes.error && !tokensRes.error && cabinsRes.data && tokensRes.data && cabinsRes.data.length > 0) {
        const waitingQueue = (tokensRes.data as QueueToken[])
          .filter((t) => t.status === 'WAITING')
          .sort((a, b) => {
            if (b.priority_score !== a.priority_score) {
              return b.priority_score - a.priority_score;
            }
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          });

        return {
          cabins: cabinsRes.data as Cabin[],
          queue: waitingQueue,
          allTokens: tokensRes.data as QueueToken[],
          dataSource: 'supabase' as const,
        };
      }
    } catch (err) {
      console.warn('[MediFlow] Supabase query error, using in-memory store:', err);
    }
  }

  // Fallback to in-memory store
  const waitingQueue = memStore.tokens
    .filter((t) => t.status === 'WAITING')
    .sort((a, b) => {
      if (b.priority_score !== a.priority_score) {
        return b.priority_score - a.priority_score;
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

  return {
    cabins: memStore.cabins,
    queue: waitingQueue,
    allTokens: memStore.tokens,
    dataSource: 'in-memory-fallback' as const,
  };
}

export async function createPatientToken(input: TriageInput, aiOutput: TriageAiOutput): Promise<QueueToken> {
  const memStore = getMemoryStore();
  const tokenNumber = `TK-${memStore.tokenCounter++}`;

  const newToken: QueueToken = {
    id: `tok-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    token_number: tokenNumber,
    patient_name: input.patient_name,
    age: input.age,
    department: input.department,
    symptoms: input.symptoms,
    urgency_level: aiOutput.urgency_level,
    priority_score: aiOutput.priority_score,
    estimated_mins: aiOutput.estimated_mins,
    status: 'WAITING',
    ai_note: aiOutput.ai_note,
    created_at: new Date().toISOString(),
  };

  // Add to in-memory store
  memStore.tokens.push(newToken);

  // If Supabase is active, persist to database
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('queue_tokens').insert([
        {
          token_number: newToken.token_number,
          patient_name: newToken.patient_name,
          age: newToken.age,
          department: newToken.department,
          symptoms: newToken.symptoms,
          urgency_level: newToken.urgency_level,
          priority_score: newToken.priority_score,
          estimated_mins: newToken.estimated_mins,
          status: newToken.status,
          ai_note: newToken.ai_note,
          created_at: newToken.created_at,
        },
      ]);
    } catch (err) {
      console.warn('[MediFlow] Failed to insert token into Supabase:', err);
    }
  }

  return newToken;
}

export async function advanceCabinQueue(cabinNumber: string) {
  const memStore = getMemoryStore();
  const cabin = memStore.cabins.find((c) => c.cabin_number === cabinNumber);

  if (!cabin) {
    throw new Error(`Cabin ${cabinNumber} not found`);
  }

  // 1. Complete existing active token in this cabin
  if (cabin.current_token) {
    const existingToken = memStore.tokens.find((t) => t.token_number === cabin.current_token);
    if (existingToken) {
      existingToken.status = 'COMPLETED';
    }
  }

  // 2. Find next patient for this cabin's department, sorted by priority score then age/time
  const deptWaiting = memStore.tokens
    .filter((t) => t.status === 'WAITING' && t.department === cabin.department)
    .sort((a, b) => {
      if (b.priority_score !== a.priority_score) return b.priority_score - a.priority_score;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

  // If no matching department waiting, pick any waiting patient with CRITICAL priority, or general waiting
  let nextPatient = deptWaiting[0];
  if (!nextPatient) {
    const criticalWaiting = memStore.tokens
      .filter((t) => t.status === 'WAITING')
      .sort((a, b) => b.priority_score - a.priority_score)[0];
    if (criticalWaiting && criticalWaiting.urgency_level === 'CRITICAL') {
      nextPatient = criticalWaiting;
    }
  }

  if (nextPatient) {
    nextPatient.status = 'SERVING';
    cabin.current_token = nextPatient.token_number;
    cabin.status = 'IN_CONSULTATION';
  } else {
    cabin.current_token = null;
    cabin.status = 'AVAILABLE';
  }

  // Sync to Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      if (cabin.current_token) {
        await supabase
          .from('queue_tokens')
          .update({ status: 'SERVING' })
          .eq('token_number', cabin.current_token);
      }
      await supabase
        .from('cabins')
        .update({
          status: cabin.status,
          current_token: cabin.current_token,
        })
        .eq('cabin_number', cabin.cabin_number);
    } catch (err) {
      console.warn('[MediFlow] Supabase sync failed on advance:', err);
    }
  }

  return {
    cabin,
    nextPatient: nextPatient || null,
  };
}

export async function addEmergencyCase(params?: {
  patient_name?: string;
  department?: 'GENERAL_MEDICINE' | 'CARDIOLOGY' | 'ORTHOPEDICS';
  symptoms?: string;
}) {
  const patientName = params?.patient_name || 'Emergency Red Code Patient';
  const department = params?.department || 'CARDIOLOGY';
  const symptoms = params?.symptoms || 'Acute STEMI symptoms: severe substernal crushing pain, diaphoresis, hypotension';

  const triageInput: TriageInput = {
    patient_name: patientName,
    age: 58,
    department,
    symptoms,
  };

  const aiOutput: TriageAiOutput = {
    urgency_level: 'CRITICAL',
    priority_score: 99,
    estimated_mins: 5,
    ai_note: 'CRITICAL STAT: Immediate resuscitation / cardiology consultation priority dispatched.',
  };

  return createPatientToken(triageInput, aiOutput);
}

export async function resetClinicDemo() {
  const memStore = getMemoryStore();
  memStore.cabins = JSON.parse(JSON.stringify(initialCabins));
  memStore.tokens = JSON.parse(JSON.stringify(initialTokens));
  memStore.tokenCounter = 108;

  if (isSupabaseConfigured && supabase) {
    try {
      // Clean and reseed Supabase
      await supabase.from('queue_tokens').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('cabins').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      for (const c of initialCabins) {
        await supabase.from('cabins').insert([{
          cabin_number: c.cabin_number,
          department: c.department,
          doctor_name: c.doctor_name,
          status: c.status,
          current_token: c.current_token,
        }]);
      }

      for (const t of initialTokens) {
        await supabase.from('queue_tokens').insert([{
          token_number: t.token_number,
          patient_name: t.patient_name,
          age: t.age,
          department: t.department,
          symptoms: t.symptoms,
          urgency_level: t.urgency_level,
          priority_score: t.priority_score,
          estimated_mins: t.estimated_mins,
          status: t.status,
          ai_note: t.ai_note,
        }]);
      }
    } catch (err) {
      console.warn('[MediFlow] Supabase demo reset error:', err);
    }
  }

  return { success: true, message: 'Demo successfully reset to fresh state' };
}
