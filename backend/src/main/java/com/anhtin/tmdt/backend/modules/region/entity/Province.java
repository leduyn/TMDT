package com.anhtin.tmdt.backend.modules.region.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "provinces")
public class Province {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private Long code;

    @Column(nullable = false)
    private String name;

    private String codename;

    @Column(name = "division_type")
    private String divisionType;

    @Column(name = "phone_code")
    private Integer phoneCode;

    @OneToMany(mappedBy = "province", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private java.util.List<Ward> wards = new java.util.ArrayList<>();

    public Province() {}

    public Province(String name) {
        this.name = name;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCode() { return code; }
    public void setCode(Long code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCodename() { return codename; }
    public void setCodename(String codename) { this.codename = codename; }

    public String getDivisionType() { return divisionType; }
    public void setDivisionType(String divisionType) { this.divisionType = divisionType; }

    public Integer getPhoneCode() { return phoneCode; }
    public void setPhoneCode(Integer phoneCode) { this.phoneCode = phoneCode; }

    public java.util.List<Ward> getWards() { return wards; }
    public void setWards(java.util.List<Ward> wards) { this.wards = wards; }

    public void addWard(Ward ward) {
        wards.add(ward);
        ward.setProvince(this);
    }
}
