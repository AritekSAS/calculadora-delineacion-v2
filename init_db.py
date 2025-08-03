import sqlite3

DB_PATH = 'recibos.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        '''CREATE TABLE IF NOT EXISTS recibos (
               id TEXT PRIMARY KEY,
               data TEXT,
               docx_path TEXT,
               pdf_path TEXT,
               fecha TEXT
           )'''
    )
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()