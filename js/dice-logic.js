export function parseCSV(str) {
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

const DICE_MAP = [
  { min: 2, max: 4, type: 'd4', faces: 4 },
  { min: 5, max: 6, type: 'd6', faces: 6 },
  { min: 7, max: 8, type: 'd8', faces: 8 },
  { min: 9, max: 10, type: 'd10', faces: 10 },
  { min: 11, max: 12, type: 'd12', faces: 12 },
  { min: 13, max: Infinity, type: 'd20', faces: 20 },
];

export function getDiceType(n) {
  return DICE_MAP.find(d => n >= d.min && n <= d.max) ?? DICE_MAP[DICE_MAP.length - 1];
}

export function getFontSize(text) {
  const len = text.length;
  if (len <= 2) return 120;
  if (len <= 5) return 80;
  return 52;
}
