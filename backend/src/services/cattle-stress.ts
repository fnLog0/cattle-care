/**
 * Individual Cattle Stress Service (Strain Index)
 *
 * Formula: SI = 5 × [(Tobs - Tmin) / (Tmax - Tmin) + (Robs - Rmin) / (Rmax - Rmin)]
 *
 * Where:
 *   Tobs = Observed rectal temperature (°C)
 *   Robs = Observed respiration rate (breaths/min)
 *   Tmin/Tmax, Rmin/Rmax = Breed-specific normal ranges
 *
 * Stress classification:
 *   SI < 2   → none
 *   2 <= SI < 4  → mild
 *   4 <= SI < 6  → moderate
 *   6 <= SI < 8  → severe
 *   SI >= 8  → danger
 */

export type Breed = 'zebu' | 'crossBreed' | 'murrah';
export type StressLevel = 'none' | 'mild' | 'moderate' | 'severe' | 'danger';

type BreedConstants = {
  tempMax: number;
  tempMin: number;
  respMax: number;
  respMin: number;
};

const BREED_CONSTANTS: Record<Breed, BreedConstants> = {
  zebu: {
    tempMax: 40.0,
    tempMin: 36.5,
    respMax: 120,
    respMin: 10,
  },
  crossBreed: {
    tempMax: 42.0,
    tempMin: 37.0,
    respMax: 150,
    respMin: 10,
  },
  murrah: {
    tempMax: 42.0,
    tempMin: 37.0,
    respMax: 150,
    respMin: 10,
  },
};

export type CattleStressInput = {
  breed: Breed;
  rectalTemperature: number; // °C
  respirationRate: number;   // breaths per minute
};

export type CattleStressResult = {
  strainIndex: number;
  stressLevel: StressLevel;
  temperatureComponent: number;
  respirationComponent: number;
  timestamp: string;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

function strainComponents(breed: Breed, rectalTemperature: number, respirationRate: number) {
  const c = BREED_CONSTANTS[breed];
  return {
    temperatureComponent: (rectalTemperature - c.tempMin) / (c.tempMax - c.tempMin),
    respirationComponent: (respirationRate - c.respMin) / (c.respMax - c.respMin),
  };
}

export function calculateStrainIndex(
  rectalTemperature: number,
  respirationRate: number,
  breed: Breed,
): number {
  const { temperatureComponent, respirationComponent } = strainComponents(
    breed,
    rectalTemperature,
    respirationRate,
  );
  return 5 * (temperatureComponent + respirationComponent);
}

export function classifyStress(strainIndex: number): StressLevel {
  if (strainIndex < 2) return 'none';
  if (strainIndex < 4) return 'mild';
  if (strainIndex < 6) return 'moderate';
  if (strainIndex < 8) return 'severe';
  return 'danger';
}

export function calculateCattleStress(input: CattleStressInput): CattleStressResult {
  const { breed, rectalTemperature, respirationRate } = input;
  const { temperatureComponent, respirationComponent } = strainComponents(
    breed,
    rectalTemperature,
    respirationRate,
  );
  const strainIndex = 5 * (temperatureComponent + respirationComponent);

  return {
    strainIndex: round2(strainIndex),
    stressLevel: classifyStress(strainIndex),
    temperatureComponent: round2(temperatureComponent),
    respirationComponent: round2(respirationComponent),
    timestamp: new Date().toISOString(),
  };
}
