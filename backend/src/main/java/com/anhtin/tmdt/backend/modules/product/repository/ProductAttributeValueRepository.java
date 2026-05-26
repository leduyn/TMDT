package com.anhtin.tmdt.backend.modules.product.repository;

import com.anhtin.tmdt.backend.modules.product.entity.ProductAttributeValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import com.anhtin.tmdt.backend.modules.order.entity.Order;
import com.anhtin.tmdt.backend.modules.product.entity.Product;
import com.anhtin.tmdt.backend.modules.product.entity.Attribute;
import com.anhtin.tmdt.backend.modules.order.entity.Transaction;

@Repository
public interface ProductAttributeValueRepository extends JpaRepository<ProductAttributeValue, Long> {

    /** Lấy tất cả attribute values của một sản phẩm */
    List<ProductAttributeValue> findByProductId(Long productId);

    /** Xóa tất cả attribute values của một sản phẩm (dùng khi update) */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Transactional
    @Query("DELETE FROM ProductAttributeValue pav WHERE pav.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);

    /**
     * [FACETING CORE] Từ danh sách product_id, thống kê ngược:
     * mỗi attribute_value còn khả dụng và có bao nhiêu sản phẩm.
     * Trả về: [attributeId, attributeName, displayName, valueId, valueName, count]
     */
    @Query(value = """
        SELECT
            a.id            AS attributeId,
            a.name          AS attributeName,
            a.display_name  AS displayName,
            av.id           AS valueId,
            av.value        AS valueName,
            COUNT(pav.product_id) AS total
        FROM product_attribute_values pav
        JOIN attribute_values av ON pav.attribute_value_id = av.id
        JOIN attributes a ON av.attribute_id = a.id
        WHERE pav.product_id IN (:productIds)
        GROUP BY a.id, a.name, a.display_name, av.id, av.value
        ORDER BY a.id, av.value
        """, nativeQuery = true)
    List<Object[]> findFacetsForProductIds(@Param("productIds") List<Long> productIds);

    /**
     * [FILTERING] Lọc sản phẩm theo danh sách attribute_value_id (AND logic).
     * Sản phẩm phải chứa TẤT CẢ các value đã chọn.
     *
     * @param valueIds   danh sách attribute_value_id đã chọn
     * @param valueCount số lượng valueIds (để so sánh COUNT = N)
     */
    @Query(value = """
        SELECT pav.product_id
        FROM product_attribute_values pav
        WHERE pav.attribute_value_id IN (:valueIds)
        GROUP BY pav.product_id
        HAVING COUNT(DISTINCT pav.attribute_value_id) = :valueCount
        """, nativeQuery = true)
    List<Long> findProductIdsMatchingAllValues(
            @Param("valueIds") List<Long> valueIds,
            @Param("valueCount") long valueCount);
}
