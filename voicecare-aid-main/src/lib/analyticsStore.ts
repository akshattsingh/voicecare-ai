export interface TriageRecord {
  id: string;
  timestamp: Date;
  transcript: string;
  language: string;
  symptoms: string[];
  duration: string;
  severity: string;
  category: string;
  riskLevel: string;
  recommendation: string;
}

const STORAGE_KEY = "voicecare_records";

export function saveRecord(record: TriageRecord): void {
  const records = getRecords();
  records.unshift(record);
  // Keep last 100 records
  if (records.length > 100) records.pop();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function getRecords(): TriageRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getSymptomFrequency(): { symptom: string; count: number; percentage: number }[] {
  const records = getRecords();
  const freq: Record<string, number> = {};
  let total = 0;

  records.forEach((r) => {
    r.symptoms.forEach((s) => {
      const key = s.toLowerCase().trim();
      freq[key] = (freq[key] || 0) + 1;
      total++;
    });
  });

  return Object.entries(freq)
    .map(([symptom, count]) => ({
      symptom,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export function getRiskDistribution(): { level: string; count: number }[] {
  const records = getRecords();
  const dist: Record<string, number> = { HIGH: 0, MEDIUM: 0, LOW: 0 };

  records.forEach((r) => {
    dist[r.riskLevel] = (dist[r.riskLevel] || 0) + 1;
  });

  return Object.entries(dist).map(([level, count]) => ({ level, count }));
}
