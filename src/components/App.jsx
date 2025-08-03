const { useState, useEffect, useRef } = React;
import InputField from './InputField.jsx';
import SelectField from './SelectField.jsx';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { UVT_YEARS, UVT_DEFAULT } from '../utils/data.js';

function App() {
  const [tipoCalculo, setTipoCalculo] = useState('vivienda');
  const [uvt, setUvt] = useState(UVT_DEFAULT);
  const [errors, setErrors] = useState({});
  const [pdfUrl, setPdfUrl] = useState(null);
  const resultCardRef = useRef(null);
  const [activeTab, setActiveTab] = useState('general');

  const [docData, setDocData] = useState({
    recibo: '',
    radicado: '',
    TITULARES: '',
    CC_TITULARES: '',
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
    document.body.appendChild(script);
  }, []);

  const handleUvtChange = (e) => {
    setUvt(e.target.value);
  };

  const handleDocChange = (field, value) => {
    setDocData(prev => ({ ...prev, [field]: value }));
  };

  const handleUsoChange = (idx, field, value) => {
    setDocData(prev => {
      const usos = prev.usos.map((u, i) => i === idx ? { ...u, [field]: value } : u);
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
    const newErrors = {};

    if (!docData.recibo || isNaN(docData.recibo)) newErrors.recibo = 'Requerido y numérico';
    if (!docData.radicado || isNaN(docData.radicado)) newErrors.radicado = 'Requerido y numérico';
    if (!docData.TITULARES) newErrors.TITULARES = 'Requerido';
    if (!docData.CC_TITULARES) newErrors.CC_TITULARES = 'Requerido';
    if (!docData.TOTAL_LETRAS) newErrors.TOTAL_LETRAS = 'Requerido';
    if (!docData.total_num || isNaN(docData.total_num)) newErrors.total_num = 'Requerido y numérico';

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex border-b border-gray-700 mb-4">
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-medium ${activeTab === 'general' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
                  onClick={() => setActiveTab('general')}
                >
                  Información General
                </button>
                <button
                  type="button"
                  className={`ml-4 px-4 py-2 text-sm font-medium ${activeTab === 'predio' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
                  onClick={() => setActiveTab('predio')}
                >
                  Datos del Predio y Titular
                </button>
              </div>

              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-start mb-4">
                    <SelectField
                      label="Uso"
                      value={tipoCalculo}
                      onChange={(e) => setTipoCalculo(e.target.value)}
                      options={[{ value: 'vivienda', label: 'Vivienda' }, { value: 'otro_uso', label: 'Diferente a Vivienda' }]}
                    />
                    <SelectField
                      label="Año y Valor UVT"
                      value={uvt}
                      onChange={handleUvtChange}
                      options={UVT_YEARS.map(u => ({ value: u.value, label: `Año ${u.year} - ${u.value}` }))}
                      error={errors.uvt}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                </div>
              )}

              {activeTab === 'predio' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Número de Liquidación"
                    type="number"
                    value={docData.recibo}
                    onChange={(e) => handleDocChange('recibo', e.target.value)}
                    error={errors.recibo}
                  />
                  <InputField
                    label="Número de Radicación"
                    type="number"
                    value={docData.radicado}
                    onChange={(e) => handleDocChange('radicado', e.target.value)}
                    error={errors.radicado}
                  />
                  <InputField
                    label="Nombre del Titular"
                    value={docData.TITULARES}
                    onChange={(e) => handleDocChange('TITULARES', e.target.value)}
                    error={errors.TITULARES}
                  />
                  <InputField
                    label="Cédula Catastral"
                    value={docData.CC_TITULARES}
                    onChange={(e) => handleDocChange('CC_TITULARES', e.target.value)}
                    error={errors.CC_TITULARES}
                  />
                  <InputField
                    label="Total en Letras"
                    value={docData.TOTAL_LETRAS}
                    onChange={(e) => handleDocChange('TOTAL_LETRAS', e.target.value)}
                    error={errors.TOTAL_LETRAS}
                  />
                  <InputField
                    label="Total Numérico"
                    type="number"
                    value={docData.total_num}
                    onChange={(e) => handleDocChange('total_num', e.target.value)}
                    error={errors.total_num}
                  />
                </div>
              )}

              <div className="text-center">
                <button type="submit" className="w-full sm:w-auto bg-blue-500 text-white font-bold py-2 px-8 rounded-lg shadow-md hover:bg-blue-600">Generar Recibo</button>
              </div>
            </form>
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