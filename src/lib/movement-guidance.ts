/** Guidance reflects reported symptoms; step totals never imply an acute flare. */
export function getPainGuidance(pain: number | null | undefined): { attention: boolean; text: string } {
  if (pain == null || !Number.isFinite(pain)) return { attention: false, text: 'No pain check-in today.' };
  if (pain > 3) return { attention: true, text: `${pain}/10 logged. Reduce load, range, or pace; stop any movement that makes symptoms increase.` };
  if (pain === 3) return { attention: true, text: '3/10: continue only if stable, gait and form stay normal, and symptoms settle.' };
  return { attention: false, text: `${pain}/10: generally acceptable if stable. Reduce load, range, or pace if symptoms increase.` };
}

export const MOVEMENT_STOP_RULE = 'Stop for sharp pain, limping, swelling, warmth, numbness, tingling, weakness, new persistent worsening, or new/worsening rest or night pain.';

export function initialRecoveryMode(pain: number | null | undefined): 'standard' | 'footFlare' {
  // A pain score warrants guidance, not a diagnosis or an automatic routine switch.
  void pain;
  return 'standard';
}
