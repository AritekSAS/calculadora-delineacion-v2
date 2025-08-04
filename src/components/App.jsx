import { useState } from 'react';
import InputField from './InputField.jsx';
import SelectField from './SelectField.jsx';
import CheckboxField from './CheckboxField.jsx';
import { UVT_YEARS, ZONAS, ESTRATOS } from '../utils/data.js';

function App() {
  const [tipoCalculo, setTipoCalculo] = useState('');
  const [uvt, setUvt] = useState('');
  const [asentamiento, setAsentamiento] = useState(false);
  const [autogestion, setAutogestion] = useState(false);
  const [m2Existentes, setM2Existentes] = useState('');
  const [m2Liquidar, setM2Liquidar] = useState('');
  const [m2ZonasComunes, setM2ZonasComunes] = useState('');
  const [zona, setZona] = useState('');
  const [estrato, setEstrato] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica de cálculo o envío se implementará según sea necesario
    console.log({
      tipoCalculo,
      uvt,
      asentamiento,
      autogestion,
      m2Existentes,
      m2Liquidar,
      m2ZonasComunes,
      zona,
      estrato,
    });
  };

  const handleClear = () => {
    setTipoCalculo('');
    setUvt('');
    setAsentamiento(false);
    setAutogestion(false);
    setM2Existentes('');
    setM2Liquidar('');
    setM2ZonasComunes('');
    setZona('');
    setEstrato('');
  };

  const uvtOptions = UVT_YEARS.map((u) => ({
    value: u.value,
    label: `${u.year} - ${u.value}`,
  }));

  const zoneOptions = tipoCalculo
    ? (tipoCalculo === 'vivienda' ? ZONAS.VIVIENDA : ZONAS.OTRO_USO).map((z) => ({
        value: z.id,
        label: z.name,
      }))
    : [];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2 text-white">
          Calculadora Impuesto de Delineación - Chía
        </h1>
        <p className="text-center text-gray-400 mb-8">Municipio de Chía...</p>

        <form
          onSubmit={handleSubmit}
          className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl space-y-8"
        >
          <div>
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-700">
              1. Información General
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <SelectField
                label="Uso"
                value={tipoCalculo}
                onChange={(e) => setTipoCalculo(e.target.value)}
                options={[
                  { value: 'vivienda', label: 'Vivienda' },
                  { value: 'otro_uso', label: 'Diferente a Vivienda' },
                ]}
              />
              <SelectField
                label="Año y Valor UVT"
                value={uvt}
                onChange={(e) => setUvt(e.target.value)}
                options={uvtOptions}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <CheckboxField
                label="¿Por Asentamiento Humano?"
                name="asentamiento"
                checked={asentamiento}
                onChange={(e) => setAsentamiento(e.target.checked)}
              />
              <CheckboxField
                label="¿Asociación por Autogestión?"
                name="autogestion"
                checked={autogestion}
                onChange={(e) => setAutogestion(e.target.checked)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField
                label="M² Existentes"
                type="number"
                value={m2Existentes}
                onChange={(e) => setM2Existentes(e.target.value)}
              />
              <InputField
                label="M² a Liquidar"
                type="number"
                value={m2Liquidar}
                onChange={(e) => setM2Liquidar(e.target.value)}
              />
              <InputField
                label="M² Zonas Comunes"
                type="number"
                value={m2ZonasComunes}
                onChange={(e) => setM2ZonasComunes(e.target.value)}
              />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-700">
              2. Zona y Coeficientes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Zona"
                value={zona}
                onChange={(e) => setZona(e.target.value)}
                options={zoneOptions}
                disabled={!tipoCalculo}
              />
              <SelectField
                label="Estrato Socioeconómico (E)"
                value={estrato}
                onChange={(e) => setEstrato(e.target.value)}
                options={ESTRATOS}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded"
            >
              Calcular Impuesto
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-2 rounded"
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;