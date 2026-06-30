import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class DBFix {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:postgresql://localhost:5432/vinago_db";
        String user = "postgres";
        String pass = "123456";
        try (Connection c = DriverManager.getConnection(url, user, pass);
             Statement s = c.createStatement()) {
            s.execute("ALTER TABLE agencies ADD COLUMN IF NOT EXISTS code VARCHAR(255) NOT NULL DEFAULT ''");
            s.execute("ALTER TABLE agencies ADD COLUMN IF NOT EXISTS representative_name VARCHAR(255)");
            s.execute("ALTER TABLE agencies ADD COLUMN IF NOT EXISTS billing_address TEXT");
            s.execute("ALTER TABLE agencies ADD COLUMN IF NOT EXISTS shipping_address TEXT");
            s.execute("ALTER TABLE agencies ADD COLUMN IF NOT EXISTS receiver_name VARCHAR(255)");
            s.execute("ALTER TABLE agencies ADD COLUMN IF NOT EXISTS receiver_phone VARCHAR(50)");
            s.execute("ALTER TABLE agencies ADD COLUMN IF NOT EXISTS nickname VARCHAR(255)");
            s.execute("ALTER TABLE agencies ADD COLUMN IF NOT EXISTS status VARCHAR(255) NOT NULL DEFAULT 'PENDING'");
            s.execute("ALTER TABLE agencies ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT false");
            System.out.println("Migration applied successfully");
        }
    }
}
