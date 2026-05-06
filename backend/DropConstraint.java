import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class DropConstraint {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/tmdt_db", "postgres", "123456");
            Statement stmt = conn.createStatement();
            stmt.execute("ALTER TABLE price_assignment_vouchers DROP CONSTRAINT IF EXISTS price_assignment_vouchers_status_check;");
            System.out.println("Constraint dropped successfully!");
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
