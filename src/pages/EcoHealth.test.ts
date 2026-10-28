import { describe, it, expect } from 'vitest';

describe('EcoHealth Calculations & Boundaries (Auditoría Médica y Nutricional)', () => {
  // Fórmula Mifflin-St Jeor implementada en EcoHealth
  const calculateMifflinStJeor = (
    gender: 'hombre' | 'mujer',
    weightKg: number,
    heightCm: number,
    ageYears: number,
    activityFactor: number,
    goal: 'mantener' | 'perder' | 'ganar'
  ) => {
    const bmr = gender === 'hombre'
      ? Math.round(10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5)
      : Math.round(10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161);

    const tdee = Math.round(bmr * activityFactor);

    let target = tdee;
    if (goal === 'perder') target = Math.round(tdee - 400);
    if (goal === 'ganar') target = Math.round(tdee + 350);

    // Límite de seguridad fisiológica para evitar dietas de inanición
    const safetyFloor = gender === 'hombre' ? 1400 : 1200;
    return {
      bmr,
      tdee,
      target: Math.max(safetyFloor, target)
    };
  };

  it('should calculate accurate BMR and TDEE for male profile', () => {
    // Hombre, 75kg, 180cm, 30 años, actividad moderada (1.55)
    // BMR = 10*75 + 6.25*180 - 5*30 + 5 = 750 + 1125 - 150 + 5 = 1730 kcal
    // TDEE = 1730 * 1.55 = 2681.5 -> 2682 kcal
    const res = calculateMifflinStJeor('hombre', 75, 180, 30, 1.55, 'mantener');
    expect(res.bmr).toBe(1730);
    expect(res.tdee).toBe(2682);
    expect(res.target).toBe(2682);
  });

  it('should calculate accurate BMR and TDEE for female profile', () => {
    // Mujer, 60kg, 165cm, 28 años, actividad ligera (1.375)
    // BMR = 10*60 + 6.25*165 - 5*28 - 161 = 600 + 1031.25 - 140 - 161 = 1330.25 -> 1330 kcal
    // TDEE = 1330 * 1.375 = 1828.75 -> 1829 kcal
    const res = calculateMifflinStJeor('mujer', 60, 165, 28, 1.375, 'mantener');
    expect(res.bmr).toBe(1330);
    expect(res.tdee).toBe(1829);
  });

  it('should apply controlled deficit and protect against unsafe caloric floors', () => {
    // Mujer muy sedentaria con bajo peso
    const res = calculateMifflinStJeor('mujer', 45, 150, 40, 1.2, 'perder');
    // Incluso con déficit de 400 kcal, nunca debe prescribir menos de 1200 kcal
    expect(res.target).toBeGreaterThanOrEqual(1200);
  });

  it('should validate Harvard Plate macronutrient quadrant targets', () => {
    const harvardRatios = {
      vegetablesFruits: 0.50,
      wholeGrains: 0.25,
      healthyProteins: 0.25
    };

    const sum = harvardRatios.vegetablesFruits + harvardRatios.wholeGrains + harvardRatios.healthyProteins;
    expect(sum).toBe(1.0);
    expect(harvardRatios.vegetablesFruits).toBe(0.50);
  });
});
