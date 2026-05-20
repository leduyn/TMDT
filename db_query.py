import psycopg2
import sys

# Set standard output encoding to utf-8
sys.stdout.reconfigure(encoding='utf-8')

def query():
    conn = psycopg2.connect("postgresql://postgres:123456@localhost:5432/tmdt_db")
    cur = conn.cursor()
    
    print("=== PRODUCTS ===")
    cur.execute("SELECT id, name, base_price, show_discount FROM products ORDER BY id")
    for row in cur.fetchall():
        print(row)
        
    cur.close()
    conn.close()

if __name__ == "__main__":
    query()
