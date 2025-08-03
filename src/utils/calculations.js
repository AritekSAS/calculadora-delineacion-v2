import { TARIFAS_K } from './data.js';

export const getCoeficienteK = (zonaId, m2) => {
  const tabla = TARIFAS_K[zonaId];
  if (!tabla) {
    console.error(`No K-tariff table found for zonaId: ${zonaId}`);
    return 0;
  }
  const rate = tabla.find(r => m2 <= r.maxM2);
  return rate ? rate.k : 0;
};

export const getCoeficienteE = (estrato, isAsentamiento) => {
  if (isAsentamiento) {
    const E_ASENTAMIENTO_VALUES = { 1: 0.1, 2: 0.15, 3: 0.25, 4: 0.7 };
    return E_ASENTAMIENTO_VALUES[estrato] || 0;
  }
  const E_REGULAR_VALUES = { 1: 0.4, 2: 0.5, 3: 0.8, 4: 1.5, 5: 1.8, 6: 2.0 };
  return E_REGULAR_VALUES[estrato] || 0;
};

export const getCoeficienteC = (tipoDeUso, m2) => {
  switch (tipoDeUso) {
    case 'comercial':
      if (m2 <= 100) return 1.0;
      if (m2 <= 500) return 1.5;
      return 2.0;
    case 'institucional':
    case 'industrial':
      if (m2 <= 500) return 1.0;
      if (m2 <= 1000) return 1.5;
      return 2.0;
    case 'dotacional':
      return 0.8;
    default:
      return 0;
  }
};

export const getCategoriaNombre = (tipoDeUso, m2) => {
  if (!tipoDeUso || !m2 || m2 <= 0) return '';
  switch (tipoDeUso) {
    case 'comercial':
      if (m2 <= 100) return 'Categoría I (hasta 100m²)';
      if (m2 <= 500) return 'Categoría II (100.01 a 500m²)';
      return 'Categoría III (+500.01m²)';
    case 'institucional':
    case 'industrial':
      if (m2 <= 500) return 'Categoría I (hasta 500m²)';
      if (m2 <= 1000) return 'Categoría II (500.01 a 1000m²)';
      return 'Categoría III (+1000.01m²)';
    default:
      return '';
  }
};