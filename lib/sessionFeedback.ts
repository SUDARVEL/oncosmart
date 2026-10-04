export type SessionFeedback = 'easy' | 'hard' | 'tired';

const SESSION_FEEDBACK = new Set<SessionFeedback>(['easy', 'hard', 'tired']);

export function asSessionFeedback(value: unknown): SessionFeedback | null {
  return typeof value === 'string' && SESSION_FEEDBACK.has(value as SessionFeedback)
    ? (value as SessionFeedback)
    : null;
}
