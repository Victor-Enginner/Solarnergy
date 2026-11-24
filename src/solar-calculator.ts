export interface SolarSpecs {
  panelCount: number;
  powerKwp: number;
  monthlyGenerationKwh: number;
  estimatedMonthlySavingsBrl: number;
  sevenYearSavingsBrl: number;
  complexityTier: string;
  complexityId: 'compact' | 'standard' | 'villa';
  batteryRecommended: string;
  whatsappUrl: string;
}

export const MIN_PANELS = 6;
export const MAX_PANELS = 32;
export const PANEL_WATTAGE = 550; // 550W Tier-1 Monocrystalline Bifacial
export const TARIFF_PER_KWH = 0.95; // R$ 0.95 per kWh average
export const MONTHLY_SOLAR_HOURS = 125; // kWh/kWp/month irradiance average

export function calculateSolarSpecs(panels: number, phoneNumber = '5511999999999'): SolarSpecs {
  const panelCount = Math.max(MIN_PANELS, Math.min(MAX_PANELS, Math.round(panels)));
  const powerKwp = Number(((panelCount * PANEL_WATTAGE) / 1000).toFixed(2));
  const monthlyGenerationKwh = Math.round(powerKwp * MONTHLY_SOLAR_HOURS);
  const estimatedMonthlySavingsBrl = Math.round(monthlyGenerationKwh * TARIFF_PER_KWH);
  const sevenYearSavingsBrl = estimatedMonthlySavingsBrl * 12 * 7;

  let complexityTier = 'Compacto (1 Água • Baixa Complexidade)';
  let complexityId: 'compact' | 'standard' | 'villa' = 'compact';
  let batteryRecommended = 'Opcional (6.5 kWh)';

  if (panelCount > 20) {
    complexityTier = 'Villa Total (Multi-Águas + Baterias • Alta Complexidade)';
    complexityId = 'villa';
    batteryRecommended = 'Dupla LFP (27.0 kWh)';
  } else if (panelCount > 10) {
    complexityTier = 'Residencial Padrão (2 Águas • Média Complexidade)';
    complexityId = 'standard';
    batteryRecommended = 'Bateria LFP (13.5 kWh)';
  }

  const message = `Olá! Gostaria de um orçamento Lumen Roof com ${panelCount} placas solares (${powerKwp} kWp • ${complexityTier}).`;
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return {
    panelCount,
    powerKwp,
    monthlyGenerationKwh,
    estimatedMonthlySavingsBrl,
    sevenYearSavingsBrl,
    complexityTier,
    complexityId,
    batteryRecommended,
    whatsappUrl,
  };
}
