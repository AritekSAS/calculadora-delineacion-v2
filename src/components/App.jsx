const { useState, useMemo, useRef, useEffect } = React;
import InputField from './InputField.jsx';
import SelectField from './SelectField.jsx';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { UVT_YEARS, UVT_DEFAULT, ZONAS, ESTRATOS, TIPOS_DE_USO_C } from '../utils/data.js';
import { formatCurrency, formatCurrencyWithDecimals, numeroALetras } from '../utils/format.js';
import { getCoeficienteK, getCoeficienteE, getCoeficienteC, getCategoriaNombre } from '../utils/calculations.js';
import { useShareImage } from '../hooks/useShareImage.js';
import RecibosList from './RecibosList.jsx';

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
  const [pdfUrl, setPdfUrl] = useState(null);

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
@@ -105,52 +107,54 @@ function App() {
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
      const response = await axios.post('/api/generar-recibo', payload, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      setPdfUrl(URL.createObjectURL(blob));
      saveAs(blob, 'recibo.pdf');
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
@@ -198,35 +202,47 @@ function App() {
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
              <button type="submit" className="w-full sm:w-auto bg-blue-500 text-white font-bold py-2 px-8 rounded-lg shadow-md hover:bg-blue-600">Generar Recibo</button>
            </div>
          </form>
        </div>
        <div className="p-4 sm:p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
          <RecibosList />
        </div>
      </div>
    </div>
    {pdfUrl && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white w-11/12 h-5/6 rounded-lg overflow-hidden relative">
          <iframe src={pdfUrl} className="w-full h-full"></iframe>
          <button onClick={() => setPdfUrl(null)} className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded">Cerrar</button>
        </div>
      </div>
    )}
  </div>
  );
}

export default App;