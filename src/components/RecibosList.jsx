const { useState, useEffect } = React;
import axios from 'axios';

function RecibosList() {
  const [recibos, setRecibos] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    const fetchRecibos = async () => {
      try {
        const res = await axios.get('/api/recibos');
        setRecibos(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRecibos();
  }, []);

  const verPdf = (id) => {
    setPdfUrl(`/api/recibos/${id}/pdf`);
  };

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-3">4. Recibos Generados</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-300">
          <thead className="bg-gray-700 text-xs uppercase">
            <tr>
              <th className="px-4 py-2">Recibo</th>
              <th className="px-4 py-2">Titular</th>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {recibos.map(r => (
              <tr key={r.id} className="border-b border-gray-700">
                <td className="px-4 py-2">{r.recibo}</td>
                <td className="px-4 py-2">{r.titular}</td>
                <td className="px-4 py-2">{r.fecha}</td>
                <td className="px-4 py-2">
                  <button onClick={() => verPdf(r.id)} className="text-blue-400 hover:underline">Ver PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

export default RecibosList;