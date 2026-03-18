import { Message, Cattle } from '@/types';
import { STRESS_LABELS } from '@/constants/stress';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Registration Agent (state machine) ───────────────────────────────────────

export type RegistrationStep = 'name' | 'breed' | 'age' | 'weight' | 'earTag' | 'confirm';

export type RegistrationState = {
  step: RegistrationStep;
  collected: {
    name?: string;
    breed?: string;
    age?: number;
    weight?: number;
    earTag?: string;
  };
};

export function getInitialRegistrationState(): RegistrationState {
  return {
    step: 'name',
    collected: {},
  };
}

export function getRegistrationWelcome(): string {
  return "Hello! I'm your cattle registration assistant. Let's register your new cattle.\n\nWhat is the name of your cattle?";
}

export async function chatRegistration(
  state: RegistrationState,
  userMessage: string
): Promise<{ response: string; nextState: RegistrationState; isComplete: boolean }> {
  await delay(500);

  const msg = userMessage.trim();

  switch (state.step) {
    case 'name': {
      if (!msg) {
        return {
          response: 'Please enter a name for your cattle.',
          nextState: state,
          isComplete: false,
        };
      }
      const nextState: RegistrationState = {
        step: 'breed',
        collected: { ...state.collected, name: msg },
      };
      return {
        response: `Great! "${msg}" is a wonderful name.\n\nWhat is the breed of ${msg}?\n\nChoose from:\n• Zebu\n• Cross Breed\n• Murrah`,
        nextState,
        isComplete: false,
      };
    }

    case 'breed': {
      const lower = msg.toLowerCase();
      let breed: string | null = null;
      if (lower.includes('zebu')) breed = 'zebu';
      else if (lower.includes('cross') || lower.includes('crossbreed')) breed = 'crossBreed';
      else if (lower.includes('murrah')) breed = 'murrah';

      if (!breed) {
        return {
          response:
            'Please select a valid breed: Zebu, Cross Breed, or Murrah.',
          nextState: state,
          isComplete: false,
        };
      }

      const nextState: RegistrationState = {
        step: 'age',
        collected: { ...state.collected, breed },
      };
      return {
        response: `${breed === 'crossBreed' ? 'Cross Breed' : breed.charAt(0).toUpperCase() + breed.slice(1)} noted!\n\nHow old is ${state.collected.name}? (Enter age in years, e.g. "3")`,
        nextState,
        isComplete: false,
      };
    }

    case 'age': {
      const age = parseFloat(msg);
      if (isNaN(age) || age <= 0 || age > 30) {
        return {
          response: 'Please enter a valid age in years (e.g. "3" or "2.5").',
          nextState: state,
          isComplete: false,
        };
      }
      const nextState: RegistrationState = {
        step: 'weight',
        collected: { ...state.collected, age },
      };
      return {
        response: `${age} year${age !== 1 ? 's' : ''} old, got it!\n\nWhat is the weight of ${state.collected.name}? (Enter weight in kg, e.g. "320")`,
        nextState,
        isComplete: false,
      };
    }

    case 'weight': {
      const weight = parseFloat(msg);
      if (isNaN(weight) || weight < 50 || weight > 1000) {
        return {
          response: 'Please enter a valid weight in kg (e.g. "320").',
          nextState: state,
          isComplete: false,
        };
      }
      const nextState: RegistrationState = {
        step: 'earTag',
        collected: { ...state.collected, weight },
      };
      return {
        response: `${weight} kg noted!\n\nFinally, what is the ear tag number for ${state.collected.name}? (e.g. "ET-011")`,
        nextState,
        isComplete: false,
      };
    }

    case 'earTag': {
      if (!msg || msg.length < 2) {
        return {
          response: 'Please enter a valid ear tag (e.g. "ET-011").',
          nextState: state,
          isComplete: false,
        };
      }
      const nextState: RegistrationState = {
        step: 'confirm',
        collected: { ...state.collected, earTag: msg.toUpperCase() },
      };
      const { name, breed, age, weight, earTag } = nextState.collected;
      const breedDisplay =
        breed === 'crossBreed' ? 'Cross Breed' : breed ? breed.charAt(0).toUpperCase() + breed.slice(1) : '';
      return {
        response: `Here's a summary for ${name}:\n\n• Breed: ${breedDisplay}\n• Age: ${age} year${Number(age) !== 1 ? 's' : ''}\n• Weight: ${weight} kg\n• Ear Tag: ${earTag ?? msg.toUpperCase()}\n\nDoes this look correct? Tap "Confirm" to save or "Edit" to start over.`,
        nextState,
        isComplete: false,
      };
    }

    case 'confirm': {
      return {
        response: 'Registration confirmed!',
        nextState: state,
        isComplete: true,
      };
    }

    default:
      return {
        response: 'Something went wrong. Please try again.',
        nextState: getInitialRegistrationState(),
        isComplete: false,
      };
  }
}

// ─── Health Agent ─────────────────────────────────────────────────────────────

const HEALTH_RESPONSES: Array<{ keywords: string[]; response: (cattle?: Cattle) => string }> = [
  {
    keywords: ['analyze', 'analysis', 'assess', 'assess stress', 'overall'],
    response: (cattle) => {
      if (!cattle?.latestVitals) {
        return "I need vitals data to analyze your cattle's health. Please ensure vitals have been recorded.";
      }
      const v = cattle.latestVitals;
      const level = STRESS_LABELS[v.stressLevel];
      return `Health Analysis for ${cattle.name}:\n\nStress Level: ${level} (Index: ${v.stressIndex.toFixed(1)}/100)\n\nKey indicators:\n• Temperature: ${v.temperature}°C ${v.temperature > 39.5 ? '⚠ Elevated' : '✓ Normal'}\n• Respiratory Rate: ${v.respiratoryRate}/min ${v.respiratoryRate > 25 ? '⚠ Elevated' : '✓ Normal'}\n• Heart Rate: ${v.heartRate} bpm ${v.heartRate > 80 ? '⚠ Elevated' : '✓ Normal'}\n• Humidity: ${v.humidity}%\n\n${v.stressLevel === 'none' || v.stressLevel === 'mild' ? `${cattle.name} appears healthy. Continue regular monitoring.` : `${cattle.name} requires attention. Consider immediate intervention.`}`;
    },
  },
  {
    keywords: ['risk', 'risks', 'danger', 'concern', 'worried'],
    response: (cattle) => {
      if (!cattle?.latestVitals) {
        return 'Please record vitals first to assess health risks.';
      }
      const v = cattle.latestVitals;
      const risks: string[] = [];
      if (v.temperature > 40) risks.push('Fever — possible infection or heat stress');
      if (v.respiratoryRate > 30) risks.push('High respiratory rate — monitor for respiratory illness');
      if (v.heartRate > 85) risks.push('Elevated heart rate — potential cardiac stress');
      if (v.humidity > 80) risks.push('High ambient humidity — increases heat stress risk');

      if (risks.length === 0) {
        return `${cattle?.name ?? 'Your cattle'} shows no significant health risks at this time. Keep up the good care!`;
      }
      return `Health Risks for ${cattle?.name ?? 'your cattle'}:\n\n${risks.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\nRecommend veterinary consultation if symptoms persist for more than 24 hours.`;
    },
  },
  {
    keywords: ['treatment', 'treat', 'medicine', 'medication', 'therapy', 'cure'],
    response: (cattle) => {
      if (!cattle?.latestVitals) {
        return 'Record vitals first so I can suggest appropriate treatment.';
      }
      const v = cattle.latestVitals;
      const treatments: string[] = [];
      if (v.temperature > 40) treatments.push('Provide cool water and shade immediately');
      if (v.temperature > 41) treatments.push('Contact veterinarian for antipyretic medication');
      if (v.respiratoryRate > 30) treatments.push('Ensure good ventilation in shelter');
      if (v.heartRate > 85) treatments.push('Reduce physical exertion, provide rest');
      treatments.push('Maintain consistent feeding schedule');
      treatments.push('Ensure access to clean water at all times');

      return `Treatment Recommendations for ${cattle?.name ?? 'your cattle'}:\n\n${treatments.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n⚠ These are general recommendations. Always consult a licensed veterinarian for medical treatment.`;
    },
  },
  {
    keywords: ['temperature', 'temp', 'fever', 'hot', 'heat'],
    response: (cattle) => {
      const temp = cattle?.latestVitals?.temperature;
      if (!temp) return 'No temperature data available. Please record vitals.';
      const normal = temp >= 38.0 && temp <= 39.5;
      return `Temperature Report for ${cattle?.name ?? 'your cattle'}:\n\nCurrent: ${temp}°C\nNormal Range: 38.0 – 39.5°C\nStatus: ${normal ? '✓ Normal' : '⚠ Abnormal'}\n\n${temp > 39.5 ? `Temperature is elevated by ${(temp - 39.5).toFixed(1)}°C. This may indicate fever, infection, or heat stress. Monitor closely and provide cool water and shade.` : temp < 38.0 ? 'Temperature is below normal. This could indicate shock or hypothermia. Contact a veterinarian.' : 'Temperature is within the healthy range. Continue regular monitoring.'}`;
    },
  },
  {
    keywords: ['feed', 'food', 'diet', 'nutrition', 'fodder'],
    response: (cattle) => {
      return `Feeding Recommendations for ${cattle?.name ?? 'your cattle'}:\n\n1. Provide 2.5–3% of body weight in dry matter daily\n2. Ensure clean, fresh water at all times (50–80 L/day)\n3. Balanced diet: green fodder, dry roughage, and concentrates\n4. Add mineral supplements (salt lick blocks)\n5. Feed 2–3 times daily at regular intervals\n\nFor a ${cattle?.weight ?? 300}kg cattle:\n• Green fodder: ~${Math.round((cattle?.weight ?? 300) * 0.08)} kg/day\n• Dry roughage: ~${Math.round((cattle?.weight ?? 300) * 0.015)} kg/day\n• Concentrates: ~${Math.round((cattle?.weight ?? 300) * 0.005)} kg/day`;
    },
  },
  {
    keywords: ['hello', 'hi', 'hey', 'start', 'help'],
    response: (cattle) =>
      `Hello! I'm the CattleCare AI Health Assistant.\n\nI can help you with:\n• Stress analysis\n• Health risk assessment\n• Treatment recommendations\n• Temperature monitoring\n• Feeding advice\n\n${cattle ? `Currently monitoring: ${cattle.name} (${cattle.earTag})` : ''}\n\nWhat would you like to know?`,
  },
];

export async function chatHealth(
  userMessage: string,
  cattle?: Cattle
): Promise<string> {
  await delay(700);

  const lower = userMessage.toLowerCase();

  for (const item of HEALTH_RESPONSES) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item.response(cattle);
    }
  }

  // Default fallback
  return `I understand you're asking about "${userMessage}".\n\nI can help with stress analysis, health risks, treatment advice, temperature monitoring, and feeding recommendations for ${cattle?.name ?? 'your cattle'}.\n\nTry asking:\n• "Analyze stress"\n• "What are the health risks?"\n• "Recommend treatment"\n• "Check temperature"\n• "Feeding advice"`;
}

export function getHealthWelcome(cattle?: Cattle): string {
  if (!cattle) {
    return "Hello! I'm the CattleCare AI Health Assistant. How can I help you today?";
  }

  const v = cattle.latestVitals;
  const level = v ? STRESS_LABELS[v.stressLevel] : 'Unknown';
  const stressIndex = v ? v.stressIndex.toFixed(1) : 'N/A';

  return `Hello! I'm monitoring ${cattle.name} (${cattle.earTag}).\n\nCurrent Status:\n• Stress Level: ${level}\n• Stress Index: ${stressIndex}/100\n• Last Updated: ${v ? new Date(v.recordedAt).toLocaleTimeString() : 'N/A'}\n\nHow can I help you? You can ask me to analyze stress, assess risks, or recommend treatment.`;
}
