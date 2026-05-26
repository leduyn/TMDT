package com.anhtin.tmdt.backend.modules.region.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "wards")
public class Ward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private Long code;

    @Column(nullable = false)
    private String name;

    private String codename;

    @Column(name = "division_type")
    private String divisionType;

    @Column(name = "short_codename")
    private String shortCodename;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "province_id")
    @JsonIgnore
    private Province province;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id")
    @JsonIgnore
    private BusinessRegion region;

    @Column(name = "legacy_ids", columnDefinition = "TEXT")
    private String legacyIds;

    public Ward() {}

    public Ward(Long code, String name, Province province) {
        this.code = code;
        this.name = name;
        this.province = province;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCode() { return code; }
    public void setCode(Long code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Province getProvince() { return province; }
    public void setProvince(Province province) { this.province = province; }

    public BusinessRegion getRegion() { return region; }
    public void setRegion(BusinessRegion region) { this.region = region; }

    public String getLegacyIds() { return legacyIds; }
    public void setLegacyIds(String legacyIds) { this.legacyIds = legacyIds; }

    public String getCodename() { return codename; }
    public void setCodename(String codename) { this.codename = codename; }

    public String getDivisionType() { return divisionType; }
    public void setDivisionType(String divisionType) { this.divisionType = divisionType; }

    public String getShortCodename() { return shortCodename; }
    public void setShortCodename(String shortCodename) { this.shortCodename = shortCodename; }
}
