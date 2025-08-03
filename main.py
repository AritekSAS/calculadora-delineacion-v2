"""Flask backend for document generation and utility helpers."""

from flask import Flask, request, send_file
from docxtpl import DocxTemplate
from docx2pdf import convert
from uuid import uuid4
import os


app = Flask(__name__)


def calcular_impuesto(area, tarifa):
    """Calcula el impuesto multiplicando ``area`` por ``tarifa`` y redondea al peso."""
    impuesto = area * tarifa
    return int(round(impuesto))


@app.route('/api/generar-documento', methods=['POST'])
def generar_documento():
    """Rellena la plantilla de Word y la convierte a PDF para su descarga."""
    data = request.json or {}
    tpl = DocxTemplate('templates/plantilla.docx')

    # Los datos recibidos incluyen todos los marcadores usados en la plantilla
    tpl.render({key: data.get(key, '') for key in data.keys()})

    temp_docx = f"/tmp/{uuid4()}.docx"
    tpl.save(temp_docx)

    temp_pdf = f"/tmp/{uuid4()}.pdf"
    convert(temp_docx, temp_pdf)

    response = send_file(temp_pdf, as_attachment=True, download_name='informe.pdf')

    @response.call_on_close
    def cleanup() -> None:
        for f in (temp_docx, temp_pdf):
            try:
                os.remove(f)
            except OSError:
                pass

    return response


if __name__ == '__main__':
    app.run(debug=True)