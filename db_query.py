import psycopg2
import sys

# Set standard output encoding to utf-8
sys.stdout.reconfigure(encoding='utf-8')

def query():
    conn = psycopg2.connect("postgresql://postgres:123456@localhost:5432/tmdt_db")
    cur = conn.cursor()
    
    print("=== SYSTEM CONFIG ===")
    try:
        cur.execute("SELECT id, config_key, config_value FROM system_config ORDER BY id")
        for row in cur.fetchall():
            print(row)
    except Exception as e:
        print("Error reading system_config:", e)
    conn.rollback()

    print("\n=== SYSTEM CONFIG AUDIT ===")
    try:
        cur.execute("SELECT id, config_key, old_value, new_value, changed_by, changed_at FROM system_config_audit ORDER BY id")
        for row in cur.fetchall():
            print(row)
    except Exception as e:
        print("Error reading system_config_audit:", e)
    conn.rollback()

    cur.close()
    conn.close()

if __name__ == "__main__":
    query()

