package com.anhtin.tmdt.backend.modules.loyalty.service;

import com.anhtin.tmdt.backend.modules.loyalty.entity.SpelVariable;
import com.anhtin.tmdt.backend.modules.loyalty.repository.SpelVariableRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class SpelVariableService {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    private static final Set<String> ALLOWED_AGG = Set.of("COUNT", "SUM", "MAX", "MIN", "AVG");
    private static final Set<String> ALLOWED_TABLES = Set.of(
        "orders", "users", "agency_customer_assignments",
        "loyalty_points", "point_transactions", "order_items",
        "brands", "categories", "products", "agency_products"
    );
    private static final Set<String> ALLOWED_JOIN_TYPES = Set.of("INNER", "LEFT", "RIGHT");
    private static final Pattern SAFE_IDENTIFIER = Pattern.compile("^[a-zA-Z_][a-zA-Z0-9_]*$");
    private static final Pattern SAFE_VALUE = Pattern.compile("^[a-zA-Z0-9_\\-:. ]*$");
    private static final Pattern SAFE_STRING_VALUE = Pattern.compile("^[a-zA-Z0-9_\\-. ]*$");

    @Autowired
    private SpelVariableRepository spelVariableRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // ===== Table / Column metadata =====

    private static final Map<String, List<String>> TABLE_COLUMNS;
    private static final Map<String, List<String>> NUMERIC_COLUMNS;
    private static final Map<String, Map<String, List<String>>> JOIN_SUGGESTIONS;

    static {
        Map<String, List<String>> tc = new LinkedHashMap<>();
        tc.put("orders", List.of("id", "customer_id", "agency_id", "total_amount", "status",
                                 "order_date", "order_type", "payment_method", "points_redeemed",
                                 "discount_amount", "delivery_fee"));
        tc.put("users", List.of("id", "username", "email", "active", "role", "created_at",
                                "phone", "organization_name"));
        tc.put("agency_customer_assignments", List.of("id", "customer_id", "agency_id", "approved",
                                                      "total_debt", "custom_name"));
        tc.put("loyalty_points", List.of("id", "customer_id", "points_balance", "total_earned",
                                         "level_number", "total_orders", "total_revenue"));
        tc.put("point_transactions", List.of("id", "customer_id", "order_id", "points",
                                             "transaction_type", "created_at"));
        tc.put("order_items", List.of("id", "order_id", "product_id", "quantity", "price"));
        tc.put("brands", List.of("id", "code", "name", "status", "is_highlight",
                                 "highlight_priority", "logo_url", "created_date"));
        tc.put("categories", List.of("id", "name", "level", "parent_id", "display_status",
                                     "status", "is_branch", "priority", "show_on_left_menu",
                                     "image_url", "updated_date"));
        tc.put("products", List.of("id", "product_code", "name", "short_name", "base_price",
                                   "dropship_price", "stock_quantity", "unit", "status",
                                   "is_dropship", "is_app_visible", "is_web_visible",
                                   "show_discount", "min_purchase_quantity", "quantity_step",
                                   "brand_id", "category_id", "product_type_id",
                                   "retail_warranty_period", "wholesale_warranty_period"));
        tc.put("agency_products", List.of("id", "agency_id", "product_id", "category_id",
                                          "custom_price", "name", "description", "status",
                                          "stock_quantity", "created_at"));
        TABLE_COLUMNS = Collections.unmodifiableMap(tc);

        Map<String, List<String>> nc = new LinkedHashMap<>();
        nc.put("orders", List.of("id", "customer_id", "agency_id", "total_amount", "points_redeemed",
                                 "discount_amount", "delivery_fee"));
        nc.put("users", List.of("id"));
        nc.put("agency_customer_assignments", List.of("id", "customer_id", "agency_id", "total_debt"));
        nc.put("loyalty_points", List.of("id", "customer_id", "points_balance", "total_earned",
                                         "level_number", "total_orders", "total_revenue"));
        nc.put("point_transactions", List.of("id", "customer_id", "order_id", "points"));
        nc.put("order_items", List.of("id", "order_id", "product_id", "quantity", "price"));
        nc.put("brands", List.of("id", "status", "is_highlight", "highlight_priority"));
        nc.put("categories", List.of("id", "level", "parent_id", "display_status", "status",
                                     "is_branch", "priority", "show_on_left_menu"));
        nc.put("products", List.of("id", "base_price", "dropship_price", "stock_quantity",
                                   "min_purchase_quantity", "quantity_step",
                                   "brand_id", "category_id", "product_type_id"));
        nc.put("agency_products", List.of("id", "agency_id", "product_id", "category_id",
                                          "custom_price", "stock_quantity"));
        NUMERIC_COLUMNS = Collections.unmodifiableMap(nc);

        Map<String, Map<String, List<String>>> js = new LinkedHashMap<>();
        js.put("orders", Map.of(
            "users", List.of("customer_id"),
            "agency_customer_assignments", List.of("agency_id")
        ));
        js.put("point_transactions", Map.of(
            "orders", List.of("order_id"),
            "users", List.of("customer_id")
        ));
        js.put("order_items", Map.of(
            "orders", List.of("order_id"),
            "products", List.of("product_id")
        ));
        js.put("agency_customer_assignments", Map.of(
            "users", List.of("customer_id")
        ));
        js.put("loyalty_points", Map.of(
            "users", List.of("customer_id")
        ));
        js.put("products", Map.of(
            "brands", List.of("brand_id"),
            "categories", List.of("category_id")
        ));
        js.put("agency_products", Map.of(
            "orders", List.of("agency_id"),
            "products", List.of("product_id"),
            "categories", List.of("category_id")
        ));
        js.put("categories", Map.of(
            "categories", List.of("parent_id")
        ));
        JOIN_SUGGESTIONS = Collections.unmodifiableMap(js);
    }

    public Map<String, List<String>> getTableColumns() { return TABLE_COLUMNS; }
    public Map<String, List<String>> getNumericColumns() { return NUMERIC_COLUMNS; }
    public Map<String, Map<String, List<String>>> getJoinSuggestions() { return JOIN_SUGGESTIONS; }
    public Set<String> getAllowedAggFunctions() { return ALLOWED_AGG; }
    public Set<String> getAllowedTables() { return ALLOWED_TABLES; }

    // ===== Build SQL =====

    public String buildSql(SpelVariable v) {
        String alias = v.getTableAlias();
        String agg = v.getAggFunction();
        String col = v.getColumnName();

        String selectExpr;
        if ("COUNT".equals(agg)) {
            selectExpr = "COUNT(" + alias + "." + col + ")";
        } else {
            selectExpr = agg + "(" + alias + "." + col + ")";
        }

        StringBuilder sql = new StringBuilder();
        sql.append("SELECT ").append(selectExpr);
        sql.append(" FROM ").append(v.getTableName()).append(" ").append(alias);

        if (v.getJoinTable() != null && !v.getJoinTable().isBlank()
            && v.getJoinOnColumn() != null && !v.getJoinOnColumn().isBlank()) {
            String joinAlias = v.getJoinAlias();
            String joinType = v.getJoinType() != null ? v.getJoinType() : "INNER";
            sql.append(" ").append(joinType).append(" JOIN ")
               .append(v.getJoinTable()).append(" ").append(joinAlias)
               .append(" ON ").append(alias).append(".").append(v.getJoinOnColumn())
               .append(" = ").append(joinAlias).append(".id");
        }

        if (v.getWhereJson() != null && !v.getWhereJson().isBlank()) {
            String whereClause = buildWhereClause(v.getWhereJson(), alias);
            if (!whereClause.isBlank()) {
                sql.append(" WHERE ").append(whereClause);
            }
        }

        return sql.toString();
    }

    private String buildWhereClause(String whereJson, String mainAlias) {
        try {
            JsonNode filters = objectMapper.readTree(whereJson);
            if (!filters.isArray() || filters.isEmpty()) return "";

            List<String> parts = new ArrayList<>();
            String lastLogic = "AND";

            for (JsonNode f : filters) {
                String column = f.path("column").asText("");
                String operator = f.path("operator").asText("=");
                String value = f.path("value").asText("");
                String logic = f.path("logic").asText("AND");

                if (column.isBlank()) continue;

                if (!SAFE_IDENTIFIER.matcher(column).matches()) continue;

                String expr;
                if ("IS NULL".equals(operator) || "IS NOT NULL".equals(operator)) {
                    expr = mainAlias + "." + column + " " + operator;
                } else if ("IN".equals(operator)) {
                    expr = mainAlias + "." + column + " IN (" + value + ")";
                } else {
                    if (!SAFE_VALUE.matcher(value).matches() && !SAFE_STRING_VALUE.matcher(value).matches()) continue;
                    if ("LIKE".equals(operator)) {
                        expr = mainAlias + "." + column + " " + operator + " '%" + value + "%'";
                    } else {
                        expr = mainAlias + "." + column + " " + operator + " '" + value + "'";
                    }
                }

                if (!parts.isEmpty()) {
                    parts.add(" " + lastLogic + " ");
                }
                parts.add(expr);
                lastLogic = "OR".equalsIgnoreCase(logic) ? "OR" : "AND";
            }

            return String.join("", parts);
        } catch (Exception e) {
            return "";
        }
    }

    // ===== Security =====

    public void validateSql(String sql) {
        String upper = sql.toUpperCase().trim();
        if (!upper.startsWith("SELECT")) {
            throw new RuntimeException("Chi cho phep truy van SELECT");
        }
        String[] forbidden = {"INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "TRUNCATE", "EXEC", "CREATE"};
        for (String kw : forbidden) {
            if (upper.contains(" " + kw + " ") || upper.contains(" " + kw + "\n")) {
                throw new RuntimeException("Khong cho phep lenh: " + kw);
            }
        }
    }

    // ===== Execute =====

    public Object executeSql(String sql, Long customerId, Long agencyId) {
        validateSql(sql);
        try {
            String paramSql = sql;
            if (paramSql.contains(":customerId")) {
                paramSql = paramSql.replace(":customerId", String.valueOf(customerId));
            }
            if (paramSql.contains(":agencyId")) {
                paramSql = paramSql.replace(":agencyId", String.valueOf(agencyId));
            }
            return jdbcTemplate.queryForObject(paramSql, Long.class);
        } catch (Exception e) {
            return 0L;
        }
    }

    // ===== CRUD =====

    @Transactional
    public SpelVariable save(SpelVariable v) {
        String sql = buildSql(v);
        validateSql(sql);
        v.setGeneratedSql(sql);
        if (v.getName() != null && !v.getName().startsWith("#")) {
            v.setName("#" + v.getName());
        }
        return spelVariableRepository.save(v);
    }

    public List<SpelVariable> findAll() {
        return spelVariableRepository.findAll();
    }

    public List<SpelVariable> findActive() {
        return spelVariableRepository.findByActiveTrue();
    }

    @Transactional
    public void deleteById(Long id) {
        spelVariableRepository.deleteById(id);
    }
}
