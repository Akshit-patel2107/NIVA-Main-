import { FertilityLevel, MenstrualPhase, RegularityStatus } from '../types';

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDisplayDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  try {
    const d = parseDate(dateStr);
    return d.toLocaleDateString('en-US', options || {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
  } catch {
    return dateStr;
  }
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export function diffInDays(dateStrA: string, dateStrB: string): number {
  const a = parseDate(dateStrA);
  const b = parseDate(dateStrB);
  const diffTime = a.getTime() - b.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export interface CycleStatus {
  cycleDay: number;
  currentPhase: MenstrualPhase;
  fertilityLevel: FertilityLevel;
  daysUntilNextPeriod: number;
  nextPeriodDate: string;
  ovulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  isPeriodDay: boolean;
  phaseProgressPercent: number;
  estimatedCycleLength: number;
}

export function computeCycleStatus(
  lastPeriodStart: string,
  cycleLength: number = 28,
  periodDuration: number = 5,
  currentDateStr: string = formatDate(new Date())
): CycleStatus {
  const safeCycleLength = Math.max(21, Math.min(45, cycleLength || 28));
  const safePeriodDuration = Math.max(2, Math.min(10, periodDuration || 5));
  
  const daysSinceStart = diffInDays(currentDateStr, lastPeriodStart);
  
  // Cycle day is 1-indexed relative to current cycle
  let cycleDay = (daysSinceStart % safeCycleLength) + 1;
  if (cycleDay <= 0) {
    cycleDay = ((cycleDay % safeCycleLength) + safeCycleLength) % safeCycleLength;
    if (cycleDay === 0) cycleDay = safeCycleLength;
  }

  const daysUntilNextPeriod = safeCycleLength - cycleDay;
  const cyclesCompleted = Math.floor(daysSinceStart / safeCycleLength);
  const nextPeriodDate = addDays(lastPeriodStart, (cyclesCompleted + 1) * safeCycleLength);
  
  // Ovulation typically occurs 14 days before next period
  const ovulationDay = Math.max(1, safeCycleLength - 14);
  const cycleStartForCurrent = addDays(lastPeriodStart, cyclesCompleted * safeCycleLength);
  const ovulationDate = addDays(cycleStartForCurrent, ovulationDay - 1);
  const fertileWindowStart = addDays(ovulationDate, -4);
  const fertileWindowEnd = addDays(ovulationDate, 1);

  let currentPhase: MenstrualPhase = 'Menstrual';
  let fertilityLevel: FertilityLevel = 'Low';
  let isPeriodDay = false;

  if (cycleDay <= safePeriodDuration) {
    currentPhase = 'Menstrual';
    fertilityLevel = 'Low';
    isPeriodDay = true;
  } else if (cycleDay < ovulationDay - 2) {
    currentPhase = 'Follicular';
    fertilityLevel = cycleDay >= ovulationDay - 5 ? 'Medium' : 'Low';
  } else if (cycleDay <= ovulationDay + 1) {
    currentPhase = 'Ovulation';
    fertilityLevel = cycleDay === ovulationDay ? 'Peak (Ovulation)' : 'High (Fertile Window)';
  } else {
    currentPhase = 'Luteal';
    fertilityLevel = 'Low';
  }

  // Phase progress
  let phaseProgressPercent = 0;
  if (currentPhase === 'Menstrual') {
    phaseProgressPercent = Math.min(100, (cycleDay / safePeriodDuration) * 100);
  } else if (currentPhase === 'Follicular') {
    const folLength = Math.max(1, ovulationDay - 2 - safePeriodDuration);
    phaseProgressPercent = Math.min(100, ((cycleDay - safePeriodDuration) / folLength) * 100);
  } else if (currentPhase === 'Ovulation') {
    phaseProgressPercent = Math.min(100, ((cycleDay - (ovulationDay - 2)) / 4) * 100);
  } else {
    const lutLength = Math.max(1, safeCycleLength - (ovulationDay + 1));
    phaseProgressPercent = Math.min(100, ((cycleDay - (ovulationDay + 1)) / lutLength) * 100);
  }

  return {
    cycleDay,
    currentPhase,
    fertilityLevel,
    daysUntilNextPeriod,
    nextPeriodDate,
    ovulationDate,
    fertileWindowStart,
    fertileWindowEnd,
    isPeriodDay,
    phaseProgressPercent: Math.round(phaseProgressPercent),
    estimatedCycleLength: safeCycleLength,
  };
}

export function getPhaseColor(phase: MenstrualPhase): {
  primary: string;
  bg: string;
  border: string;
  text: string;
  badge: string;
  soft: string;
} {
  switch (phase) {
    case 'Menstrual':
      return {
        primary: '#D9534F',
        bg: '#FDF2F2',
        border: '#FBD5D5',
        text: '#9B1C1C',
        badge: 'bg-rose-100 text-rose-800 border-rose-200',
        soft: '#FEE2E2',
      };
    case 'Follicular':
      return {
        primary: '#319795',
        bg: '#E6FFFA',
        border: '#B2F5EA',
        text: '#234E52',
        badge: 'bg-teal-100 text-teal-800 border-teal-200',
        soft: '#CCFBF1',
      };
    case 'Ovulation':
      return {
        primary: '#805AD5',
        bg: '#FAF5FF',
        border: '#E9D8FD',
        text: '#553C9A',
        badge: 'bg-purple-100 text-purple-800 border-purple-200',
        soft: '#F3E8FF',
      };
    case 'Luteal':
      return {
        primary: '#DD6B20',
        bg: '#FFFAF0',
        border: '#FEEBC8',
        text: '#7B341E',
        badge: 'bg-amber-100 text-amber-800 border-amber-200',
        soft: '#FEF3C7',
      };
  }
}

export function getPhaseInfo(phase: MenstrualPhase): {
  tagline: string;
  hormones: string;
  energyLevel: string;
  nutritionTip: string;
  movementTip: string;
} {
  switch (phase) {
    case 'Menstrual':
      return {
        tagline: 'Rest & Intuitive Renewal',
        hormones: 'Estrogen and progesterone at lowest baseline. Uterine lining shedding.',
        energyLevel: 'Lowest; inward-focused and reflective.',
        nutritionTip: 'Warm iron-dense foods (spinach, lentils, bone broth), herbal teas, and magnesium.',
        movementTip: 'Restorative yoga, gentle walking, light stretching, or complete physical rest.',
      };
    case 'Follicular':
      return {
        tagline: 'Rising Vitality & Creativity',
        hormones: 'Estrogen steadily rises as follicles develop, boosting dopamine and serotonin.',
        energyLevel: 'Increasing stamina, clear mental focus, and social enthusiasm.',
        nutritionTip: 'Fresh sprouted seeds, fermented foods for gut health, citrus, and lean proteins.',
        movementTip: 'Cardio, strength circuits, dance, and trying new workout routines.',
      };
    case 'Ovulation':
      return {
        tagline: 'Peak Radiance & Ovulatory Power',
        hormones: 'Estrogen peaks alongside LH surge. Highest fertility of the cycle.',
        energyLevel: 'Monthly peak in endurance, confidence, and verbal fluency.',
        nutritionTip: 'Antioxidant-rich leafy greens, berries, omega-3s, and abundant hydration.',
        movementTip: 'High-intensity interval training (HIIT), heavy lifts, and group fitness classes.',
      };
    case 'Luteal':
      return {
        tagline: 'Nurturing & PMS Protection',
        hormones: 'Progesterone rises to support uterine lining; shifts in neurotransmitters.',
        energyLevel: 'Gradually tapering down; metabolism burns ~100-200 extra kcal.',
        nutritionTip: 'Complex carbs (sweet potatoes, oats), dark chocolate, pumpkin seeds, and dandelion root.',
        movementTip: 'Pilates, moderate weight training, barre, nature walks, and grounding breathwork.',
      };
  }
}
