const { useState, useMemo, useRef, useEffect } = React;
import InputField from './InputField.jsx';
import SelectField from './SelectField.jsx';
import axios from 'axios';
import { saveAs } from 'file-saver';
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

  const [docData, setDocData] = useState({
    recibo: '',
    radicado: '',
    CC_TITULAR: '',
    CEDULA_CATASTRAL: '',
    TOTAL_LETRAS: '',
    total_num: '',
    NORMA: '',
    ZONA: '',
    ESTRATO: '',
    FECHA: '',
    ARQUITECTO: '',
    DIRECCION: '',
    TELEFONO: '',
    usos: [{ USO: '', UVT: '', AREA: '', COE: '', F: '', TD: '', TT: '' }]
  });

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
@@ -124,50 +143,91 @@ function App() {
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

  const handleDocChange = (field, value) => {
    setDocData(prev => ({ ...prev, [field]: value }));
  };

  const handleUsoChange = (index, field, value) => {
    setDocData(prev => {
      const usos = [...prev.usos];
      usos[index][field] = value;
      return { ...prev, usos };
    });
  };

  const addUso = () => {
    setDocData(prev => ({
      ...prev,
      usos: [...prev.usos, { USO: '', UVT: '', AREA: '', COE: '', F: '', TD: '', TT: '' }]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...docData };
    delete payload.usos;
    docData.usos.forEach((u, idx) => {
      const i = idx + 1;
      payload[`USO${i}`] = u.USO;
      payload[`UVT${i}`] = u.UVT;
      payload[`AREA${i}`] = u.AREA;
      payload[`COE${i}`] = u.COE;
      payload[`F${i}`] = u.F;
      payload[`TD${i}`] = u.TD;
      payload[`TT${i}`] = u.TT;
    });
    try {
      const response = await axios.post('/api/generar-documento', payload, { responseType: 'blob' });
      saveAs(new Blob([response.data], { type: 'application/pdf' }), 'informe.pdf');
    } catch (err) {
      console.error(err);
    }
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
@@ -217,31 +277,70 @@ function App() {
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

        <div className="mt-8 p-4 sm:p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-3">3. Generar Documento</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Recibo" value={docData.recibo} onChange={(e) => handleDocChange('recibo', e.target.value)} />
              <InputField label="Radicado" value={docData.radicado} onChange={(e) => handleDocChange('radicado', e.target.value)} />
              <InputField label="CC Titular" value={docData.CC_TITULAR} onChange={(e) => handleDocChange('CC_TITULAR', e.target.value)} />
              <InputField label="Cédula Catastral" value={docData.CEDULA_CATASTRAL} onChange={(e) => handleDocChange('CEDULA_CATASTRAL', e.target.value)} />
              <InputField label="Total en Letras" value={docData.TOTAL_LETRAS} onChange={(e) => handleDocChange('TOTAL_LETRAS', e.target.value)} />
              <InputField label="Total Numérico" value={docData.total_num} onChange={(e) => handleDocChange('total_num', e.target.value)} />
              <InputField label="Norma" value={docData.NORMA} onChange={(e) => handleDocChange('NORMA', e.target.value)} />
              <InputField label="Zona" value={docData.ZONA} onChange={(e) => handleDocChange('ZONA', e.target.value)} />
              <InputField label="Estrato" value={docData.ESTRATO} onChange={(e) => handleDocChange('ESTRATO', e.target.value)} />
              <InputField label="Fecha" value={docData.FECHA} onChange={(e) => handleDocChange('FECHA', e.target.value)} />
              <InputField label="Arquitecto" value={docData.ARQUITECTO} onChange={(e) => handleDocChange('ARQUITECTO', e.target.value)} />
              <InputField label="Dirección" value={docData.DIRECCION} onChange={(e) => handleDocChange('DIRECCION', e.target.value)} />
              <InputField label="Teléfono" value={docData.TELEFONO} onChange={(e) => handleDocChange('TELEFONO', e.target.value)} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Desglose por Usos</h3>
              {docData.usos.map((u, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-7 gap-2 mb-4">
                  <InputField label={`USO${idx + 1}`} value={u.USO} onChange={(e) => handleUsoChange(idx, 'USO', e.target.value)} />
                  <InputField label={`UVT${idx + 1}`} value={u.UVT} onChange={(e) => handleUsoChange(idx, 'UVT', e.target.value)} />
                  <InputField label={`AREA${idx + 1}`} value={u.AREA} onChange={(e) => handleUsoChange(idx, 'AREA', e.target.value)} />
                  <InputField label={`COE${idx + 1}`} value={u.COE} onChange={(e) => handleUsoChange(idx, 'COE', e.target.value)} />
                  <InputField label={`F${idx + 1}`} value={u.F} onChange={(e) => handleUsoChange(idx, 'F', e.target.value)} />
                  <InputField label={`TD${idx + 1}`} value={u.TD} onChange={(e) => handleUsoChange(idx, 'TD', e.target.value)} />
                  <InputField label={`TT${idx + 1}`} value={u.TT} onChange={(e) => handleUsoChange(idx, 'TT', e.target.value)} />
                </div>
              ))}
              <button type="button" onClick={addUso} className="mt-2 bg-gray-700 text-white px-4 py-2 rounded">Agregar Uso</button>
            </div>
            <div className="text-center">
              <button type="submit" className="w-full sm:w-auto bg-blue-500 text-white font-bold py-2 px-8 rounded-lg shadow-md hover:bg-blue-600">Generar PDF</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;