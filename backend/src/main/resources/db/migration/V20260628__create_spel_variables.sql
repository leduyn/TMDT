CREATE TABLE spel_variables (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    agg_function VARCHAR(10) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    table_alias VARCHAR(10) NOT NULL,
    column_name VARCHAR(50) NOT NULL,
    join_table VARCHAR(50),
    join_alias VARCHAR(10),
    join_on_column VARCHAR(50),
    join_type VARCHAR(10) DEFAULT 'INNER',
    where_json TEXT,
    generated_sql TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);
