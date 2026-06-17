package com.anhtin.tmdt.backend.modules.product.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "categories")
@NoArgsConstructor
@AllArgsConstructor
public class Category {

    /**
     * Tên hiển thị mặc định cho từng cấp danh mục.
     */
    public static final Map<Integer, String> DEFAULT_LEVEL_NAMES = Map.of(
            0, "Ngành hàng",
            1, "Nhóm hàng",
            2, "Loại sản phẩm",
            3, "Dòng sản phẩm"
    );

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    @Column(nullable = false)
    private Integer level = 0;

    @Column(name = "bravo_id")
    private Long bravoId;

    private Integer status;

    private Integer priority;

    @Column(name = "bravo_sort_value")
    private String bravoSortValue;

    @Column(name = "is_branch")
    private Integer isBranch;

    @Column(name = "show_on_left_menu")
    private Integer showOnLeftMenu;

    @Column(name = "display_status")
    private Integer displayStatus;

    @Column(name = "background_color")
    private String backgroundColor;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    /**
     * Tự động tính level dựa trên parent trước khi lưu.
     */
    @PrePersist
    @PreUpdate
    private void calculateLevel() {
        if (parent != null) {
            this.level = parent.getLevel() + 1;
        } else {
            this.level = 0;
        }
        updatedDate = LocalDateTime.now();
    }

    /**
     * Trả về tên hiển thị của level hiện tại (ví dụ: "Ngành hàng", "Nhóm hàng"...).
     */
    public String getLevelName() {
        return DEFAULT_LEVEL_NAMES.getOrDefault(level, "Cấp " + level);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Category getParent() { return parent; }
    public void setParent(Category parent) { this.parent = parent; }
    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }
    public Long getBravoId() { return bravoId; }
    public void setBravoId(Long bravoId) { this.bravoId = bravoId; }
    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }
    public Integer getPriority() { return priority; }
    public void setPriority(Integer priority) { this.priority = priority; }
    public String getBravoSortValue() { return bravoSortValue; }
    public void setBravoSortValue(String bravoSortValue) { this.bravoSortValue = bravoSortValue; }
    public Integer getIsBranch() { return isBranch; }
    public void setIsBranch(Integer isBranch) { this.isBranch = isBranch; }
    public Integer getShowOnLeftMenu() { return showOnLeftMenu; }
    public void setShowOnLeftMenu(Integer showOnLeftMenu) { this.showOnLeftMenu = showOnLeftMenu; }
    public Integer getDisplayStatus() { return displayStatus; }
    public void setDisplayStatus(Integer displayStatus) { this.displayStatus = displayStatus; }
    public String getBackgroundColor() { return backgroundColor; }
    public void setBackgroundColor(String backgroundColor) { this.backgroundColor = backgroundColor; }
    public LocalDateTime getUpdatedDate() { return updatedDate; }
    public void setUpdatedDate(LocalDateTime updatedDate) { this.updatedDate = updatedDate; }
}
