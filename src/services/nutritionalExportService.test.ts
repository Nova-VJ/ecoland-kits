import { describe, it, expect, beforeEach } from 'vitest';
import { nutritionalExportService } from './nutritionalExportService';

describe('Nutritional Export Service for Professionals (P4)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Genera informe estructurado con métricas de fibra y cláusula de no diagnóstico', () => {
    const report = nutritionalExportService.generateReport();

    expect(report.reportId).toBeDefined();
    expect(report.nutritionalAverages.averageCalories).toBeGreaterThan(0);
    expect(report.nutritionalAverages.averageFiberGrams).toBeGreaterThan(0);
    expect(report.foodFingerprintProfile).toBeDefined();

    // Comprobar descargo médico ético
    expect(report.legalMedicalDisclaimer).toContain('NO constituye un diagnóstico médico');
    expect(report.legalMedicalDisclaimer).toContain('dietista o nutricionista');
  });

  it('2. Exportación a CSV formateada con secciones y cabeceras', () => {
    const csv = nutritionalExportService.exportAsCsv();

    expect(csv).toContain('SECCION,PARAMETRO,VALOR');
    expect(csv).toContain('METADATOS,Reporte ID');
    expect(csv).toContain('PROMEDIOS,Fibra Media (g)');
    expect(csv).toContain('AVISO_LEGAL,Descargo');
  });
});
