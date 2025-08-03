 const { useState, useMemo, useRef, useEffect } = React;
import InputField from './InputField.jsx';
import SelectField from './SelectField.jsx';
import { UVT_YEARS, UVT_DEFAULT, ZONAS, ESTRATOS, TIPOS_DE_USO_C } from '../utils/data.js';
import { formatCurrency, formatCurrencyWithDecimals, numeroALetras } from '../utils/format.js';
import { getCoeficienteK, getCoeficienteE, getCoeficienteC, getCategoriaNombre } from '../utils/calculations.js';
import { useShareImage } from '../hooks/useShareImage.js';

function App() {
  const [tipoCalculo, setTipoCalculo] = useState('vivienda');
  const [isAsentamiento, setIsAsentamiento] = useState(false);
  const [isAutogestion, setIsAutogestion] = useState(false);
  const [medidasAmbientales, setMedidasAmbientales] = useState(false);
  const [m2Existentes, setM2Existentes] = useState('');
  const [m2Liquidar, setM2Liquidar] = useState('');
  const [m2Comunes, setM2Comunes] = useState('');
  const [uvt, setUvt] = useState(UVT_DEFAULT);
  const [zona, setZona] = useState('');
  const [subzona, setSubzona] = useState('');
  const [estrato, setEstrato] = useState('');
  const [tipoDeUso, setTipoDeUso] = useState('');
  const [resultado, setResultado] = useState(null);
  const [errors, setErrors] = useState({});
  const resultCardRef = useRef(null);

  useEffect(() => {
    const scriptId = 'html2canvas-script';
    if (document.getElementById(scriptId)) return;
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.async = true;
    document.head.appendChild(script);
    return () => { const es = document.getElementById(scriptId); if (es) document.head.removeChild(es); };
  }, []);

  const zonasDisponibles = useMemo(() => (tipoCalculo === 'vivienda' ? ZONAS.VIVIENDA : ZONAS.OTRO_USO), [tipoCalculo]);
  const subzonasDisponibles = useMemo(() => {
    if (!zona) return [];
    const z = zonasDisponibles.find(z => z.id === zona);
    return z ? z.subzonas : [];
  }, [zona, zonasDisponibles]);
  const estratosDisponibles = useMemo(() => (
    tipoCalculo === 'vivienda' && isAsentamiento ? ESTRATOS.filter(e => e.value <= 4) : ESTRATOS
  ), [isAsentamiento, tipoCalculo]);

  const totalM2ParaC = useMemo(() => (
    (parseFloat(m2Existentes) || 0) + (parseFloat(m2Liquidar) || 0) + (parseFloat(m2Comunes) || 0)
  ), [m2Existentes, m2Liquidar, m2Comunes]);
  const categoriaCalculada = useMemo(() => getCategoriaNombre(tipoDeUso, totalM2ParaC), [tipoDeUso, totalM2ParaC]);

  const handleZonaChange = (e) => { setZona(e.target.value); setSubzona(''); setResultado(null); };
  const handleUvtChange = (e) => { setUvt(e.target.value); setResultado(null); };

  const validateForm = () => {
    const newErrors = {};
    if ((parseFloat(m2Liquidar) || 0) <= 0 && (parseFloat(m2Comunes) || 0) <= 0) {
      newErrors.m2 = 'Debe ingresar un valor positivo en "M² a Liquidar" o "M² Zonas Comunes".';
    }
    if (!uvt || uvt <= 0) newErrors.uvt = 'Debe seleccionar un valor de UVT.';
    if (!zona) newErrors.zona = 'Debe seleccionar una zona.';
    if (subzonasDisponibles.length > 0 && !subzona) { newErrors.subzona = 'Debe seleccionar una subzona.'; }
    if (tipoCalculo === 'vivienda' && !estrato) { newErrors.estrato = 'Debe seleccionar un estrato.'; }
    if (tipoCalculo === 'otro_uso' && !tipoDeUso) { newErrors.tipoDeUso = 'Debe seleccionar un tipo de uso.'; }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = () => {
    if (!validateForm()) { setResultado(null); return; }

    const m2ExistentesNum = parseFloat(m2Existentes) || 0;
    const m2LiquidarNum = parseFloat(m2Liquidar) || 0;
    const m2ComunesNum = parseFloat(m2Comunes) || 0;
    const uvtNum = parseFloat(uvt);

    let totalM2ParaK;
    if(tipoCalculo === 'vivienda' && isAutogestion){
      totalM2ParaK = m2LiquidarNum;
    } else {
      totalM2ParaK = m2ExistentesNum + m2LiquidarNum + m2ComunesNum;
    }

    const K = getCoeficienteK(zona, totalM2ParaK);

    let baseResult, finalResult, formula = '', breakdownLiq = '', breakdownCom = '', valorEnLetras = '', datosProyecto = '', breakdownAmbiental = '', fechaEstimacion = '', anioTarifas = '';

    let displaySubzona;
    if (subzonasDisponibles.length > 0 && subzona) {
      const selectedSubzonaObj = subzonasDisponibles.find(s => (typeof s === 'string' ? s === subzona : s.id === subzona));
      displaySubzona = typeof selectedSubzonaObj === 'string' ? selectedSubzonaObj : (selectedSubzonaObj || {}).sigla;
    } else {
      displaySubzona = (ZONAS.VIVIENDA.find(z => z.id === zona) || ZONAS.OTRO_USO.find(z => z.id === zona) || {}).name || zona;
    }

    if (tipoCalculo === 'vivienda') {
      const E = getCoeficienteE(estrato, isAsentamiento);
      const impLiquidar = m2LiquidarNum * uvtNum * K * E;
      const impComunes = m2ComunesNum * uvtNum * K * E * 0.5;
      baseResult = impLiquidar + impComunes;

      formula = `IDV = (Liq. M² x UVT x K x E) + (Comunes M² x UVT x K x E x 50%)`;
      if (m2LiquidarNum > 0) breakdownLiq = `Liq. M²: (${m2LiquidarNum} x ${uvtNum} x ${K} x ${E}) = ${formatCurrencyWithDecimals(impLiquidar)}`;
      if (m2ComunesNum > 0) breakdownCom = `Z. Comunes: (${m2ComunesNum} x ${uvtNum} x ${K} x ${E} x 50%) = ${formatCurrencyWithDecimals(impComunes)}`;
      datosProyecto = `Uso: Vivienda ${isAutogestion ? '(Autogestión)' : ''} | Subzona: ${displaySubzona} | Estrato: ${estrato}`;
    } else {
      const C = getCoeficienteC(tipoDeUso, totalM2ParaK);
      const impLiquidar = m2LiquidarNum * uvtNum * K * C;
      const impComunes = m2ComunesNum * uvtNum * K * C * 0.5;
      baseResult = impLiquidar + impComunes;

      formula = `IDU = (Liq. M² x UVT x K x C) + (Comunes M² x UVT x K x C x 50%)`;
      if (m2LiquidarNum > 0) breakdownLiq = `Liq. M²: (${m2LiquidarNum} x ${uvtNum} x ${K} x ${C}) = ${formatCurrencyWithDecimals(impLiquidar)}`;
      if (m2ComunesNum > 0) breakdownCom = `Z. Comunes: (${m2ComunesNum} x ${uvtNum} x ${K} x ${C} x 50%) = ${formatCurrencyWithDecimals(impComunes)}`;
      const categoriaNombre = getCategoriaNombre(tipoDeUso, totalM2ParaC);
      datosProyecto = `Uso: ${(TIPOS_DE_USO_C.find(t => t.value === tipoDeUso) || {}).label} (${categoriaNombre}) | Subzona: ${displaySubzona}`;
    }

    finalResult = baseResult;
    if(medidasAmbientales){
      let descuento = 0; let descPercent = 0;
      const urbanZones = ['AVIS', 'ARU', 'AH', 'AUM', 'AIM']; const ruralZones = ['ZR', 'ZSR'];
      if(urbanZones.includes(zona)) { descPercent = 0.20; }
      else if (ruralZones.includes(zona)) { descPercent = 0.15; }
      else if (zona === 'PROTECCION') { descPercent = 0.10; }
      if(descPercent > 0){
        descuento = baseResult * descPercent; finalResult = baseResult - descuento;
        breakdownAmbiental = `Desc. Ambiental (${descPercent*100}%): - ${formatCurrencyWithDecimals(descuento)}`;
      }
    }

    const roundedFinalResult = Math.round(finalResult);
    valorEnLetras = numeroALetras(roundedFinalResult, { plural: 'PESOS', singular: 'PESO' }) + ' M/CTE';
    anioTarifas = (UVT_YEARS.find(y => y.value === uvtNum) || {}).year;
    fechaEstimacion = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

    setResultado({ value: roundedFinalResult, formula, breakdownLiq, breakdownCom, breakdownAmbiental, valorEnLetras, datosProyecto, fechaEstimacion, anioTarifas });
  };

  const handleShare = useShareImage(resultCardRef);

  const handleReset = () => {
    setTipoCalculo('vivienda'); setIsAsentamiento(false); setMedidasAmbientales(false); setIsAutogestion(false);
    setM2Existentes(''); setM2Liquidar(''); setM2Comunes('');
    setUvt(UVT_DEFAULT); setZona(''); setSubzona(''); setEstrato(''); setTipoDeUso('');
    setResultado(null); setErrors({});
  };

  return (
    <div className="min-h-screen text-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">Calculadora Impuesto de Delineación - Chía</h1>
        <div className="space-y-6">
          <div className="p-4 sm:p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-3">1. Información General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-start mb-4">
              <SelectField label="Uso" value={tipoCalculo} onChange={(e) => { setTipoCalculo(e.target.value); setResultado(null); setErrors({}); }} options={[{ value: 'vivienda', label: 'Vivienda' }, { value: 'otro_uso', label: 'Diferente a Vivienda' }]} />
              <div className="space-y-3 md:pt-8">
                {tipoCalculo === 'vivienda' && (
                  <>
                    <div className="flex items-center space-x-3"><input type="checkbox" id="asentamiento" checked={isAsentamiento} onChange={(e) => { setIsAsentamiento(e.target.checked); setEstrato(''); setResultado(null);}} className="h-4 w-4 text-[#63ff9a] bg-gray-700 border-gray-600 rounded focus:ring-[#63ff9a] focus:ring-offset-gray-800" /><label htmlFor="asentamiento" className="text-sm font-medium text-gray-300">¿Por Asentamiento Humano?</label></div>
                    <div className="flex items-center space-x-3"><input type="checkbox" id="autogestion" checked={isAutogestion} onChange={(e) => { setIsAutogestion(e.target.checked); setResultado(null);}} className="h-4 w-4 text-[#63ff9a] bg-gray-700 border-gray-600 rounded focus:ring-[#63ff9a] focus:ring-offset-gray-800" /><label htmlFor="autogestion" className="text-sm font-medium text-gray-300">¿Asociación por Autogestión?</label></div>
                  </>
                )}
              </div>
              <SelectField label="Año y Valor UVT" value={uvt} onChange={handleUvtChange} options={UVT_YEARS.map(u => ({ value: u.value, label: `Año ${u.year} - ${formatCurrency(u.value)}` }))} error={errors.uvt} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField label="M² Existentes" type="number" value={m2Existentes} onChange={(e) => setM2Existentes(e.target.value)} placeholder="0" min="0" />
              <InputField label="M² a Liquidar" type="number" value={m2Liquidar} onChange={(e) => setM2Liquidar(e.target.value)} placeholder="Ej: 120" min="0" />
              <InputField label="M² Zonas Comunes" type="number" value={m2Comunes} onChange={(e) => setM2Comunes(e.target.value)} placeholder="Ej: 30" min="0" />
            </div>
            <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-gray-700">
              <input type="checkbox" id="ambiental" checked={medidasAmbientales} onChange={(e) => { setMedidasAmbientales(e.target.checked); setResultado(null); }} className="h-4 w-4 text-[#63ff9a] bg-gray-700 border-gray-600 rounded focus:ring-[#63ff9a] focus:ring-offset-gray-800" />
              <label htmlFor="ambiental" className="text-sm font-medium text-gray-300">¿Proyecto con medidas ambientales?</label>
            </div>
            {errors.m2 && <p className="mt-2 text-xs text-red-400">{errors.m2}</p>}
          </div>
          <div className="p-4 sm:p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-3">2. Zona y Coeficientes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField label="Zona" value={zona} onChange={handleZonaChange} options={zonasDisponibles} error={errors.zona} />
              {subzonasDisponibles.length > 0 && (
                <SelectField label="Subzona (Informativa)" value={subzona} onChange={(e) => setSubzona(e.target.value)} options={subzonasDisponibles.map(sz => typeof sz === 'string' ? {value: sz, label: sz} : {value: sz.id, label: `${sz.name.substring(0,25)}... (${sz.sigla})`})} disabled={!zona} error={errors.subzona} />
              )}
              {tipoCalculo === 'vivienda' ? (
                <SelectField label="Estrato Socioeconómico (E)" value={estrato} onChange={(e) => setEstrato(e.target.value)} options={estratosDisponibles} error={errors.estrato} />
              ) : (
                <SelectField label="Tipo de Uso (C)" value={tipoDeUso} onChange={(e) => setTipoDeUso(e.target.value)} options={TIPOS_DE_USO_C} error={errors.tipoDeUso} />
              )}
              {tipoCalculo === 'otro_uso' && categoriaCalculada && (
                <div className="md:col-span-2 mt-2 p-3 bg-gray-700/50 rounded-lg text-center">
                  <p className="text-sm text-gray-300">Categoría Aplicada (Automática): <span className="font-bold text-white">{categoriaCalculada}</span></p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button onClick={handleCalculate} className="w-full sm:w-auto bg-gradient-to-r from-[#63ff9a] to-green-400 text-gray-900 font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-green-400/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-400 transition-all duration-300 transform hover:scale-105">Calcular Impuesto</button>
          <button onClick={handleReset} className="w-full sm:w-auto bg-gray-700 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-600 transition-all duration-300 transform hover:scale-105">Limpiar</button>
        </div>
        {resultado && (
          <div ref={resultCardRef} className="mt-8 p-4 sm:p-6 bg-gray-800 border-2 border-dashed border-gray-700 rounded-xl">
            <div className="border-b text-center border-gray-700 pb-3 mb-4">
              <p className="text-sm font-medium text-gray-300">Datos del Proyecto</p>
              <p className="text-xs text-gray-400">{resultado.datosProyecto}</p>
            </div>
            <div className='text-center'>
              <p className="text-base font-medium text-gray-300">Impuesto de Delineación Estimado ({resultado.fechaEstimacion})</p>
              <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white my-2">{formatCurrency(resultado.value)}</p>
              <p className="text-xs text-gray-400 capitalize mb-4">({resultado.valorEnLetras})</p>
            </div>
            <div className="text-xs text-left text-gray-300 bg-gray-900/50 p-4 rounded-lg">
              <p className="font-bold text-center text-base mb-2">Desglose del Cálculo</p>
              <div className="text-center space-y-1">
                {resultado.breakdownLiq && <p className="break-words">{resultado.breakdownLiq}</p>}
                {resultado.breakdownCom && <p className="break-words">{resultado.breakdownCom}</p>}
                {resultado.breakdownAmbiental && <p className="break-words font-semibold text-green-400 mt-2">{resultado.breakdownAmbiental}</p>}
              </div>
            </div>
            <div className='text-center'>
              <button id="share-button-clone" onClick={handleShare} className="mt-6 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 transition-all duration-300 text-sm">
                Compartir Liquidación
              </button>
            </div>
            <div className="mt-6 text-xs text-yellow-300 bg-yellow-900/30 p-4 rounded-lg">
              <strong className="block text-center text-yellow-200">Nota Importante</strong>
              <p className="mt-1 text-center">Este cálculo se basa en las tarifas del Acuerdo 164 de 2019, vigentes para el año {resultado.anioTarifas}. Estos valores cambiarán con el nuevo año. El valor es una estimación y no corresponde a una liquidación oficial, la cual debe ser validada por la Dirección de Urbanismo de Chía.</p>
            </div>
            <footer className="mt-6 pt-3 border-t border-gray-700">
              <p className="text-left text-xs text-gray-500">
                Herramienta generada e implementada por Aritek_arquitectura SAS.
              </p>
              <p className="text-left text-xs text-gray-500 flex items-center">
                <svg className="w-3 h-3 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>
                ariteksas@gmail.com
              </p>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
