
import sqlite3
import json
import os

DB_PATH = "/Applications/iqra/iqra-core/data/quran_local.db"

def get_surah_fatiha():
    if not os.path.exists(DB_PATH):
        return "Database not found at " + DB_PATH
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT arabic FROM ayat WHERE surah = 1 ORDER BY ayah ASC")
    rows = cursor.fetchall()
    
    conn.close()
    return [row[0] for row in rows]

if __name__ == "__main__":
    ayahs = get_surah_fatiha()
    print(json.dumps(ayahs, ensure_ascii=False))
