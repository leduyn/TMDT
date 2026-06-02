import psycopg2
import sys

sys.stdout.reconfigure(encoding='utf-8')

def query():
    conn = psycopg2.connect("postgresql://postgres:123456@localhost:5432/tmdt_db")
    cur = conn.cursor()
    
    print("=== PRODUCTS ===")
    try:
        cur.execute("""
            SELECT id, name, base_price, min_purchase_quantity
            FROM products
            ORDER BY id
        """)
        for r in cur.fetchall():
            print(f"Product ID: {r[0]} | Name: {r[1]} | Price: {r[2]} | Min Qty: {r[3]}")
    except Exception as e:
        print("Error reading products:", e)
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    query()
