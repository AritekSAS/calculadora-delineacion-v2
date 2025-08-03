import React, { useState, useMemo, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import html2canvas from 'html2canvas';

        // --- React Component Code Starts Here ---

        // --- Helper Functions ---
        const formatCurrency = (value) => {
            return new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                maximumFractionDigits: 0,
                minimumFractionDigits: 0,
            }).format(value);
        };

        const formatCurrencyWithDecimals = (value) => {
            return new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
            }).format(value);
        };

        // --- Number to Words Converter (Spanish) ---
        function Unidades(num){
            switch(num) {
                case 1: return 'UN'; case 2: return 'DOS'; case 3: return 'TRES'; case 4: return 'CUATRO';
                case 5: return 'CINCO'; case 6: return 'SEIS'; case 7: return 'SIETE'; case 8: return 'OCHO'; case 9: return 'NUEVE';
            }
            return '';
        }
        function Decenas(num){
            let decena = Math.floor(num/10); let unidad = num - (decena * 10);
            switch(decena) {
                case 1:
                    switch(unidad) {
                        case 0: return 'DIEZ'; case 1: return 'ONCE'; case 2: return 'DOCE'; case 3: return 'TRECE';
                        case 4: return 'CATORCE'; case 5: return 'QUINCE'; default: return 'DIECI' + Unidades(unidad);
                    }
                case 2:
                    switch(unidad) {
                        case 0: return 'VEINTE'; default: return 'VEINTI' + Unidades(unidad);
                    }
                case 3: return DecenasY('TREINTA', unidad); case 4: return DecenasY('CUARENTA', unidad);
                case 5: return DecenasY('CINCUENTA', unidad); case 6: return DecenasY('SESENTA', unidad);
                case 7: return DecenasY('SETENTA', unidad); case 8: return DecenasY('OCHENTA', unidad);
                case 9: return DecenasY('NOVENTA', unidad); case 0: return Unidades(unidad);
            }
        }
        function DecenasY(strSin, numUnidades) { if (numUnidades > 0) return strSin + ' Y ' + Unidades(numUnidades); return strSin; }
        function Centenas(num) {
            let centenas = Math.floor(num / 100); let decenas = num - (centenas * 100);
            switch(centenas) {
                case 1: if (decenas > 0) return 'CIENTO ' + Decenas(decenas); return 'CIEN';
                case 2: return 'DOSCIENTOS ' + Decenas(decenas); case 3: return 'TRESCIENTOS ' + Decenas(decenas);
                case 4: return 'CUATROCIENTOS ' + Decenas(decenas); case 5: return 'QUINIENTOS ' + Decenas(decenas);
                case 6: return 'SEISCIENTOS ' + Decenas(decenas); case 7: return 'SETECIENTOS ' + Decenas(decenas);
                case 8: return 'OCHOCIENTOS ' + Decenas(decenas); case 9: return 'NOVECIENTOS ' + Decenas(decenas);
            }
            return Decenas(decenas);
        }
        function Seccion(num, divisor, strSingular, strPlural) {
            let cientos = Math.floor(num / divisor); let resto = num - (cientos * divisor); let letras = '';
            if (cientos > 0) if (cientos > 1) letras = Centenas(cientos) + ' ' + strPlural; else letras = strSingular;
            if (resto > 0) letras += '';
            return letras;
        }
        function Miles(num) {
            let divisor = 1000; let cientos = Math.floor(num / divisor); let resto = num - (cientos * divisor);
            let strMiles = Seccion(num, divisor, 'UN MIL', 'MIL'); let strCentenas = Centenas(resto);
            if(strMiles === '') return strCentenas;
            return strMiles + ' ' + strCentenas;
        }
        function Millones(num) {
            let divisor = 1000000; let cientos = Math.floor(num / divisor); let resto = num - (cientos * divisor);
            let strMillones = Seccion(num, divisor, 'UN MILLON DE', 'MILLONES DE'); let strMiles = Miles(resto);
            if(strMillones === '') return strMiles;
            return strMillones + ' ' + strMiles;
        }
        function numeroALetras(num, currency) {
            currency = currency || {};
            let data = {
                numero: num, enteros: Math.floor(num),
                letrasMonedaPlural: currency.plural || 'PESOS', letrasMonedaSingular: currency.singular || 'PESO',
            };
            if (data.enteros === 0) return 'CERO ' + data.letrasMonedaPlural;
            if (data.enteros === 1) return Millones(data.enteros) + ' ' + data.letrasMonedaSingular;
            else return Millones(data.enteros) + ' ' + data.letrasMonedaPlural;
        }


        // --- OFFICIAL TARIFF DATA ---
        const UVT_YEARS = [{ year: 2025, value: 49799 }, { year: 2024, value: 47065 }, { year: 2023, value: 42412 }];
        const UVT_DEFAULT = UVT_YEARS[0].value;
        const TARIFAS_K = {
            ZR: [{ maxM2: 72, k: 0.12 }, { maxM2: 100, k: 0.24 }, { maxM2: 150, k: 0.55 }, { maxM2: 200, k: 0.78 }, { maxM2: 250, k: 0.93 }, { maxM2: Infinity, k: 1.24 }],
            ZSR: [{ maxM2: 72, k: 0.16 }, { maxM2: 100, k: 0.31 }, { maxM2: 150, k: 0.62 }, { maxM2: 200, k: 1.24 }, { maxM2: 250, k: 1.55 }, { maxM2: 500, k: 1.75 }, { maxM2: 1000, k: 1.95 }, { maxM2: 2000, k: 2.10 }, { maxM2: Infinity, k: 2.20 }],
            PROTECCION: [{ maxM2: 72, k: 0.16 }, { maxM2: 100, k: 0.39 }, { maxM2: 150, k: 0.78 }, { maxM2: 200, k: 1.40 }, { maxM2: 250, k: 1.55 }, { maxM2: Infinity, k: 2.71 }],
            AVIS: [{ maxM2: 75, k: 0.12 }, { maxM2: 100, k: 0.16 }, { maxM2: 150, k: 0.47 }, { maxM2: 200, k: 0.78 }, { maxM2: 250, k: 1.01 }, { maxM2: Infinity, k: 1.40 }],
            ARU: [{ maxM2: 75, k: 0.40 }, { maxM2: 100, k: 0.60 }, { maxM2: 150, k: 0.80 }, { maxM2: 200, k: 1.00 }, { maxM2: 250, k: 1.20 }, { maxM2: 500, k: 1.60 }, { maxM2: 1000, k: 1.70 }, { maxM2: 2000, k: 1.90 }, { maxM2: Infinity, k: 2.00 }],
            AH: [{ maxM2: 75, k: 0.40 }, { maxM2: 150, k: 0.60 }, { maxM2: 200, k: 0.90 }, { maxM2: 250, k: 1.30 }, { maxM2: 500, k: 1.60 }, { maxM2: 1000, k: 1.80 }, { maxM2: 2000, k: 2.00 }, { maxM2: Infinity, k: 2.20 }],
            AUM: [{ maxM2: 75, k: 0.50 }, { maxM2: 100, k: 0.70 }, { maxM2: 150, k: 0.90 }, { maxM2: 200, k: 1.10 }, { maxM2: 250, k: 1.30 }, { maxM2: 500, k: 1.70 }, { maxM2: 1000, k: 2.00 }, { maxM2: 2000, k: 2.10 }, { maxM2: Infinity, k: 2.20 }],
            AIM: [{ maxM2: 72, k: 0.16 }, { maxM2: 100, k: 0.39 }, { maxM2: 150, k: 0.78 }, { maxM2: 200, k: 1.40 }, { maxM2: 250, k: 1.55 }, { maxM2: Infinity, k: 2.71 }],
        };
        const ZONAS = {
          VIVIENDA: [{ id: 'ZR', name: 'ZONA RURAL (ZR)', subzonas: 'ZAP-ZJM-ZJME'.split('-') }, { id: 'ZSR', name: 'SUBURBANA (ZSR)', subzonas: 'ZRG-ZRS-CP-ZVC-ZVCE-ZCS'.split('-') }, { id: 'PROTECCION', name: 'SUELO DE PROTECCIÓN', subzonas: [{ id: 'ZBP-ZRFP-1', name: 'Zona de reserva forestal protectora productora...', sigla: 'ZBP-ZRFP' }, { id: 'ZRP-ZRFPP', name: 'Zona de reserva forestal protectora productora alta...', sigla: 'ZRP-ZRFPP' }, { id: 'ZBP-ZRFP-2', name: 'Zona de amortiguación', sigla: 'ZBP-ZRFP' }] }, { id: 'AVIS', name: 'SUELO URBANO - VIVIENDA DE INTERÉS SOCIAL Y PRIORITARIA (AVIS)', subzonas: [] }, { id: 'ARU', name: 'RESIDENCIAL URBANA (ARU)', subzonas: [] }, { id: 'AH', name: 'SUELO URBANO - COMERCIAL Y DE SERVICIOS (AH)', subzonas: [] }, { id: 'AUM', name: 'AUM', subzonas: [] }, { id: 'AIM', name: 'AIM', subzonas: [] }],
          OTRO_USO: [{ id: 'ZR', name: 'ZONA RURAL (ZR)', subzonas: 'ZAP-ZJM-ZJME'.split('-') }, { id: 'ZSR', name: 'SUBURBANA (ZSR)', subzonas: 'ZRG-ZRS-CP-ZVC-ZVCE-ZCS'.split('-') }, { id: 'PROTECCION', name: 'SUELO DE PROTECCIÓN', subzonas: [{ id: 'ZBP-ZRFP-1', name: 'Zona de reserva forestal protectora productora...', sigla: 'ZBP-ZRFP' }, { id: 'ZRP-ZRFPP', name: 'Zona de reserva forestal protectora productora alta...', sigla: 'ZRP-ZRFPP' }, { id: 'ZBP-ZRFP-2', name: 'Zona de amortiguación', sigla: 'ZBP-ZRFP' }] }, { id: 'AH', name: 'SUELO URBANO - COMERCIAL Y DE SERVICIOS (AH)', subzonas: [] }, { id: 'AUM', name: 'AUM', subzonas: [] }, { id: 'AIM', name: 'AIM', subzonas: [] }]
        };
        const ESTRATOS = [ { value: 1, label: 'Estrato 1' }, { value: 2, label: 'Estrato 2' }, { value: 3, label: 'Estrato 3' }, { value: 4, label: 'Estrato 4' }, { value: 5, label: 'Estrato 5' }, { value: 6, label: 'Estrato 6' }];
        const TIPOS_DE_USO_C = [{ value: 'comercial', label: 'Comercio y/o Servicios' }, { value: 'institucional', label: 'Institucional' }, { value: 'industrial', label: 'Industrial' }, { value: 'dotacional', label: 'Dotacional (No especificado en tabla C)' }];

        const getCoeficienteK = (zonaId, m2) => { const tabla = TARIFAS_K[zonaId]; if (!tabla) { console.error(`No K-tariff table found for zonaId: ${zonaId}`); return 0; } const rate = tabla.find(r => m2 <= r.maxM2); return rate ? rate.k : 0; };
        const getCoeficienteE = (estrato, isAsentamiento) => { if (isAsentamiento) { const E_ASENTAMIENTO_VALUES = { 1: 0.1, 2: 0.15, 3: 0.25, 4: 0.7 }; return E_ASENTAMIENTO_VALUES[estrato] || 0; } const E_REGULAR_VALUES = { 1: 0.4, 2: 0.5, 3: 0.8, 4: 1.5, 5: 1.8, 6: 2.0 }; return E_REGULAR_VALUES[estrato] || 0; };
        const getCoeficienteC = (tipoDeUso, m2) => { switch (tipoDeUso) { case 'comercial': if (m2 <= 100) return 1.0; if (m2 <= 500) return 1.5; return 2.0; case 'institucional': case 'industrial': if (m2 <= 500) return 1.0; if (m2 <= 1000) return 1.5; return 2.0; case 'dotacional': return 0.8; default: return 0; } };

        const getCategoriaNombre = (tipoDeUso, m2) => {
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
                default: return '';
            }
        };

        const InputField = ({ label, type, value, onChange, placeholder, min, error }) => (<div className="w-full"><label className="block text-sm font-medium text-gray-400 mb-2">{label}</label><input type={type} value={value} onChange={onChange} placeholder={placeholder} min={min} className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#63ff9a] focus:border-transparent transition-all duration-300`} />{error && <p className="mt-1 text-xs text-red-400">{error}</p>}</div>);
        const SelectField = ({ label, value, onChange, options, disabled = false, error }) => (<div className="w-full"><label className="block text-sm font-medium text-gray-400 mb-2">{label}</label><select value={value} onChange={onChange} disabled={disabled} className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-[#63ff9a] focus:border-transparent transition-all duration-300 disabled:bg-gray-800/50 disabled:cursor-not-allowed`}><option value="" disabled>-- Seleccione --</option>{options.map((opt) => (<option className="bg-gray-800 text-white" key={opt.value || opt.id} value={opt.value || opt.id}>{opt.label || opt.name}</option>))}</select>{error && <p className="mt-1 text-xs text-red-400">{error}</p>}</div>);

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
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
            script.async = true;
            document.head.appendChild(script);
            return () => { const es = document.getElementById(scriptId); if (es) document.head.removeChild(es); };
          }, []);

          const zonasDisponibles = useMemo(() => tipoCalculo === 'vivienda' ? ZONAS.VIVIENDA : ZONAS.OTRO_USO, [tipoCalculo]);
          const subzonasDisponibles = useMemo(() => { if (!zona) return []; const z = zonasDisponibles.find(z => z.id === zona); return z ? z.subzonas : []; }, [zona, zonasDisponibles]);
          const estratosDisponibles = useMemo(() => tipoCalculo === 'vivienda' && isAsentamiento ? ESTRATOS.filter(e => e.value <= 4) : ESTRATOS, [isAsentamiento, tipoCalculo]);
          
          const totalM2ParaC = useMemo(() => (parseFloat(m2Existentes) || 0) + (parseFloat(m2Liquidar) || 0) + (parseFloat(m2Comunes) || 0), [m2Existentes, m2Liquidar, m2Comunes]);
          const categoriaCalculada = useMemo(() => getCategoriaNombre(tipoDeUso, totalM2ParaC), [tipoDeUso, totalM2ParaC]);
          
          const handleZonaChange = (e) => { setZona(e.target.value); setSubzona(''); setResultado(null); };
          const handleUvtChange = (e) => { setUvt(e.target.value); setResultado(null); }

          const validateForm = () => {
            const newErrors = {};
            if ((parseFloat(m2Liquidar) || 0) <= 0 && (parseFloat(m2Comunes) || 0) <= 0) { newErrors.m2 = 'Debe ingresar un valor positivo en "M² a Liquidar" o "M² Zonas Comunes".'; }
            if (!uvt || uvt <= 0) newErrors.uvt = 'Debe seleccionar un valor de UVT.';
            if (!zona) newErrors.zona = 'Debe seleccionar una zona.';
            if (subzonasDisponibles.length > 0 && !subzona) { newErrors.subzona = 'Debe seleccionar una subzona.'; }
            if (tipoCalculo === 'vivienda' && !estrato) { newErrors.estrato = 'Debe seleccionar un estrato.'; }
            if (tipoCalculo === 'otro_uso' && !tipoDeUso) { newErrors.tipoDeUso = 'Debe seleccionar un tipo de uso.'; }
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
          }

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
              const categoriaNombre = getCategoriaNombre(tipoDeUso, totalM2ParaK);
              datosProyecto = `Uso: ${ (TIPOS_DE_USO_C.find(t => t.value === tipoDeUso) || {}).label } (${categoriaNombre}) | Subzona: ${displaySubzona}`;
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
          
          const handleShare = async () => {
            if (!resultCardRef.current || typeof window.html2canvas === 'undefined') { alert('Error: La librería para generar la imagen no está lista.'); return; }
            const canvas = await window.html2canvas(resultCardRef.current, { useCORS: true, backgroundColor: '#111827', onclone: (doc) => { const btn = doc.getElementById('share-button-clone'); if(btn) btn.style.display = 'none'; }});
            const dataUrl = canvas.toDataURL('image/png');
            const downloadImage = () => { const link = document.createElement('a'); link.href = dataUrl; link.download = 'liquidacion_delineacion.png'; document.body.appendChild(link); link.click(); document.body.removeChild(link); }
            try {
                if (!navigator.share) { throw new Error('Web Share API no es compatible, se descargará la imagen.'); }
                const response = await fetch(dataUrl); const blob = await response.blob(); const file = new File([blob], 'liquidacion_delineacion.png', { type: 'image/png' });
                await navigator.share({ title: 'Liquidación Impuesto de Delineación', text: 'Adjunto la estimación del impuesto de delineación.', files: [file]});
            } catch (error) { console.warn("Fallo el API de compartir, usando descarga como fallback:", error.message); downloadImage(); }
          };

          const handleReset = () => {
            setTipoCalculo('vivienda'); setIsAsentamiento(false); setMedidasAmbientales(false); setIsAutogestion(false);
            setM2Existentes(''); setM2Liquidar(''); setM2Comunes('');
            setUvt(UVT_DEFAULT); setZona(''); setSubzona(''); setEstrato(''); setTipoDeUso('');
            setResultado(null); setErrors({});
          };

          return (
            <div className="bg-gray-900 min-h-screen flex items-center justify-center p-4 font-sans text-gray-200">
              <div className="w-full max-w-3xl bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 space-y-8">
                <div className="text-center">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Calculadora Impuesto de Delineación</h1>
                    <p className="text-gray-400 mt-2">Municipio de Chía</p>
                    <p className="text-xs text-gray-500 mt-2 px-2">Basado en: Acuerdos 107 (2016) y 164 (2019), Decreto 590 (2019), Resolución 549 (2015)</p>
                </div>
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
                          {subzonasDisponibles.length > 0 && (<SelectField label="Subzona (Informativa)" value={subzona} onChange={(e) => setSubzona(e.target.value)} options={subzonasDisponibles.map(sz => typeof sz === 'string' ? {value: sz, label: sz} : {value: sz.id, label: `${sz.name.substring(0,25)}... (${sz.sigla})`})} disabled={!zona} error={errors.subzona} />)}
                          {tipoCalculo === 'vivienda' ? (<SelectField label="Estrato Socioeconómico (E)" value={estrato} onChange={(e) => setEstrato(e.target.value)} options={estratosDisponibles} error={errors.estrato} />) : (<SelectField label="Tipo de Uso (C)" value={tipoDeUso} onChange={(e) => setTipoDeUso(e.target.value)} options={TIPOS_DE_USO_C} error={errors.tipoDeUso} />)}
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

        ReactDOM.render(<App />, document.getElementById('root'));