import type { SessionDisplayLabel, SessionRepType } from './getDay1Session';

export type ParsedPathwayFile = {
  /** Sort key — lower first; ties broken by full filename. */
  sortOrder: number;
  sortTieBreak: string;
  /** Human label from filename (no leading order number). */
  rawLabel: string;
  repType: SessionRepType;
  repValue: number;
  displayValue: string;
  displayLabel: SessionDisplayLabel;
};

const ORDER_PREFIX = /^(\d+)\s*[.,]?\s*/;

export function parsePathwayFilename(fileName: string): ParsedPathwayFile {
  const base = fileName.replace(/\.mp4$/i, '').trim();
  const orderMatch = ORDER_PREFIX.exec(base);
  const sortOrder = orderMatch ? Number(orderMatch[1]) : 9999;
  const rawLabel = orderMatch ? base.slice(orderMatch[0].length).trim() : base;

  const lower = rawLabel.toLowerCase();
  if (/\b1\s*min\b/i.test(rawLabel) || lower.includes('1min')) {
    return {
      sortOrder,
      sortTieBreak: fileName,
      rawLabel,
      repType: 'duration',
      repValue: 60,
      displayValue: '01',
      displayLabel: 'MINS',
    };
  }

  const repsMatch = /(\d+)\s*reps/i.exec(rawLabel) ?? /(\d+)\s*eps/i.exec(rawLabel);
  if (repsMatch) {
    const count = Number(repsMatch[1]);
    const safe = Number.isFinite(count) && count > 0 ? count : 5;
    const padded = safe < 10 ? `0${safe}` : String(safe);
    return {
      sortOrder,
      sortTieBreak: fileName,
      rawLabel,
      repType: 'reps',
      repValue: safe,
      displayValue: padded,
      displayLabel: 'REPS',
    };
  }

  // Stretches / some clips have no rep suffix — show as 30 sec hold default.
  return {
    sortOrder,
    sortTieBreak: fileName,
    rawLabel,
    repType: 'duration',
    repValue: 30,
    displayValue: '30',
    displayLabel: 'SECS',
  };
}

export function comparePathwayFiles(a: ParsedPathwayFile, b: ParsedPathwayFile): number {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.sortTieBreak.localeCompare(b.sortTieBreak);
}
