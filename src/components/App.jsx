  } catch (err) {
      console.error(err);
    }
  };

  const downloadDocx = async () => {
    if (!reciboId) return;
    try {
      const res = await axios.get(`/api/recibos/${reciboId}/docx`, { responseType: 'blob' });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      saveAs(blob, 'recibo.docx');
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
                    className={`ml-4 px-4 py-2 text-sm font-medium ${activeTab === 'predioTitular' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('predioTitular')}
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
                      options={UVT_YEARS.map((u) => ({ value: u.value, label: `Año ${u.year} - ${u.value}` }))}
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
                    <button type="button" onClick={addUso} className="mt-2 bg-gray-700 text-white px-4 py-2 rounded">
                      Agregar Uso
                    </button>
                  </div>
                </div>
              )}

                {activeTab === 'predioTitular' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        value={docData.CEDULA_CATASTRAL}
                        onChange={(e) => handleDocChange('CEDULA_CATASTRAL', e.target.value)}
                        error={errors.CEDULA_CATASTRAL}
                      />
                    </div>
                  </div>
                )}

              <div className="text-center">
                <button type="submit" className="w-full sm:w-auto bg-blue-500 text-white font-bold py-2 px-8 rounded-lg shadow-md hover:bg-blue-600">
                  Generar Recibo
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {pdfUrl && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white w-11/12 h-5/6 rounded-lg overflow-hidden relative">
            <iframe src={pdfUrl} className="w-full h-full"></iframe>
            <button onClick={downloadDocx} className="absolute bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded">
              Generar Recibo
            </button>
            <button onClick={() => setPdfUrl(null)} className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );