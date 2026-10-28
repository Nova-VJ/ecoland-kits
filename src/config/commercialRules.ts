/**
 * REGLAS COMERCIALES Y FUENTE ÚNICA DE VERDAD (SINGLE SOURCE OF TRUTH)
 * Ecoland E-commerce Transaccional & Omnicanal
 * 
 * Centraliza todos los parámetros comerciales, fiscales, logísticos y
 * condiciones de cálculo ambiental para evitar divergencias entre vistas.
 */

export interface DeliveryZone {
  id: string;
  name: string;
  postalCodePrefixes: string[];
  carrier: string;
  transitHours: string;
  shippingCost: number;
  freeShippingThreshold: number;
  allowsColdChain: boolean;
}

export interface TaxRule {
  category: 'super_reduced' | 'reduced' | 'standard';
  rate: number;
  label: string;
}

export interface EnvironmentalEvidence {
  claimType: 'co2_avoided' | 'plastic_free' | 'fsc_packaging' | 'local_origin_cyl' | 'eu_organic';
  productId?: string;
  supplierId?: string;
  methodology: string;
  source: string;
  scope: 'cradle-to-gate' | 'packaging-only' | 'certification';
  unit: string;
  verifiedAt: string;
  expiresAt: string;
  verificationStatus: 'DRAFT' | 'PENDING_AUDIT' | 'VERIFIED' | 'EXPIRED';
  value?: number;
}

export const COMMERCIAL_RULES = {
  // --- UMBRALES DE ENVÍO Y PORTES ---
  FREE_SHIPPING_THRESHOLD: 49.00, // En euros (estándar auditado unificado)
  STANDARD_SHIPPING_PRICE: 4.90,  // En euros
  CLICK_COLLECT_PRICE: 0.00,      // Recogida en tienda física en Valladolid siempre gratuita
  
  // --- RECOGIDA FÍSICA (OMNICANAL) ---
  PHYSICAL_STORE: {
    id: 'store-valladolid-01',
    name: 'Ecoland Valladolid Centro',
    address: 'Calle Mayor / Zona Centro, Valladolid',
    city: 'Valladolid',
    postalCode: '47001',
    schedule: 'Lunes a Viernes 09:30 - 20:30, Sábados 10:00 - 14:30',
    phone: '+34 983 000 000',
    preparationTimeMinutes: 120, // 2 horas de preparación tras la confirmación
  },

  // --- ZONAS DE ENTREGA Y LOGÍSTICA ---
  DELIVERY_ZONES: [
    {
      id: 'valladolid-local',
      name: 'Valladolid Capital y Alfoz',
      postalCodePrefixes: ['47'],
      carrier: 'Reparto Eléctrico Ecoland / Mensajería Local',
      transitHours: '24h',
      shippingCost: 4.90,
      freeShippingThreshold: 49.00,
      allowsColdChain: true,
    },
    {
      id: 'peninsula',
      name: 'Península Ibérica',
      postalCodePrefixes: ['01', '02', '03', '04', '05', '06', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '36', '37', '39', '40', '41', '42', '43', '44', '45', '46', '48', '49', '50'],
      carrier: 'SEUR Frío 13:30 / Tipsa Eco 24-48h',
      transitHours: '24-48h',
      shippingCost: 4.90,
      freeShippingThreshold: 49.00,
      allowsColdChain: true,
    },
    {
      id: 'baleares',
      name: 'Islas Baleares (Solo productos no perecederos)',
      postalCodePrefixes: ['07'],
      carrier: 'Correos Express 48-72h',
      transitHours: '48-72h',
      shippingCost: 8.90,
      freeShippingThreshold: 85.00,
      allowsColdChain: false,
    }
  ] as DeliveryZone[],

  // --- SUSCRIPCIONES Y DESCUENTOS ---
  SUBSCRIPTION_DISCOUNT_PERCENT: 10, // 10% de descuento recurrente en packs
  SUBSCRIPTION_DISCOUNT_FACTOR: 0.90,

  // --- REGLAS FISCALES (IVA ESPAÑA) ---
  TAX_RATES: {
    SUPER_REDUCED: 0.04, // 4% alimentos básicos (pan, harinas, leche vegetal básica, fruta fresca, verduras, legumbres)
    REDUCED: 0.10,       // 10% alimentos elaborados, snacks bio, complementos alimenticios
    STANDARD: 0.21,      // 21% cosmética, higiene, menaje zero waste, portes
  },

  // --- PROGRAMA DE APORTACIÓN AMBIENTAL (REFORESTACIÓN) ---
  // Cumplimiento estricto: Desactivado hasta formalización legal de convenio
  TREE_CONTRIBUTION: {
    AMOUNT: 0.00,
    STATUS: 'PILOTO_NO_ACTIVO',
    ENABLED_IN_CHECKOUT: false,
    PARTNER_ORGANIZATION: 'En proceso de formalización con entidad de custodia fluvial/forestal en Castilla y León',
    NOTICE: 'Programa piloto en proceso de formalización técnica y contable. Actualmente no disponible para cobro público.'
  },

  // --- SISTEMA DE EVIDENCIA AMBIENTAL (PRIORIDAD 9) ---
  // Solo se muestran claims cuando verification_status === 'VERIFIED'
  ENVIRONMENTAL_EVIDENCE_SYSTEM: {
    SHOW_UNVERIFIED_ESTIMATES: false,
    ACTIVE_VERIFIED_CLAIMS: [
      {
        claimType: 'fsc_packaging',
        methodology: 'Certificación de cadena de custodia FSC de fabricante de cartón reciclado.',
        source: 'Certificado FSC-C123456 / Proveedor Embalajes CyL',
        scope: 'packaging-only',
        unit: '100% Cartón reciclado libre de plástico virgen',
        verifiedAt: '2026-01-15',
        expiresAt: '2027-01-15',
        verificationStatus: 'VERIFIED'
      },
      {
        claimType: 'eu_organic',
        methodology: 'Certificación oficial ecológica conforme al Reglamento (UE) 2018/848.',
        source: 'Comité de Agricultura Ecológica de Castilla y León (CAECyL) y organismos certificadores de origen.',
        scope: 'certification',
        unit: 'Sello oficial Eurohoja',
        verifiedAt: '2026-02-01',
        expiresAt: '2027-02-01',
        verificationStatus: 'VERIFIED'
      }
    ] as EnvironmentalEvidence[]
  },

  // --- TIEMPO LÍMITE DE RESERVA DE STOCK EN CHECKOUT ---
  STOCK_RESERVATION_TIMEOUT_MINUTES: 15,
} as const;

/**
 * Calcula los gastos de envío reales según destino y subtotal
 */
export function calculateShippingCost(
  subtotal: number,
  deliveryMethod: 'domicilio' | 'click_and_collect',
  postalCode?: string
): { shippingCost: number; isFree: boolean; remainingForFree: number; zone: DeliveryZone } {
  if (deliveryMethod === 'click_and_collect') {
    return {
      shippingCost: COMMERCIAL_RULES.CLICK_COLLECT_PRICE,
      isFree: true,
      remainingForFree: 0,
      zone: COMMERCIAL_RULES.DELIVERY_ZONES[0]
    };
  }

  // Identificar zona por prefijo de código postal (por defecto Península)
  const prefix = postalCode ? postalCode.trim().substring(0, 2) : '47';
  const zone = COMMERCIAL_RULES.DELIVERY_ZONES.find(z => z.postalCodePrefixes.includes(prefix)) 
    || COMMERCIAL_RULES.DELIVERY_ZONES[1]; // fallback a península

  const isFree = subtotal >= zone.freeShippingThreshold;
  const shippingCost = isFree ? 0 : zone.shippingCost;
  const remainingForFree = Math.max(0, zone.freeShippingThreshold - subtotal);

  return {
    shippingCost,
    isFree,
    remainingForFree,
    zone
  };
}
