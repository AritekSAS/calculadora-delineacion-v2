// Constants used across the application
export const UVT_YEARS = [{ year: 2025, value: 49799 }, { year: 2024, value: 47065 }, { year: 2023, value: 42412 }];
export const UVT_DEFAULT = UVT_YEARS[0].value;

export const TARIFAS_K = {
  ZR: [{ maxM2: 72, k: 0.12 }, { maxM2: 100, k: 0.24 }, { maxM2: 150, k: 0.55 }, { maxM2: 200, k: 0.78 }, { maxM2: 250, k: 0.93 }, { maxM2: Infinity, k: 1.24 }],
  ZSR: [{ maxM2: 72, k: 0.16 }, { maxM2: 100, k: 0.31 }, { maxM2: 150, k: 0.62 }, { maxM2: 200, k: 1.24 }, { maxM2: 250, k: 1.55 }, { maxM2: 500, k: 1.75 }, { maxM2: 1000, k: 1.95 }, { maxM2: 2000, k: 2.10 }, { maxM2: Infinity, k: 2.20 }],
  PROTECCION: [{ maxM2: 72, k: 0.16 }, { maxM2: 100, k: 0.39 }, { maxM2: 150, k: 0.78 }, { maxM2: 200, k: 1.40 }, { maxM2: 250, k: 1.55 }, { maxM2: Infinity, k: 2.71 }],
  AVIS: [{ maxM2: 75, k: 0.12 }, { maxM2: 100, k: 0.16 }, { maxM2: 150, k: 0.47 }, { maxM2: 200, k: 0.78 }, { maxM2: 250, k: 1.01 }, { maxM2: Infinity, k: 1.40 }],
  ARU: [{ maxM2: 75, k: 0.40 }, { maxM2: 100, k: 0.60 }, { maxM2: 150, k: 0.80 }, { maxM2: 200, k: 1.00 }, { maxM2: 250, k: 1.20 }, { maxM2: 500, k: 1.60 }, { maxM2: 1000, k: 1.70 }, { maxM2: 2000, k: 1.90 }, { maxM2: Infinity, k: 2.00 }],
  AH: [{ maxM2: 75, k: 0.40 }, { maxM2: 150, k: 0.60 }, { maxM2: 200, k: 0.90 }, { maxM2: 250, k: 1.30 }, { maxM2: 500, k: 1.60 }, { maxM2: 1000, k: 1.80 }, { maxM2: 2000, k: 2.00 }, { maxM2: Infinity, k: 2.20 }],
  AUM: [{ maxM2: 75, k: 0.50 }, { maxM2: 100, k: 0.70 }, { maxM2: 150, k: 0.90 }, { maxM2: 200, k: 1.10 }, { maxM2: 250, k: 1.30 }, { maxM2: 500, k: 1.70 }, { maxM2: 1000, k: 2.00 }, { maxM2: 2000, k: 2.10 }, { maxM2: Infinity, k: 2.20 }],
  AIM: [{ maxM2: 72, k: 0.16 }, { maxM2: 100, k: 0.39 }, { maxM2: 150, k: 0.78 }, { maxM2: 200, k: 1.40 }, { maxM2: 250, k: 1.55 }, { maxM2: Infinity, k: 2.71 }],
};

export const ZONAS = {
  VIVIENDA: [
    { id: 'ZR', name: 'ZONA RURAL (ZR)', subzonas: 'ZAP-ZJM-ZJME'.split('-') },
    { id: 'ZSR', name: 'SUBURBANA (ZSR)', subzonas: 'ZRG-ZRS-CP-ZVC-ZVCE-ZCS'.split('-') },
    { id: 'PROTECCION', name: 'SUELO DE PROTECCIÓN', subzonas: [
      { id: 'ZBP-ZRFP-1', name: 'Zona de reserva forestal protectora productora...', sigla: 'ZBP-ZRFP' },
      { id: 'ZRP-ZRFPP', name: 'Zona de reserva forestal protectora productora alta...', sigla: 'ZRP-ZRFPP' },
      { id: 'ZBP-ZRFP-2', name: 'Zona de amortiguación', sigla: 'ZBP-ZRFP' },
    ] },
    { id: 'AVIS', name: 'SUELO URBANO - VIVIENDA DE INTERÉS SOCIAL Y PRIORITARIA (AVIS)', subzonas: [] },
    { id: 'ARU', name: 'RESIDENCIAL URBANA (ARU)', subzonas: [] },
    { id: 'AH', name: 'SUELO URBANO - COMERCIAL Y DE SERVICIOS (AH)', subzonas: [] },
    { id: 'AUM', name: 'AUM', subzonas: [] },
    { id: 'AIM', name: 'AIM', subzonas: [] },
  ],
  OTRO_USO: [
    { id: 'ZR', name: 'ZONA RURAL (ZR)', subzonas: 'ZAP-ZJM-ZJME'.split('-') },
    { id: 'ZSR', name: 'SUBURBANA (ZSR)', subzonas: 'ZRG-ZRS-CP-ZVC-ZVCE-ZCS'.split('-') },
    { id: 'PROTECCION', name: 'SUELO DE PROTECCIÓN', subzonas: [
      { id: 'ZBP-ZRFP-1', name: 'Zona de reserva forestal protectora productora...', sigla: 'ZBP-ZRFP' },
      { id: 'ZRP-ZRFPP', name: 'Zona de reserva forestal protectora productora alta...', sigla: 'ZRP-ZRFPP' },
      { id: 'ZBP-ZRFP-2', name: 'Zona de amortiguación', sigla: 'ZBP-ZRFP' },
    ] },
    { id: 'AH', name: 'SUELO URBANO - COMERCIAL Y DE SERVICIOS (AH)', subzonas: [] },
    { id: 'AUM', name: 'AUM', subzonas: [] },
    { id: 'AIM', name: 'AIM', subzonas: [] },
  ],
};

export const ESTRATOS = [
  { value: 1, label: 'Estrato 1' },
  { value: 2, label: 'Estrato 2' },
  { value: 3, label: 'Estrato 3' },
  { value: 4, label: 'Estrato 4' },
  { value: 5, label: 'Estrato 5' },
  { value: 6, label: 'Estrato 6' },
];

export const TIPOS_DE_USO_C = [
  { value: 'comercial', label: 'Comercio y/o Servicios' },
  { value: 'institucional', label: 'Institucional' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'dotacional', label: 'Dotacional (No especificado en tabla C)' },
];