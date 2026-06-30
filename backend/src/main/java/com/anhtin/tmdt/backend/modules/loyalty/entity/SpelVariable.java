package com.anhtin.tmdt.backend.modules.loyalty.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "spel_variables")
public class SpelVariable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "agg_function", nullable = false, length = 10)
    private String aggFunction;

    @Column(name = "table_name", nullable = false, length = 50)
    private String tableName;

    @Column(name = "table_alias", nullable = false, length = 10)
    private String tableAlias;

    @Column(name = "column_name", nullable = false, length = 50)
    private String columnName;

    @Column(name = "join_table", length = 50)
    private String joinTable;

    @Column(name = "join_alias", length = 10)
    private String joinAlias;

    @Column(name = "join_on_column", length = 50)
    private String joinOnColumn;

    @Column(name = "join_type", length = 10)
    private String joinType = "INNER";

    @Column(name = "where_json", columnDefinition = "TEXT")
    private String whereJson;

    @Column(name = "generated_sql", columnDefinition = "TEXT", nullable = false)
    private String generatedSql;

    private boolean active = true;

    public SpelVariable() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getAggFunction() { return aggFunction; }
    public void setAggFunction(String aggFunction) { this.aggFunction = aggFunction; }
    public String getTableName() { return tableName; }
    public void setTableName(String tableName) { this.tableName = tableName; }
    public String getTableAlias() { return tableAlias; }
    public void setTableAlias(String tableAlias) { this.tableAlias = tableAlias; }
    public String getColumnName() { return columnName; }
    public void setColumnName(String columnName) { this.columnName = columnName; }
    public String getJoinTable() { return joinTable; }
    public void setJoinTable(String joinTable) { this.joinTable = joinTable; }
    public String getJoinAlias() { return joinAlias; }
    public void setJoinAlias(String joinAlias) { this.joinAlias = joinAlias; }
    public String getJoinOnColumn() { return joinOnColumn; }
    public void setJoinOnColumn(String joinOnColumn) { this.joinOnColumn = joinOnColumn; }
    public String getJoinType() { return joinType; }
    public void setJoinType(String joinType) { this.joinType = joinType; }
    public String getWhereJson() { return whereJson; }
    public void setWhereJson(String whereJson) { this.whereJson = whereJson; }
    public String getGeneratedSql() { return generatedSql; }
    public void setGeneratedSql(String generatedSql) { this.generatedSql = generatedSql; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
