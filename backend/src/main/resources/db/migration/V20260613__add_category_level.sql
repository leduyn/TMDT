-- Thêm cột level cho bảng categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 0;

-- Tự động cập nhật level cho dữ liệu hiện có dựa trên cây parent
-- Level 0: root (parent_id IS NULL)
-- Level 1: con trực tiếp của root
-- Level 2, 3...: tương tự
WITH RECURSIVE category_tree AS (
    -- Base case: root categories (no parent)
    SELECT id, parent_id, 0 AS calculated_level
    FROM categories
    WHERE parent_id IS NULL

    UNION ALL

    -- Recursive case: children
    SELECT c.id, c.parent_id, ct.calculated_level + 1
    FROM categories c
    INNER JOIN category_tree ct ON c.parent_id = ct.id
)
UPDATE categories
SET level = category_tree.calculated_level
FROM category_tree
WHERE categories.id = category_tree.id;
