-- Drop obsolete columns from sales_policies that were removed in V2
ALTER TABLE sales_policies 
    DROP COLUMN IF EXISTS adjustment_type,
    DROP COLUMN IF EXISTS condition_type,
    DROP COLUMN IF EXISTS adjustment_value,
    DROP COLUMN IF EXISTS filter_province_name,
    DROP COLUMN IF EXISTS filter_rank_level,
    DROP COLUMN IF EXISTS quantity_limit,
    DROP COLUMN IF EXISTS quantity_operator,
    DROP COLUMN IF EXISTS specific_price,
    DROP COLUMN IF EXISTS value_limit;
