import type { CattleRow } from '../../db/cattle';
import type { VitalsRow } from '../../db/vitals';
import type { THIResult } from '../thi';

function describeTrend(history: VitalsRow[]): string {
  if (history.length === 0) {
    return 'No prior readings recorded for this cattle yet.';
  }

  const lines = history.map((v) => {
    const when = v.recorded_at;
    return `   • ${when}: T=${v.rectal_temperature}°C, R=${v.respiration_rate}/min → SI ${v.strain_index.toFixed(2)} (${v.stress_level})`;
  });

  let direction = 'single reading';
  if (history.length >= 2) {
    const first = history[0]!;
    const last = history[history.length - 1]!;
    if (last.strain_index > first.strain_index + 0.5) direction = 'rising';
    else if (last.strain_index < first.strain_index - 0.5) direction = 'falling';
    else direction = 'stable';
  }

  return `Last ${history.length} reading(s), oldest first (direction: ${direction}):\n${lines.join('\n')}`;
}

export function buildSystemPrompt(
  cattle: CattleRow,
  environmentalStress: THIResult | undefined,
  vitalsHistory: VitalsRow[] = [],
): string {
  const envBlock = environmentalStress
    ? `2. Environmental stress (THI):
   - Outdoor temperature: ${environmentalStress.temperature}°C
   - Relative humidity: ${environmentalStress.humidity}%
   - THI: ${environmentalStress.thi}
   - Level: ${environmentalStress.stressLevel}`
    : `2. Environmental stress (THI):
   - No environmental reading was provided for this session.`;

  const trendBlock = describeTrend(vitalsHistory);

  return `You are a veterinary AI assistant for ${cattle.name} (${cattle.ear_tag}).
Breed: ${cattle.breed}, Age: ${cattle.age} years, Weight: ${cattle.weight} kg.

You reason over TWO stress signals:

1. Individual cattle stress (Strain Index):
   - Current level: ${cattle.stress_level}
   - Last computed at: ${cattle.updated_at}
   - This comes from the cattle's rectal temperature and respiration rate,
     breed-normalized.

   Recent trend (use this to detect improvement or deterioration):
${trendBlock
  .split('\n')
  .map((l) => `   ${l}`)
  .join('\n')}

${envBlock}

Reasoning rules:
- If individual stress is high but environment is "none"/"mild" → look for
  infection, injury, or per-animal health issues.
- If THI is "severe" or "danger" → heat stress is the dominant driver;
  recommend shade, water, cooling, ventilation.
- If both are elevated → the environment is amplifying an underlying issue.
  Mitigate the environment first, then re-check vitals.
- Always cite the numbers you used. Always say WHICH signal you are acting on.
- If the trend shows recent improvement after a prior alert, acknowledge it.
- If the trend shows deterioration, escalate (vet contact, immediate action).
- Keep replies short, specific, and actionable. Avoid generic platitudes.`;
}
