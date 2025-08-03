@app.route('/api/generar-recibo', methods=['POST'])
def generar_recibo():
    """Genera un recibo a partir de la plantilla, lo guarda y lo registra en la BD."""
    data = request.json or {}
    tpl = DocxTemplate('templates/plantilla.docx')
    tpl.render({key: data.get(key, '') for key in data.keys()})

    _init_storage()
    uid = str(uuid4())
    docx_path = os.path.join('recibos', f"{uid}.docx")
    pdf_path = os.path.join('recibos', f"{uid}.pdf")
    tpl.save(docx_path)
    convert(docx_path, pdf_path)

    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute(
        'INSERT INTO recibos (id, data, docx_path, pdf_path, fecha) VALUES (?, ?, ?, ?, datetime("now"))',
        (uid, json.dumps(data), docx_path, pdf_path)
    )
    con.commit()
    con.close()

    resp = send_file(pdf_path, as_attachment=True, download_name='recibo.pdf')
    resp.headers['X-Recibo-ID'] = uid
    return resp


@app.route('/api/recibos', methods=['GET'])
def listar_recibos():
    """Lista todos los recibos generados."""
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute('SELECT id, fecha, data FROM recibos ORDER BY fecha DESC')
    rows = cur.fetchall()
    con.close()

    recibos = []
    for rid, fecha, data in rows:
        d = json.loads(data or '{}')
        recibos.append({
            'id': rid,
            'fecha': fecha,
            'recibo': d.get('recibo', ''),
            'titular': d.get('TITULARES', ''),
        })

    return jsonify(recibos)


@app.route('/api/recibos/<rid>/pdf', methods=['GET'])
def obtener_pdf(rid):
    """Devuelve el PDF de un recibo específico."""
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute('SELECT pdf_path FROM recibos WHERE id = ?', (rid,))
    row = cur.fetchone()
    con.close()
    if not row:
        return jsonify({'error': 'Recibo no encontrado'}), 404
    return send_file(row[0], as_attachment=False, mimetype='application/pdf')


@app.route('/api/recibos/<rid>/docx', methods=['GET'])
def obtener_docx(rid):
    """Devuelve el DOCX de un recibo específico."""
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute('SELECT docx_path FROM recibos WHERE id = ?', (rid,))
    row = cur.fetchone()
    con.close()
    if not row:
        return jsonify({'error': 'Recibo no encontrado'}), 404
    return send_file(
        row[0],
        as_attachment=True,
        download_name='recibo.docx',
        mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )


if __name__ == '__main__':
    app.run(debug=True)