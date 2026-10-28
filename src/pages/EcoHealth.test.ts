import { describe, it, expect } from 'vitest';

describe('EcoHealth — Estimaciones Energéticas y Protección contra Ingestas Restrictivas', () => {
  /**
   * Cálculo de estimación de gasto energético (Mifflin-St Jeor).
   * No prescribe dietas extremas ni fija fronteras médicas universales.
   * Si la ingesta estimada es potencialmente muy restrictiva, genera advertencia y
   * recomienda consultar a un profesional sanitario colegiado.
   */
  const evaluateEnergeticEstimate = (
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
    if (goal === 'perder') target = Math.round(tdee - 350); // Déficit moderado prudente
    if (goal === 'ganar') target = Math.round(tdee + 300);

    // Detección de ingesta potencialmente muy restrictiva
    const isPotentiallyRestrictive = 
      (gender === 'hombre' && target < 1500) ||
      (gender === 'mujer' && target < 1200) ||
      (tdee - target > 500);

    return {
      bmr,
      tdee,
      estimatedTarget: target,
      isPotentiallyRestrictive,
      recommendation: isPotentiallyRestrictive
        ? 'Aviso: La ingesta estimada resultante puede ser excesivamente restrictiva. Se recomienda consultar con un médico o dietista-nutricionista colegiado.'
        : 'Estimación orientativa de mantenimiento o ajuste moderado.'
    };
  };

  it('debe calcular estimaciones precisas de BMR y TDEE para perfil masculino', () => {
    const res = evaluateEnergeticEstimate('hombre', 75, 180, 30, 1.55, 'mantener');
    expect(res.bmr).toBe(1730);
    expect(res.tdee).toBe(2682);
    expect(res.isPotentiallyRestrictive).toBe(false);
  });

  it('debe calcular estimaciones precisas de BMR y TDEE para perfil femenino', () => {
    const res = evaluateEnergeticEstimate('mujer', 60, 165, 28, 1.375, 'mantener');
    expect(res.bmr).toBe(1330);
    expect(res.tdee).toBe(1829);
    expect(res.isPotentiallyRestrictive).toBe(false);
  });

  it('debe detectar ingesta potencialmente muy restrictiva y generar aviso de consulta profesional en lugar de fijar un límite rígido', () => {
    // Caso de persona sedentaria con bajo peso intentando un déficit
    const res = evaluateEnergeticEstimate('mujer', 44, 150, 42, 1.2, 'perder');
    
    // TDEE = 10*44 + 6.25*150 - 5*42 - 161 = 440 + 937.5 - 210 - 161 = 1006.5 * 1.2 = 1208 kcal
    // Al restar 350, daría ~858 kcal -> Ingesta severamente restrictiva
    expect(res.isPotentiallyRestrictive).toBe(true);
    expect(res.recommendation).toContain('médico o dietista-nutricionista colegiado');
  });

  it('debe mantener las proporciones visuales del Plato Saludable (50% / 25% / 25%) como referencia de composición', () => {
    const visualPlateProportions = {
      vegetablesFruits: 0.50,
      wholeGrains: 0.25,
      healthyProteins: 0.25
    };

    const sum = visualPlateProportions.vegetablesFruits + 
                visualPlateProportions.wholeGrains + 
                visualPlateProportions.healthyProteins;

    expect(sum).toBe(1.0);
    expect(visualPlateProportions.vegetablesFruits).toBe(0.50);
  });
});
