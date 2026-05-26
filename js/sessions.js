const STORAGE_KEY = 'dice_sessions';

export const DEFAULT_SESSIONS = [
  { label: '1/X/2',  csv: '1,X,2' },
  { label: '1/X/2+', csv: '1, X, 2, No Gol, Gol, Under, Over' },
  { label: '1-10',   csv: '1,2,3,4,5,6,7,8,9,10' },
  { label: 'Amici',  csv: 'Fel,Cos,Mul,Sec,Luc,Max,Fab,Cla,Ian' },
  { label: 'Esiti',  csv: 'Under, Over, No Gol, Gol' },
];

export function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_SESSIONS];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_SESSIONS];
  } catch {
    return [...DEFAULT_SESSIONS];
  }
}

export function saveSession(sessions, csv) {
  const label = csv.split(',')[0].trim() || '?';
  const filtered = sessions.filter(s => s.csv !== csv);
  const updated = [{ label, csv }, ...filtered].slice(0, 5);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
  return updated;
}

export function storeSessions(sessions) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)); } catch {}
}
